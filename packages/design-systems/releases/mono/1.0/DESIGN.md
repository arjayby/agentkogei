# Mono Design System

Mono is a monochrome, high-contrast Design System for products whose own content deserves the spotlight: creative tools, component libraries, media products, and developer platforms with rich live previews. The chrome is achromatic ink on paper in light mode and paper on ink in dark mode; the Project's content supplies the color. Apply this direction to marketing, authentication, onboarding, and application surfaces; do not use it to invent workflows, information architecture, business rules, or product copy.

## Principles

1. **Content carries the color.** Interface chrome stays achromatic; imagery, previews, media, and data visualization provide the chroma. Status colors are the only exception and never decorate.
2. **Two typographic voices.** A tight-tracked grotesk sans speaks in headlines and body; a small uppercase monospace annotates with eyebrows, indices, and counters. Neither voice does the other's job.
3. **Hairlines before shadows.** Grouping comes from fine borders, spacing, and surface steps — not elevation effects. Shadows are rare and shallow.
4. **Round the controls, frame the content.** Actions are pill-shaped and unmistakable; content panels use generous but calm corners; the grid itself stays rectilinear.
5. **Dark and light are equals.** The system is designed dark-first but ships both modes at full fidelity; neither is an afterthought or a naive inversion.
6. **Accessible by construction.** Semantics, focus, target size, contrast, zoom, and reduced motion are baseline requirements, not polish.

## Semantic tokens

Use the roles in the Token definitions section; never bind product meaning to a raw color. The base surface is pure achromatic: white paper with near-black ink in light mode, near-black ink with paper-white text in dark mode. Every neutral is zero-chroma — no warm or cool cast in either mode. Cards sit on the background behind a hairline border in light mode and step one surface lighter in dark mode. Accent is achromatic too: the primary action is inverted ink. Status colors (destructive, success, warning, info) are the only chromatic interface tokens and must always pair with text or an icon. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text, controls, focus indicators, and meaningful graphics.

Typography has two voices. Display and body use the `--mono-font-sans` stack at medium weight for headings; tracking tightens as size grows, from normal at body sizes to about −4% at hero sizes. Body text is 15–16px with 1.5–1.75 line height. The monospace voice uses `--mono-font-mono` for uppercase eyebrows, section indices, counters, keyboard shortcuts, and machine identifiers at 11–12px with +8–10% tracking; apply uppercase with CSS `text-transform`, never by typing capitals, and never set the mono voice below 11px. Oversized statistics may reach 56–72px with a mono caption beneath. Use tabular numerals for metrics and never use the mono voice for sentences or paragraphs.

Spacing follows a 4px base. Prefer 8, 12, 16, 24, 32, 48, 64, and 96px. Controls are 44px tall by default, with 36–40px compact variants that keep a 44px touch target through padding or hit area. Buttons and standalone inputs are fully rounded pills; fields inside dense forms and cards use `--mono-radius-md`; large media panels, hero surfaces, and screenshots use `--mono-radius-lg`. Do not mix a pill and a rectangle in the same control group.

## Layout and responsiveness

Content lives in a centered 72rem container; reading columns stay near 42rem and 60–75 characters. Application shells may reach 90rem. On wide screens the container edges may be delimited by decorative hairline rails (solid or dashed, `aria-hidden`); they organize the page and never carry meaning. Sections may open with a mono uppercase eyebrow above the heading, and sequences may be numbered with mono indices (01, 02, 03) beside real headings — the index is presentation, the heading is structure.

- **Desktop (1024px and wider):** persistent navigation may sit in a slim top bar; large media or preview panels may run wider than the text column. Keep primary actions near the page title.
- **Tablet (768–1023px):** collapse multi-column groups before shrinking type or controls; keep media panels full-width.
- **Mobile (below 768px):** one content column in source order, full-width primary actions where useful, and wide tables converted to labelled records or explicitly scrollable regions.
- At 200% zoom and 320 CSS pixels, no page-level horizontal scrolling is allowed except in intentionally scrollable data or media regions with a visible affordance.

## Product surfaces

### Marketing and pricing

Lead with one oversized statement, a short muted explanation, and one pill primary action beside a quiet secondary link. Follow with evidence: real product previews, capability groups introduced by mono eyebrows, and numbered how-it-works sequences. Statistic blocks pair an oversized numeral with a mono caption and must state real, supplied figures. Never fabricate demos, screenshots, or metrics to make a section feel alive. Pricing must state billing period, eligibility, renewal, cancellation, and refund terms beside the decision.

### Authentication and onboarding

