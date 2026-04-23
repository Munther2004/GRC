<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Security Audit Report — GRC Management System</title>
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
        .header-title    { font-size: 22px; font-weight: bold; }
        .header-subtitle { font-size: 12px; color: #a8c4e0; margin-top: 4px; }
        .header-meta     { margin-top: 10px; font-size: 9px; color: #7fafd4; }

        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #dc2626, #ea580c);
        }

        .ai-badge-strip {
            background: #fef2f2;
            border-bottom: 1px solid #fecaca;
            padding: 7px 32px;
            font-size: 9px;
            color: #991b1b;
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

        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .meta-table td {
            padding: 5px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10px;
        }
        .meta-table td.label {
            font-weight: bold;
            color: #475569;
            width: 30%;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-size: 9px;
        }

        .summary-box {
            background: #f8fafc;
            border-left: 4px solid #1e3a5f;
            padding: 14px 18px;
            border-radius: 0 6px 6px 0;
            margin-bottom: 18px;
            font-size: 11px;
        }

        .kpi-row { width: 100%; margin-bottom: 20px; }
        .kpi-row td {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px 14px;
            text-align: center;
            background: #f8fafc;
            width: 16.6%;
        }
        .kpi-value { font-size: 20px; font-weight: bold; }
        .kpi-label { font-size: 8px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

        .score-box {
            text-align: center;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
        }
        .score-value { font-size: 36px; font-weight: bold; color: #0369a1; }
        .score-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 4px; }

        .finding {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 12px;
            padding: 12px 14px;
            page-break-inside: avoid;
        }
        .finding-header {
            display: block;
            margin-bottom: 8px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
        }
        .finding-number { font-size: 9px; color: #64748b; }
        .finding-title { font-size: 12px; font-weight: bold; color: #1a1a2e; margin-top: 2px; }

        .severity-pill {
            display: inline-block;
            font-size: 8px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #fff;
            margin-right: 6px;
        }
        .severity-critical { background: #dc2626; }
        .severity-high     { background: #ea580c; }
        .severity-medium   { background: #ca8a04; }
        .severity-low      { background: #2563eb; }
        .severity-info     { background: #64748b; }

        .finding-row { margin-top: 8px; }
        .finding-label {
            font-size: 8px;
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 2px;
        }
        .finding-text { font-size: 10px; color: #334155; }
        .affected {
            font-family: 'Courier New', monospace;
            background: #f1f5f9;
            padding: 4px 6px;
            border-radius: 3px;
            font-size: 9px;
            color: #1e293b;
            display: inline-block;
        }

        .footer {
            border-top: 1px solid #e2e8f0;
            margin-top: 28px;
            padding: 12px 32px;
            font-size: 8px;
            color: #94a3b8;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-eyebrow">Security Configuration Audit</div>
        <div class="header-title">{{ $audit->file_name }}</div>
        <div class="header-subtitle">Automated security analysis report</div>
        <div class="header-meta">Generated {{ $generatedAt->format('F j, Y · H:i') }}</div>
    </div>
    <div class="accent-bar"></div>
    <div class="ai-badge-strip">AI-ASSISTED ANALYSIS · This report was generated using Claude AI</div>

    <div class="content">

        <div class="section">
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
        <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="summary-box">{{ $audit->summary }}</div>
        </div>
        @endif

        <div class="section">
            <div class="section-title">Findings Overview</div>
            @if($audit->compliance_score !== null)
            <div class="score-box">
                <div class="score-value">{{ number_format($audit->compliance_score, 1) }}<span style="font-size:18px;color:#475569;"> / 100</span></div>
                <div class="score-label">Overall Security Posture Score</div>
            </div>
            @endif
            <table class="kpi-row">
                <tr>
                    <td><div class="kpi-value">{{ $audit->total_findings }}</div><div class="kpi-label">Total</div></td>
                    <td><div class="kpi-value" style="color:#dc2626;">{{ $audit->critical_count }}</div><div class="kpi-label">Critical</div></td>
                    <td><div class="kpi-value" style="color:#ea580c;">{{ $audit->high_count }}</div><div class="kpi-label">High</div></td>
                    <td><div class="kpi-value" style="color:#ca8a04;">{{ $audit->medium_count }}</div><div class="kpi-label">Medium</div></td>
                    <td><div class="kpi-value" style="color:#2563eb;">{{ $audit->low_count }}</div><div class="kpi-label">Low</div></td>
                    <td><div class="kpi-value" style="color:#64748b;">{{ $audit->info_count }}</div><div class="kpi-label">Info</div></td>
                </tr>
            </table>
        </div>

        <div class="section">
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

    <div class="footer">
        GRC Management System · Security Audit Report · Generated {{ $generatedAt->format('Y-m-d H:i:s') }}
    </div>
</body>
</html>
