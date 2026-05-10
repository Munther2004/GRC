---
version: alpha
name: Cohere
description: Cohere's 2026 web system is a controlled enterprise AI interface built from stark white editorial space, deep green-black product bands, soft mineral surfaces, rounded media cards, and a distinctive type split between monospaced-feeling display headlines and precise Unica77 UI text.

colors:
  primary: "#17171c"
  cohere-black: "#000000"
  ink: "#212121"
  deep-green: "#003c33"
  dark-navy: "#071829"
  canvas: "#ffffff"
  soft-stone: "#eeece7"
  pale-green: "#edfce9"
  pale-blue: "#f1f5ff"
  hairline: "#d9d9dd"
  border-light: "#e5e7eb"
  card-border: "#f2f2f2"
  muted: "#93939f"
  slate: "#75758a"
  body-muted: "#616161"
  action-blue: "#1863dc"
  focus-blue: "#4c6ee6"
  coral: "#ff7759"
  coral-soft: "#ffad9b"
  form-focus: "#9b60aa"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  error: "#b30000"

dark-colors:
  # Forest dark mode — pairs with the light Cohere canvas as an alternate surface.
  background: "#06100e"
  background-soft: "#091413"
  card: "#0c1c19"
  stone: "#0e2520"
  pale-green: "#0c1f1b"
  pale-blue: "#0c1620"
  ink: "#e6f3ec"
  muted: "#8fb6a4"
  slate: "#7c9c8d"
  hairline: "#1d3a31"
  border: "#1e3a31"
  primary: "#b0e4cc"
  on-primary: "#06100e"
  accent: "#7fd1ad"
  deep-green: "#063a31"
  mint: "#b0e4cc"
  blue: "#7aa9e6"
  coral: "#ff957c"

typography:
  hero-display:
    fontFamily: CohereText
    fontSize: 96px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.92px
  product-display:
    fontFamily: CohereText
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.44px
  section-display:
    fontFamily: Unica77 Cohere Web
    fontSize: 60px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -1.2px
  section-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.48px
  card-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 32px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -0.32px
  feature-heading:
    fontFamily: Unica77 Cohere Web
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0
  body-large:
    fontFamily: Unica77 Cohere Web
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  body:
    fontFamily: Unica77 Cohere Web
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button:
    fontFamily: Unica77 Cohere Web
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.71
    letterSpacing: 0
  caption:
    fontFamily: Unica77 Cohere Web
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  mono-label:
    fontFamily: CohereMono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.28px
  micro:
    fontFamily: Unica77 Cohere Web
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 22px
  xl: 30px
  pill: 32px
  full: 9999px

spacing:
  xxs: 2px
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 8px 0
  button-pill-outline:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.xl}"
    padding: 6px 12px
  announcement-bar:
    backgroundColor: "{colors.cohere-black}"
    textColor: "{colors.on-dark}"
    typography: "{typography.micro}"
    height: 36px
  hero-photo-card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
  agent-console-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.sm}"
    padding: 24px
  trust-logo-strip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
  capability-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: 24px
  dark-feature-band:
    backgroundColor: "{colors.deep-green}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.lg}"
    padding: 80px
  product-card:
    backgroundColor: "{colors.soft-stone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 32px
  blog-filter-chip:
    backgroundColor: transparent
    textColor: "{colors.coral}"
    typography: "{typography.card-heading}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  research-table:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-large}"
  contact-form-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 32px
  footer-newsletter:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-dark}"
    typography: "{typography.micro}"
  # ── GRC Trustifyjo implementation extensions ────────────────────────────────
  theme-toggle:
    shape: pill
    rounded: "{rounded.full}"
    padding: 6px 10px
    surface: glass
    icons: [Sun, Moon]
    height: 32px
  glass-nav:
    backgroundColor: "rgba(255, 255, 255, 0.72)"
    backdropFilter: "blur(14px)"
    border: "1px solid rgba(20, 24, 32, 0.08)"
    height: 64px
  hero-dashboard-mock:
    perspective: 1400px
    rotateZ: -2deg
    pointerTilt: { rotateX: -7deg, rotateY: 9deg, ease: "cubic-bezier(.2,.7,.2,1)" }
    layers:
      primary:    { translateZ: 40px,  rounded: "{rounded.md}" }
      band:       { translateZ: 80px,  rounded: "{rounded.md}", rotate: "-3deg" }
      floatChip:  { translateZ: 120px, rounded: "{rounded.full}", rotate: "2deg" }
    shadow: "0 24px 60px -28px rgba(15, 23, 42, 0.28), 0 8px 22px -10px rgba(15, 23, 42, 0.12)"
  feature-card-3d:
    rounded: "{rounded.md}"
    padding: 28px
    perspective: 1100px
    pointerTilt: { rotateX: -7deg, rotateY: 9deg, ease: "cubic-bezier(.2,.7,.2,1)" }
    sheen: "radial-gradient(220px circle at <cursor>, color-mix(in srgb, deep-green 9%, transparent), transparent 70%)"
    iconBadge: { background: "{colors.pale-green}", color: "{colors.deep-green}", rounded: "{rounded.sm}", size: 44px }
    tag: { rounded: "{rounded.full}", border: "1px solid hairline", typography: "{typography.micro}" }
  compliance-orrery:
    aspectRatio: 1
    maxWidth: 460px
    rings: [80, 120, 162, 208]
    rotationSpeeds: [12, -8, 12, -8]
    pointerTilt: { rotateY: 18deg, rotateX: -12deg }
    nodes: [ISO 27001, NIST, OWASP, CIS, SOC 2, PCI DSS, GDPR, HIPAA]
    palette: { ring: "deep-green 25%", node: "deep-green", core: "mint" }
  ai-verdict-card:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
    border: "1px solid rgba(255, 255, 255, 0.12)"
    backdropFilter: "blur(8px)"
    transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)"
    rounded: "{rounded.md}"
    padding: 20px

