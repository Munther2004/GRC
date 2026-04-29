{{-- Canonical PDF design system — single source of truth.
     Brand: deep-green #003c33 (matches DESIGN.md Cohere-derived light theme).
     Severity hues match the web post-cleanup: critical #e5484d / high #f76b15 / medium #f5b929 / low #46bd5f.
     Type split: DejaVu Serif for display, DejaVu Sans for body — DomPDF ships both.
--}}
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        font-family: 'DejaVu Sans', Arial, sans-serif;
        font-size: 11px;
        color: #212121;
        background: #ffffff;
        line-height: 1.5;
    }
    .display {
        font-family: 'DejaVu Serif', Georgia, serif;
    }

    /* ── Header band (deep-green; replaces navy slab) ───────────────────── */
    .header {
        background: #003c33;
        color: #ffffff;
        padding: 26px 32px 20px;
    }
    .header-right {
        float: right;
        text-align: right;
        font-size: 8.5px;
        color: #9bc5b4;
    }
    .header-eyebrow {
        font-size: 9px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #9bc5b4;
        margin-bottom: 6px;
    }
    .header-brand-mark {
        font-size: 8px;
        letter-spacing: 2.4px;
        text-transform: uppercase;
        color: #cfeae0;
        margin-bottom: 4px;
    }
    .header-title {
        font-family: 'DejaVu Serif', Georgia, serif;
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 0.3px;
    }
    .header-subtitle {
        font-size: 12px;
        color: #cfeae0;
        margin-top: 4px;
    }
    .header-meta {
        margin-top: 10px;
        font-size: 9px;
        color: #9bc5b4;
    }

    /* ── Accent strip (hairline + pale-green band) ──────────────────────── */
    .accent-bar {
        height: 4px;
        background: #edfce9;
        border-bottom: 1px solid #d9d9dd;
    }

    /* ── AI badge strip ─────────────────────────────────────────────────── */
    .ai-badge-strip {
        background: #edfce9;
        border-bottom: 1px solid #c8e8c0;
        padding: 7px 32px;
        font-size: 9px;
        color: #003c33;
        letter-spacing: 0.3px;
    }

    /* ── Sections ───────────────────────────────────────────────────────── */
    .section {
        padding: 0 32px;
        margin-bottom: 26px;
    }
    .section-title {
        font-size: 12px;
        font-weight: bold;
        color: #003c33;
        border-bottom: 1px solid #d9d9dd;
        padding-bottom: 6px;
        margin-bottom: 14px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }

    /* ── Content wrapper ────────────────────────────────────────────────── */
    .content {
        padding: 18px 24px;
    }

    /* ── Tables ─────────────────────────────────────────────────────────── */
    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
    }
    thead tr {
        background: #003c33;
        color: #ffffff;
    }
    thead th {
        padding: 7px 10px;
        text-align: left;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        font-size: 9px;
    }
    tbody tr {
        border-bottom: 1px solid #d9d9dd;
    }
    tbody tr:nth-child(even) {
        background: #fafaf8;
    }
    tbody td {
        padding: 6px 10px;
        color: #212121;
    }

    /* ── Severity colours (canonical, web-matched) ──────────────────────── */
    .color-critical { color: #e5484d; }
    .color-high     { color: #f76b15; }
    .color-medium   { color: #f5b929; }
    .color-low      { color: #46bd5f; }
    .color-info     { color: #75758a; }

    /* Legacy aliases — preserved so existing inline class names keep working */
    .color-red    { color: #e5484d; }
    .color-amber  { color: #f76b15; }
    .color-yellow { color: #f5b929; }
    .color-green  { color: #46bd5f; }
    .color-blue   { color: #003c33; }
    .color-gray   { color: #75758a; }

    .text-red   { color: #e5484d; }
    .text-amber { color: #f76b15; }
    .text-green { color: #46bd5f; }
    .text-blue  { color: #003c33; }

    .bar-red    { background: #e5484d; }
    .bar-yellow { background: #f5b929; }
    .bar-green  { background: #46bd5f; }
    .bar-blue   { background: #003c33; }

    /* Severity tinted backgrounds */
    .critical-bg { background: #fdeeee; } .critical-color { color: #e5484d; }
    .high-bg     { background: #fef0e6; } .high-color     { color: #f76b15; }
    .medium-bg   { background: #fef8e3; } .medium-color   { color: #f5b929; }
    .low-bg      { background: #ecf9ef; } .low-color      { color: #46bd5f; }

    /* ── Pill capsules (canonical recipe) ───────────────────────────────── */
    .pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: bold;
        letter-spacing: 0.3px;
    }
    .pill--critical { background: #fdeeee; color: #b3343a; }
    .pill--high     { background: #fef0e6; color: #a64308; }
    .pill--medium   { background: #fef8e3; color: #8a6d10; }
    .pill--low      { background: #ecf9ef; color: #297a3b; }
    .pill--info     { background: #f1f1ee; color: #75758a; }

    /* ── Score / status badges (alias of pill, used by current templates) ─ */
    .score-badge,
    .status-badge,
    .badge {
        display: inline-block;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 9px;
        font-weight: bold;
        letter-spacing: 0.3px;
    }
    .badge-green        { background: #ecf9ef; color: #297a3b; }
    .badge-yellow       { background: #fef8e3; color: #8a6d10; }
    .badge-red          { background: #fdeeee; color: #b3343a; }
    .badge-gray         { background: #f1f1ee; color: #75758a; }
    .badge-critical     { background: #fdeeee; color: #b3343a; }
    .badge-high         { background: #fef0e6; color: #a64308; }
    .badge-medium       { background: #fef8e3; color: #8a6d10; }
    .badge-low          { background: #ecf9ef; color: #297a3b; }
    .badge-compliant    { background: #ecf9ef; color: #297a3b; }
    .badge-partial      { background: #fef8e3; color: #8a6d10; }
    .badge-pc           { background: #fef8e3; color: #8a6d10; }
    .badge-nc           { background: #fdeeee; color: #b3343a; }
    .badge-noncompliant { background: #fdeeee; color: #b3343a; }
    .badge-na           { background: #f1f1ee; color: #75758a; }
    .badge-improved     { background: #ecf9ef; color: #297a3b; }
    .badge-regressed    { background: #fdeeee; color: #b3343a; }
    .badge-unchanged    { background: #f1f1ee; color: #75758a; }
    .badge-new          { background: #edfce9; color: #003c33; }
    .badge-removed      { background: #f1f1ee; color: #75758a; }
    .badge-adequate     { background: #ecf9ef; color: #297a3b; }
    .badge-part-ev      { background: #fef8e3; color: #8a6d10; }
    .badge-insuff       { background: #fdeeee; color: #b3343a; }
    .badge-fw           { background: #edfce9; color: #003c33; }

    /* Solid-fill severity pill — used in security-audit findings */
    .severity-pill {
        display: inline-block;
        font-size: 8px;
        font-weight: bold;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #ffffff;
        margin-right: 6px;
    }
    .severity-critical { background: #e5484d; }
    .severity-high     { background: #f76b15; }
    .severity-medium   { background: #f5b929; color: #5b440a; }
    .severity-low      { background: #46bd5f; }
    .severity-info     { background: #75758a; }

    /* ── KPI cells ──────────────────────────────────────────────────────── */
    .kpi-row {
        display: table;
        width: 100%;
        border-collapse: separate;
        border-spacing: 8px 0;
        margin-bottom: 4px;
    }
    .kpi-cell {
        display: table-cell;
        background: #fafaf8;
        border: 1px solid #d9d9dd;
        border-radius: 6px;
        padding: 12px 14px;
        text-align: center;
        width: 25%;
    }
    .kpi-number { font-size: 26px; font-weight: bold; line-height: 1; }
    .kpi-label  { font-size: 9px; color: #75758a; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px; }

    .kpi-box {
        flex: 1;
        border: 1px solid #d9d9dd;
        border-radius: 6px;
        padding: 10px 12px;
        background: #fafaf8;
    }
    .kpi-value { font-size: 20px; font-weight: bold; color: #003c33; line-height: 1.1; }
    .kpi-sub   { font-size: 8px; color: #75758a; margin-top: 2px; }

    /* ── Mini bars ──────────────────────────────────────────────────────── */
    .mini-bar-bg {
        background: #d9d9dd;
        border-radius: 3px;
        height: 7px;
        width: 80px;
        overflow: hidden;
        display: inline-block;
        vertical-align: middle;
    }
    .mini-bar-fill { height: 100%; border-radius: 3px; }

    /* ── Risk grid ──────────────────────────────────────────────────────── */
    .risk-grid { display: table; width: 100%; }
    .risk-grid-row { display: table-row; }
    .risk-cell {
        display: table-cell;
        padding: 10px 12px;
        border: 1px solid #d9d9dd;
        text-align: center;
        border-radius: 4px;
    }
    .risk-count { font-size: 26px; font-weight: bold; line-height: 1; }
    .risk-label { font-size: 9px; margin-top: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; }

    /* ── Recommendations list ───────────────────────────────────────────── */
    .rec-list { list-style: none; }
    .rec-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 12px;
        margin-bottom: 6px;
        border-radius: 6px;
        border: 1px solid #d9d9dd;
        background: #fafaf8;
        font-size: 10.5px;
    }
    .rec-num {
        background: #003c33;
        color: #ffffff;
        font-size: 9px;
        font-weight: bold;
        min-width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        text-align: center;
        line-height: 20px;
    }

    /* ── Narrative block (AI text) ──────────────────────────────────────── */
    .narrative {
        background: #edfce9;
        border-left: 3px solid #003c33;
        padding: 14px 18px;
        border-radius: 0 6px 6px 0;
        line-height: 1.75;
        font-size: 10.5px;
        color: #212121;
    }
    .narrative p { margin-bottom: 10px; }
    .narrative p:last-child { margin-bottom: 0; }

    /* ── Evidence cells ─────────────────────────────────────────────────── */
    .ev-row { display: table; width: 100%; }
    .ev-cell {
        display: table-cell;
        text-align: center;
        padding: 8px;
        border: 1px solid #d9d9dd;
        background: #fafaf8;
    }
    .ev-count { font-size: 20px; font-weight: bold; }
    .ev-label { font-size: 9px; color: #75758a; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px; }

    /* ── Boxed panels ───────────────────────────────────────────────────── */
    .box {
        border: 1px solid #d9d9dd;
        border-radius: 6px;
        overflow: hidden;
    }
    .box-header {
        background: #fafaf8;
        border-bottom: 1px solid #d9d9dd;
        padding: 7px 10px;
        font-size: 9px;
        font-weight: bold;
        color: #003c33;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }
    .box-body { padding: 10px; }

    /* ── Two-col flex ───────────────────────────────────────────────────── */
    .two-col { display: flex; gap: 16px; margin-bottom: 18px; }
    .col-half { flex: 1; }

    /* ── Compliance hero block ──────────────────────────────────────────── */
    .compliance-block {
        display: flex;
        align-items: center;
        gap: 24px;
        background: #edfce9;
        border: 1px solid #c8e8c0;
        border-radius: 8px;
        padding: 16px 24px;
    }
    .compliance-score { font-size: 48px; font-weight: bold; line-height: 1; }
    .compliance-score.green  { color: #46bd5f; }
    .compliance-score.yellow { color: #f5b929; }
    .compliance-score.red    { color: #e5484d; }
    .compliance-label { font-size: 11px; color: #75758a; margin-top: 4px; }
    .compliance-bar-wrap { flex: 1; }
    .compliance-bar-bg {
        background: #d9d9dd;
        border-radius: 4px;
        height: 12px;
        overflow: hidden;
        margin-top: 8px;
    }
    .compliance-bar-fill { height: 100%; border-radius: 4px; }

    /* ── Footer (fixed bottom band) ─────────────────────────────────────── */
    .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #003c33;
        color: #cfeae0;
        font-size: 9px;
        padding: 7px 32px;
        display: flex;
        justify-content: space-between;
    }
    /* Inline footer used by templates that don't fix the bar */
    .footer-static {
        margin-top: 24px;
        padding-top: 10px;
        border-top: 1px solid #d9d9dd;
        font-size: 8px;
        color: #75758a;
        text-align: center;
    }

    /* ── Misc ───────────────────────────────────────────────────────────── */
    .page-break { page-break-after: always; }
    .spacer { height: 16px; }
    .small-note { font-size: 9px; color: #75758a; margin-top: 6px; }
</style>