Use a narrow, single-purpose panel with an explicit heading; a mono eyebrow may name the step. Labels remain visible; placeholders are examples, not labels. Put validation beside the field and summarize submission errors at the top. Onboarding shows progress (mono indices work well here), permits safe backtracking, and distinguishes required from optional steps.

### Dashboard and product UI

Start with the Builder's current work, not decorative metrics. Content previews — media, documents, components, renders — are the heroes of a Mono dashboard; give them the large-radius panel treatment and let chrome recede. Summary statistics use the numeral-plus-caption pattern only for questions the Builder actually asks. Tables have a caption or nearby heading, labelled columns, keyboard-reachable row actions, and useful empty and loading states. Forms group related fields with `fieldset` and `legend` where appropriate. Settings state scope and consequence before destructive actions.

## Components and interaction states

Follow the anatomy in the Mono component guidance section. Every interactive component needs default, hover, focus-visible, active, disabled, loading, error, and success behavior where those states apply. Hover on achromatic surfaces is a one-step surface shift, never a color change. Destructive actions use direct language and require confirmation when the consequence is difficult to reverse. Do not communicate disabled state through opacity alone; keep help text visible.

Focus indicators are a 2px achromatic ring with at least 2px offset and must never be removed; on pill controls the ring follows the pill. Keyboard order follows the visual and reading order. Pointer targets are at least 24 by 24 CSS pixels under WCAG 2.2, with 44 by 44 preferred for primary mobile actions.

## Feedback states

- **Loading:** preserve the eventual layout with quiet achromatic skeletons; label long operations; skeletons must not shimmer under reduced motion.
- **Empty:** name what is empty, explain why it matters, and offer the next valid action. A filtered-empty state must offer a reset.
- **Error:** state what failed, preserve entered data, and provide recovery. Never expose stack traces or blame the Builder.
- **Success:** confirm the completed outcome close to the action; use a toast only when the originating context remains visible.
- **Disabled:** use only when an action cannot currently succeed, and explain the prerequisite in persistent text.
- **Destructive:** identify the affected object and whether recovery exists.

## Motion

Chrome moves briefly; content may perform. Interface transitions use 120ms for local control feedback and 200ms for panels, preferring opacity and small transforms. Rich, continuous motion belongs only inside content panels that genuinely demonstrate the Project's functionality — a real preview, not a decoration — and any such region must initialize only when visible, pause off-screen, and stop on unmount. Do not autoplay decorative motion or animate layout. Under `prefers-reduced-motion: reduce`, chrome transitions become immediate or a short crossfade, and content motion is replaced by a static frame with an explicit play control.

## Accessibility

Use native HTML semantics before ARIA. Each page has one primary heading and landmarks with unique labels where repeated. Decorative rails, indices, and eyebrows must not pollute the accessibility tree with noise: mark pure decoration `aria-hidden` and keep real headings as the structure. Uppercase styling comes from CSS so screen readers receive normal casing. Every control has an accessible name; every input has a programmatic label and associated error. WebGL and live-graphics regions need an accessible text alternative describing what they show. Announce asynchronous status through an appropriate live region without stealing focus. Support keyboard-only use, 400% text zoom, reflow at 320 CSS pixels, forced colors, light and dark color schemes, and reduced motion.

## Agent instructions

### Do

- Use Mono semantic tokens and existing shadcn/ui primitives before creating a component.
- Keep chrome achromatic in both modes and let supplied content, media, and data provide the color.
- Pair every mono uppercase eyebrow or index with a real heading, and keep the mono voice out of sentences.
- Use pill controls, hairline borders, and one-step surface shifts; write the empty, loading, error, success, disabled, and destructive variants while designing the happy path.
- Verify mobile source order, keyboard order, focus visibility, light and dark contrast, and reduced motion.
- Keep product-specific language, figures, and workflows supplied by the Project.

### Do not

- Do not introduce brand hues, gradients, glass effects, glows, or dramatic shadows into chrome; the system's character is its restraint.
- Do not fake live demos, statistics, or previews, and do not autoplay decorative motion.
- Do not use color, casing, or placeholder text as the only carrier of meaning.
- Do not hide core actions behind hover, rely on desktop-only layouts, or set the mono voice below 11px or body text below 12px.
- Do not prescribe navigation, domain objects, permissions, billing logic, or marketing claims.
- Do not add installation scripts, runtime dependencies, tracking, remote fonts, or remote assets.

## Final validation checklist

