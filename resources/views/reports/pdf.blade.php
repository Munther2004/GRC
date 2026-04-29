<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GRC Compliance Report</title>
    @include('reports._partials._styles')
</head>
<body>

    @include('reports._partials._header', [
        'title'    => 'GRC Charter — Compliance Report',
        'subtitle' => 'Princess Sumaya University for Technology',
        'meta'     => 'Generated: ' . $generatedAt,
    ])

    <!-- Overall Compliance -->
    <div class="section" style="margin-top: 24px;">
        <div class="section-title">Overall Compliance</div>
        @php
            $scoreClass = $overallCompliance >= 80 ? 'green' : ($overallCompliance >= 50 ? 'yellow' : 'red');
            $barClass   = 'bar-' . $scoreClass;
        @endphp
        <div class="compliance-block">
            <div>
                <div class="compliance-score {{ $scoreClass }}">{{ $overallCompliance }}%</div>
                <div class="compliance-label">Overall Score</div>
            </div>
            <div class="compliance-bar-wrap">
                <div style="font-size:11px; color:#212121; font-weight:bold;">Across all active frameworks</div>
                <div class="compliance-bar-bg">
                    <div class="compliance-bar-fill {{ $barClass }}" style="width: {{ $overallCompliance }}%;"></div>
                </div>
                <div style="margin-top:6px; font-size:10px; color:#75758a;">
                    @if($overallCompliance >= 80)
                        <span style="color:#46bd5f;">&#10003; Good compliance posture</span>
                    @elseif($overallCompliance >= 50)
                        <span style="color:#f5b929;">&#9888; Moderate compliance — improvements needed</span>
                    @else
                        <span style="color:#e5484d;">&#10005; Low compliance — immediate action required</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Compliance by Framework -->
    <div class="section">
        <div class="section-title">Compliance by Framework</div>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Full Name</th>
                    <th>Score</th>
                    <th>Progress</th>
                    <th class="num">Assessments</th>
                </tr>
            </thead>
            <tbody>
                @forelse($complianceByFramework as $fw)
                    @php
                        $score = $fw['latest_score'] ?? null;
                        $bc = $score !== null ? ($score >= 80 ? 'badge-green' : ($score >= 50 ? 'badge-yellow' : 'badge-red')) : '';
                        $fc = $score !== null ? ($score >= 80 ? '#46bd5f' : ($score >= 50 ? '#f5b929' : '#e5484d')) : '#93939f';
                        $fw_score = $score ?? 0;
                    @endphp
                    <tr>
                        <td><strong>{{ $fw['short_name'] }}</strong></td>
                        <td>{{ $fw['name'] }}</td>
                        <td>
                            @if($score !== null)
                                <span class="score-badge {{ $bc }}">{{ $score }}%</span>
                            @else
                                <span style="color:#93939f;">No data</span>
                            @endif
                        </td>
                        <td>
                            <div class="mini-bar-bg">
                                <div class="mini-bar-fill" style="width:{{ $fw_score }}%; background:{{ $fc }};"></div>
                            </div>
                        </td>
                        <td class="num">{{ $fw['assessments_count'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" style="text-align:center; color:#93939f; padding:16px;">No framework data available</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Risk Summary -->
    <div class="section">
        <div class="section-title">Risk Summary</div>
        <table>
            <thead>
                <tr>
                    <th style="width:25%;">Level</th>
                    <th class="num" style="width:25%;">Count</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color:#e5484d;">&#9632; Critical</strong></td>
                    <td class="num" style="font-size:14px; font-weight:bold; color:#e5484d;">{{ $riskByLevel['critical'] }}</td>
                    <td style="color:#75758a;">Score &ge; 20 — Immediate treatment required</td>
                </tr>
                <tr>
                    <td><strong style="color:#f76b15;">&#9632; High</strong></td>
                    <td class="num" style="font-size:14px; font-weight:bold; color:#f76b15;">{{ $riskByLevel['high'] }}</td>
                    <td style="color:#75758a;">Score 13–19 — Priority treatment needed</td>
                </tr>
                <tr>
                    <td><strong style="color:#f5b929;">&#9632; Medium</strong></td>
                    <td class="num" style="font-size:14px; font-weight:bold; color:#f5b929;">{{ $riskByLevel['medium'] }}</td>
                    <td style="color:#75758a;">Score 7–12 — Treatment plan required</td>
                </tr>
                <tr>
                    <td><strong style="color:#46bd5f;">&#9632; Low</strong></td>
                    <td class="num" style="font-size:14px; font-weight:bold; color:#46bd5f;">{{ $riskByLevel['low'] }}</td>
                    <td style="color:#75758a;">Score &le; 6 — Monitor and review</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Assessment History -->
    <div class="section">
        <div class="section-title">Assessment History</div>
        @if(count($assessmentHistory) === 0)
            <p style="color:#93939f; text-align:center; padding:16px;">No completed assessments found.</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>Assessment Title</th>
                        <th>Framework</th>
                        <th>Period</th>
                        <th>Score</th>
                        <th>Completed</th>
                        <th>Conducted By</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($assessmentHistory as $a)
                        @php
                            $bc = $a['compliance_percentage'] >= 80 ? 'badge-green' : ($a['compliance_percentage'] >= 50 ? 'badge-yellow' : 'badge-red');
                        @endphp
                        <tr>
                            <td>{{ $a['title'] }}</td>
                            <td><span class="badge badge-fw">{{ $a['framework'] }}</span></td>
                            <td style="color:#75758a;">{{ $a['period'] }}</td>
                            <td><span class="score-badge {{ $bc }}">{{ $a['compliance_percentage'] }}%</span></td>
                            <td style="color:#75758a;">{{ $a['completed_at'] }}</td>
                            <td style="color:#75758a;">{{ $a['user'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    @include('reports._partials._page_chrome', ['reportTitle' => 'Compliance Report'])

</body>
</html>
