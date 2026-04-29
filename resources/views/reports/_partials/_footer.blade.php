{{-- Inline footer strip (optional). The universal "Confidential · GRC Charter / Page X of Y"
     line on every page is written by _page_chrome via page_script() in the @page bottom margin —
     templates do not need to call _footer for that.

     Use _footer only when a section-end inline footer is desired. Pass:
       $left   — left text
       $right  — right text
--}}
@php
    $left  = $left  ?? null;
    $right = $right ?? null;
@endphp
@if($left || $right)
    <div class="footer-static">
        {{ $left }} @if($right) — {{ $right }} @endif
    </div>
@endif
