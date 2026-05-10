<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Executive Summary — GRC Trustifyjo</title>
    @include('reports._partials._styles')
</head>
<body>

    @include('reports._partials._cover', [
        'eyebrow'        => 'Executive Report · Confidential',
        'title'          => 'Executive Summary',
        'subtitle'       => 'Security & Compliance Posture',
        'description'    => 'Synthesis of organisational compliance, evidence quality, and risk exposure across active frameworks. Prepared for Princess Sumaya University for Technology.',
        'classification' => 'Confidential · Internal Use Only',
    ])

    <div class="spacer"></div>

    <!-- Executive Narrative -->
    <div class="section">
        <div class="section-title">Executive Narrative</div>
        <div class="narrative">
            <div class="narrative-eyebrow">AI Narrative · Claude Sonnet · Figures drawn live from the GRC database</div>
            @foreach(array_filter(preg_split('/\n{2,}/', trim($narrative))) as $para)
                <p>{{ trim($para) }}</p>
            @endforeach
        </div>
    </div>

    <!-- Compliance Overview -->
    <div class="section">
        <div class="section-title">Compliance Overview</div>

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
                    <th class="num">Count</th>
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
                            'compliant'           => '#46bd5f',
                            'partially_compliant' => '#f5b929',
                            'non_compliant'       => '#e5484d',
                            default               => '#93939f',
                        };
                    @endphp
                    <tr>
                        <td><span class="score-badge {{ $s['badge'] }}">{{ $s['label'] }}</span></td>
                        <td class="num" style="font-weight:bold;">{{ $cnt }}</td>
                        <td>
                            <div class="mini-bar-bg" style="width:100px;">
                                <div class="mini-bar-fill" style="width:{{ $pct }}%; background:{{ $fc }};"></div>
                            </div>
                            <span style="margin-left:6px; font-size:9px; color:#75758a;">{{ $pct }}%</span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Risk Summary -->
    <div class="section">
        <div class="section-title">Risk Summary</div>
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
                <div class="risk-cell" style="background:#fafaf8;">
                    <div class="risk-count color-blue">{{ $riskStats['open'] }}</div>
                    <div class="risk-label color-blue">Open / Active</div>
                </div>
                <div class="risk-cell" style="background:#ecf9ef;">
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
                    <th class="num">#</th>
                    <th>Risk Title</th>
                    <th>Category</th>
                    <th class="num">Score</th>
                    <th>Level</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topRisks as $i => $risk)
                    @php
                        $levelBadge = match($risk['risk_level']) {
                            'critical' => 'badge-critical',
                            'high'     => 'badge-high',
                            'medium'   => 'badge-medium',
                            default    => 'badge-low',
                        };
                        $levelColor = match($risk['risk_level']) {
                            'critical' => '#e5484d',
                            'high'     => '#f76b15',
                            'medium'   => '#f5b929',
                            default    => '#46bd5f',
                        };
                    @endphp
                    <tr>
                        <td class="num" style="color:#93939f; font-weight:bold;">{{ $i + 1 }}</td>
                        <td><strong>{{ $risk['title'] }}</strong></td>
                        <td style="color:#75758a;">{{ $risk['category'] }}</td>
                        <td class="num" style="font-weight:bold; color:{{ $levelColor }};">{{ $risk['score'] }}</td>
                        <td>
                            <span class="score-badge {{ $levelBadge }}" style="text-transform:capitalize;">{{ $risk['risk_level'] }}</span>
                        </td>
                        <td style="color:#75758a; text-transform:capitalize;">{{ str_replace('_', ' ', $risk['status']) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Page break before framework + recommendations -->
    <div class="page-break"></div>

    <!-- Framework Compliance Breakdown -->
    <div class="section" style="margin-top: 24px;">
        <div class="section-title">Framework Compliance Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Full Name</th>
                    <th>Self-Assessed</th>
                    <th>Evidence Score</th>
                    <th>Progress</th>
                    <th class="num">Assessments</th>
                </tr>
            </thead>
            <tbody>
                @forelse($frameworkBreakdown as $fw)
                    @php
                        $sc  = $fw['compliance'];
                        $es  = $fw['evidence_score'];
                        $sbc = $sc !== null ? ($sc >= 80 ? 'badge-green' : ($sc >= 50 ? 'badge-yellow' : 'badge-red')) : 'badge-gray';
                        $ebc = $es !== null ? ($es >= 70 ? 'badge-green' : ($es >= 40 ? 'badge-yellow' : 'badge-red')) : 'badge-gray';
                        $fc  = $sc !== null ? ($sc >= 80 ? '#46bd5f' : ($sc >= 50 ? '#f5b929' : '#e5484d')) : '#93939f';
                        $sw  = $sc ?? 0;
                    @endphp
                    <tr>
                        <td><strong>{{ $fw['name'] }}</strong></td>
                        <td style="color:#75758a;">{{ $fw['full_name'] }}</td>
                        <td>
                            @if($sc !== null)
                                <span class="score-badge {{ $sbc }}">{{ $sc }}%</span>
                            @else
                                <span style="color:#93939f; font-size:9px;">No data</span>
                            @endif
                        </td>
                        <td>
                            @if($es !== null)
                                <span class="score-badge {{ $ebc }}">{{ round($es, 1) }}%</span>
                            @else
                                <span style="color:#93939f; font-size:9px;">Pending</span>
                            @endif
                        </td>
                        <td>
                            <div class="mini-bar-bg">
                                <div class="mini-bar-fill" style="width:{{ $sw }}%; background:{{ $fc }};"></div>
                            </div>
                        </td>
                        <td class="num">{{ $fw['assessments_count'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6" style="text-align:center; color:#93939f; padding:12px;">No framework data available.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Evidence Health -->
    <div class="section">
        <div class="section-title">Evidence Health</div>
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
            <p style="font-size:10px; color:#212121; margin-bottom:8px;">
                <strong>Top non-compliant control categories:</strong>
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th class="num">Non-Compliant Controls</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($nonCompliantCategories as $cat => $cnt)
                        <tr>
                            <td>{{ $cat }}</td>
                            <td class="num" style="font-weight:bold; color:#e5484d;">{{ $cnt }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <!-- Priority Recommendations -->
    <div class="section">
        <div class="section-title">Priority Recommendations</div>
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

    @include('reports._partials._page_chrome', ['reportTitle' => 'Executive Summary'])

</body>
</html>
