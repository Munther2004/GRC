<?php

namespace App\Mail;

use App\Models\Corporation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CorporationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Corporation $corporation,
        public string $managerEmail,
        public string $managerPassword,
        public string $registrationCode,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Congratulations! {$this->corporation->name} Has Been Approved — GRC Platform",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.corporation-approved',
            with: [
                'corporation'      => $this->corporation,
                'managerEmail'     => $this->managerEmail,
                'managerPassword'  => $this->managerPassword,
                'registrationCode' => $this->registrationCode,
                'loginUrl'         => route('login'),
                'registerUrl'      => url('/register'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
