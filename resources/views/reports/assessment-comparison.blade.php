<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assessment Comparison Report — GRC Management System</title>
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
        .header-title    { font-size: 20px; font-weight: bold; }
        .header-subtitle { font-size: 11px; color: #a8c4e0; margin-top: 3px; }
        .header-meta     { margin-top: 8px; font-size: 8px; color: #7fafd4; }

        .accent-bar {
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #0ea5e9);
        }

        /* ── VS Banner ── */
        .vs-banner {
            display: flex;
            align-items: stretch;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
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
            color: #94a3b8;
            letter-spacing: 1px;
            border-left: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            background: #ffffff;
        }
        .vs-label  { font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 3px; }
        .vs-title  { font-size: 12px; font-weight: bold; color: #1e3a5f; }
        .vs-meta   { font-size: 8.5px; color: #64748b; margin-top: 2px; }
        .fw-badge  { display: inline-block; padding: 1px 6px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 8px; color: #475569; margin-right: 5px; }

        /* ── KPI row ── */
        .content { padding: 18px 24px; }

        .kpi-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .kpi-box {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 12px;
            text-align: center;
            background: #f8fafc;
        }
        .kpi-label  { font-size: 8px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .kpi-value  { font-size: 18px; font-weight: bold; color: #1e3a5f; }
        .kpi-sub    { font-size: 8px; color: #64748b; margin-top: 2px; }
        .kpi-delta-pos { color: #16a34a; font-weight: bold; font-size: 9px; }
        .kpi-delta-neg { color: #dc2626; font-weight: bold; font-size: 9px; }
        .kpi-delta-nil { color: #64748b; font-size: 9px; }

        .net-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .net-improved  { background: #dcfce7; color: #166534; }
        .net-regressed { background: #fee2e2; color: #991b1b; }
        .net-nochange  { background: #f1f5f9; color: #475569; }

        /* ── Section title ── */
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e3a5f;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ── Comparison table ── */
        table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
        th {
            background: #1e3a5f;
            color: #ffffff;
            padding: 6px 8px;
            text-align: left;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        tr:nth-child(even) td { background: #f8fafc; }
        tr.improved td:first-child { border-left: 3px solid #22c55e; }
        tr.regressed td:first-child { border-left: 3px solid #ef4444; }

        /* ── Status / direction badges ── */
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 8px;
            font-size: 7.5px;
            font-weight: bold;
        }
        .badge-compliant    { background: #dcfce7; color: #166534; }
        .badge-partial      { background: #fef3c7; color: #92400e; }
        .badge-nc           { background: #fee2e2; color: #991b1b; }
        .badge-na           { background: #f1f5f9; color: #64748b; }
        .badge-improved     { background: #dcfce7; color: #166534; }
        .badge-regressed    { background: #fee2e2; color: #991b1b; }
        .badge-unchanged    { background: #f1f5f9; color: #475569; }
        .badge-new          { background: #dbeafe; color: #1d4ed8; }
        .badge-removed      { background: #f1f5f9; color: #64748b; }
        .badge-adequate     { background: #dcfce7; color: #166534; }
        .badge-part-ev      { background: #fef3c7; color: #92400e; }
        .badge-insuff       { background: #fee2e2; color: #991b1b; }
        .badge-fw           { background: #e0f2fe; color: #0369a1; }

        .text-none { color: #94a3b8; }

        /* ── Footer ── */
        .footer {
            margin-top: 24px;
            padding-top: 10px;
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
    <div class="header-eyebrow">GRC Management System — Compliance Report</div>
    <div class="header-title">Assessment Comparison Report</div>
    <div class="header-subtitle">Side-by-side comparison of control status, compliance scores, and evidence quality</div>
    <div class="header-meta">Generated: {{ $generatedAt }} &nbsp;|&nbsp; Classification: Internal</div>
</div>
<div class="accent-bar"></div>

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

    <div class="kpi-row">

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
                <td colspan="8" style="text-align:center; color:#94a3b8; padding: 20px;">
                    No controls found in either assessment.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        GRC Management System &mdash; Assessment Comparison Report &mdash; Generated {{ $generatedAt }}<br>
        "{{ $assessmentA['title'] }}" vs "{{ $assessmentB['title'] }}" &mdash; For internal use only
    </div>

</div>
</body>
</html>
