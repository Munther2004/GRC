<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #7ABFA8; background-color: #091413; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0D1F1C; border: 1px solid #285A48; }
        .header { padding: 40px 30px; text-align: center; border-bottom: 1px solid #285A48; }
        .header h1 { color: #C8E6D8; margin: 0; font-size: 22px; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 14px 26px; background: #285A48; color: #C8E6D8 !important; text-decoration: none; border-radius: 4px; font-weight: 600; }
        .footer { padding: 20px 30px; border-top: 1px solid #285A48; font-size: 12px; color: #5C9181; text-align: center; }
        a.fallback { color: #7ABFA8; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You've been invited to {{ $corporation->name }}</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You've been invited to join <strong>{{ $corporation->name }}</strong> on the GRC Platform. Click the button below to set up your account:</p>
            <p style="text-align:center; margin: 30px 0;">
                <a class="button" href="{{ $inviteUrl }}">Accept invitation</a>
            </p>
            @if ($expiresAt)
                <p style="font-size: 13px;">This invitation expires on <strong>{{ $expiresAt->format('M j, Y g:i A') }}</strong>.</p>
            @endif
            <p style="font-size: 13px;">If the button doesn't work, paste this link into your browser:</p>
            <p><a class="fallback" href="{{ $inviteUrl }}">{{ $inviteUrl }}</a></p>
        </div>
        <div class="footer">If you weren't expecting this, you can safely ignore the email.</div>
    </div>
</body>
</html>
