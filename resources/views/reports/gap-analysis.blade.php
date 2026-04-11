<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Gap Analysis Report — GRC Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background: #ffffff;
            line-height: 1.6;
        }

        .header {
            background: #1e3a5f;
            color: #ffffff;
            padding: 26px 32px 20px;
        }
        .header-eyebrow {
            font-size: 9px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #7fafd4;
            margin-bottom: 6px;
        }
        .header-title   { font-size: 22px; font-weight: bold; }
        .header-subtitle{ font-size: 12px; color: #a8c4e0; margin-top: 4px; }
        .header-meta    { margin-top: 10px; font-size: 9px; color: #7fafd4; }

        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #7c3aed, #4f46e5);
            margin-bottom: 0;
        }

        .ai-badge-strip {
            background: #f5f3ff;
            border-bottom: 1px solid #ddd6fe;
            padding: 7px 32px;
            font-size: 9px;
            color: #5b21b6;
            letter-spacing: 0.3px;
        }

        .content { padding: 24px 32px; }

        .section { margin-bottom: 28px; }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a5f;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ── KPI bar ── */
        .kpi-row { display: flex; gap: 12px; margin-bottom: 20px; }
        .kpi-box {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
            text-align: center;
            background: #f8fafc;
        }
        .kpi-value { font-size: 22px; font-weight: bold; }
        .kpi-label { font-size: 9px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* ── Rating badge ── */
        .rating-critical { color: #dc2626; }
        .rating-high     { color: #ea580c; }
        .rating-medium   { color: #ca8a04; }
        .rating-low      { color: #16a34a; }

        /* ── Narrative ── */
        .narrative p { margin-bottom: 10px; text-align: justify; }

        /* ── Tables ── */
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 6px; }
        th {
            background: #1e3a5f;
            color: #ffffff;
            padding: 7px 10px;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        tr:nth-child(even) td { background: #f8fafc; }
        tr:last-child td { border-bottom: none; }

        /* ── Badges ── */
        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 10px;
            font-size: 8.5px;
            font-weight: bold;
        }
        .badge-nc  { background: #fee2e2; color: #b91c1c; }
        .badge-pc  { background: #fef3c7; color: #92400e; }
        .badge-high   { background: #fee2e2; color: #b91c1c; }
        .badge-medium { background: #fef3c7; color: #92400e; }
        .badge-low    { background: #dcfce7; color: #166534; }

        /* ── Action list ── */
        .action-item { padding: 8px 12px; border-left: 3px solid #e2e8f0; margin-bottom: 8px; background: #f8fafc; }
        .action-item.high   { border-left-color: #dc2626; }
        .action-item.medium { border-left-color: #f59e0b; }
        .action-item.low    { border-left-color: #22c55e; }
        .action-title  { font-weight: bold; font-size: 10px; }
        .action-meta   { font-size: 9px; color: #64748b; margin-top: 3px; }

        /* ── Highlights ── */
        .highlight-item { padding: 6px 10px; border-left: 3px solid #22c55e; margin-bottom: 6px; background: #f0fdf4; font-size: 10px; }

        /* ── Page break ── */
        .page-break { page-break-after: always; }

        /* ── Footer ── */
        .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            font-size: 8.5px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>

<!-- Header -->
<div class="header">
    <div class="header-eyebrow">GRC Management System — Compliance Report</div>
    <div class="header-title">AI-Powered Gap Analysis Report</div>
    <div class="header-subtitle">Compliance gap findings, remediation recommendations, and prioritised action list</div>
    <div class="header-meta">Generated: {{ $generatedAt }} &nbsp;|&nbsp; Classification: Internal</div>
</div>
<div class="accent-bar"></div>
<div class="ai-badge-strip">
    &#9889; This gap analysis narrative was generated by AI (Claude Sonnet) based on live GRC system data.
    Findings should be reviewed and validated by a qualified compliance officer before use in formal reporting.
</div>

<div class="content">

    <!-- ── KPI Row ── -->
    @php
        $ratingClass = match(strtolower($result['overall_risk_rating'] ?? '')) {
            'critical' => 'rating-critical',
            'high'     => 'rating-high',
            'medium'   => 'rating-medium',
            default    => 'rating-low',
        };
    @endphp

    <div class="kpi-row">
        <div class="kpi-box">
            <div class="kpi-value">{{ $compliancePct }}%</div>
            <div class="kpi-label">Self-Assessed Compliance</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-value" style="color: #dc2626;">{{ $gapSummary['non_compliant'] }}</div>
            <div class="kpi-label">Non-Compliant Controls</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-value" style="color: #ca8a04;">{{ $gapSummary['partially_compliant'] }}</div>
            <div class="kpi-label">Partially Compliant</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-value {{ $ratingClass }}">{{ $result['overall_risk_rating'] ?? 'N/A' }}</div>
            <div class="kpi-label">Overall Risk Rating</div>
        </div>
    </div>

    <!-- ── 1. Executive Summary ── -->
    <div class="section">
        <div class="section-title">1. Executive Summary</div>
        <div class="narrative">
            @foreach(array_filter(preg_split('/\n{2,}/', trim($result['executive_summary'] ?? ''))) as $para)
                <p>{{ $para }}</p>
            @endforeach
        </div>
    </div>

    <!-- ── 2. Critical Gaps ── -->
    @if(!empty($result['critical_gaps']))
    <div class="section">
        <div class="section-title">2. Critical Gaps Requiring Immediate Attention</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%">Control ID</th>
                    <th style="width:10%">Framework</th>
                    <th style="width:25%">Control Title</th>
                    <th style="width:30%">Finding</th>
                    <th style="width:25%">Recommendation</th>
                </tr>
            </thead>
            <tbody>
                @foreach($result['critical_gaps'] as $gap)
                <tr>
                    <td><strong>{{ $gap['control_id'] ?? '—' }}</strong></td>
                    <td>{{ $gap['framework'] ?? '—' }}</td>
                    <td>{{ $gap['title'] ?? '—' }}</td>
                    <td>{{ $gap['finding'] ?? '—' }}</td>
                    <td>{{ $gap['recommendation'] ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <!-- ── 3. Category Analysis ── -->
    @if(!empty($result['category_analysis']))
    <div class="section">
        <div class="section-title">3. Per-Category Gap Analysis</div>
        <table>
            <thead>
                <tr>
                    <th style="width:22%">Category</th>
                    <th style="width:10%">Non-Compliant</th>
                    <th style="width:10%">Partial</th>
                    <th style="width:58%">Summary</th>
                </tr>
            </thead>
            <tbody>
                @foreach($result['category_analysis'] as $cat)
                <tr>
                    <td><strong>{{ $cat['category'] ?? '—' }}</strong></td>
                    <td><span class="badge badge-nc">{{ $cat['gap_count'] ?? 0 }}</span></td>
                    <td><span class="badge badge-pc">{{ $cat['partial_count'] ?? 0 }}</span></td>
                    <td>{{ $cat['summary'] ?? '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

</div>

<div class="page-break"></div>

<div class="content">

    <!-- ── 4. Gap Data Table ── -->
    <div class="section">
        <div class="section-title">4. Detailed Gap Register</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%">Control ID</th>
                    <th style="width:10%">Framework</th>
                    <th style="width:22%">Title</th>
                    <th style="width:15%">Category</th>
                    <th style="width:13%">Status</th>
                    <th style="width:5%">Evidence</th>
                    <th style="width:25%">Notes</th>
                </tr>
            </thead>
            <tbody>
                @forelse($gapData as $row)
                <tr>
                    <td><strong>{{ $row['control_id'] }}</strong></td>
                    <td>{{ $row['framework'] }}</td>
                    <td>{{ $row['title'] }}</td>
                    <td>{{ $row['category'] ?? '—' }}</td>
                    <td>
                        @if($row['compliance_status'] === 'non_compliant')
                            <span class="badge badge-nc">Non-Compliant</span>
                        @else
                            <span class="badge badge-pc">Partial</span>
                        @endif
                    </td>
                    <td style="text-align:center">{{ $row['evidence_count'] }}</td>
                    <td>{{ $row['notes'] ?? '—' }}</td>
                </tr>
                @empty
                <tr><td colspan="7" style="text-align:center; color: #64748b;">No gaps recorded.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- ── 5. Prioritised Action List ── -->
    @if(!empty($result['action_list']))
    <div class="section">
        <div class="section-title">5. Prioritised Action List</div>
        @foreach($result['action_list'] as $action)
        @php $pClass = strtolower($action['priority'] ?? 'low'); @endphp
        <div class="action-item {{ $pClass }}">
            <div class="action-title">
                <span class="badge badge-{{ $pClass }}">{{ $action['priority'] ?? '' }}</span>
                &nbsp;{{ $action['action'] ?? '' }}
            </div>
            <div class="action-meta">
                @if(!empty($action['control_ids']))
                    Controls: {{ implode(', ', $action['control_ids']) }} &nbsp;|&nbsp;
                @endif
                Owner: {{ $action['owner'] ?? 'TBD' }}
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <!-- ── 6. Positive Highlights ── -->
    @if(!empty($result['positive_highlights']))
    <div class="section">
        <div class="section-title">6. Positive Highlights</div>
        @foreach($result['positive_highlights'] as $highlight)
        <div class="highlight-item">&#10003;&nbsp; {{ $highlight }}</div>
        @endforeach
    </div>
    @endif

    <div class="footer">
        GRC Management System &mdash; Gap Analysis Report &mdash; Generated {{ $generatedAt }}<br>
        AI-assisted analysis &mdash; For internal use only &mdash; Validate before formal submission
    </div>
</div>

</body>
</html>
