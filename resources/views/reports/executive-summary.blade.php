<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Executive Summary — GRC Management System</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background: #ffffff;
            line-height: 1.6;
        }

        /* ── Header ── */
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
        .header-title {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 0.3px;
        }
        .header-subtitle {
            font-size: 12px;
            color: #a8c4e0;
            margin-top: 4px;
        }
        .header-meta {
            margin-top: 10px;
            font-size: 9px;
            color: #7fafd4;
        }

        /* ── Accent bar ── */
        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #1e40af);
            margin-bottom: 24px;
        }

        /* ── AI badge strip ── */
        .ai-badge-strip {
            background: #eff6ff;
            border-bottom: 1px solid #bfdbfe;
            padding: 7px 32px;
            font-size: 9px;
            color: #1d4ed8;
            letter-spacing: 0.3px;
        }

        /* ── Sections ── */
        .section {
            padding: 0 32px;
            margin-bottom: 26px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #1e3a5f;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        /* ── Narrative (AI text) ── */
        .narrative {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 14px 18px;
            border-radius: 0 6px 6px 0;
            line-height: 1.75;
            font-size: 10.5px;
            color: #1e293b;
        }
        .narrative p {
            margin-bottom: 10px;
        }
        .narrative p:last-child {
            margin-bottom: 0;
        }

        /* ── KPI row ── */
        .kpi-row {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-bottom: 4px;
        }
        .kpi-cell {
            display: table-cell;
            background: #f0f7ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 12px 14px;
            text-align: center;
            width: 25%;
        }
        .kpi-number {
            font-size: 26px;
            font-weight: bold;
            line-height: 1;
        }
        .kpi-label {
            font-size: 9px;
            color: #64748b;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .color-green  { color: #16a34a; }
        .color-yellow { color: #ca8a04; }
        .color-red    { color: #dc2626; }
        .color-blue   { color: #2563eb; }
        .color-gray   { color: #64748b; }

        /* ── Tables ── */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        thead tr {
            background: #1e3a5f;
            color: #ffffff;
        }
        thead th {
            padding: 7px 10px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-size: 9px;
        }
        tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td {
            padding: 6px 10px;
            color: #374151;
        }

        /* ── Controls summary bar ── */
        .ctrl-bar-wrap {
            display: table;
            width: 100%;
        }
        .ctrl-bar-cell {
            display: table-cell;
            text-align: center;
            padding: 10px 6px;
            border: 1px solid #e2e8f0;
        }
        .ctrl-bar-cell:first-child { border-radius: 6px 0 0 6px; }
        .ctrl-bar-cell:last-child  { border-radius: 0 6px 6px 0; }
        .ctrl-count { font-size: 22px; font-weight: bold; }
        .ctrl-label { font-size: 9px; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.4px; }

        /* ── Risk grid ── */
        .risk-grid {
            display: table;
            width: 100%;
        }
        .risk-grid-row { display: table-row; }
        .risk-cell {
            display: table-cell;
            padding: 10px 6px;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        .risk-count { font-size: 26px; font-weight: bold; line-height: 1; }
        .risk-label { font-size: 9px; margin-top: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; }
        .critical-bg { background: #fef2f2; } .critical-color { color: #dc2626; }
        .high-bg     { background: #fff7ed; } .high-color     { color: #ea580c; }
        .medium-bg   { background: #fefce8; } .medium-color   { color: #ca8a04; }
        .low-bg      { background: #f0fdf4; } .low-color      { color: #16a34a; }

        /* ── Score badge ── */
        .score-badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .badge-green  { background: #dcfce7; color: #16a34a; }
        .badge-yellow { background: #fef9c3; color: #ca8a04; }
        .badge-red    { background: #fee2e2; color: #dc2626; }
        .badge-gray   { background: #f1f5f9; color: #64748b; }

        /* ── Mini progress bar ── */
        .mini-bar-bg {
            background: #e2e8f0;
            border-radius: 3px;
            height: 7px;
            width: 70px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }
        .mini-bar-fill { height: 100%; border-radius: 3px; }

        /* ── Recommendations ── */
        .rec-list { list-style: none; }
        .rec-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 12px;
            margin-bottom: 6px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 10.5px;
        }
        .rec-num {
            background: #1e3a5f;
            color: #fff;
            font-size: 9px;
            font-weight: bold;
            min-width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            text-align: center;
            line-height: 20px;
        }

        /* ── Evidence stats inline ── */
        .ev-row {
            display: table;
            width: 100%;
        }
        .ev-cell {
            display: table-cell;
            text-align: center;
            padding: 8px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        .ev-count { font-size: 20px; font-weight: bold; }
        .ev-label { font-size: 9px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

        /* ── Page break ── */
        .page-break { page-break-after: always; }

        /* ── Footer ── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1e3a5f;
            color: #a8c4e0;
            font-size: 9px;
            padding: 7px 32px;
            display: flex;
            justify-content: space-between;
        }

        .spacer { height: 16px; }
        .small-note { font-size: 9px; color: #94a3b8; margin-top: 6px; }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <div class="header-eyebrow">Confidential &mdash; For Executive Review Only</div>
        <div class="header-title">Executive Summary — Security &amp; Compliance Posture</div>
        <div class="header-subtitle">GRC Management System &mdash; Princess Sumaya University for Technology</div>
        <div class="header-meta">Generated: {{ $generatedAt }} &nbsp;&bull;&nbsp; AI-Assisted Narrative (claude-sonnet)</div>
    </div>
    <div class="accent-bar"></div>
    <div class="ai-badge-strip">&#10024; This narrative was generated by AI based on live GRC system data. Figures are drawn directly from the database at time of generation.</div>

    <div class="spacer"></div>

    <!-- Section 1: AI Narrative -->
    <div class="section">
        <div class="section-title">1. Executive Narrative</div>
        <div class="narrative">
            @foreach(array_filter(preg_split('/\n{2,}/', trim($narrative))) as $para)
                <p>{{ trim($para) }}</p>
            @endforeach
        </div>
    </div>

    <!-- Section 2: Compliance Overview -->
    <div class="section">
        <div class="section-title">2. Compliance Overview</div>

        @php
            $saClass  = $selfAssessed >= 80 ? 'color-green' : ($selfAssessed >= 50 ? 'color-yellow' : 'color-red');
            $ewClass  = $evidenceWeighted !== null
                ? ($evidenceWeighted >= 70 ? 'color-green' : ($evidenceWeighted >= 40 ? 'color-yellow' : 'color-red'))
                : 'color-gray';
            $openPct  = $controlStats['total'] > 0
                ? round(($controlStats['non_compliant'] / $controlStats['total']) * 100)
                : 0;
        @endphp

        <div class="kpi-row">
            <div class="kpi-cell">
                <div class="kpi-number {{ $saClass }}">{{ $selfAssessed }}%</div>
                <div class="kpi-label">Self-Assessed Compliance</div>
            </div>
            <div class="kpi-cell">
                @if($evidenceWeighted !== null)
                    <div class="kpi-number {{ $ewClass }}">{{ $evidenceWeighted }}%</div>
                    <div class="kpi-label">Evidence-Weighted Score</div>
                @else
                    <div class="kpi-number color-gray">N/A</div>
                    <div class="kpi-label">Evidence-Weighted Score</div>
                @endif
            </div>
            <div class="kpi-cell">
                <div class="kpi-number {{ $controlStats['compliant'] > 0 ? 'color-green' : 'color-gray' }}">
                    {{ $controlStats['compliant'] }}
                </div>
                <div class="kpi-label">Compliant Controls</div>
            </div>
            <div class="kpi-cell">
                <div class="kpi-number {{ $controlStats['non_compliant'] > 0 ? 'color-red' : 'color-green' }}">
                    {{ $controlStats['non_compliant'] }}
                </div>
                <div class="kpi-label">Non-Compliant Controls</div>
            </div>
        </div>

        <div class="spacer"></div>

        <!-- Controls full breakdown -->
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th style="text-align:center;">Count</th>
                    <th>Share of Active Controls</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $statuses = [
                        ['label' => 'Compliant',            'key' => 'compliant',           'badge' => 'badge-green'],
                        ['label' => 'Partially Compliant',  'key' => 'partially_compliant', 'badge' => 'badge-yellow'],
                        ['label' => 'Non-Compliant',        'key' => 'non_compliant',        'badge' => 'badge-red'],
                        ['label' => 'Not Set',              'key' => 'not_set',              'badge' => 'badge-gray'],
                        ['label' => 'Not Applicable',       'key' => 'not_applicable',       'badge' => 'badge-gray'],
                    ];
                    $totalCtrl = max($controlStats['total'], 1);
                @endphp
                @foreach($statuses as $s)
                    @php
                        $cnt  = $controlStats[$s['key']];
                        $pct  = round(($cnt / $totalCtrl) * 100);
                        $fc   = match($s['key']) {
                            'compliant'           => '#16a34a',
                            'partially_compliant' => '#ca8a04',
                            'non_compliant'       => '#dc2626',
                            default               => '#94a3b8',
                        };
                    @endphp
                    <tr>
                        <td><span class="score-badge {{ $s['badge'] }}">{{ $s['label'] }}</span></td>
                        <td style="text-align:center; font-weight:bold;">{{ $cnt }}</td>
                        <td>
                            <div class="mini-bar-bg" style="width:100px;">
                                <div class="mini-bar-fill" style="width:{{ $pct }}%; background:{{ $fc }};"></div>
                            </div>
                            <span style="margin-left:6px; font-size:9px; color:#64748b;">{{ $pct }}%</span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Section 3: Risk Summary -->
    <div class="section">
        <div class="section-title">3. Risk Summary</div>
        <div class="risk-grid">
            <div class="risk-grid-row">
                <div class="risk-cell critical-bg">
                    <div class="risk-count critical-color">{{ $riskStats['critical'] }}</div>
                    <div class="risk-label critical-color">Critical</div>
                </div>
                <div class="risk-cell high-bg">
                    <div class="risk-count high-color">{{ $riskStats['high'] }}</div>
                    <div class="risk-label high-color">High</div>
                </div>
                <div class="risk-cell medium-bg">
                    <div class="risk-count medium-color">{{ $riskStats['medium'] }}</div>
                    <div class="risk-label medium-color">Medium</div>
                </div>
                <div class="risk-cell low-bg">
                    <div class="risk-count low-color">{{ $riskStats['low'] }}</div>
                    <div class="risk-label low-color">Low</div>
                </div>
                <div class="risk-cell" style="background:#f1f5f9;">
                    <div class="risk-count color-blue">{{ $riskStats['open'] }}</div>
                    <div class="risk-label color-blue">Open / Active</div>
                </div>
                <div class="risk-cell" style="background:#f0fdf4;">
                    <div class="risk-count color-green">{{ $riskStats['closed'] }}</div>
                    <div class="risk-label color-green">Closed</div>
                </div>
            </div>
        </div>

        <div class="spacer"></div>

        <!-- Top 5 risks -->
        @if(count($topRisks) > 0)
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Risk Title</th>
                    <th>Category</th>
                    <th style="text-align:center;">Score</th>
                    <th style="text-align:center;">Level</th>
                    <th style="text-align:center;">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topRisks as $i => $risk)
                    @php
                        $levelBadge = match($risk['risk_level']) {
                            'critical' => 'badge-red',
                            'high'     => 'badge-yellow',
                            'medium'   => 'badge-yellow',
                            default    => 'badge-green',
                        };
                        $levelColor = match($risk['risk_level']) {
                            'critical' => '#dc2626',
                            'high'     => '#ea580c',
                            'medium'   => '#ca8a04',
                            default    => '#16a34a',
                        };
                    @endphp
                    <tr>
                        <td style="color:#94a3b8; font-weight:bold;">{{ $i + 1 }}</td>
                        <td><strong>{{ $risk['title'] }}</strong></td>
                        <td style="color:#64748b;">{{ $risk['category'] }}</td>
                        <td style="text-align:center; font-weight:bold; color:{{ $levelColor }};">{{ $risk['score'] }}</td>
                        <td style="text-align:center;">
                            <span class="score-badge {{ $levelBadge }}" style="text-transform:capitalize;">{{ $risk['risk_level'] }}</span>
                        </td>
                        <td style="text-align:center; color:#64748b; text-transform:capitalize;">{{ str_replace('_', ' ', $risk['status']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Page break before framework + recommendations -->
    <div class="page-break"></div>

    <!-- Section 4: Framework Breakdown -->
    <div class="section" style="margin-top: 24px;">
        <div class="section-title">4. Framework Compliance Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Full Name</th>
                    <th style="text-align:center;">Self-Assessed</th>
                    <th style="text-align:center;">Evidence Score</th>
                    <th style="text-align:center;">Progress</th>
                    <th style="text-align:center;">Assessments</th>
                </tr>
            </thead>
            <tbody>
                @forelse($frameworkBreakdown as $fw)
                    @php
                        $sc  = $fw['compliance'];
                        $es  = $fw['evidence_score'];
                        $sbc = $sc !== null ? ($sc >= 80 ? 'badge-green' : ($sc >= 50 ? 'badge-yellow' : 'badge-red')) : 'badge-gray';
                        $ebc = $es !== null ? ($es >= 70 ? 'badge-green' : ($es >= 40 ? 'badge-yellow' : 'badge-red')) : 'badge-gray';
                        $fc  = $sc !== null ? ($sc >= 80 ? '#16a34a' : ($sc >= 50 ? '#ca8a04' : '#dc2626')) : '#94a3b8';
                        $sw  = $sc ?? 0;
                    @endphp
                    <tr>
                        <td><strong>{{ $fw['name'] }}</strong></td>
                        <td style="color:#64748b;">{{ $fw['full_name'] }}</td>
                        <td style="text-align:center;">
                            @if($sc !== null)
                                <span class="score-badge {{ $sbc }}">{{ $sc }}%</span>
                            @else
                                <span style="color:#94a3b8; font-size:9px;">No data</span>
                            @endif
                        </td>
                        <td style="text-align:center;">
                            @if($es !== null)
                                <span class="score-badge {{ $ebc }}">{{ round($es, 1) }}%</span>
                            @else
                                <span style="color:#94a3b8; font-size:9px;">Pending</span>
                            @endif
                        </td>
                        <td style="text-align:center;">
                            <div class="mini-bar-bg">
                                <div class="mini-bar-fill" style="width:{{ $sw }}%; background:{{ $fc }};"></div>
                            </div>
                        </td>
                        <td style="text-align:center;">{{ $fw['assessments_count'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:12px;">No framework data available.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Section 5: Evidence Health -->
    <div class="section">
        <div class="section-title">5. Evidence Health</div>
        <div class="ev-row">
            <div class="ev-cell">
                <div class="ev-count color-blue">{{ $evidenceStats['total'] }}</div>
                <div class="ev-label">Total Files</div>
            </div>
            <div class="ev-cell">
                <div class="ev-count color-green">{{ $evidenceStats['approved'] }}</div>
                <div class="ev-label">Approved</div>
            </div>
            <div class="ev-cell">
                <div class="ev-count {{ $evidenceStats['pending'] > 0 ? 'color-yellow' : 'color-green' }}">{{ $evidenceStats['pending'] }}</div>
                <div class="ev-label">Pending Review</div>
            </div>
            <div class="ev-cell">
                <div class="ev-count {{ $evidenceStats['rejected'] > 0 ? 'color-red' : 'color-green' }}">{{ $evidenceStats['rejected'] }}</div>
                <div class="ev-label">Rejected</div>
            </div>
            <div class="ev-cell">
                @php
                    $approvalRate = $evidenceStats['total'] > 0
                        ? round(($evidenceStats['approved'] / $evidenceStats['total']) * 100)
                        : 0;
                    $arClass = $approvalRate >= 70 ? 'color-green' : ($approvalRate >= 40 ? 'color-yellow' : 'color-red');
                @endphp
                <div class="ev-count {{ $arClass }}">{{ $approvalRate }}%</div>
                <div class="ev-label">Approval Rate</div>
            </div>
        </div>

        @if(count($nonCompliantCategories) > 0)
            <div class="spacer"></div>
            <p style="font-size:10px; color:#374151; margin-bottom:8px;">
                <strong>Top non-compliant control categories:</strong>
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th style="text-align:center;">Non-Compliant Controls</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($nonCompliantCategories as $cat => $cnt)
                        <tr>
                            <td>{{ $cat }}</td>
                            <td style="text-align:center; font-weight:bold; color:#dc2626;">{{ $cnt }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <!-- Section 6: Priority Recommendations -->
    <div class="section">
        <div class="section-title">6. Priority Recommendations</div>
        <ul class="rec-list">
            @foreach($recommendations as $i => $rec)
                <li class="rec-item">
                    <span class="rec-num">{{ $i + 1 }}</span>
                    <span>{{ $rec }}</span>
                </li>
            @endforeach
        </ul>
        <p class="small-note">Recommendations generated by AI based on current GRC system data. Management should validate before action.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
        <span>Confidential &mdash; AI Executive Summary &mdash; GRC Management System</span>
        <span>Princess Sumaya University for Technology &mdash; {{ $generatedAt }}</span>
    </div>

</body>
</html>
