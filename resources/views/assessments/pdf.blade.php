<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Assessment Report</title>
    @include('reports._partials._styles')
    <style>
        /* Page-specific: control-status breakdown grid (4-up table-cell) */
        .breakdown-grid { display: table; width: 100%; page-break-inside: avoid; }
        .breakdown-row  { display: table-row; }
        .breakdown-cell { display: table-cell; padding: 10px 14px; border: 1px solid #d9d9dd; text-align: center; }
        .bd-count { font-size: 26px; font-weight: bold; line-height: 1; }
        .bd-label { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 3px; }
        .compliant-bg    { background: #ecf9ef; } .compliant-color    { color: #46bd5f; }
        .partial-bg      { background: #fef8e3; } .partial-color      { color: #f5b929; }
        .noncompliant-bg { background: #fdeeee; } .noncompliant-color { color: #e5484d; }
        .na-bg           { background: #f1f1ee; } .na-color           { color: #75758a; }

        /* Hero score block (assessment-specific) */
        .score-block {
            display: flex;
            align-items: center;
            gap: 24px;
            background: #edfce9;
            border: 1px solid #c8e8c0;
            border-radius: 8px;
            padding: 16px 24px;
            page-break-inside: avoid;
        }
        .score-num { font-size: 48px; font-weight: bold; line-height: 1; }
        .score-green  { color: #46bd5f; }
        .score-yellow { color: #f5b929; }
        .score-red    { color: #e5484d; }
        .bar-bg { background: #d9d9dd; border-radius: 4px; height: 10px; overflow: hidden; margin-top: 8px; }
        .bar-fill { height: 100%; border-radius: 4px; }
        .bg-green  { background: #46bd5f; }
        .bg-yellow { background: #f5b929; }
        .bg-red    { background: #e5484d; }
    </style>
</head>
<body>

    @include('reports._partials._header', [
        'title'    => 'Assessment Report — ' . $assessment->title,
        'subtitle' => $assessment->framework->name . ' • Period: ' . $assessment->period,
        'meta'     => 'Conducted by: ' . $assessment->user->name . ' • Scope: ' . $assessment->scope . ' • Generated: ' . $generatedAt,
    ])

    <!-- Compliance Score -->
    <div class="section" style="margin-top: 24px;">
        <div class="section-title">Compliance Score</div>
        @php
            $pct = $assessment->compliance_percentage;
            $sc  = $pct >= 80 ? 'green' : ($pct >= 50 ? 'yellow' : 'red');
        @endphp
        <div class="score-block">
            <div>
                <div class="score-num score-{{ $sc }}">{{ $pct }}%</div>
                <div style="font-size:10px; color:#75758a; margin-top:4px;">Compliance Score</div>
            </div>
            <div style="flex:1;">
                <div style="font-size:11px; color:#212121; font-weight:bold;">{{ $assessment->framework->short_name }} &mdash; {{ $assessment->title }}</div>
                <div class="bar-bg" style="margin-top:6px; width:100%;">
                    <div class="bar-fill bg-{{ $sc }}" style="width:{{ $pct }}%;"></div>
                </div>
                <div style="margin-top:6px; font-size:10px; color:#75758a;">
                    @if($pct >= 80)
                        <span style="color:#46bd5f;">&#10003; Good compliance posture</span>
                    @elseif($pct >= 50)
                        <span style="color:#f5b929;">&#9888; Moderate &mdash; improvements needed</span>
                    @else
                        <span style="color:#e5484d;">&#10005; Low compliance &mdash; immediate action required</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Control Breakdown -->
    <div class="section">
        <div class="section-title">Control Breakdown</div>
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

    <!-- Compliance by Category -->
    <div class="section">
        <div class="section-title">Compliance by Category</div>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="num">Compliant</th>
                    <th class="num">Total</th>
                    <th class="num">Score</th>
                    <th>Progress</th>
                </tr>
            </thead>
            <tbody>
                @foreach($byCategory as $cat => $data)
                    @php
                        $cc = $data['percentage'] >= 80 ? '#46bd5f' : ($data['percentage'] >= 50 ? '#f5b929' : '#e5484d');
                    @endphp
                    <tr>
                        <td><strong>{{ $cat ?: 'Uncategorized' }}</strong></td>
                        <td class="num">{{ $data['compliant'] }}</td>
                        <td class="num">{{ $data['total'] }}</td>
                        <td class="num" style="font-weight:bold; color:{{ $cc }};">{{ $data['percentage'] }}%</td>
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

    <!-- Control Assessment Details -->
    <div class="section" style="margin-top:24px;">
        <div class="section-title">Control Assessment Details</div>
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
                        <td style="color:#75758a;">{{ $item->control->category }}</td>
                        <td><span class="status-badge {{ $cls }}">{{ $label }}</span></td>
                        <td style="color:#75758a; font-size:9px;">{{ $item->comments ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    @include('reports._partials._page_chrome', [
        'reportTitle' => 'Assessment · ' . $assessment->framework->short_name,
    ])

</body>
</html>
