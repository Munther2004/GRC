{{-- Operational cover page — deep-green hero with title block, system-format date in the
     header bar, and a thin classification stripe. Designed to look like a polished GRC
     platform report, not a board packet.

     Variables (all optional):
       $eyebrow        — small uppercase label above the title (classification line)
       $title          — display title (DejaVu Serif)
       $subtitle       — short subtitle line under the title (plain sans, pale-green)
       $description    — longer paragraph under the subtitle (optional)
       $classification — bottom-stripe text; defaults to a generic line
       $generatedDate  — Carbon-like instance; falls back to now()
       $brandMark      — defaults to "GRC · Trustifyjo"
--}}
@php
    $generatedDate  = $generatedDate  ?? \Carbon\CarbonImmutable::now();
    $brandMark      = $brandMark      ?? 'GRC · Trustifyjo';
    $classification = $classification ?? 'Confidential · Internal Use Only';
    $systemDate     = 'Generated · ' . $generatedDate->format('j M Y');
@endphp

<div class="cover-page">
    <div class="cover-hero">
        <div class="cover-meta">
            <span class="cover-brand">{{ $brandMark }}</span>
            <span class="cover-date">{{ $systemDate }}</span>
        </div>
        <div class="cover-rule"></div>

        @isset($eyebrow)
            <div class="cover-eyebrow">{{ $eyebrow }}</div>
        @endisset

        @isset($title)
            <div class="cover-title">{{ $title }}</div>
        @endisset

        @isset($subtitle)
            <div class="cover-subtitle">{{ $subtitle }}</div>
        @endisset

        @isset($description)
            <div class="cover-description">{{ $description }}</div>
        @endisset
    </div>

    <div class="cover-classification">{{ $classification }}</div>
</div>
