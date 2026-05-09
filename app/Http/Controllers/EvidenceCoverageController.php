<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Control;
use App\Models\Framework;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvidenceCoverageController extends Controller
{
    /** Coverage status keys exposed to the UI. */
    private const STATUS_FULLY_COVERED = 'fully_covered';

    private const STATUS_PARTIAL = 'partially_covered';

    private const STATUS_INSUFFICIENT = 'insufficient';

    private const STATUS_NO_EVIDENCE = 'no_evidence';

    private const STATUS_EXPIRING = 'expiring';

    /** Threshold for the "Expiring Soon" classification. */
    private const EXPIRY_SOON_DAYS = 30;

    /** Numeric ranking used to merge "best" verdicts and to sort by status. */
    private const STATUS_RANK = [
        self::STATUS_NO_EVIDENCE => 0,
        self::STATUS_INSUFFICIENT => 1,
        self::STATUS_EXPIRING => 2,
        self::STATUS_PARTIAL => 3,
        self::STATUS_FULLY_COVERED => 4,
    ];

    /** Confidence ranking — used to surface the "best" confidence per control. */
    private const CONFIDENCE_RANK = ['Low' => 1, 'Medium' => 2, 'High' => 3];

    public function index(Request $request)
    {
        $actor = Auth::user();
        $perPage = 20;

        // ── Tenant-scoped assessment universe ───────────────────────────────
        // The matrix only shows controls that belong to assessments. Tenant
        // scope rides through Assessment.corporation_id (Assessment is a
        // tenant table per CLAUDE.md) — super_admin sees every assessment,
        // others see only their corporation's. From here we derive both:
        //   - the list of assessments shown in the filter dropdown
        //   - the set of assessment ids used to scope the controls query
        $tenantAssessments = $actor
            ->organisationScope(Assessment::query())
            ->orderBy('title')
            ->get(['id', 'title', 'framework_id']);

        $tenantAssessmentIds = $tenantAssessments->pluck('id')->all();

        // Apply the assessment filter when one is selected. If the chosen
        // assessment isn't in the tenant set we silently ignore it — defends
        // against URL tampering and stale links.
        $assessmentFilter = $request->string('assessment')->toString();
        $scopedAssessmentIds = $tenantAssessmentIds;
        if ($assessmentFilter !== '' && $assessmentFilter !== 'all') {
            $assessmentId = (int) $assessmentFilter;
            if (in_array($assessmentId, $tenantAssessmentIds, true)) {
                $scopedAssessmentIds = [$assessmentId];
            }
        }

        // ── Build the per-control rows ──────────────────────────────────────
        // Evidence is filtered by uploader's corporation_id (Evidence has no
        // direct corporation_id column — see CLAUDE.md follow-ups).
        //
        // No type hint on $q — Laravel passes a Relation instance (HasMany /
        // MorphMany) when invoking eager-load closures, not a Builder. Both
        // expose ->whereHas(), so duck-type it.
        $tenantFilter = function ($q) use ($actor) {
            if ($actor && method_exists($actor, 'isSuperAdmin') && $actor->isSuperAdmin()) {
                return;
            }

            $corpId = $actor?->corporation_id;
            if ($corpId === null) {
                $q->whereRaw('1 = 0'); // not in any tenant → no rows

                return;
            }

            $q->whereHas('user', fn ($uq) => $uq->where('corporation_id', $corpId));
        };

        // The eager-loaded assessmentItems are also constrained to the same
        // assessment set so per-row aggregation only counts evidence reachable
        // through tenant (and optionally currently-filtered) assessments.
        $assessmentItemsFilter = function ($q) use ($scopedAssessmentIds) {
            $q->whereIn('assessment_id', $scopedAssessmentIds);
        };

        $controlsQuery = Control::query()
            ->where('is_active', true)
            // ↓ The single most important change: hide global/library controls
            //   that aren't part of any (tenant-scoped, optionally filtered)
            //   assessment. AssessmentItem is the join row.
            ->whereHas(
                'assessmentItems',
                fn ($q) => $q->whereIn('assessment_id', $scopedAssessmentIds),
            )
            ->with([
                'framework:id,short_name,name',
                'directEvidence' => $tenantFilter,
                'assessmentItems' => $assessmentItemsFilter,
                'assessmentItems.evidence' => $tenantFilter,
            ])
            ->when(
                $request->filled('framework') && $request->framework !== 'all',
                fn ($q) => $q->where('framework_id', $request->framework),
            )
            ->when(
                $request->filled('search'),
                fn ($q) => $q->where(function ($qq) use ($request) {
                    $term = $request->string('search')->toString();
                    $qq->where('control_id', 'like', "%{$term}%")
                        ->orWhere('title', 'like', "%{$term}%");
                }),
            )
            ->orderBy('framework_id')
            ->orderBy('control_id');

        // If the tenant has no assessments at all, scopedAssessmentIds is
        // empty — whereIn with an empty list is always-false in Eloquent, so
        // the page renders with zero rows (correct outcome). The same holds
        // when whereHas('assessmentItems') is fed an empty set.
        $rows = $controlsQuery->get()->map(fn (Control $c) => $this->mapRow($c));

        // ── Stats are computed from the framework/search-filtered set BEFORE
        // the coverage-status filter narrows the table. This matches the
        // common dashboard idiom: "given my filters, here is the breakdown."
        $stats = $this->computeStats($rows);

        // ── Apply coverage status filter ────────────────────────────────────
        $statusFilter = $request->string('coverage')->toString();
        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $rows = $rows->where('coverage_status', $statusFilter)->values();
        }

        // ── Sort ────────────────────────────────────────────────────────────
        $rows = $this->applySort(
            $rows,
            $request->string('sort')->toString() ?: 'control_id',
            $request->string('direction')->toString() ?: 'asc',
        );

        // ── Paginate (manually, since rows are computed in PHP) ─────────────
        $page = max(1, (int) $request->input('page', 1));
        $paginator = new LengthAwarePaginator(
            items: $rows->forPage($page, $perPage)->values(),
            total: $rows->count(),
            perPage: $perPage,
            currentPage: $page,
            options: [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );

        $frameworks = Framework::where('is_active', true)
            ->orderBy('short_name')
            ->get(['id', 'short_name', 'name']);

        // Assessment dropdown options — same tenant-scoped list we used to
        // gate the controls query, mapped down to what the UI needs.
        $assessmentOptions = $tenantAssessments
            ->map(fn (Assessment $a) => [
                'id' => $a->id,
                'title' => $a->title,
            ])
            ->values();

        return Inertia::render('evidence-coverage', [
            'controls' => $paginator,
            'frameworks' => $frameworks,
            'assessments' => $assessmentOptions,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'framework' => $request->input('framework', 'all'),
                'assessment' => $request->input('assessment', 'all'),
                'coverage' => $request->input('coverage', 'all'),
                'sort' => $request->input('sort', 'control_id'),
                'direction' => $request->input('direction', 'asc'),
            ],
        ]);
    }

    /**
     * Reduce a Control + its tenant-scoped evidence into a row for the table.
     *
     * @return array<string, mixed>
     */
    private function mapRow(Control $control): array
    {
        $evidence = $control->assessmentItems
            ->flatMap->evidence
            ->concat($control->directEvidence ?? collect())
            ->unique('id');

        $evidenceCount = $evidence->count();
        $bestVerdict = $this->bestVerdict($evidence);
        $bestConfidence = $this->bestConfidence($evidence, $bestVerdict);
        $expiryStatus = $this->expiryStatus($evidence);
        $coverageStatus = $this->coverageStatus($evidenceCount, $bestVerdict, $expiryStatus);

        return [
            'id' => $control->id,
            'control_id' => $control->control_id,
            'title' => $control->title,
            'framework' => $control->framework ? [
                'id' => $control->framework->id,
                'short_name' => $control->framework->short_name,
                'name' => $control->framework->name,
            ] : null,
            'evidence_count' => $evidenceCount,
            'ai_verdict' => $bestVerdict, // 'Adequate' | 'Partially Adequate' | 'Insufficient' | null
            'ai_confidence' => $bestConfidence, // 'High' | 'Medium' | 'Low' | null
            'expiry_status' => $expiryStatus, // 'valid' | 'expiring' | 'expired' | 'no_expiry' | 'none'
            'coverage_status' => $coverageStatus,
            'coverage_rank' => self::STATUS_RANK[$coverageStatus] ?? 0,
        ];
    }

    /**
     * Pick the strongest AI verdict across a control's evidence collection.
     * Adequate > Partially Adequate > Insufficient > null.
     */
    private function bestVerdict(Collection $evidence): ?string
    {
        $rank = ['Insufficient' => 1, 'Partially Adequate' => 2, 'Adequate' => 3];
        $best = null;
        $bestRank = 0;

        foreach ($evidence as $e) {
            $verdict = $e->ai_verdict;
            if (! $verdict || ! isset($rank[$verdict])) {
                continue;
            }
            if ($rank[$verdict] > $bestRank) {
                $best = $verdict;
                $bestRank = $rank[$verdict];
            }
        }

        return $best;
    }

    /**
     * Confidence reported alongside the best verdict — pick the highest among
     * evidence rows that share that verdict, falling back to the highest seen.
     */
    private function bestConfidence(Collection $evidence, ?string $bestVerdict): ?string
    {
        $best = null;
        $bestRank = 0;

        foreach ($evidence as $e) {
            $confidence = $e->ai_confidence;
            if (! $confidence || ! isset(self::CONFIDENCE_RANK[$confidence])) {
                continue;
            }
            if ($bestVerdict !== null && $e->ai_verdict !== $bestVerdict) {
                continue;
            }
            if (self::CONFIDENCE_RANK[$confidence] > $bestRank) {
                $best = $confidence;
                $bestRank = self::CONFIDENCE_RANK[$confidence];
            }
        }

        return $best;
    }

    /**
     * Aggregate expiry view across a control's evidence.
     *
     * Returns:
     *   'expired'    — at least one evidence is past its expiry
     *   'expiring'   — at least one evidence expires within EXPIRY_SOON_DAYS
     *   'valid'      — at least one evidence has an expiry > 30 days out
     *   'no_expiry'  — has evidence but none of them set an expiry date
     *   'none'       — no evidence linked
     */
    private function expiryStatus(Collection $evidence): string
    {
        if ($evidence->isEmpty()) {
            return 'none';
        }

        $now = Carbon::now();
        $soonThreshold = $now->copy()->addDays(self::EXPIRY_SOON_DAYS);

        $hasExpired = false;
        $hasExpiringSoon = false;
        $hasFutureValid = false;
        $anyExpirySet = false;

        foreach ($evidence as $e) {
            $expiry = $e->expiry_date;
            if ($expiry === null) {
                continue;
            }
            $anyExpirySet = true;

            $expiryDate = $expiry instanceof Carbon ? $expiry : Carbon::parse($expiry);

            if ($expiryDate->isPast()) {
                $hasExpired = true;
            } elseif ($expiryDate->lte($soonThreshold)) {
                $hasExpiringSoon = true;
            } else {
                $hasFutureValid = true;
            }
        }

        if (! $anyExpirySet) {
            return 'no_expiry';
        }
        if ($hasExpired) {
            return 'expired';
        }
        if ($hasExpiringSoon) {
            return 'expiring';
        }
        if ($hasFutureValid) {
            return 'valid';
        }

        return 'no_expiry';
    }

    /**
     * Coverage badge logic. Priority:
     *   no evidence              -> no_evidence
     *   evidence has expiring    -> expiring     (acts as a flag — it overrides verdict)
     *   verdict = Adequate       -> fully_covered
     *   verdict = Insufficient   -> insufficient
     *   else                     -> partially_covered
     */
    private function coverageStatus(int $count, ?string $bestVerdict, string $expiryStatus): string
    {
        if ($count === 0) {
            return self::STATUS_NO_EVIDENCE;
        }

        if (in_array($expiryStatus, ['expiring', 'expired'], true)) {
            return self::STATUS_EXPIRING;
        }

        if ($bestVerdict === 'Adequate') {
            return self::STATUS_FULLY_COVERED;
        }

        if ($bestVerdict === 'Insufficient') {
            return self::STATUS_INSUFFICIENT;
        }

        return self::STATUS_PARTIAL;
    }

    /**
     * Stat-strip totals derived from the (unfiltered-by-coverage) row set.
     *
     * @return array<string, int>
     */
    private function computeStats(Collection $rows): array
    {
        $total = $rows->count();
        $fully = $rows->where('coverage_status', self::STATUS_FULLY_COVERED)->count();
        $none = $rows->where('coverage_status', self::STATUS_NO_EVIDENCE)->count();
        $insufficient = $rows->where('coverage_status', self::STATUS_INSUFFICIENT)->count();
        $expiring = $rows->where('coverage_status', self::STATUS_EXPIRING)->count();
        $partial = $rows->where('coverage_status', self::STATUS_PARTIAL)->count();

        return [
            'total' => $total,
            'fully_covered' => $fully,
            'fully_covered_pct' => $total > 0 ? (int) round(($fully / $total) * 100) : 0,
            'no_evidence' => $none,
            'insufficient' => $insufficient,
            'expiring' => $expiring,
            'partially_covered' => $partial,
        ];
    }

    private function applySort(Collection $rows, string $sort, string $direction): Collection
    {
        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';
        $descending = $direction === 'desc';

        return match ($sort) {
            'evidence_count' => $rows
                ->sortBy('evidence_count', SORT_REGULAR, $descending)
                ->values(),
            'coverage_status' => $rows
                ->sortBy(fn ($r) => $r['coverage_rank'], SORT_NUMERIC, $descending)
                ->values(),
            'framework' => $rows
                ->sortBy(fn ($r) => $r['framework']['short_name'] ?? '', SORT_FLAG_CASE | SORT_STRING, $descending)
                ->values(),
            default => $rows
                ->sortBy('control_id', SORT_NATURAL | SORT_FLAG_CASE, $descending)
                ->values(),
        };
    }
}
