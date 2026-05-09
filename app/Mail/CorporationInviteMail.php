<?php

namespace App\Mail;

use App\Models\CorporationInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CorporationInviteMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public CorporationInvite $invite,
        public string $inviteUrl,
    ) {}

    public function envelope(): Envelope
    {
        $corp = $this->invite->corporation->name ?? 'GRC Platform';

        return new Envelope(
            subject: "You've been invited to join {$corp} on the GRC Platform",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.corporation-invite',
            with: [
                'invite' => $this->invite,
                'corporation' => $this->invite->corporation,
                'inviteUrl' => $this->inviteUrl,
                'expiresAt' => $this->invite->expires_at,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
