{{-- Shared report header band.
     Variables (all optional):
       $eyebrow    — small uppercase label above the title           (escaped)
       $brandMark  — small uppercase brand mark, defaults to "GRC · Charter" (escaped)
       $title      — main title                                       (escaped)
       $subtitle   — descriptive subtitle                             (escaped)
       $meta       — generation metadata line                         (escaped)
       $right      — right-aligned classification block               (HTML allowed — only field
                                                                       that bypasses escaping;
                                                                       callers must not pass user input here)
     Use unicode punctuation in caller strings (—, •, non-breaking space) since
     the escaped fields render HTML entities literally.
--}}
@php
    $brandMark = $brandMark ?? 'GRC · Charter';
@endphp
<div class="header">
    @isset($right)
        <div class="header-right">{!! $right !!}</div>
    @endisset
    <div class="header-brand-mark">{{ $brandMark }}</div>
    @isset($eyebrow)
        <div class="header-eyebrow">{{ $eyebrow }}</div>
    @endisset
    @isset($title)
        <div class="header-title">{{ $title }}</div>
    @endisset
    @isset($subtitle)
        <div class="header-subtitle">{{ $subtitle }}</div>
    @endisset
    @isset($meta)
        <div class="header-meta">{{ $meta }}</div>
    @endisset
</div>
<div class="accent-bar"></div>
