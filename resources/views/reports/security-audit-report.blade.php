<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Security Audit Report — GRC Charter</title>
    @include('reports._partials._styles')
    <style>
        /* Page-specific: meta key/value table */
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .meta-table td {
            padding: 5px 10px;
            border-bottom: 1px solid #d9d9dd;
            font-size: 10px;
        }
        .meta-table td.label {
            font-weight: bold;
            color: #75758a;
            width: 30%;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-size: 9px;
        }

        .summary-box {
            background: #edfce9;
            border-left: 3px solid #003c33;
            padding: 14px 18px;
            border-radius: 0 6px 6px 0;
            margin-bottom: 18px;
            font-size: 11px;
            page-break-inside: avoid;
        }

        /* KPI summary row (table-cell layout) */
        .kpi-row-tbl { width: 100%; margin-bottom: 20px; border-collapse: separate; border-spacing: 8px 0; page-break-inside: avoid; }
        .kpi-row-tbl td {
            border: 1px solid #d9d9dd;
            border-radius: 6px;
            padding: 12px 14px;
            text-align: center;
            background: #fafaf8;
            width: 16.6%;
        }
        .kpi-row-tbl .kpi-value { font-size: 20px; font-weight: bold; color: inherit; }
        .kpi-row-tbl .kpi-label { font-size: 8px; color: #75758a; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Posture score box */
        .score-box {
            text-align: center;
            background: #edfce9;
            border: 1px solid #c8e8c0;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .score-value { font-size: 36px; font-weight: bold; color: #003c33; }
        .score-label { font-size: 10px; color: #212121; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 4px; }

        /* Finding card */
        .finding {
            border: 1px solid #d9d9dd;
            border-radius: 6px;
            margin-bottom: 12px;
            padding: 12px 14px;
            page-break-inside: avoid;
        }
        .finding-header {
            display: block;
            margin-bottom: 8px;
            border-bottom: 1px solid #d9d9dd;
            padding-bottom: 6px;
        }
        .finding-number { font-size: 9px; color: #75758a; }
        .finding-title { font-size: 12px; font-weight: bold; color: #212121; margin-top: 2px; }
        .finding-row { margin-top: 8px; }
        .finding-label {
            font-size: 8px;
            font-weight: bold;
            color: #75758a;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 2px;
        }
        .finding-text { font-size: 10px; color: #212121; }
        .affected {
            font-family: 'Courier New', monospace;
            background: #fafaf8;
            padding: 4px 6px;
            border-radius: 3px;
            font-size: 9px;
            color: #212121;
            display: inline-block;
            border: 1px solid #d9d9dd;
        }
    </style>
</head>
<body>

    @include('reports._partials._header', [
        'eyebrow'  => 'Security Configuration Audit',
        'title'    => $audit->file_name,
        'subtitle' => 'Automated security analysis report',
        'meta'     => 'Generated ' . $generatedAt->format('F j, Y · H:i'),
    ])
    <div class="ai-badge-strip">AI-ASSISTED ANALYSIS · This report was generated using Claude AI</div>

    <div class="content">

        <div class="section" style="padding:0;">
            <div class="section-title">Audit Metadata</div>
            <table class="meta-table">
                <tr>
                    <td class="label">File Name</td>
                    <td>{{ $audit->file_name }}</td>
                </tr>
                <tr>
                    <td class="label">File Type</td>
                    <td>{{ $audit->file_type }}</td>
                </tr>
                <tr>
                    <td class="label">File Size</td>
                    <td>{{ number_format($audit->file_size) }} bytes</td>
                </tr>
                <tr>
                    <td class="label">Uploaded By</td>
                    <td>{{ $audit->user->name ?? 'Unknown' }}</td>
                </tr>
                <tr>
                    <td class="label">Analyzed At</td>
                    <td>{{ $audit->analyzed_at?->format('F j, Y · H:i') ?? 'Pending' }}</td>
                </tr>
                @if(!empty($audit->frameworks_checked))
                <tr>
                    <td class="label">Frameworks Checked</td>
                    <td>{{ implode(', ', $audit->frameworks_checked) }}</td>
                </tr>
                @endif
                @if(!empty($audit->controls_referenced))
                <tr>
                    <td class="label">Controls Referenced</td>
                    <td>{{ implode(', ', $audit->controls_referenced) }}</td>
                </tr>
                @endif
            </table>
        </div>

        @if($audit->summary)
        <div class="section" style="padding:0;">
            <div class="section-title">Executive Summary</div>
            <div class="summary-box">{{ $audit->summary }}</div>
        </div>
        @endif

        <div class="section" style="padding:0;">
            <div class="section-title">Findings Overview</div>
            @if($audit->compliance_score !== null)
            <div class="score-box">
                <div class="score-value">{{ number_format($audit->compliance_score, 1) }}<span style="font-size:18px;color:#75758a;"> / 100</span></div>
                <div class="score-label">Overall Security Posture Score</div>
            </div>
            @endif
            <table class="kpi-row-tbl">
                <tr>
                    <td><div class="kpi-value">{{ $audit->total_findings }}</div><div class="kpi-label">Total</div></td>
                    <td><div class="kpi-value" style="color:#e5484d;">{{ $audit->critical_count }}</div><div class="kpi-label">Critical</div></td>
                    <td><div class="kpi-value" style="color:#f76b15;">{{ $audit->high_count }}</div><div class="kpi-label">High</div></td>
                    <td><div class="kpi-value" style="color:#f5b929;">{{ $audit->medium_count }}</div><div class="kpi-label">Medium</div></td>
                    <td><div class="kpi-value" style="color:#46bd5f;">{{ $audit->low_count }}</div><div class="kpi-label">Low</div></td>
                    <td><div class="kpi-value" style="color:#75758a;">{{ $audit->info_count }}</div><div class="kpi-label">Info</div></td>
                </tr>
            </table>
        </div>

        <div class="section" style="padding:0;">
            <div class="section-title">Detailed Findings</div>

            @forelse($findings as $finding)
                <div class="finding">
                    <div class="finding-header">
                        <span class="severity-pill severity-{{ $finding->severity }}">{{ $finding->severity }}</span>
                        <span class="finding-number">Finding #{{ $finding->finding_number }}</span>
                        <div class="finding-title">{{ $finding->title }}</div>
                    </div>

                    <div class="finding-row">
                        <div class="finding-label">Description</div>
                        <div class="finding-text">{{ $finding->description }}</div>
                    </div>

                    @if($finding->affected_item)
                    <div class="finding-row">
                        <div class="finding-label">Affected Item</div>
                        <div class="finding-text"><span class="affected">{{ $finding->affected_item }}</span></div>
                    </div>
                    @endif

                    <div class="finding-row">
                        <div class="finding-label">Recommendation</div>
                        <div class="finding-text">{{ $finding->recommendation }}</div>
                    </div>

                    @if($finding->control_reference || $finding->control)
                    <div class="finding-row">
                        <div class="finding-label">Control Reference</div>
                        <div class="finding-text">
                            {{ $finding->control_reference }}
                            @if($finding->control)
                                — {{ $finding->control->title }}
                            @endif
                        </div>
                    </div>
                    @endif

                    @if($finding->compliance_impact)
                    <div class="finding-row">
                        <div class="finding-label">Compliance Impact</div>
                        <div class="finding-text">{{ $finding->compliance_impact }}</div>
                    </div>
                    @endif
                </div>
            @empty
                <div class="summary-box">No findings recorded for this audit.</div>
            @endforelse
        </div>

    </div>

    @include('reports._partials._page_chrome', ['reportTitle' => 'Security Audit Report'])
</body>
</html>
