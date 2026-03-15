<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assessment Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; line-height: 1.5; }

        .header { background: #1e3a5f; color: #fff; padding: 24px 32px; }
        .header-title { font-size: 18px; font-weight: bold; }
        .header-sub { font-size: 11px; color: #a8c4e0; margin-top: 4px; }
        .header-meta { font-size: 10px; color: #7fafd4; margin-top: 6px; }
        .accent-bar { height: 4px; background: linear-gradient(90deg, #3b82f6, #1e40af); margin-bottom: 24px; }

        .section { padding: 0 32px; margin-bottom: 24px; }
        .section-title { font-size: 12px; font-weight: bold; color: #1e3a5f; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }

        .score-block { display: flex; align-items: center; gap: 24px; background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 24px; }
        .score-num { font-size: 48px; font-weight: bold; line-height: 1; }
        .score-green  { color: #16a34a; }
        .score-yellow { color: #ca8a04; }
        .score-red    { color: #dc2626; }
        .bar-bg { background: #e2e8f0; border-radius: 4px; height: 10px; overflow: hidden; margin-top: 8px; }
        .bar-fill { height: 100%; border-radius: 4px; }
        .bg-green  { background: #16a34a; }
        .bg-yellow { background: #ca8a04; }
        .bg-red    { background: #dc2626; }

        .breakdown-grid { display: table; width: 100%; }
        .breakdown-row  { display: table-row; }
        .breakdown-cell { display: table-cell; padding: 10px 14px; border: 1px solid #e2e8f0; text-align: center; }
        .bd-count { font-size: 26px; font-weight: bold; line-height: 1; }
        .bd-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 3px; }
        .compliant-bg    { background: #f0fdf4; } .compliant-color    { color: #16a34a; }
        .partial-bg      { background: #fefce8; } .partial-color      { color: #ca8a04; }
        .noncompliant-bg { background: #fef2f2; } .noncompliant-color { color: #dc2626; }
        .na-bg           { background: #f8fafc; } .na-color           { color: #94a3b8; }

        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        thead tr { background: #1e3a5f; color: #fff; }
        thead th { padding: 7px 10px; text-align: left; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; }
        tbody tr { border-bottom: 1px solid #e2e8f0; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td { padding: 6px 10px; color: #374151; }
        .mini-bar-bg   { background: #e2e8f0; border-radius: 3px; height: 7px; width: 80px; overflow: hidden; display: inline-block; vertical-align: middle; }
        .mini-bar-fill { height: 100%; border-radius: 3px; }

        .status-badge { display: inline-block; padding: 2px 6px; border-radius: 8px; font-size: 8px; font-weight: bold; }
        .badge-compliant    { background: #dcfce7; color: #16a34a; }
        .badge-partial      { background: #fef9c3; color: #ca8a04; }
        .badge-noncompliant { background: #fee2e2; color: #dc2626; }
        .badge-na           { background: #f1f5f9; color: #94a3b8; }

        .footer { position: fixed; bottom: 0; left: 0; right: 0; background: #1e3a5f; color: #a8c4e0; font-size: 9px; padding: 7px 32px; display: flex; justify-content: space-between; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <div class="header-title">Assessment Report &mdash; {{ $assessment->title }}</div>
        <div class="header-sub">{{ $assessment->framework->name }} &bull; Period: {{ $assessment->period }}</div>
        <div class="header-meta">
            Conducted by: {{ $assessment->user->name }} &bull;
            Scope: {{ $assessment->scope }} &bull;
            Generated: {{ $generatedAt }}
        </div>
    </div>
    <div class="accent-bar"></div>

    <!-- Section 1: Compliance Score -->
    <div class="section">
        <div class="section-title">1. Compliance Score</div>
        @php
            $pct = $assessment->compliance_percentage;
            $sc  = $pct >= 80 ? 'green' : ($pct >= 50 ? 'yellow' : 'red');
        @endphp
        <div class="score-block">
            <div>
                <div class="score-num score-{{ $sc }}">{{ $pct }}%</div>
                <div style="font-size:10px; color:#64748b; margin-top:4px;">Compliance Score</div>
            </div>
            <div style="flex:1;">
                <div style="font-size:11px; color:#374151; font-weight:bold;">{{ $assessment->framework->short_name }} &mdash; {{ $assessment->title }}</div>
                <div class="bar-bg" style="margin-top:6px; width:100%;">
                    <div class="bar-fill bg-{{ $sc }}" style="width:{{ $pct }}%;"></div>
                </div>
                <div style="margin-top:6px; font-size:10px; color:#64748b;">
                    @if($pct >= 80)
                        <span style="color:#16a34a;">&#10003; Good compliance posture</span>
                    @elseif($pct >= 50)
                        <span style="color:#ca8a04;">&#9888; Moderate &mdash; improvements needed</span>
                    @else
                        <span style="color:#dc2626;">&#10005; Low compliance &mdash; immediate action required</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Section 2: Breakdown -->
    <div class="section">
        <div class="section-title">2. Control Breakdown</div>
        <div class="breakdown-grid">
            <div class="breakdown-row">
                <div class="breakdown-cell compliant-bg">
                    <div class="bd-count compliant-color">{{ $breakdown['compliant'] }}</div>
                    <div class="bd-label compliant-color">Compliant</div>
                </div>
                <div class="breakdown-cell partial-bg">
                    <div class="bd-count partial-color">{{ $breakdown['partially_compliant'] }}</div>
                    <div class="bd-label partial-color">Partial</div>
                </div>
                <div class="breakdown-cell noncompliant-bg">
                    <div class="bd-count noncompliant-color">{{ $breakdown['non_compliant'] }}</div>
                    <div class="bd-label noncompliant-color">Non-Compliant</div>
                </div>
                <div class="breakdown-cell na-bg">
                    <div class="bd-count na-color">{{ $breakdown['not_applicable'] }}</div>
                    <div class="bd-label na-color">N/A</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Section 3: By Category -->
    <div class="section">
        <div class="section-title">3. Compliance by Category</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Compliant</th>
                    <th>Total</th>
                    <th>Score</th>
                    <th>Progress</th>
                </tr>
            </thead>
            <tbody>
                @foreach($byCategory as $cat => $data)
                    @php
                        $cc = $data['percentage'] >= 80 ? '#16a34a' : ($data['percentage'] >= 50 ? '#ca8a04' : '#dc2626');
                    @endphp
                    <tr>
                        <td><strong>{{ $cat ?: 'Uncategorized' }}</strong></td>
                        <td style="text-align:center;">{{ $data['compliant'] }}</td>
                        <td style="text-align:center;">{{ $data['total'] }}</td>
                        <td style="font-weight:bold; color:{{ $cc }};">{{ $data['percentage'] }}%</td>
                        <td>
                            <div class="mini-bar-bg">
                                <div class="mini-bar-fill" style="width:{{ $data['percentage'] }}%; background:{{ $cc }};"></div>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="page-break"></div>

    <!-- Section 4: All Controls -->
    <div class="section" style="margin-top:24px;">
        <div class="section-title">4. Control Assessment Details</div>
        <table>
            <thead>
                <tr>
                    <th style="width:10%;">Control ID</th>
                    <th style="width:35%;">Title</th>
                    <th style="width:15%;">Category</th>
                    <th style="width:15%;">Status</th>
                    <th>Comments</th>
                </tr>
            </thead>
            <tbody>
                @foreach($items as $item)
                    @php
                        $statusLabels  = ['compliant' => 'Compliant', 'partially_compliant' => 'Partial', 'non_compliant' => 'Non-Compliant', 'not_applicable' => 'N/A'];
                        $statusClasses = ['compliant' => 'badge-compliant', 'partially_compliant' => 'badge-partial', 'non_compliant' => 'badge-noncompliant', 'not_applicable' => 'badge-na'];
                        $label = $statusLabels[$item->compliance_status] ?? $item->compliance_status;
                        $cls   = $statusClasses[$item->compliance_status] ?? '';
                    @endphp
                    <tr>
                        <td style="font-family:monospace; font-size:9px;">{{ $item->control->control_id }}</td>
                        <td>{{ $item->control->title }}</td>
                        <td style="color:#64748b;">{{ $item->control->category }}</td>
                        <td><span class="status-badge {{ $cls }}">{{ $label }}</span></td>
                        <td style="color:#64748b; font-size:9px;">{{ $item->comments ?? '&mdash;' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        <span>Confidential &mdash; {{ $assessment->title }}</span>
        <span>{{ $assessment->framework->short_name }} &mdash; {{ $generatedAt }}</span>
    </div>

</body>
</html>