motion:
  reveal-on-scroll:
    threshold: 0.18
    distance: 28px
    duration: 800ms
    easing: "cubic-bezier(.2,.7,.2,1)"
    stagger: 60ms
  word-reveal:
    distance: 40px
    duration: 900ms
    perWordDelay: 90ms
    easing: "cubic-bezier(.2,.7,.2,1)"
  count-up:
    duration: 1600ms
    easing: "cubic-bezier(0,0,.3,1)"  # easeOutCubic
  hover-lift:
    distance: -1px to -2px
    duration: 220ms
    easing: "cubic-bezier(.2,.7,.2,1)"
  pointer-tilt:
    duration: 220-240ms
    easing: "cubic-bezier(.2,.7,.2,1)"
    snapBack: on pointerleave
  marquee:
    duration: 38s
    direction: linear
    loop: infinite

depth:
  shadow-soft: "0 10px 30px -16px rgba(15, 23, 42, 0.18)"
  shadow:      "0 24px 60px -28px rgba(15, 23, 42, 0.28), 0 8px 22px -10px rgba(15, 23, 42, 0.12)"
  shadow-dark: "0 28px 64px -28px rgba(0,0,0,0.85), 0 12px 28px -14px rgba(0,0,0,0.55)"
  glass:       "blur(14px) saturate(140%)"
  mesh:        "radial-gradient layers in primary / chart-2 / chart-3 at 8-12% alpha"

themes:
  light: cohere-light  # design.md canonical, applied via CSS variables
  dark:  forest-grc    # forest dark companion, applied via CSS variables
  toggle:
    storage: localStorage["appearance"]
    cookieMirror: appearance
    systemFallback: prefers-color-scheme
    visibleIn: [landing-nav, landing-footer, admin-header]
---

## Overview

Cohere's current web presence feels like a sober enterprise AI command center with editorial restraint. The home page opens on a huge typographic declaration over a white canvas, then uses photography, dark product mockups, trust logos, and generous empty space to make AI infrastructure feel controlled rather than speculative. Product pages invert the tone into deep green-black or dark navy bands, while blog and research pages move toward publishing-system clarity: large filters, thin rules, dense lists, and pale technical backgrounds.

What makes the system distinctive is the mix of austere black-and-white UI with bursts of tactile brand imagery. The site avoids decorative chrome in the normal interface; color arrives through photography, abstract 3D media, coral blog taxonomy chips, blue research links, and dark product environments. Cards are rounded but not cute. Type is large, tight, and almost monospaced in spirit, creating a research-lab cadence across marketing, product, and editorial surfaces.

