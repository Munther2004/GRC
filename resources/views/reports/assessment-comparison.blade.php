<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assessment Comparison Report — GRC Charter</title>
    @include('reports._partials._styles')
    <style>
        /* Page-specific: VS banner */
        .vs-banner {
            display: flex;
            align-items: stretch;
            border-bottom: 1px solid #d9d9dd;
            background: #fafaf8;
        }
        .vs-side {
            flex: 1;
            padding: 14px 20px;
        }
        .vs-divider {
            width: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            color: #93939f;
            letter-spacing: 1px;
            border-left: 1px solid #d9d9dd;
            border-right: 1px solid #d9d9dd;
            background: #ffffff;
        }
        .vs-label  { font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #93939f; margin-bottom: 3px; }
        .vs-title  { font-size: 12px; font-weight: bold; color: #003c33; }
        .vs-meta   { font-size: 8.5px; color: #75758a; margin-top: 2px; }
        .fw-badge  { display: inline-block; padding: 1px 6px; border: 1px solid #d9d9dd; border-radius: 999px; font-size: 8px; color: #212121; margin-right: 5px; }

        /* Comparison KPI flex (delta-aware) */
        .kpi-flex { display: flex; gap: 10px; margin-bottom: 20px; }
        .kpi-flex .kpi-box {
            flex: 1;
            border: 1px solid #d9d9dd;
            border-radius: 6px;
            padding: 10px 12px;
            text-align: center;
            background: #fafaf8;
        }
        .kpi-flex .kpi-label { font-size: 8px; color: #75758a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .kpi-flex .kpi-value { font-size: 18px; font-weight: bold; color: #003c33; }
        .kpi-flex .kpi-sub   { font-size: 8px; color: #75758a; margin-top: 2px; }
        .kpi-delta-pos { color: #46bd5f; font-weight: bold; font-size: 9px; }
        .kpi-delta-neg { color: #e5484d; font-weight: bold; font-size: 9px; }
        .kpi-delta-nil { color: #75758a; font-size: 9px; }

        .net-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 9px;
            font-weight: bold;
        }
        .net-improved  { background: #ecf9ef; color: #297a3b; }
        .net-regressed { background: #fdeeee; color: #b3343a; }
        .net-nochange  { background: #f1f1ee; color: #75758a; }

        /* Compact tables for the dense comparison rows */
        .content table { font-size: 8.5px; }
        .content thead th { padding: 6px 8px; font-size: 8px; }
        .content tbody td { padding: 6px 8px; }
        .content .badge { font-size: 7.5px; padding: 1px 6px; }

        /* Direction strip on improved/regressed rows */
        tr.improved td:first-child { border-left: 3px solid #46bd5f; }
        tr.regressed td:first-child { border-left: 3px solid #e5484d; }

        .text-none { color: #93939f; }
    </style>
</head>
<body>

@include('reports._partials._header', [
    'title'    => 'Assessment Comparison Report',
    'subtitle' => 'Side-by-side comparison of control status, compliance scores, and evidence quality',
    'meta'     => 'Generated: ' . $generatedAt . '   |   Classification: Internal',
])

<!-- VS Banner -->
<div class="vs-banner">
    <div class="vs-side">
        <div class="vs-label">Baseline (A)</div>
        <div class="vs-title">{{ $assessmentA['title'] }}</div>
        <div class="vs-meta">
            <span class="fw-badge">{{ $assessmentA['framework'] }}</span>
            {{ $assessmentA['date'] }} &nbsp;&middot;&nbsp; {{ $assessmentA['compliance_percentage'] }}% compliance
        </div>
    </div>
    <div class="vs-divider">VS</div>
    <div class="vs-side">
        <div class="vs-label">Latest (B)</div>
        <div class="vs-title">{{ $assessmentB['title'] }}</div>
        <div class="vs-meta">
            <span class="fw-badge">{{ $assessmentB['framework'] }}</span>
            {{ $assessmentB['date'] }} &nbsp;&middot;&nbsp; {{ $assessmentB['compliance_percentage'] }}% compliance
        </div>
    </div>
</div>

<div class="content">

    <!-- KPI Row -->
    @php
        $delta  = $summary['compliance_delta'];
        $edelta = $summary['evidence_quality_delta'];
    @endphp

    <div class="kpi-flex">

        <div class="kpi-box">
            <div class="kpi-label">Compliance Score</div>
            <div class="kpi-value">{{ $summary['compliance_score_a'] }}% → {{ $summary['compliance_score_b'] }}%</div>
            <div class="kpi-sub">
                @if($delta > 0)
                    <span class="kpi-delta-pos">+{{ $delta }}% improved</span>
                @elseif($delta < 0)
                    <span class="kpi-delta-neg">{{ $delta }}% regressed</span>
                @else
                    <span class="kpi-delta-nil">No change</span>
                @endif
            </div>
        </div>

        <div class="kpi-box">
            <div class="kpi-label">Controls Changed</div>
            <div class="kpi-value">{{ $summary['changed_count'] }}</div>
            <div class="kpi-sub">
                {{ $summary['improved_count'] }} improved &nbsp;/&nbsp; {{ $summary['regressed_count'] }} regressed
            </div>
        </div>

        <div class="kpi-box">
            <div class="kpi-label">Evidence Quality</div>
            <div class="kpi-value">{{ $summary['evidence_quality_a'] }}% → {{ $summary['evidence_quality_b'] }}%</div>
            <div class="kpi-sub">
                @if($edelta > 0)
                    <span class="kpi-delta-pos">+{{ $edelta }}% improved</span>
                @elseif($edelta < 0)
                    <span class="kpi-delta-neg">{{ $edelta }}% regressed</span>
                @else
                    <span class="kpi-delta-nil">No change</span>
                @endif
            </div>
        </div>

        <div class="kpi-box">
            <div class="kpi-label">Total Controls</div>
            <div class="kpi-value">{{ $summary['total_controls'] }}</div>
            <div class="kpi-sub">across both assessments</div>
        </div>

        <div class="kpi-box">
            <div class="kpi-label">Net Change</div>
            <div style="margin-top: 6px;">
                @if($delta > 0)
                    <span class="net-badge net-improved">&#8593; Overall Improved</span>
                @elseif($delta < 0)
                    <span class="net-badge net-regressed">&#8595; Overall Regressed</span>
                @else
                    <span class="net-badge net-nochange">&#8212; No Change</span>
                @endif
            </div>
        </div>

    </div>

    <!-- Comparison Table -->
    <div class="section-title">Control-by-Control Comparison</div>

    <table>
        <thead>
            <tr>
                <th style="width:8%">Code</th>
                <th style="width:22%">Control Name</th>
                <th style="width:7%">Framework</th>
                <th style="width:12%">Status A</th>
                <th style="width:12%">Status B</th>
                <th style="width:10%">Change</th>
                <th style="width:10%">Evidence A</th>
                <th style="width:10%">Evidence B</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            @php
                $rowClass = '';
                if ($row['direction'] === 'improved')  $rowClass = 'improved';
                if ($row['direction'] === 'regressed') $rowClass = 'regressed';

                $statusBadgeClass = [
                    'compliant'           => 'badge-compliant',
                    'partially_compliant' => 'badge-partial',
                    'non_compliant'       => 'badge-nc',
                    'not_applicable'      => 'badge-na',
                    'not_assessed'        => 'badge-na',
                ];
                $statusLabel = [
                    'compliant'           => 'Compliant',
                    'partially_compliant' => 'Partial',
                    'non_compliant'       => 'Non-Compliant',
                    'not_applicable'      => 'N/A',
                    'not_assessed'        => 'Not Assessed',
                ];
                $dirBadgeClass = [
                    'improved'  => 'badge-improved',
                    'regressed' => 'badge-regressed',
                    'unchanged' => 'badge-unchanged',
                    'new'       => 'badge-new',
                    'removed'   => 'badge-removed',
                ];
                $dirLabel = [
                    'improved'  => '↑ Improved',
                    'regressed' => '↓ Regressed',
                    'unchanged' => '→ Unchanged',
                    'new'       => '✦ New',
                    'removed'   => '✕ Removed',
                ];
                $verdictBadgeClass = [
                    'Adequate'          => 'badge-adequate',
                    'Partially Adequate'=> 'badge-part-ev',
                    'Insufficient'      => 'badge-insuff',
                ];
                $verdictLabel = [
                    'Adequate'          => 'Adequate',
                    'Partially Adequate'=> 'Partial',
                    'Insufficient'      => 'Insufficient',
                ];
            @endphp
            <tr class="{{ $rowClass }}">
                <td><strong>{{ $row['control_code'] }}</strong></td>
                <td>{{ Str::limit($row['control_name'], 55) }}</td>
                <td><span class="badge badge-fw">{{ $row['framework'] }}</span></td>
                <td>
                    <span class="badge {{ $statusBadgeClass[$row['status_a']] ?? 'badge-na' }}">
                        {{ $statusLabel[$row['status_a']] ?? $row['status_a'] }}
                    </span>
                </td>
                <td>
                    <span class="badge {{ $statusBadgeClass[$row['status_b']] ?? 'badge-na' }}">
                        {{ $statusLabel[$row['status_b']] ?? $row['status_b'] }}
                    </span>
                </td>
                <td>
                    <span class="badge {{ $dirBadgeClass[$row['direction']] ?? 'badge-unchanged' }}">
                        {{ $dirLabel[$row['direction']] ?? $row['direction'] }}
                    </span>
                </td>
                <td>
                    @if($row['evidence_verdict_a'])
                        <span class="badge {{ $verdictBadgeClass[$row['evidence_verdict_a']] ?? '' }}">
                            {{ $verdictLabel[$row['evidence_verdict_a']] ?? $row['evidence_verdict_a'] }}
                        </span>
                    @else
                        <span class="text-none">—</span>
                    @endif
                </td>
                <td>
                    @if($row['evidence_verdict_b'])
                        <span class="badge {{ $verdictBadgeClass[$row['evidence_verdict_b']] ?? '' }}">
                            {{ $verdictLabel[$row['evidence_verdict_b']] ?? $row['evidence_verdict_b'] }}
                        </span>
                    @else
                        <span class="text-none">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align:center; color:#93939f; padding: 20px;">
                    No controls found in either assessment.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    @include('reports._partials._footer', [
        'left'  => 'GRC Charter — Assessment Comparison Report — Generated ' . $generatedAt,
        'right' => '"' . $assessmentA['title'] . '" vs "' . $assessmentB['title'] . '"',
        'fixed' => false,
    ])

</div>
</body>
</html>