- [ ] All four required surfaces are represented and share the same achromatic hierarchy, tokens, and component anatomy.
- [ ] Responsive layouts work at 320, 390, 768, 1024, and 1440 CSS pixels without unintended overflow.
- [ ] Light, dark, forced-colors, and reduced-motion modes remain understandable, and dark mode is a designed equal rather than an inversion.
- [ ] Keyboard navigation, focus order, focus visibility, labels, status announcements, and errors are complete.
- [ ] Normal text, large text, controls, focus indicators, and meaningful graphics meet WCAG 2.2 AA contrast in both modes.
- [ ] Loading, empty, error, success, disabled, and destructive states are present where applicable.
- [ ] Decorative rails, indices, and eyebrows are presentation only; headings and landmarks carry the structure.
- [ ] No product workflow, information architecture, business logic, final copy, statistic, or demo was invented by the Design System.
- [ ] The implementation follows the React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction section and passes the Mono validation guidance section.

## Token definitions

```css
:root {
	--mono-background: oklch(1 0 0);
	--mono-foreground: oklch(0.145 0 0);
	--mono-card: oklch(1 0 0);
	--mono-muted: oklch(0.97 0 0);
	--mono-muted-foreground: oklch(0.5 0 0);
	--mono-border: oklch(0.922 0 0);
	--mono-primary: oklch(0.205 0 0);
	--mono-primary-foreground: oklch(0.985 0 0);
	--mono-destructive: oklch(0.55 0.21 27);
	--mono-success: oklch(0.5 0.13 155);
	--mono-warning: oklch(0.6 0.13 75);
	--mono-info: oklch(0.55 0.12 230);
	--mono-ring: oklch(0.44 0 0);
	--mono-font-sans: "Geist", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif;
	--mono-font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	--mono-radius-sm: 0.5rem;
	--mono-radius-md: 0.625rem;
	--mono-radius-lg: 1.125rem;
	--mono-radius-full: 9999px;
	--mono-duration-fast: 120ms;
	--mono-duration-default: 200ms;
}

.dark {
	--mono-background: oklch(0.145 0 0);
	--mono-foreground: oklch(0.985 0 0);
	--mono-card: oklch(0.205 0 0);
	--mono-muted: oklch(0.269 0 0);
	--mono-muted-foreground: oklch(0.708 0 0);
	--mono-border: oklch(0.31 0 0);
	--mono-primary: oklch(0.985 0 0);
	--mono-primary-foreground: oklch(0.145 0 0);
	--mono-destructive: oklch(0.7 0.19 22);
	--mono-success: oklch(0.7 0.12 155);
	--mono-warning: oklch(0.78 0.12 75);
	--mono-info: oklch(0.74 0.1 230);
	--mono-ring: oklch(0.72 0 0);
}

@media (prefers-reduced-motion: reduce) {
	:root {
		--mono-duration-fast: 0ms;
		--mono-duration-default: 0ms;
	}
}
```

The sans and mono stacks are fallback chains; the Project supplies any branded font locally and never fetches type from this Design System or a remote host.

## Mono component guidance

### Buttons

One filled pill primary action per region: inverted ink (dark-on-light in light mode, light-on-dark in dark mode). Secondary actions are quiet pills with a hairline border or plain text links; destructive actions use explicit text and the destructive token. Preserve the label while loading, add a progress indicator, and disable duplicate submission. Icon-only buttons require an accessible name and tooltip.

### Eyebrows, indices, and statistics

An eyebrow is a mono uppercase label directly above a heading, in muted foreground. An index is a mono ordinal (01, 02, 03) beside a heading in a numbered sequence. A statistic block is an oversized sans numeral above a mono uppercase caption. All three are presentation over real structure: the heading outline must survive their removal, and figures must be supplied by the Project.

### Cards and panels

A Card groups one decision or related dataset behind a hairline border, with header, title, description, content, and footer as applicable. In dark mode a Card steps one surface lighter; in light mode it shares the background and relies on its border. A media panel is a large-radius surface whose interior is the Project's content — preview, screenshot, render, or live-graphics region — with chrome kept to a thin caption row. Avoid nested Cards; prefer a divider or spacing.

### Forms

Use visible labels, descriptions before errors, and persistent values after failure. Standalone inputs (search, subscribe) may be pills; grouped form fields use the medium radius. Group related controls with a fieldset. Required state is conveyed in text. Submission errors receive focus only when the Builder must act before continuing.

### Navigation

A slim top bar carries the wordmark, primary destinations, and at most one pill action; mark the current destination semantically. The bar may sit on a solid background with a hairline bottom border. On mobile, preserve access to primary destinations without horizontal overflow. Breadcrumbs represent hierarchy rather than browser history.