**Key Characteristics:**
- Monumental display headlines with very tight line height and negative tracking.
- White editorial canvases interrupted by deep green, dark navy, and image-led CTA bands.
- Rounded media cards and product cards, usually 8px to 22px.
- Pill CTAs in near-black or white, with most secondary actions rendered as underlined text links.
- Trust-logo strips with monochrome partner marks and very wide vertical spacing.
- Agent-console mockups using dark panels, small status chips, and product integration badges.
- Blog and research surfaces with prominent taxonomy chips, long rule-separated lists, and search fields.

## Colors

### Brand & Accent

- **Cohere Black** (`#000000`): Announcement bar, highest-contrast text, and the global brand anchor.
- **Near-Black Primary** (`#17171c`): Primary CTA buttons, dark footer, and deep UI cards.
- **Deep Enterprise Green** (`#003c33`): Product hero bands for North and Command-style dark sections.
- **Dark Navy** (`#071829`): Financial-services and security-oriented solution bands.
- **Action Blue** (`#1863dc`): Editorial links, pagination, and secondary action emphasis.
- **Coral** (`#ff7759`): Blog category chips, taxonomy outlines, and warm product markers.
- **Soft Coral** (`#ffad9b`): Pale chip borders and segmented article-label details.

### Surface & Background

- **Canvas White** (`#ffffff`): Dominant page background and form/card surface.
- **Soft Stone** (`#eeece7`): Product cards, testimonial placeholders, and warm neutral surface blocks.
- **Pale Green Wash** (`#edfce9`): North page section backdrop behind stacked dark capability panels.
- **Pale Blue Wash** (`#f1f5ff`): Blog CTA surface behind abstract 3D imagery.
- **Card Border** (`#f2f2f2`): Softest card containment line.

### Text & Rules

- **Ink** (`#212121`): Default body text and most link text on light backgrounds.
- **Muted Slate** (`#93939f`): Footer links, dates, metadata, and de-emphasized labels.
- **Slate** (`#75758a`): Research separators and tertiary text.
- **Hairline** (`#d9d9dd`): Standard list rules and section dividers.
- **Border Light** (`#e5e7eb`): Secondary divider and utility rule.

### Semantic

- **Focus Blue** (`#4c6ee6`): Keyboard focus and ring color.
- **Form Focus Violet** (`#9b60aa`): Focus border for text inputs.
- **Error Red** (`#b30000`): Extracted ring/shadow color associated with validation-like states.

### Gradient System

Cohere does not use gradients as a generic UI fill. Gradients and color fields are media-led: abstract 3D hero imagery, deep blue open-science particle fields, red-orange product video posters, and dark green-to-black product environments. Keep UI surfaces flat; reserve gradient richness for large media panels and CTA image bands.

## Typography

### Font Family

- **Display**: `CohereText`, falling back to `Space Grotesk`, `Inter`, `ui-sans-serif`, and `system-ui`.
- **Body/UI**: `Unica77 Cohere Web`, falling back to `Inter`, `Arial`, `ui-sans-serif`, and `system-ui`.
- **Technical labels**: `CohereMono`, falling back to `Arial`, `ui-sans-serif`, and `system-ui`.
- **Icons**: Cohere uses custom icon fonts and thin-line geometric illustrations.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---|
| Hero Display | CohereText | 96px | 400 | 1.00 | -1.92px | Home page declaration scale. |
| Product Display | CohereText | 72px | 400 | 1.00 | -1.44px | Product and research hero headlines. |
| Section Display | Unica77 | 60px | 400 | 1.00 | -1.2px | Large product-page headings. |
| Section Heading | Unica77 | 48px | 400 | 1.20 | -0.48px | Split hero and CTA headings. |
| Card Heading | Unica77 | 32px | 400 | 1.20 | -0.32px | Feature card and list section titles. |
| Feature Heading | Unica77 | 24px | 400 | 1.30 | 0 | Cards, filters, and article titles. |
| Body Large | Unica77 | 18px | 400 | 1.40 | 0 | Lead text and larger paragraphs. |
| Body | Unica77 | 16px | 400 | 1.50 | 0 | Default copy and link text. |
| Button | Unica77 | 14px | 500 | 1.71 | 0 | Compact CTA labels. |
| Caption | Unica77 | 14px | 400 | 1.40 | 0 | Metadata and small explanatory text. |
| Mono Label | CohereMono | 14px | 400 | 1.40 | 0.28px | Uppercase technical labels. |
| Micro | Unica77 | 12px | 400 | 1.40 | 0 | Footer, nav microcopy, and small links. |

### Principles

