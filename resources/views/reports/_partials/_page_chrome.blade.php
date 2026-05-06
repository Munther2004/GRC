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

        // Footer — every page. y=h-22 sits ~17mm from the page bottom edge,
        // well inside the 96px (=72pt) bottom @page margin. With body content
        // ending at y≈h-72pt, that leaves ~50pt (~17mm) of breathing room
        // between the last body element and the footer baseline.
        $left  = 'Confidential · GRC Charter';
        $pdf->text(48, $h - 22, $left, $font, 8, $muted);

        $pageTxt = 'Page ' . $pageNumber . ' of ' . $pageCount;
        $pageW   = $fontMetrics->getTextWidth($pageTxt, $font, 8);
        $pdf->text($w - 48 - $pageW, $h - 22, $pageTxt, $font, 8, $muted);

        // Running header — pages 2+ when caller provides a report title.
        // Brand text at y=20pt, hairline rule at y=36pt. With the @page top
        // margin at 120px (=90pt), body content begins ~54pt below the rule —
        // a comfortable, unmistakable visual separation.
        if ($pageNumber > 1 && !empty($reportTitle)) {
            $brand = 'GRC · CHARTER';
            $pdf->text(48, 20, $brand, $font, 7.5, $deep);
            $titleW = $fontMetrics->getTextWidth($reportTitle, $font, 7.5);
            $pdf->text($w - 48 - $titleW, 20, $reportTitle, $font, 7.5, $muted);
            // Hairline rule separating running header from page content
            $pdf->filled_rectangle(48, 36, $w - 96, 0.5, $muted);
        }
    });
}
</script>
