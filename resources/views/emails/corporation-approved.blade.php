<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #7ABFA8;
            background-color: #091413;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0D1F1C;
            overflow: hidden;
            border: 1px solid #285A48;
        }
        .header {
            background: linear-gradient(135deg, #091413 0%, #0D1F1C 100%);
            padding: 50px 30px;
            text-align: center;
            border-bottom: 1px solid #285A48;
        }
        .header::before {
            content: '✶  ✶  ✶';
            display: block;
            font-size: 12px;
            color: #408A71;
            margin-bottom: 20px;
            letter-spacing: 12px;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 400;
            color: #E0F5EC;
            letter-spacing: 0.05em;
        }
        .header p {
            margin: 0;
            font-size: 12px;
            color: #7ABFA8;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            font-style: italic;
        }
        .content {
            padding: 40px 30px;
        }
        .content p {
            margin: 0 0 15px 0;
            color: #7ABFA8;
            font-style: italic;
        }
        .content strong {
            color: #E0F5EC;
            font-style: normal;
        }
        .section-label {
            color: #408A71;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            margin: 30px 0 12px 0;
            display: block;
        }
        .credentials-box {
            background-color: rgba(64, 138, 113, 0.05);
            border: 1px solid rgba(64, 138, 113, 0.25);
            border-left: 3px solid #408A71;
            padding: 20px 24px;
            margin: 0 0 20px 0;
        }
        .credential-item {
            margin: 14px 0;
        }
        .credential-item:first-child { margin-top: 0; }
        .credential-item:last-child  { margin-bottom: 0; }
        .credential-label {
            color: #7ABFA8;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            margin-bottom: 4px;
        }
        .credential-value {
            font-family: 'Courier New', monospace;
            font-size: 15px;
            font-weight: 600;
            color: #E0F5EC;
            word-break: break-all;
            letter-spacing: 0.02em;
        }
        .code-box {
            background-color: rgba(176, 228, 204, 0.05);
            border: 1px solid rgba(176, 228, 204, 0.25);
            border-left: 3px solid #B0E4CC;
            padding: 20px 24px;
            margin: 0 0 20px 0;
        }
        .code-value {
            font-family: 'Courier New', monospace;
            font-size: 22px;
            font-weight: 700;
            color: #B0E4CC;
            letter-spacing: 0.15em;
            word-break: break-all;
            margin-top: 6px;
        }
        .code-desc {
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #7ABFA8;
            font-style: italic;
        }
        .warning {
            background-color: rgba(139, 38, 53, 0.06);
            border: 1px solid rgba(139, 38, 53, 0.25);
            border-left: 3px solid #8B2635;
            padding: 16px 20px;
            margin: 20px 0;
            color: #E0F5EC;
            font-size: 13px;
        }
        .steps-box {
            background-color: rgba(9, 20, 19, 0.6);
            border: 1px solid #285A48;
            padding: 20px 24px;
            margin: 0 0 20px 0;
        }
        .steps-box ol {
            margin: 8px 0 0 0;
            padding-left: 22px;
        }
        .steps-box li {
            margin: 10px 0;
            color: #E0F5EC;
            font-size: 13px;
        }
        .steps-box li span {
            color: #408A71;
            font-weight: 600;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #408A71, #285A48);
            color: #091413 !important;
            padding: 13px 36px;
            text-decoration: none;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }
        .divider {
            border: none;
            border-top: 1px solid #285A48;
            margin: 30px 0;
        }
        .footer {
            background-color: #091413;
            padding: 24px 30px;
            text-align: center;
            color: #7ABFA8;
            font-size: 11px;
            border-top: 1px solid #285A48;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">

        <div class="header">
            <h1>{{ $corporation->name }}</h1>
            <p>Registration Approved</p>
        </div>

        <div class="content">
            <p>Welcome,</p>
            <p>
                Your organisation has been <strong>approved</strong> on the GRC Platform.
                Your manager account has been created — use the credentials below to log in.
            </p>

            {{-- ── Manager login credentials ── --}}
            <span class="section-label">Your Manager Account</span>
            <div class="credentials-box">
                <div class="credential-item">
                    <div class="credential-label">Email (login)</div>
                    <div class="credential-value">{{ $managerEmail }}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">Temporary Password</div>
                    <div class="credential-value">{{ $managerPassword }}</div>
                </div>
            </div>

            <div class="warning">
                <strong>⚠ Security notice —</strong> change this temporary password immediately after your first login. Never share it.
            </div>

            <p style="text-align:center; margin: 24px 0;">
                <a href="{{ $loginUrl }}" class="button">Log In to GRC Platform</a>
            </p>

            <hr class="divider">

            {{-- ── Registration code for employees ── --}}
            <span class="section-label">Employee Registration Code</span>
            <div class="code-box">
                <div class="credential-label">Share this code with your team</div>
                <div class="code-value">{{ $registrationCode }}</div>
                <p class="code-desc">
                    Employees enter this code when signing up at
                    <strong style="color:#E0F5EC; font-style:normal;">{{ $registerUrl }}</strong>
                    to be linked to <strong style="color:#E0F5EC; font-style:normal;">{{ $corporation->name }}</strong>.
                </p>
            </div>

            <hr class="divider">

            {{-- ── Next steps ── --}}
            <span class="section-label">Getting Started</span>
            <div class="steps-box">
                <ol>
                    <li><span>Log in</span> using the credentials above.</li>
                    <li><span>Change your password</span> from your account settings.</li>
                    <li><span>Share the registration code</span> with each employee who needs access.</li>
                    <li><span>Employees sign up</span> at {{ $registerUrl }} and enter the code during registration.</li>
                    <li><span>Start managing compliance</span> — risks, controls, assessments, and evidence.</li>
                </ol>
            </div>

            <hr class="divider">

            <p>If you have any questions, contact us at <strong>support@grcsystem.online</strong>.</p>
        </div>

        <div class="footer">
            <p>&copy; {{ now()->year }} GRC System. All rights reserved.<br>
            This email was sent because your organisation was approved on the GRC Platform.</p>
        </div>
    </div>
</body>
</html>