- Use massive type sparingly; Cohere pages often have one oversized headline and then settle into restrained 16px-24px UI copy.
- Keep display type tight. Hero copy should feel compact and carved, not airy.
- Avoid heavy bold weights. Size, spacing, and surface contrast do most of the hierarchy work.
- Use uppercase mono labels for category and system markers, especially on product and research pages.
- Editorial pages can use coral chips and blue links, but the base typography remains black and measured.

## Layout

### Spacing System

The system uses an 8px base with many one-off alignment values: `2px`, `6px`, `8px`, `10px`, `12px`, `16px`, `20px`, `22px`, `24px`, `28px`, `32px`, `36px`, `40px`, `56px`, `60px`, `64px`, and `80px`.

Large sections rely on dramatic vertical breathing room. The home page places a trust-logo strip far below the hero media. Product pages often hold dark panels inside fields of empty white space, then transition to dense forms or footers only near the end.

### Grid & Container

- Global nav uses a three-zone layout: logo left, menu centered, sign-in/CTA right.
- Home hero is centered text above a two-card media composition: a wide product mockup card beside a narrower photography card.
- Feature sections commonly use 3-column cards on desktop.
- Product pages alternate centered hero blocks, trust-logo strips, large single-feature bands, and 2- or 3-column card grids.
- Research pages use full-width lists with date and chip columns instead of decorative cards.
- Forms use two-column input rows inside a rounded white card on dark or stone section backgrounds.

### Whitespace Philosophy

Cohere uses whitespace as a trust signal. Large empty intervals separate the brand claim, customer proof, product proof, and CTA. Dense content appears only where it serves the information architecture: research paper rows, blog card grids, and contact form fields.

## Elevation & Depth

Cohere is mostly flat. Depth comes from surface alternation, media contrast, rounded corners, and thin borders rather than drop shadows.

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, white or dark field | Hero copy, research lists, editorial surfaces |
| Bordered | 1px `#d9d9dd`, `#e5e7eb`, or dark translucent rules | Research rows, forms, pale cards, footer inputs |
| Media Lift | Rounded image or video over contrasting section color | Hero photo cards, product videos, CTA imagery |
| Dark Product Field | Deep green or navy full-width band | Command, North, financial services, security sections |

## Shapes

### Radius Scale

| Token | Value | Role |
|---|---:|---|
| `xs` | 4px | Small images, search fields, article thumbnails, utility elements |
| `sm` | 8px | Blog chips, cards, small media, dialogs |
| `md` | 16px | Medium product cards and grouped blocks |
| `lg` | 22px | Signature media-card and soft placeholder radius |
| `xl` | 30px | Research/topic filter pills |
| `pill` | 32px | Primary CTA buttons |
| `full` | 9999px | Round status elements and fully pill-shaped controls |

### Image Treatment

Images are not decorative backdrops for text except in CTA bands. Most imagery sits as rounded cards with visible corners: product videos, enterprise photography, article thumbnails, and abstract 3D renders. The dominant radii are 8px and 22px.

## Components

### **`button-primary`**

Near-black or white pill CTA, depending on surface contrast. Uses 14px-16px Unica77, 12px 24px padding, and a 32px pill radius. This is the primary action style for "Request a demo", "Submit", and hero CTAs.

### **`button-secondary`**

Text-only action link, usually underlined or rule-aligned, with no filled background. Used for "Explore products", "Try the Playground", newsletter signup, and secondary hero actions.

### **`button-pill-outline`**

Outlined pill control with transparent fill, 1px dark border, and 30px radius. Used for research filters, topic tags, and lightweight taxonomy controls.

### **`announcement-bar`**

Full-width black strip above the nav, 36px tall, centered microcopy with an underlined "Learn more" link and a close control at the far right.

### **`hero-photo-card`**

Rounded media card used in the home hero and solution pages. It combines photography or abstract imagery with an overlaid dark agent-console module. Radius is usually 22px on large cards and 8px on smaller thumbnails.

### **`agent-console-card`**

Dark product mockup panel showing agent names, status chips, integration badges, prompt fields, and generated response cards. Background is near-black, text is white or muted, and small accent chips use product colors.

### **`trust-logo-strip`**

Centered copy above a row of monochrome customer logos. It is intentionally quiet: no cards, no borders, just large horizontal spacing and black or white logos depending on the background.

### **`capability-card`**

Content block with thin-line geometric illustration, 24px heading, body copy, and a text link. On light backgrounds, cards often have only a top rule or a subtle image/card relationship rather than full boxing.

