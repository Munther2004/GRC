<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GRC Compliance Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 11px;
            color: #1a1a2e;
            background: #ffffff;
            line-height: 1.5;
        }

        /* ── Header ── */
        .header {
            background: #1e3a5f;
            color: #ffffff;
            padding: 24px 32px;
            margin-bottom: 0;
        }
        .header-title {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .header-subtitle {
            font-size: 12px;
            color: #a8c4e0;
            margin-top: 4px;
        }
        .header-meta {
            margin-top: 8px;
            font-size: 10px;
            color: #7fafd4;
        }

        /* ── Blue accent bar ── */
        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #1e40af);
            margin-bottom: 24px;
        }

        /* ── Sections ── */
        .section {
            padding: 0 32px;
            margin-bottom: 28px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a5f;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 6px;
            margin-bottom: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* ── Overall compliance ── */
        .compliance-block {
            display: flex;
            align-items: center;
            gap: 24px;
            background: #f0f7ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 16px 24px;
        }
        .compliance-score {
            font-size: 48px;
            font-weight: bold;
            line-height: 1;
        }
        .compliance-score.green  { color: #16a34a; }
        .compliance-score.yellow { color: #ca8a04; }
        .compliance-score.red    { color: #dc2626; }
        .compliance-label {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }
        .compliance-bar-wrap {
            flex: 1;
        }
        .compliance-bar-bg {
            background: #e2e8f0;
            border-radius: 4px;
            height: 12px;
            overflow: hidden;
            margin-top: 8px;
        }
        .compliance-bar-fill {
            height: 100%;
            border-radius: 4px;
        }
        .bar-green  { background: #16a34a; }
        .bar-yellow { background: #ca8a04; }
        .bar-red    { background: #dc2626; }

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
            padding: 8px 10px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            font-size: 9px;
        }
        tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }
        tbody tr:nth-child(even) {
            background: #f8fafc;
        }
        tbody td {
            padding: 7px 10px;
            color: #374151;
        }

        /* ── Framework table progress bar ── */
        .mini-bar-bg {
            background: #e2e8f0;
            border-radius: 3px;
            height: 8px;
            width: 80px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }
        .mini-bar-fill {
            height: 100%;
            border-radius: 3px;
        }

        /* ── Risk level badges ── */
        .risk-grid {
            display: table;
            width: 100%;
        }
        .risk-grid-row {
            display: table-row;
        }
        .risk-cell {
            display: table-cell;
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
            text-align: center;
            border-radius: 4px;
        }
        .risk-count {
            font-size: 28px;
            font-weight: bold;
            line-height: 1;
        }
        .risk-label {
            font-size: 10px;
            margin-top: 4px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }
        .critical-bg { background: #fef2f2; }
        .critical-color { color: #dc2626; }
        .high-bg { background: #fff7ed; }
        .high-color { color: #ea580c; }
        .medium-bg { background: #fefce8; }
        .medium-color { color: #ca8a04; }
        .low-bg { background: #f0fdf4; }
        .low-color { color: #16a34a; }

        /* ── Score badge in table ── */
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

        /* ── Footer ── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1e3a5f;
            color: #a8c4e0;
            font-size: 9px;
            padding: 8px 32px;
            display: flex;
            justify-content: space-between;
        }

        /* ── Page break ── */
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <div class="header-title">GRC Management System &mdash; Compliance Report</div>
        <div class="header-subtitle">Princess Sumaya University for Technology</div>
        <div class="header-meta">Generated: {{ $generatedAt }}</div>
    </div>
    <div class="accent-bar"></div>

    <!-- Section 1: Overall Compliance -->
    <div class="section">
        <div class="section-title">1. Overall Compliance</div>
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
                <div style="font-size:11px; color:#374151; font-weight:bold;">Across all active frameworks</div>
                <div class="compliance-bar-bg">
                    <div class="compliance-bar-fill {{ $barClass }}" style="width: {{ $overallCompliance }}%;"></div>
                </div>
                <div style="margin-top:6px; font-size:10px; color:#64748b;">
                    @if($overallCompliance >= 80)
                        <span style="color:#16a34a;">&#10003; Good compliance posture</span>
                    @elseif($overallCompliance >= 50)
                        <span style="color:#ca8a04;">&#9888; Moderate compliance — improvements needed</span>
                    @else
                        <span style="color:#dc2626;">&#10005; Low compliance — immediate action required</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Section 2: Compliance by Framework -->
    <div class="section">
        <div class="section-title">2. Compliance by Framework</div>
        <table>
            <thead>
                <tr>
                    <th>Framework</th>
                    <th>Full Name</th>
                    <th>Score</th>
                    <th>Progress</th>
                    <th>Assessments</th>
                </tr>
            </thead>
            <tbody>
                @forelse($complianceByFramework as $fw)
                    @php
                        $score = $fw['latest_score'] ?? null;
                        $bc = $score !== null ? ($score >= 80 ? 'badge-green' : ($score >= 50 ? 'badge-yellow' : 'badge-red')) : '';
                        $fc = $score !== null ? ($score >= 80 ? '#16a34a' : ($score >= 50 ? '#ca8a04' : '#dc2626')) : '#94a3b8';
                        $fw_score = $score ?? 0;
                    @endphp
                    <tr>
                        <td><strong>{{ $fw['short_name'] }}</strong></td>
                        <td>{{ $fw['name'] }}</td>
                        <td>
                            @if($score !== null)
                                <span class="score-badge {{ $bc }}">{{ $score }}%</span>
                            @else
                                <span style="color:#94a3b8;">No data</span>
                            @endif
                        </td>
                        <td>
                            <div class="mini-bar-bg">
                                <div class="mini-bar-fill" style="width:{{ $fw_score }}%; background:{{ $fc }};"></div>
                            </div>
                        </td>
                        <td style="text-align:center;">{{ $fw['assessments_count'] }}</td>
                    </tr>
                @empty
                    <tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:16px;">No framework data available</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- Section 3: Risk Summary -->
    <div class="section">
        <div class="section-title">3. Risk Summary</div>
        <table>
            <thead>
                <tr>
                    <th style="width:25%;">Level</th>
                    <th style="width:25%;">Count</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong style="color:#dc2626;">&#9632; Critical</strong></td>
                    <td style="font-size:14px; font-weight:bold; color:#dc2626;">{{ $riskByLevel['critical'] }}</td>
                    <td style="color:#64748b;">Score &ge; 20 — Immediate treatment required</td>
                </tr>
                <tr>
                    <td><strong style="color:#ea580c;">&#9632; High</strong></td>
                    <td style="font-size:14px; font-weight:bold; color:#ea580c;">{{ $riskByLevel['high'] }}</td>
                    <td style="color:#64748b;">Score 13–19 — Priority treatment needed</td>
                </tr>
                <tr>
                    <td><strong style="color:#ca8a04;">&#9632; Medium</strong></td>
                    <td style="font-size:14px; font-weight:bold; color:#ca8a04;">{{ $riskByLevel['medium'] }}</td>
                    <td style="color:#64748b;">Score 7–12 — Treatment plan required</td>
                </tr>
                <tr>
                    <td><strong style="color:#16a34a;">&#9632; Low</strong></td>
                    <td style="font-size:14px; font-weight:bold; color:#16a34a;">{{ $riskByLevel['low'] }}</td>
                    <td style="color:#64748b;">Score &le; 6 — Monitor and review</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Section 4: Assessment History -->
    <div class="section">
        <div class="section-title">4. Assessment History</div>
        @if(count($assessmentHistory) === 0)
            <p style="color:#94a3b8; text-align:center; padding:16px;">No completed assessments found.</p>
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
                            <td><span style="background:#eff6ff; color:#1d4ed8; padding:2px 6px; border-radius:4px; font-size:9px;">{{ $a['framework'] }}</span></td>
                            <td style="color:#64748b;">{{ $a['period'] }}</td>
                            <td><span class="score-badge {{ $bc }}">{{ $a['compliance_percentage'] }}%</span></td>
                            <td style="color:#64748b;">{{ $a['completed_at'] }}</td>
                            <td style="color:#64748b;">{{ $a['user'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <span>Confidential &mdash; Generated by GRC System</span>
        <span>Princess Sumaya University for Technology &mdash; {{ $generatedAt }}</span>
    </div>

</body>
</html>
