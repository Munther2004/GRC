<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Executive Dashboard — GRC Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10px;
            color: #1a1a2e;
            background: #ffffff;
            line-height: 1.5;
        }

        /* ── Header ── */
        .header {
            background: #1e3a5f;
            color: #ffffff;
            padding: 22px 28px 18px;
        }
        .header-eyebrow {
            font-size: 8px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #7fafd4;
            margin-bottom: 5px;
        }
        .header-title    { font-size: 22px; font-weight: bold; }
        .header-sub      { font-size: 11px; color: #a8c4e0; margin-top: 3px; }
        .header-meta     { margin-top: 10px; font-size: 8.5px; color: #7fafd4; }
        .header-right    { float: right; text-align: right; font-size: 8px; color: #7fafd4; }

        .accent-bar { height: 3px; background: linear-gradient(90deg, #2563eb, #0ea5e9); }

        .content { padding: 18px 24px; }

        /* ── Section title ── */
        .section-title {
            font-size: 10px;
            font-weight: bold;
            color: #1e3a5f;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ── Health Score banner ── */
        .health-banner {
            display: flex;
            align-items: stretch;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
        }
        .health-grade {
            width: 90px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 14px;
            background: #f0f9ff;
            border-right: 1px solid #e2e8f0;
        }
        .grade-letter { font-size: 40px; font-weight: 900; line-height: 1; }
        .grade-label  { font-size: 8px; color: #64748b; margin-top: 4px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .health-body  { flex: 1; padding: 12px 16px; }
        .health-score-big { font-size: 20px; font-weight: bold; color: #1e3a5f; }
        .health-score-sub { font-size: 8.5px; color: #64748b; }
        .health-basis { font-size: 8px; color: #94a3b8; margin-top: 2px; }

        /* Component bars */
        .comp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .comp-label { width: 95px; font-size: 8.5px; color: #475569; }
        .comp-track { flex: 1; height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .comp-fill  { height: 100%; border-radius: 3px; }
        .comp-val   { width: 30px; font-size: 8px; text-align: right; color: #64748b; }
        .comp-max   { width: 22px; font-size: 7.5px; text-align: right; color: #94a3b8; }

        /* ── KPI row ── */
        .kpi-row { display: flex; gap: 10px; margin-bottom: 18px; }
        .kpi-box {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
            background: #f8fafc;
        }
        .kpi-label { font-size: 7.5px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .kpi-value { font-size: 20px; font-weight: bold; color: #1e3a5f; line-height: 1.1; }
        .kpi-sub   { font-size: 8px; color: #64748b; margin-top: 2px; }
        .text-green { color: #16a34a; }
        .text-amber { color: #d97706; }
        .text-red   { color: #dc2626; }
        .text-blue  { color: #2563eb; }

        /* ── Two-col layout ── */
        .two-col { display: flex; gap: 16px; margin-bottom: 18px; }
        .col-half { flex: 1; }
        .box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }
        .box-header {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            padding: 7px 10px;
            font-size: 9px;
            font-weight: bold;
            color: #1e3a5f;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .box-body { padding: 10px; }

        /* ── Risk table ── */
        table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
        th {
            background: #1e3a5f;
            color: #ffffff;
            padding: 5px 7px;
            text-align: left;
            font-size: 7.5px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        td { padding: 5px 7px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) td { background: #f8fafc; }

        .badge {
            display: inline-block;
            padding: 1px 5px;
            border-radius: 8px;
            font-size: 7.5px;
            font-weight: bold;
        }
        .badge-critical { background: #fee2e2; color: #991b1b; }
        .badge-high     { background: #ffedd5; color: #9a3412; }
        .badge-medium   { background: #fef3c7; color: #92400e; }
        .badge-low      { background: #dcfce7; color: #166534; }

        /* ── Framework bars ── */
        .fw-row { margin-bottom: 9px; }
        .fw-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
        .fw-name   { font-size: 9px; font-weight: bold; color: #1e3a5f; }
        .fw-pct    { font-size: 10px; font-weight: bold; }
        .fw-track  { height: 7px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .fw-fill   { height: 100%; border-radius: 4px; }
        .fw-sub    { font-size: 7.5px; color: #94a3b8; margin-top: 2px; }

        /* ── Evidence grid ── */
        .ev-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .ev-item { width: calc(50% - 4px); }
        .ev-value { font-size: 16px; font-weight: bold; }
        .ev-label { font-size: 7.5px; color: #64748b; }

        /* ── Assessment box ── */
        .latest-box {
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            padding: 8px;
            background: #f8fafc;
            margin-top: 8px;
        }
        .latest-label { font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 2px; }
        .latest-title { font-size: 9.5px; font-weight: bold; color: #1e3a5f; }
        .latest-meta  { font-size: 7.5px; color: #64748b; margin-top: 2px; }
        .fw-chip {
            display: inline-block;
            padding: 1px 5px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 7.5px;
            color: #475569;
            margin-right: 4px;
        }
        .stat-row { display: flex; gap: 10px; margin-bottom: 8px; }
        .stat-box { flex: 1; text-align: center; padding: 8px 4px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; }
        .stat-value { font-size: 16px; font-weight: bold; }
        .stat-label { font-size: 7.5px; color: #64748b; }

        /* ── Trend table (sparkline substitute for PDF) ── */
        .trend-row { display: flex; gap: 8px; align-items: flex-end; }
        .trend-bar-wrap { flex: 1; text-align: center; }
        .trend-bar-outer { height: 40px; background: #f1f5f9; border-radius: 3px 3px 0 0; display: flex; align-items: flex-end; }
        .trend-bar-inner { width: 100%; border-radius: 3px 3px 0 0; }
        .trend-date { font-size: 7px; color: #94a3b8; margin-top: 2px; }
        .trend-val  { font-size: 8px; font-weight: bold; color: #2563eb; }

        /* ── Footer ── */
        .footer {
            margin-top: 20px;
            padding-top: 8px;
            border-top: 1px solid #e2e8f0;
            font-size: 7.5px;
            color: #94a3b8;
            text-align: center;
        }

        .page-break { page-break-after: always; }
    </style>
</head>
<body>

<!-- Header -->
<div class="header">
    <div class="header-right">
        Confidential &mdash; Internal Use Only<br>Generated: {{ $generatedAt }}
    </div>
    <div class="header-eyebrow">GRC Management System &mdash; Executive Report</div>
    <div class="header-title">Executive Dashboard</div>
    <div class="header-sub">Compliance &amp; Risk Posture Overview</div>
</div>
<div class="accent-bar"></div>

<div class="content">

    <!-- ── Health Score Banner ── -->
    @php
        $gradeColors = ['A' => '#16a34a', 'B' => '#2563eb', 'C' => '#d97706', 'D' => '#ea580c', 'F' => '#dc2626'];
        $gradeColor  = $gradeColors[$healthScore['grade']] ?? '#dc2626';

        $compliancePct = $complianceSummary['overall_pct'];
        $compColor = $compliancePct >= 80 ? '#16a34a' : ($compliancePct >= 60 ? '#d97706' : '#dc2626');
    @endphp

    <div class="health-banner">
        <div class="health-grade">
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
                    ['Compliance', $healthScore['components']['compliance'], 40, '#3b82f6'],
                    ['Critical Risks', $healthScore['components']['critical_risks'], 20, '#ef4444'],
                    ['Evidence Quality', $healthScore['components']['evidence_quality'], 20, '#8b5cf6'],
                    ['Overdue Items', $healthScore['components']['overdue_items'], 10, '#f59e0b'],
                    ['Open Risks', $healthScore['components']['open_risks'], 10, '#f97316'],
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
    <div class="kpi-row">
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
                            <th style="width:5%">#</th>
                            <th style="width:38%">Risk Title</th>
                            <th style="width:12%">Score</th>
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
                            <td>{{ $i + 1 }}</td>
                            <td>{{ Str::limit($risk['title'], 40) }}</td>
                            <td><strong>{{ $risk['score'] }}</strong>/25</td>
                            <td><span class="badge {{ $lvlClass }}">{{ ucfirst($lvl) }}</span></td>
                            <td>{{ str_replace('_', ' ', ucfirst($risk['status'])) }}</td>
                            <td>{{ $risk['has_treatment'] ? 'Planned' : 'None' }}</td>
                        </tr>
                        @empty
                        <tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:12px;">No risks recorded.</td></tr>
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
                        $fwClr = $fwPct >= 80 ? '#16a34a' : ($fwPct >= 60 ? '#d97706' : '#dc2626');
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
                    <p style="color:#94a3b8;font-size:8.5px;text-align:center;padding:12px 0;">No framework data.</p>
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
                            ['Approved',      $evidenceSummary['approved'],      '#16a34a'],
                            ['Pending Review',$evidenceSummary['pending'],        '#d97706'],
                            ['Rejected',      $evidenceSummary['rejected'],       '#dc2626'],
                            ['Expiring ≤14d', $evidenceSummary['expiring_soon'],  '#ea580c'],
                            ['Expired',       $evidenceSummary['expired'],        '#64748b'],
                            ['Total Files',   $evidenceSummary['total'],          '#2563eb'],
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
                            ['Total',      $assessmentSummary['total'],      '#1e3a5f'],
                            ['Completed',  $assessmentSummary['completed'],  '#16a34a'],
                            ['In Progress',$assessmentSummary['in_progress'],'#2563eb'],
                            ['Overdue',    $assessmentSummary['overdue'],    $assessmentSummary['overdue'] > 0 ? '#dc2626' : '#94a3b8'],
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
                                <strong style="color: {{ $assessmentSummary['latest_score'] >= 80 ? '#16a34a' : ($assessmentSummary['latest_score'] >= 60 ? '#d97706' : '#dc2626') }}">
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
            <p style="color:#94a3b8;font-size:8.5px;text-align:center;">Not enough snapshot data yet.</p>
            @else
            <div class="trend-row">
                @foreach($trend as $point)
                @php $barH = max(4, (int)round($point['compliance_score'] * 0.4)); @endphp
                <div class="trend-bar-wrap">
                    <div class="trend-val">{{ $point['compliance_score'] }}%</div>
                    <div class="trend-bar-outer">
                        <div class="trend-bar-inner" style="height: {{ $barH }}px; background: #3b82f6;"></div>
                    </div>
                    <div class="trend-date">{{ $point['date'] }}</div>
                </div>
                @endforeach
            </div>
            @endif
        </div>
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        GRC Management System &mdash; Executive Dashboard Report &mdash; Generated {{ $generatedAt }}<br>
        Confidential &mdash; Internal Use Only &mdash; Do not distribute outside the organisation
    </div>

</div>
</body>
</html>