### **`dark-feature-band`**

Deep green or navy full-width section used for product capabilities, security claims, and feature breakdowns. Text turns white; cards use darker translucent surfaces, pale borders, and abstract line illustrations.

### **`product-card`**

Warm stone card used for product/model summaries. Typically 3-column on desktop, with 8px radius, generous padding, a small pill button, a divider line, and checkmark bullet rows.

### **`blog-filter-chip`**

Large coral taxonomy chip used on the blog index. Active chips invert to coral fill with dark text; inactive chips use coral outline and pale fill. Typography is oversized relative to typical filters, making the taxonomy a hero-level control.

### **`research-table`**

Rule-separated publication list with title left, topic pills centered, and date right. Rows are tall, white, and border-driven; filters above use many compact outlined pills.

### **`contact-form-card`**

Rounded white form panel set against dark green or warm stone sections. Inputs are rectangular with thin gray borders, 12px-16px padding, and compact labels/placeholders. Submit uses the same near-black pill style as primary CTAs.

### **`footer-newsletter`**

Dark footer subscription block with coral "AI moves fast" label, white headline, muted legal microcopy, a single-line email field, and arrow submit marker. Footer columns use white section labels and muted links.

## Do's and Don'ts

### Do

- Use white canvas as the default surface; introduce dark green or navy as full-width product bands.
- Keep primary CTAs pill-shaped and near-black on light surfaces.
- Use 22px radius on major media cards and placeholders.
- Use coral for editorial taxonomy and small warm accents, not as the main CTA system.
- Use monochrome trust logos with wide spacing.
- Use thin-line geometric illustrations for research and capability icons.
- Let photography and product mockups carry color, while the UI shell stays restrained.

### Don't

- Do not turn coral or blue into broad decorative surface colors.
- Do not add heavy drop shadows to cards.
- Do not make every section card-based; Cohere often uses unframed rows, rules, and open space.
- Do not use rounded cards below 8px for major media.
- Do not replace the display/body type split with one generic sans-serif voice.
- Do not render undocumented interaction variants in documentation or previews.
- Do not use saturated gradients as normal UI backgrounds; keep gradients media-led.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Small Mobile | <425px | Single-column cards, compact nav, reduced hero headline scale |
| Mobile | 425-640px | Hero media stacks, card grids become one column, form rows stack |
| Large Mobile | 640-768px | Wider one-column layouts with larger media cards |
| Tablet | 768-1024px | Two-column cards begin, nav spacing tightens |
| Desktop | 1024-1440px | Full nav, 3-column card grids, split hero compositions |
| Large Desktop | 1440-2560px | Wide containers and large empty vertical intervals |

### Touch Targets

Primary CTAs and pills meet comfortable touch sizing through 12px-24px padding and pill radii. Research filter chips and blog category chips are larger than standard tags, making dense taxonomy surfaces usable on touch devices.

### Collapsing Strategy

- Nav collapses from full horizontal links to a compact mobile menu.
- Hero media moves from split cards to stacked cards.
- Product and capability grids collapse from 3 columns to 2 and then 1.
- Form fields collapse from paired rows to a single column.
- Research rows preserve their rule-separated structure but stack metadata below titles on smaller widths.

## Iteration Guide

1. Start from a white canvas or a full-width dark green/navy band; avoid mid-tone page backgrounds unless the screenshot shows a specific CTA/form section.
2. Use `button-primary` for the single highest-priority action and `button-secondary` for the companion action.
3. Use `hero-photo-card` or `agent-console-card` when a page needs visual energy; avoid invented dashboard data.
4. For editorial pages, combine `blog-filter-chip`, `button-pill-outline`, and `research-table` instead of generic marketing cards.
5. Keep component examples structurally honest: placeholder product frames are better than invented product content.

## Known Gaps

- Exact proprietary font files are not bundled; use the documented fallbacks when implementing externally.
- Mobile screenshots were not regenerated in this public update, so mobile behavior is documented from the desktop system and existing responsive patterns.
- Some live pages lazy-load content blocks late; blank testimonial placeholders are documented as placeholder skeleton surfaces rather than filled testimonial cards.

---

## GRC Trustifyjo Implementation