### Tables and lists

Use tables for comparative data and lists for repeated records. Provide headings, meaningful column labels, sorting state, keyboard-reachable row actions, pagination context, and a responsive strategy. Row hover is a one-step surface shift. Use tabular numerals in numeric columns and never encode status with color alone.

### Dialogs and alerts

Dialogs have a title, description, initial focus, trapped focus, Escape behavior, and restored focus, on a card surface with a hairline border. Use alerts for persistent contextual feedback and toasts for transient confirmation only.

### State matrix

| State | Required treatment |
| --- | --- |
| Loading | Stable geometry, progress label, achromatic skeleton, no duplicate action |
| Empty | Cause, value, next valid action |
| Error | Plain-language cause, preserved input, recovery |
| Success | Named outcome, appropriate live announcement |
| Disabled | Visible prerequisite and non-color cue |
| Destructive | Object, consequence, reversibility, confirmation |
| Informational | Named context, non-color cue, no false urgency |

## React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction

This direction translates Mono without changing its Design System.

1. Import the Token definitions section into the Project's existing Tailwind CSS v4 global stylesheet and map the Mono variables to the Project's semantic theme variables in `@theme inline`, including both font roles.
2. Keep Server Components as the default in Next.js. Add `"use client"` only to components that need browser state, effects, event handlers, or client-only APIs — including any live content region.
3. Compose existing shadcn/ui primitives before adding custom components. Use Button, Card, Table, Field, Alert, Empty, Skeleton, Dialog, Sheet, Dropdown Menu, and Tooltip according to their documented anatomy; express pill controls through `rounded-full` variants rather than forked components.
4. Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `ring-ring`; do not place Mono's OKLCH values directly in component class names.
5. Use `gap-*` for layout spacing, `size-*` for equal dimensions, `font-mono` with `uppercase tracking-wider` for the annotation voice, and `cn()` for conditional classes. Avoid one-off color, type, radius, and shadow overrides.
6. Any WebGL or live-graphics region mounts lazily, pauses when off-screen via an intersection observer, cleans up on unmount, and honors `prefers-reduced-motion`. The region needs an accessible description and a non-animated fallback.
7. Dependencies are guidance only. The Builder chooses and runs package-manager commands; this Design System contains no hooks, scripts, executable files, or remote imports.

Compatibility: React 19 or Next.js 16, Tailwind CSS 4.x, and shadcn/ui with either Radix or Base primitives. The Design Contract remains valid for React 18 and Next.js 15, but this release's evaluated baseline is React 19 / Next.js 16.

## Agent examples

### Good marketing request

“Build the supplied landing page with an oversized headline, one pill primary action, a mono-eyebrow capability section, a numbered how-it-works sequence, and the Project's real statistics as numeral-plus-caption blocks. Keep chrome achromatic in light and dark. Verify keyboard order, 320px reflow, and reduced motion against Mono.”

### Good dashboard request

“Compose the supplied render-library workflow with a page heading, a grid of large-radius preview panels for real project media, and a responsive activity table with tabular numerals. Use Project copy and domain objects unchanged. Include loading, empty, filtered-empty, error, and success feedback.”

### Bad request

“Make it feel premium with purple gradients, glowing borders, animated fake demos, and big made-up stats like 10k users.”

The bad request adds chroma to chrome, fabricates content, and autoplays decoration — all of which Mono prohibits. Replace it with the Project's real content presented in large panels, achromatic chrome, and restrained motion.

## Mono validation guidance

Validate representative marketing, authentication, onboarding, dashboard, table, form, settings, loading, empty, error, success, disabled, and destructive screens.

- Run structure, type, lint, and application tests in the Project.
- Use an automated accessibility engine on every reference screen, then manually verify headings, landmarks, names, descriptions, keyboard paths, focus order, and focus visibility — including that eyebrows, indices, and rails do not disturb the heading outline or reading order.
- Test desktop at 1440×900 and mobile at 390×844 in light and dark modes; confirm dark mode uses designed surface steps rather than inverted light values.
- Test reflow at 320 CSS pixels and text resizing to 200%; isolate intentionally scrollable data and media regions.
- Test `prefers-reduced-motion: reduce`, forced colors, and 400% zoom where the workflow permits; confirm live content regions pause off-screen and offer static fallbacks.
- Measure text, control, focus, and meaningful-graphic contrast against WCAG 2.2 Level AA in both modes.
- Human review must confirm the achromatic discipline held — no invented hues in chrome — and that no product behavior, figure, or demo was invented.
