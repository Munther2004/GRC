<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Executive Dashboard — GRC Charter</title>
    @include('reports._partials._styles')
    <style>
        /* Page-specific: Health Score banner ── */
        .health-banner {
            display: flex;
            align-items: stretch;
            border: 1px solid #d9d9dd;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
            /* Never split the grade letter from its score breakdown across a
               page break — the banner is the visual hook for page 1. */
            page-break-inside: avoid;
        }
        .health-grade {
            width: 72px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px 8px;
            /* background tint set inline per severity grade */
            border-right: 1px solid #d9d9dd;
        }
        .grade-letter {
            font-family: 'DejaVu Serif', Georgia, serif;
            font-size: 38px;
            font-weight: bold;
            line-height: 1;
            letter-spacing: -0.6px;
        }
        .grade-label  { font-size: 7.5px; color: #75758a; margin-top: 6px; text-align: center; text-transform: uppercase; letter-spacing: 0.6px; }
        .health-body  { flex: 1; padding: 12px 16px; }
        .health-score-big { font-size: 20px; font-weight: bold; color: #003c33; }
        .health-score-sub { font-size: 8.5px; color: #75758a; }
        .health-basis { font-size: 8px; color: #93939f; margin-top: 2px; }

        /* Component bars */
        .comp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .comp-label { width: 95px; font-size: 8.5px; color: #212121; }
        .comp-track { flex: 1; height: 5px; background: #d9d9dd; border-radius: 3px; overflow: hidden; }
        .comp-fill  { height: 100%; border-radius: 3px; }
        .comp-val   { width: 30px; font-size: 8px; text-align: right; color: #75758a; }
        .comp-max   { width: 22px; font-size: 7.5px; text-align: right; color: #93939f; }

        /* KPI flex row (page-specific) */
        .kpi-flex { display: flex; gap: 10px; margin-bottom: 18px; page-break-inside: avoid; }
        .kpi-flex .kpi-box { padding: 10px 12px; }
        .kpi-flex .kpi-label { font-size: 7.5px; color: #75758a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }

        /* Framework bars */
        .fw-row { margin-bottom: 9px; }
        .fw-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
        .fw-name   { font-size: 9px; font-weight: bold; color: #003c33; }
        .fw-pct    { font-size: 10px; font-weight: bold; }
        .fw-track  { height: 7px; background: #d9d9dd; border-radius: 4px; overflow: hidden; }
        .fw-fill   { height: 100%; border-radius: 4px; }
        .fw-sub    { font-size: 7.5px; color: #93939f; margin-top: 2px; }

        /* Evidence grid */
        .ev-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .ev-item { width: calc(50% - 4px); }
        .ev-value { font-size: 16px; font-weight: bold; }
        .ev-grid .ev-label { font-size: 7.5px; color: #75758a; }

        /* Latest assessment box */
        .latest-box {
            border: 1px solid #d9d9dd;
            border-radius: 5px;
            padding: 8px;
            background: #fafaf8;
            margin-top: 8px;
        }
        .latest-label { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #93939f; margin-bottom: 2px; }
        .latest-title { font-size: 9.5px; font-weight: bold; color: #003c33; }
        .latest-meta  { font-size: 7.5px; color: #75758a; margin-top: 2px; }
        .fw-chip {
            display: inline-block;
            padding: 1px 5px;
            border: 1px solid #d9d9dd;
            border-radius: 999px;
            font-size: 7.5px;
            color: #212121;
            margin-right: 4px;
        }
        .stat-row { display: flex; gap: 10px; margin-bottom: 8px; }
        .stat-box { flex: 1; text-align: center; padding: 8px 4px; background: #fafaf8; border: 1px solid #d9d9dd; border-radius: 5px; }
        .stat-value { font-size: 16px; font-weight: bold; }
        .stat-label { font-size: 7.5px; color: #75758a; }

        /* Trend bars (sparkline substitute) */
        .trend-row { display: flex; gap: 8px; align-items: flex-end; }
        .trend-bar-wrap { flex: 1; text-align: center; }
        .trend-bar-outer { height: 40px; background: #fafaf8; border-radius: 3px 3px 0 0; display: flex; align-items: flex-end; }
        .trend-bar-inner { width: 100%; border-radius: 3px 3px 0 0; }
        .trend-date { font-size: 7px; color: #93939f; margin-top: 2px; }
        .trend-val  { font-size: 8px; font-weight: bold; color: #003c33; }

        /* Static footer (no fixed bar on this template) */
        .dashboard-footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #d9d9dd;
            font-size: 7.5px;
            color: #93939f;
            text-align: center;
        }

        /* Compact tables for this dense layout */
        .content table { font-size: 8.5px; }
        .content thead th { padding: 5px 7px; font-size: 7.5px; }
        .content tbody td { padding: 5px 7px; }
    </style>
</head>
<body>

@include('reports._partials._header', [
    'title'    => 'Executive Dashboard',
    'subtitle' => 'Compliance & Risk Posture Overview',
    'right'    => 'Confidential — Internal Use Only<br>Generated: ' . e($generatedAt),
])

<div class="content">

    <!-- ── Health Score Banner ── -->
    @php
        $gradeColors = ['A' => '#46bd5f', 'B' => '#003c33', 'C' => '#f5b929', 'D' => '#f76b15', 'F' => '#e5484d'];
        $gradeBgs    = ['A' => '#ecf9ef', 'B' => '#edfce9', 'C' => '#fef8e3', 'D' => '#fef0e6', 'F' => '#fdeeee'];
        $gradeColor  = $gradeColors[$healthScore['grade']] ?? '#e5484d';
        $gradeBg     = $gradeBgs[$healthScore['grade']]    ?? '#fdeeee';

        $compliancePct = $complianceSummary['overall_pct'];
        $compColor = $compliancePct >= 80 ? '#46bd5f' : ($compliancePct >= 60 ? '#f76b15' : '#e5484d');
    @endphp

    <div class="health-banner">
        <div class="health-grade" style="background: {{ $gradeBg }}">
            <div class="grade-letter" style="color: {{ $gradeColor }}">{{ $healthScore['grade'] }}</div>
            <div class="grade-label">Health Grade</div>
        </div>
        <div class="health-body">
            <span class="health-score-big" style="color: {{ $gradeColor }}">{{ $healthScore['health_score'] }}</span>
            <span class="health-score-sub"> / 100 — Compliance Health Score</span>
            <div class="health-basis">
                Basis: {{ $healthScore['raw']['compliance_basis'] === 'evidence' ? 'Evidence-weighted compliance' : 'Self-assessed compliance' }}
                &nbsp;&middot;&nbsp; Open risks: {{ $healthScore['raw']['open_risks'] }}
                &nbsp;&middot;&nbsp; Critical risks: {{ $healthScore['raw']['critical_risks'] }}
                &nbsp;&middot;&nbsp; Evidence approval: {{ $healthScore['raw']['approval_rate'] }}%
            </div>
            <div style="margin-top: 8px;">
                @foreach([
                    ['Compliance', $healthScore['components']['compliance'], 40, '#003c33'],
                    ['Critical Risks', $healthScore['components']['critical_risks'], 20, '#e5484d'],
                    ['Evidence Quality', $healthScore['components']['evidence_quality'], 20, '#46bd5f'],
                    ['Overdue Items', $healthScore['components']['overdue_items'], 10, '#f5b929'],
                    ['Open Risks', $healthScore['components']['open_risks'], 10, '#f76b15'],
                ] as [$lbl, $val, $mx, $clr])
                <div class="comp-row">
                    <div class="comp-label">{{ $lbl }}</div>
                    <div class="comp-track">
                        <div class="comp-fill" style="width: {{ ($mx > 0 ? $val/$mx : 0) * 100 }}%; background: {{ $clr }};"></div>
                    </div>
                    <div class="comp-val">{{ $val }}</div>
                    <div class="comp-max">/ {{ $mx }}</div>
                </div>
                @endforeach
            </div>
        </div>
    </div>

    <!-- ── KPI Row ── -->
    <div class="kpi-flex">
        <div class="kpi-box">
            <div class="kpi-label">Compliance</div>
            <div class="kpi-value" style="color: {{ $compColor }}">{{ $compliancePct }}%</div>
            <div class="kpi-sub">{{ $complianceSummary['compliant'] }} compliant of {{ $complianceSummary['total_controls'] }}</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Open Risks</div>
            <div class="kpi-value">{{ $riskSummary['total_open'] }}</div>
            <div class="kpi-sub">Avg score {{ $riskSummary['avg_score'] }}/25</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Critical Risks</div>
            <div class="kpi-value {{ $riskSummary['critical'] > 0 ? 'text-red' : 'text-green' }}">{{ $riskSummary['critical'] }}</div>
            <div class="kpi-sub">{{ $riskSummary['high'] }} high severity</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Evidence Files</div>
            <div class="kpi-value text-blue">{{ $evidenceSummary['total'] }}</div>
            <div class="kpi-sub">
                <span class="text-green">{{ $evidenceSummary['approved'] }}</span> approved /
                <span class="text-amber">{{ $evidenceSummary['pending'] }}</span> pending
            </div>
        </div>
        <div class="kpi-box">
            <div class="kpi-label">Assessments</div>
            <div class="kpi-value">{{ $assessmentSummary['total'] }}</div>
            <div class="kpi-sub">
                {{ $assessmentSummary['completed'] }} completed
                @if($assessmentSummary['overdue'] > 0)
                    &nbsp;&middot;&nbsp; <span class="text-red">{{ $assessmentSummary['overdue'] }} overdue</span>
                @endif
            </div>
        </div>
    </div>

    <!-- ── Top Risks + Framework ── -->
    <div class="two-col">

        <!-- Top Risks -->
        <div class="col-half">
            <div class="box">
                <div class="box-header">Top Risks by Score</div>
                <table>
                    <thead>
                        <tr>
                            <th class="num" style="width:5%">#</th>
                            <th style="width:38%">Risk Title</th>
                            <th class="num" style="width:12%">Score</th>
                            <th style="width:15%">Level</th>
                            <th style="width:15%">Status</th>
                            <th style="width:15%">Treatment</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($riskSummary['top_risks'] as $i => $risk)
                        @php
                            $lvl = $risk['level'];
                            $lvlClass = match($lvl) {
                                'critical' => 'badge-critical',
                                'high'     => 'badge-high',
                                'medium'   => 'badge-medium',
                                default    => 'badge-low',
                            };
                        @endphp
                        <tr>
                            <td class="num">{{ $i + 1 }}</td>
                            <td>{{ Str::limit($risk['title'], 40) }}</td>
                            <td class="num"><strong>{{ $risk['score'] }}</strong>/25</td>
                            <td><span class="badge {{ $lvlClass }}">{{ ucfirst($lvl) }}</span></td>
                            <td>{{ str_replace('_', ' ', ucfirst($risk['status'])) }}</td>
                            <td>{{ $risk['has_treatment'] ? 'Planned' : 'None' }}</td>
                        </tr>
                        @empty
                        <tr><td colspan="6" style="text-align:center;color:#93939f;padding:12px;">No risks recorded.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Framework Breakdown -->
        <div class="col-half">
            <div class="box">
                <div class="box-header">Framework Compliance</div>
                <div class="box-body">
                    @forelse($frameworkBreakdown as $fw)
                    @php
                        $fwPct = $fw['compliance_pct'];
                        $fwClr = $fwPct >= 80 ? '#46bd5f' : ($fwPct >= 60 ? '#f76b15' : '#e5484d');
                    @endphp
                    <div class="fw-row">
                        <div class="fw-header">
                            <span class="fw-name">{{ $fw['name'] }}</span>
                            <span class="fw-pct" style="color: {{ $fwClr }}">{{ $fwPct }}%</span>
                        </div>
                        <div class="fw-track">
                            <div class="fw-fill" style="width: {{ $fwPct }}%; background: {{ $fwClr }};"></div>
                        </div>
                        <div class="fw-sub">
                            {{ $fw['compliant'] }} compliant &middot;
                            {{ $fw['partial'] }} partial &middot;
                            {{ $fw['non_compliant'] }} non-compliant &middot;
                            {{ $fw['total_controls'] }} total
                        </div>
                    </div>
                    @empty
                    <p style="color:#93939f;font-size:8.5px;text-align:center;padding:12px 0;">No framework data.</p>
                    @endforelse
                </div>
            </div>
        </div>
    </div>

    <!-- ── Evidence + Assessment ── -->
    <div class="two-col">

        <!-- Evidence Status -->
        <div class="col-half">
            <div class="box">
                <div class="box-header">Evidence Status</div>
                <div class="box-body">
                    <div class="ev-grid">
                        @foreach([
                            ['Approved',      $evidenceSummary['approved'],      '#46bd5f'],
                            ['Pending Review',$evidenceSummary['pending'],        '#f5b929'],
                            ['Rejected',      $evidenceSummary['rejected'],       '#e5484d'],
                            ['Expiring ≤14d', $evidenceSummary['expiring_soon'],  '#f76b15'],
                            ['Expired',       $evidenceSummary['expired'],        '#75758a'],
                            ['Total Files',   $evidenceSummary['total'],          '#003c33'],
                        ] as [$lbl, $val, $clr])
                        <div class="ev-item">
                            <div class="ev-value" style="color: {{ $clr }}">{{ $val }}</div>
                            <div class="ev-label">{{ $lbl }}</div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        <!-- Assessment Summary -->
        <div class="col-half">
            <div class="box">
                <div class="box-header">Assessment Summary</div>
                <div class="box-body">
                    <div class="stat-row">
                        @foreach([
                            ['Total',      $assessmentSummary['total'],      '#003c33'],
                            ['Completed',  $assessmentSummary['completed'],  '#46bd5f'],
                            ['In Progress',$assessmentSummary['in_progress'],'#003c33'],
                            ['Overdue',    $assessmentSummary['overdue'],    $assessmentSummary['overdue'] > 0 ? '#e5484d' : '#93939f'],
                        ] as [$lbl, $val, $clr])
                        <div class="stat-box">
                            <div class="stat-value" style="color: {{ $clr }}">{{ $val }}</div>
                            <div class="stat-label">{{ $lbl }}</div>
                        </div>
                        @endforeach
                    </div>

                    @if($assessmentSummary['latest_title'])
                    <div class="latest-box">
                        <div class="latest-label">Latest Assessment</div>
                        <div class="latest-title">{{ Str::limit($assessmentSummary['latest_title'], 55) }}</div>
                        <div class="latest-meta">
                            @if($assessmentSummary['latest_framework'])
                                <span class="fw-chip">{{ $assessmentSummary['latest_framework'] }}</span>
                            @endif
                            {{ $assessmentSummary['latest_date'] }}
                            @if($assessmentSummary['latest_score'] !== null)
                                &nbsp;&middot;&nbsp;
                                <strong style="color: {{ $assessmentSummary['latest_score'] >= 80 ? '#46bd5f' : ($assessmentSummary['latest_score'] >= 60 ? '#f76b15' : '#e5484d') }}">
                                    {{ $assessmentSummary['latest_score'] }}%
                                </strong> compliance
                            @endif
                        </div>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- ── Compliance Trend ── -->
    @if(count($trend) > 0)
    <div class="box" style="margin-bottom: 18px;">
        <div class="box-header">Compliance Trend (Last {{ count($trend) }} Snapshots)</div>
        <div class="box-body">
            @if(count($trend) < 2)
            <p style="color:#93939f;font-size:8.5px;text-align:center;">Not enough snapshot data yet.</p>
            @else
            @php
                $trendCount = count($trend);
                $sparkW = 700; $sparkH = 50;
                $padX = 8; $padY = 6;
                $usableW = $sparkW - 2 * $padX;
                $usableH = $sparkH - 2 * $padY;
                $polyPoints = '';
                $dotPoints  = [];
                foreach ($trend as $i => $point) {
                    $x = $padX + ($i * $usableW / max($trendCount - 1, 1));
                    $y = $padY + $usableH - (($point['compliance_score'] / 100) * $usableH);
                    $polyPoints .= round($x, 1) . ',' . round($y, 1) . ' ';
                    $dotPoints[] = ['x' => round($x, 1), 'y' => round($y, 1)];
                }
            @endphp
            <div style="display: table; width: 100%; margin-bottom: 4px;">
                @foreach($trend as $point)
                    <div style="display: table-cell; text-align: center; font-size: 8px; font-weight: bold; color: #003c33;">{{ $point['compliance_score'] }}%</div>
                @endforeach
            </div>
            <svg viewBox="0 0 {{ $sparkW }} {{ $sparkH }}" preserveAspectRatio="none" style="width: 100%; height: 42px;">
                <polyline points="{{ trim($polyPoints) }}" fill="none" stroke="#003c33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                @foreach($dotPoints as $dot)
                    <circle cx="{{ $dot['x'] }}" cy="{{ $dot['y'] }}" r="3" fill="#003c33" />
                @endforeach
            </svg>
            <div style="display: table; width: 100%; margin-top: 6px;">
                @foreach($trend as $point)
                    <div style="display: table-cell; text-align: center; font-size: 7px; color: #93939f;">{{ $point['date'] }}</div>
                @endforeach
            </div>
            @endif
        </div>
    </div>
    @endif

    @include('reports._partials._page_chrome', ['reportTitle' => 'Executive Dashboard'])

</div>
</body>
</html>
