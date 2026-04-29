{{-- Shared report footer.
     $left  — left text  (escaped; defaults to "Confidential — GRC Charter")
     $right — right text (escaped; defaults to current $generatedAt if available)
     $fixed — true to render as fixed bottom bar; false for inline footer
     Use unicode punctuation in caller strings (—, •, non-breaking space).
--}}
@php
    $left  = $left  ?? 'Confidential — GRC Charter';
    $right = $right ?? ($generatedAt ?? '');
    $fixed = $fixed ?? true;
@endphp
@if($fixed)
    <div class="footer">
        <span>{{ $left }}</span>
        <span>{{ $right }}</span>
    </div>
@else
    <div class="footer-static">
        {{ $left }} @if($right) — {{ $right }} @endif
    </div>
@endif