The GRC Trustifyjo is the GRC Management System's adoption of this design system. It keeps the Cohere editorial discipline (white canvas, deep enterprise green bands, pill CTAs, monumental display headlines, restrained type) and extends it with a paired dark mode, a 3D layered depth language, a visible theme toggle, and a small set of composite components specific to a security/compliance product surface. Deep green-black product bands, agent-console mockups, and trust-logo strips are still the load-bearing surface treatments — the additions sit on top, not in place of them.

### Theming

There are now two paired themes wired through CSS custom properties:

- **`cohere-light`** — the canonical light system documented above. White canvas, deep-green primary, ink text, soft stone surfaces, hairline borders.
- **`forest-grc`** — the dark companion. Near-black canvas (`#06100e`), elevated forest cards (`#0c1c19`), mint primary (`#b0e4cc`) for affordances, sage accent (`#7fd1ad`) for italic emphasis, and a subdued deep green (`#063a31`) reserved for the dark feature band so it stays distinguishable from the page background.

Both palettes share the same component shapes, rounded scale, spacing rhythm, and typography. The dark mode is not an "inverted" duplicate — accents are deliberately lifted (sage `#7fd1ad`) so italic emphasis stays legible against the dark canvas. Saturated brand bands (deep-green band, posture card) keep their hue so the design language stays recognisable across modes.

#### `theme-toggle`

A pill switch with a sun/moon glyph. Persists to `localStorage["appearance"]` (`light | dark | system`), mirrors to a `appearance` cookie for SSR consistency, and falls back to `prefers-color-scheme` on first visit. The toggle is always visible — placed in the landing-page navbar and footer, and in the admin header on every authenticated page. Clicking it swaps the active theme preset on `document.documentElement` so every CSS-variable-driven surface flips simultaneously.

### Depth & 3D language

The Cohere base system is intentionally flat. The GRC Trustifyjo adds a **layered, theme-aware depth grammar** that's used selectively — never as a generic decoration. The vocabulary:

| Token | Treatment | Use |
|---|---|---|
| `shadow-soft` | `0 10px 30px -16px var(--shadow-tint)` | Standing card edge, subtle elevation. |
| `shadow` | Compound 24px and 8px shadows | Hovered/lifted feature cards, hero mockups. |
| `shadow-dark` | Heavy compound for dark canvas | Dark-mode equivalents only. |
| `glass` | `backdrop-filter: blur(14px) saturate(140%)` over a `card` 70% mix | Sticky nav, theme toggle, frosted floating chips. |
| `mesh` | Stacked radial gradients in primary, chart-2, chart-3 at 8–12% alpha | Hero halo, CTA panel halo, dark-band ambient lights. |

Pointer-driven perspective tilt is the signature 3D move: hero mockups and feature cards listen to `pointermove` and apply `rotateX/rotateY` (capped at 7–9 degrees) with a 220–240 ms ease and a snap-back on `pointerleave`. Layers inside a tilted parent use `translateZ` (40 / 80 / 120 px) to amplify parallax — primary panel sits closest, secondary card mid-depth, floating chip nearest the viewer. Effects are CSS transforms only — no WebGL.

### New & extended components

#### `glass-nav`

The Cohere `announcement-bar` sits unchanged on top. Beneath it, the landing nav uses a glassmorphic surface — `var(--card)` at ~70% mix, `backdrop-filter: blur(14px) saturate(140%)`, a hairline glass border. Three-zone layout (logo left / centred links / theme-toggle + auth CTAs right) is preserved.

#### `hero-dashboard-mock`

A composed product mockup that replaces the generic `hero-photo-card` for product-marketing surfaces. Three nested rounded panels at increasing `translateZ`:

- **Primary panel** (40 px) — Risk Register window with traffic-light controls, tabular row list, mini score bars.
- **Compliance posture band** (80 px, –3° rotate) — solid deep-green panel with a 94.2 % posture meter and the four framework codes.
- **AI verdict chip** (120 px, +2° rotate) — pill chip floating off the right edge with a sparkle glyph and the verdict string.

The whole stack tilts on cursor with a soft snap-back, sitting on top of a blurred dual-radial mesh halo. The mockup is designed to read as honest product UI — not invented dashboard data — in keeping with the "structurally honest" rule from the Iteration Guide.

#### `feature-card-3d`

A 3-up grid surface used to enumerate platform features (Risk Register, Compliance Assessments, Evidence Repository, Controls Hub, Gap Analysis, AI Assistance, Dashboards & Reports, Role-Based Access, Corporation Onboarding). Each card is `var(--card)` over a hairline border with `shadow-soft`, lifts to `shadow` on pointer enter, tilts up to 7°×9°, and reveals a cursor-following sheen radial. A pale-green icon badge sits top-left, an outline tag pill top-right. Reveal-on-scroll cascades 60 ms apart down the grid.

