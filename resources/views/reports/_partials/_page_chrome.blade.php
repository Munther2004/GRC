{{-- Page chrome — @page margins reserve space; <script type="text/php"> writes:
       footer (every page): "Confidential · GRC Charter" left, "Page X of Y" right
       running header (pages 2+, when $reportTitle is set): brand mark + report title

     The @page rules already live in _styles.blade.php. This partial only injects the
     PHP page_script callback. Include just before </body> in each template.

     Variable:
       $reportTitle — short identifier used in the running header on pages 2+. Pass null
                      or omit to suppress the running header (e.g. for short single-page
                      report types where it would just be visual noise).
--}}
@php
    $reportTitle = $reportTitle ?? null;
@endphp
<script type="text/php">
if (isset($pdf)) {
    $reportTitle = {!! json_encode($reportTitle, JSON_UNESCAPED_UNICODE) !!};
    $pdf->page_script(function ($pageNumber, $pageCount, $pdf, $fontMetrics) use ($reportTitle) {
        $font  = $fontMetrics->getFont('DejaVu Sans', 'normal');
        $w     = $pdf->get_width();
        $h     = $pdf->get_height();
        $muted = [0.46, 0.46, 0.54];   // #75758a
        $deep  = [0.0,  0.235, 0.2];   // #003c33

        // Footer — every page
        $left  = 'Confidential · GRC Charter';
        $pdf->text(48, $h - 32, $left, $font, 8, $muted);

        $pageTxt = 'Page ' . $pageNumber . ' of ' . $pageCount;
        $pageW   = $fontMetrics->getTextWidth($pageTxt, $font, 8);
        $pdf->text($w - 48 - $pageW, $h - 32, $pageTxt, $font, 8, $muted);

        // Running header — pages 2+ when caller provides a report title
        // @page top margin is 80px ≈ 60pt; text at y=28, rule at y=46 — both in margin, clear of content.
        if ($pageNumber > 1 && !empty($reportTitle)) {
            $brand = 'GRC · CHARTER';
            $pdf->text(48, 28, $brand, $font, 7.5, $deep);
            $titleW = $fontMetrics->getTextWidth($reportTitle, $font, 7.5);
            $pdf->text($w - 48 - $titleW, 28, $reportTitle, $font, 7.5, $muted);
            // Hairline rule separating running header from page content (0.5pt tall filled rect)
            $pdf->filled_rectangle(48, 46, $w - 96, 0.5, $muted);
        }
    });
}
</script>