#### `compliance-orrery`

A media-led 3D orbital that visualises the eight frameworks the platform speaks (ISO 27001, NIST 800-53, OWASP ASVS, CIS Benchmarks, SOC 2, PCI DSS, GDPR, HIPAA). Four concentric rings rotate at independent speeds; framework nodes ride the rings and carry mono labels. The whole figure tilts to mouse position via a perspective transform on the parent. Treated as media, not chrome — sits inside a "Frameworks Atlas" section beside its narrative copy.

#### `dark-feature-band` extensions

The Cohere `dark-feature-band` is reused for the AI Assistance showcase. Inside it, an `ai-verdict-card` floats with a glassmorphic surface (`rgba(255,255,255,0.06)` over `rgba(255,255,255,0.12)` border, `backdrop-filter: blur(8px)`) and a `perspective(1000px) rotateY(-4deg) rotateX(2deg)` transform — making the band feel like a dark product environment with a sample agent verdict suspended in front of it. A blurred radial blob (mint, 45 % alpha) sits in the band's top-right corner as ambient light.

#### `living-metric`

A vertical metric block with an uppercase mono kicker, a tabular-numeric display value that counts up on first reveal (1.6 s, ease-out cubic), and a single italic caption beneath. Used inside a 2×2 grid for the "Numbers that do not lie" section.

#### `motto-marquee`

A continuous serif strip (38 s linear infinite) used as a section divider. Cohere-style typography — uppercase, 11 px, 0.5 em letter-spacing — alternated with a sparkle glyph in deep-green. Restrained, slow, and not interactive.

#### `tenets`

A 3-column flat grid (no shadows) that explains the three GRC pillars (Governance, Risk, Compliance). Cards are `var(--card)` separated by a single hairline grid line. Each card carries a pale-green icon badge, a 24 px feature heading, body copy, and a hover-only deep-green sweep underline that draws across the card's bottom edge. Reveal-on-scroll staggers the three cards at 150 ms.

### Motion principles

- **Reveal once.** All scroll-triggered animations fire exactly once and use a 0.18 IntersectionObserver threshold. Subsequent visits to the same section don't re-trigger.
- **Cap perspective tilts at ±10°.** Beyond that, type starts to deform and the page feels unstable.
- **Pointer-driven motion always snaps back.** On `pointerleave`, every tilted/sheen-active surface returns to neutral within 240 ms.
- **No spring physics.** All easings are cubic Bézier — usually `cubic-bezier(.2,.7,.2,1)`. Springs read as bouncy and undermine the editorial register.
- **Reduced motion is honoured.** A `@media (prefers-reduced-motion: reduce)` block clamps animation and transition durations to ~0 ms across the welcome root.

### Hero typography behaviour

The "Risk is not eliminated. It is governed." headline uses the Cohere hero-display scale and word-by-word reveal: each word stagger-fades 90 ms apart, rising 40 px on a 900 ms ease-out cubic. The accented italic word ("governed.") swaps to deep-green in light mode and sage `#7fd1ad` in dark mode for legibility. No per-letter animation — words are the unit.

### Surface & contrast safeguards

The global `h1–h6 { color: var(--foreground); }` rule is intentional, but it overrides inheritance inside dark bands. Components that render headings on a deep-green or dark background must set an explicit `color: var(--on-dark)` (or equivalent) on their heading element. This is the only place the headline-rule cascade has to be manually overridden.

### Roman numerals

The system does not use Roman numerals as section labels (no "Volume I/II/III", "Chapter VI", "Cap. IV", etc.). Years are rendered in long form ("Twenty Twenty-Six") rather than `MMXXVI`. If a step or volume label is needed, use the actual section name on its own.

### CSS variable contract

Every consumer surface reads from a single set of CSS custom properties (`--background`, `--foreground`, `--card`, `--primary`, `--primary-foreground`, `--muted-foreground`, `--border`, `--accent`, `--destructive`, plus `--sidebar-*` for the admin shell). The active theme writes those variables once on `document.documentElement`. Pages should never hardcode `#hex` values for foreground/background/border roles; they should compose with `color-mix(in srgb, var(--token) NN%, transparent)` when alpha is needed.
