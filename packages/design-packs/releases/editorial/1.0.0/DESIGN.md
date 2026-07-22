# Editorial Interface System

Editorial is a warm, spacious, content-forward Interface System for knowledge products and thoughtful SaaS. It gives writing, evidence, and considered decisions room to lead. Apply it across marketing, authentication, onboarding, and application surfaces without inventing workflows, information architecture, business rules, or product copy.

## Principles

1. **Content sets the rhythm.** Begin with the reading sequence, then place controls where the next decision naturally occurs.
2. **Warmth comes from restraint.** Use paper-like surfaces, ink-like text, generous space, and precise rules instead of ornamental nostalgia.
3. **Contrast creates hierarchy.** Pair an expressive editorial display face with a quiet interface sans; do not make every element expressive.
4. **Utilities support the story.** Navigation, filters, metadata, and actions remain direct and compact around more generous reading regions.
5. **Access is part of authorship.** Semantics, reflow, contrast, focus, target size, reduced motion, and readable measures are required.

## Semantic tokens

Use the roles in the Token definitions section; never attach product meaning to a raw color. The light canvas resembles warm paper, cards are a slightly lifted sheet, borders resemble fine rules, and aubergine is reserved for interactive emphasis. Dark mode uses warm charcoal rather than inverted cream. Status always combines color with text or an icon. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text, controls, focus indicators, and meaningful graphics.

Typography has two voices. Display headings and short editorial pull quotes use a Project-provided serif with the `--editorial-font-display` fallback; controls, labels, data, and body copy use `--editorial-font-interface`. Never fetch remote fonts from the Pack. Display type may be 36–72px with compact leading; body type is 16–18px with 1.65–1.8 line height. Interface labels remain 12–14px and must not use all caps for sentences. Use italic sparingly for emphasis, not long passages.

Spacing follows an 8px reading rhythm with 4px available inside compact controls. Prefer 8, 16, 24, 32, 48, 64, 96, and 128px. Use 44px controls by default and preserve a 44px touch target. Corners are subtle: 2px for fields and controls, 4px for cards, and a pill only for compact tags. Fine borders and whitespace establish grouping; shadows are rare.

## Layout and responsiveness

Keep prose between 52 and 68 characters and dense metadata between 70 and 85. Marketing pages use an asymmetric 12-column grid within 80rem. Application shells may reach 92rem, but the primary reading column stays narrow. Use offset columns, marginal notes, rules, and deliberate white space; avoid merely enlarging Foundation's centered card layout.

- **Desktop (1024px and wider):** a stable utility rail may accompany an offset reading column. Align metadata and secondary actions in a margin when the reading order remains clear.
- **Tablet (768–1023px):** bring marginal content into the main flow, reduce large display sizes, and keep utility controls near the content they affect.
- **Mobile (below 768px):** use one source-ordered column, place metadata before its article or record, make important actions full-width, and convert wide comparisons into labelled records or explicit horizontal regions.
- At 200% zoom and 320 CSS pixels, prevent page-level horizontal scrolling except in intentionally scrollable data regions with a visible label and keyboard access.

## Product surfaces

### Marketing and pricing

Open with a strong editorial headline, a concise deck, and one primary action. Follow with evidence in readable chapters separated by space or a fine rule. Use pull quotes only for real supplied testimony. Pricing must keep period, eligibility, renewal, cancellation, and refund terms adjacent to the decision. Never use decorative publication language to disguise commercial terms.

### Authentication and onboarding

Place the form in a calm reading column with a clear heading and short supplied context. Labels remain visible and placeholders are examples. Put errors beside fields and summarize submission failures at the top. Onboarding reads as a short sequence of chapters: show progress, support safe backtracking, and distinguish required and optional work.

### Dashboard and product UI

Lead with the Builder's current work and recent meaningful content. Summaries use a restrained editorial hierarchy, not a wall of KPI cards. Tables retain true headers, captions, keyboard-reachable actions, and responsive alternatives. Long-form content gets anchors, comfortable measure, and nearby metadata. Forms use sections with explicit headings or `fieldset` and `legend`. Settings explain scope and consequence before controls.

## Components and interaction states

Follow the Editorial component guidance section. Every interactive component needs default, hover, focus-visible, active, disabled, loading, error, and success behavior where applicable. Primary actions use a filled ink treatment; secondary actions use a rule or quiet text treatment. Links are visibly identifiable without relying on color alone. Destructive actions use literal language and confirmation when difficult to reverse.

Focus indicators use a 2px semantic ring with at least 2px offset and are never removed. Keyboard order follows source and reading order, including when desktop content is visually offset. Pointer targets are at least 24 by 24 CSS pixels under WCAG 2.2 and preferably 44 by 44 on touch surfaces.

## Feedback states

- **Loading:** preserve the reading layout, label longer operations, and use quiet skeleton blocks that do not shimmer under reduced motion.
- **Empty:** name the absent content, explain its value, and offer the next valid action; filtered-empty states include a reset.
- **Error:** use a direct heading, preserve entered content, explain recovery, and avoid dramatic or blaming language.
- **Success:** confirm the named outcome near the action; reserve toasts for outcomes whose origin remains visible.
- **Disabled:** state the missing prerequisite in persistent text rather than a tooltip alone.
- **Destructive:** identify the object, consequence, and recovery status before confirmation.

## Motion

Motion should feel like turning attention, not turning pages. Use 140–200ms for local controls and 200–280ms for disclosed regions. Prefer opacity and small vertical transforms. Do not animate paragraphs, simulate paper, autoplay marquees, or use parallax. Under `prefers-reduced-motion: reduce`, remove continuous movement and nonessential transforms, disable smooth scrolling, and make state changes immediate or use a brief crossfade.

## Accessibility

Use native HTML before ARIA. Each page has one primary heading and labelled landmarks. Preserve a logical heading outline even when display sizes differ. Every control has an accessible name; every input has a programmatic label and associated error. Images need useful alternative text or empty alt text when decorative. Captions and transcripts accompany supplied media. Announce asynchronous status without stealing focus. Support keyboard-only use, 400% text zoom, reflow at 320 CSS pixels, forced colors, light and dark schemes, and reduced motion.

## Agent instructions

### Do

- Start from the Project's content hierarchy and use Editorial semantic tokens and existing shadcn/ui primitives.
- Pair a narrow reading measure with purposeful marginal metadata and generous section spacing.
- Keep controls familiar, literal, and close to the content they affect.
- Design loading, empty, error, success, disabled, and destructive variants with the happy path.
- Verify source order, keyboard order, contrast, text resize, mobile reflow, dark mode, and reduced motion.

### Do not

- Do not turn every screen into a magazine cover or use serif type for controls, tables, code, or long utility text.
- Do not add sepia filters, paper textures, drop caps, decorative rules, or pull quotes without a content purpose.
- Do not hide actions in hover states, rely on color or italics alone, or reorder content visually away from DOM order.
- Do not prescribe navigation, domain objects, permissions, billing logic, or final copy.
- Do not add scripts, runtime dependencies, tracking, remote fonts, or remote assets.

## Final validation checklist

- [ ] Marketing, authentication, onboarding, and application surfaces express the same warm, spacious, content-forward system.
- [ ] The result is structurally distinct from Foundation through type roles, reading measure, spacing rhythm, asymmetric layout, component density, and interaction treatment.
- [ ] Responsive layouts work at 320, 390, 768, 1024, and 1440 CSS pixels without unintended overflow or broken reading order.
- [ ] Light, dark, forced-colors, reduced-motion, 200% text, and 400% zoom remain understandable.
- [ ] Keyboard navigation, focus visibility, labels, headings, status announcements, media alternatives, and errors are complete.
- [ ] Text, controls, focus indicators, rules, and meaningful graphics meet WCAG 2.2 AA contrast.
- [ ] Loading, empty, error, success, disabled, and destructive states are present where applicable.
- [ ] No product workflow, information architecture, business logic, final copy, remote asset, or executable behavior was invented.
- [ ] The implementation follows the React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction section and passes the Editorial validation guidance section.

## Token definitions

```css
:root {
	--editorial-background: oklch(0.975 0.014 82);
	--editorial-foreground: oklch(0.22 0.025 48);
	--editorial-card: oklch(0.995 0.008 82);
	--editorial-muted: oklch(0.935 0.02 79);
	--editorial-muted-foreground: oklch(0.46 0.035 52);
	--editorial-border: oklch(0.82 0.025 74);
	--editorial-primary: oklch(0.38 0.095 335);
	--editorial-primary-foreground: oklch(0.985 0.008 82);
	--editorial-destructive: oklch(0.5 0.17 28);
	--editorial-success: oklch(0.43 0.1 145);
	--editorial-warning: oklch(0.55 0.11 72);
	--editorial-info: oklch(0.43 0.08 245);
	--editorial-ring: oklch(0.52 0.13 335);
	--editorial-font-display: ui-serif, Georgia, Cambria, "Times New Roman", serif;
	--editorial-font-interface: Inter, ui-sans-serif, system-ui, sans-serif;
	--editorial-measure: 62ch;
	--editorial-radius-sm: 0.125rem;
	--editorial-radius-md: 0.25rem;
	--editorial-radius-lg: 0.375rem;
	--editorial-duration-fast: 140ms;
	--editorial-duration-default: 220ms;
}

.dark {
	--editorial-background: oklch(0.18 0.018 48);
	--editorial-foreground: oklch(0.92 0.018 82);
	--editorial-card: oklch(0.22 0.02 48);
	--editorial-muted: oklch(0.265 0.025 48);
	--editorial-muted-foreground: oklch(0.73 0.025 76);
	--editorial-border: oklch(0.37 0.03 52);
	--editorial-primary: oklch(0.76 0.09 335);
	--editorial-primary-foreground: oklch(0.18 0.018 48);
	--editorial-destructive: oklch(0.69 0.15 28);
	--editorial-success: oklch(0.7 0.1 145);
	--editorial-warning: oklch(0.76 0.1 72);
	--editorial-info: oklch(0.72 0.08 245);
	--editorial-ring: oklch(0.76 0.09 335);
}

@media (prefers-reduced-motion: reduce) {
	:root {
		--editorial-duration-fast: 0ms;
		--editorial-duration-default: 0ms;
	}
}
```

## Editorial component guidance

### Buttons and links

Use one filled primary action per region. Secondary actions use an outline or quiet variant; inline actions should read as links and remain identifiable without color alone. Keep labels stable while loading and prevent duplicate submission. Icon-only buttons need an accessible name and tooltip.

### Articles, cards, and panels

An Article region has a heading, optional deck, metadata, body, and contextual actions in that reading order. A Card groups one decision or short record; it is not the default wrapper for prose. Prefer whitespace and a fine rule over nested surfaces. Pull quotes must be supplied content and cannot interrupt keyboard or screen-reader order.

### Forms

Use visible labels, quiet descriptions, persistent values after failure, and errors adjacent to their fields. Group related controls with a section heading or fieldset. Keep a form's reading measure narrow even inside a wide shell. Required state is written in text.

### Navigation and contents

Mark the current destination semantically. A table of contents links only to real page headings and exposes the active location without color alone. On mobile, preserve primary destinations and source order without horizontal overflow. Breadcrumbs express hierarchy rather than browser history.

### Tables, lists, and metadata

Use tables for comparison, lists for repeated records, and definition lists for metadata. Tables need a caption or nearby heading, labelled columns, sorting state, keyboard-reachable row actions, pagination context, and a responsive plan. On narrow screens, preserve the most important label and value before optional metadata.

### Dialogs, disclosures, and alerts

Dialogs have a title, description, predictable initial focus, trapped focus, Escape behavior, and restored focus. Disclosures keep their trigger adjacent to the revealed content. Alerts are persistent and contextual; toasts only confirm an outcome when its source stays visible.

### State matrix

| State | Required treatment |
| --- | --- |
| Loading | Stable reading geometry, plain progress label, no motion when reduced |
| Empty | Named absence, why it matters, next valid action |
| Error | Direct heading, preserved content, recovery path |
| Success | Named outcome beside the originating action |
| Disabled | Persistent prerequisite and non-color cue |
| Destructive | Object, consequence, reversibility, confirmation |
| Informational | Calm context, semantic icon or label, no false urgency |

## React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction

This direction translates Editorial without changing its Interface System.

1. Import the Token definitions section into the Project's existing Tailwind CSS v4 global stylesheet and map its variables to the Project's semantic theme in `@theme inline`. Map both interface and display font roles to locally available Project stacks.
2. Keep Server Components as the default in Next.js. Add `"use client"` only for browser state, effects, event handlers, or client-only APIs.
3. Compose existing shadcn/ui primitives before custom components. Use Button, Card, Table, Field, Alert, Empty, Skeleton, Dialog, Sheet, Dropdown Menu, Tooltip, Breadcrumb, and Separator according to their documented anatomy.
4. Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `ring-ring`; never place Editorial OKLCH values in component class names.
5. Express the editorial grid with CSS Grid, `max-w-*`, `gap-*`, and deliberate column spans. Keep DOM order meaningful when using offsets. Use `prose` only if the Project already owns and configures it; this Pack adds no dependency.
6. Keep serif display utilities away from controls, tables, code, and dense metadata. Avoid one-off colors, arbitrary shadows, oversized radii, and remote font imports.
7. Dependencies are guidance only. The Builder chooses and runs package-manager commands; this Pack has no hooks, scripts, executable files, or remote assets.

Compatibility: React 19 or Next.js 16, Tailwind CSS 4.x, and shadcn/ui with either Radix or Base primitives. The Design Contract remains valid for React 18 and Next.js 15, while the evaluated baseline is React 19 / Next.js 16.

## Editorial agent examples

### Good knowledge dashboard request

“Compose the supplied research-library workflow with a clear page title, an offset reading column, compact source metadata, and a responsive recent-documents table. Keep all Project terminology and copy. Include loading, empty, filtered-empty, error, and success states. Verify heading order, keyboard order, 320px reflow, dark mode, and reduced motion against Editorial.”

### Good authentication request

“Present the supplied email sign-in flow in a narrow reading column with its existing context and terms. Keep visible labels, preserve the submitted address after failure, announce errors, and return focus predictably. Do not invent providers, publication language, or account policy.”

### Good content detail request

“Lay out the supplied article, author metadata, citations, and actions with a 62-character reading measure and a desktop margin for metadata. On mobile, move that metadata before the article in source order. Use the Project's text without manufacturing quotes or editorial claims.”

### Bad request

“Make Foundation beige, switch every label to a serif, add paper texture and animated page turns, and write magazine-style copy.”

The bad request is a recolor with decoration and invented content. Use Editorial's type roles, reading rhythm, asymmetric composition, restrained components, and accessibility requirements instead.

## Editorial validation guidance

Validate representative marketing, authentication, onboarding, dashboard, article or content detail, table, form, settings, loading, empty, error, success, disabled, and destructive screens.

- Run structure, type, lint, and application tests in the Project.
- Use an automated accessibility engine on every reference screen, then manually verify landmarks, heading outline, accessible names, descriptions, keyboard paths, focus order, focus visibility, link identification, and media alternatives.
- Test desktop at 1440×900 and mobile at 390×844 in light and dark modes.
- Test reflow at 320 CSS pixels, text resizing to 200%, and zoom to 400%; isolate and label intentionally scrollable data regions.
- Confirm marginal metadata follows a sensible source order when columns collapse.
- Test `prefers-reduced-motion: reduce`, forced colors, and disabled smooth scrolling.
- Measure text, controls, links, focus, rules, and meaningful graphics against WCAG 2.2 Level AA.
- Compare against Foundation: reject a result that only changes color or font while retaining its centered grid, density, radii, and component rhythm.
- Human review must confirm editorial hierarchy, consistent warm restraint, responsive reading decisions, rights, and that no product behavior or copy was invented.

## Creative Commons Attribution 4.0 International

Editorial Interface System is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). You may share and adapt the material for any purpose, including commercially, provided you give appropriate credit, link to the license, and indicate whether changes were made. You may do so in any reasonable manner, but not in a way that suggests AgentKogei endorses you or your use. You may not apply legal or technological restrictions that prevent others from doing anything the license permits.

No warranties are given. Other rights, including privacy, publicity, or moral rights, may still limit a particular use. The human-readable license summary is at https://creativecommons.org/licenses/by/4.0/ and the controlling legal code is at https://creativecommons.org/licenses/by/4.0/legalcode.

## Attribution and provenance

Editorial Interface System was created by AgentKogei and is licensed under CC BY 4.0.

Suggested attribution: “Editorial Interface System by AgentKogei, licensed under CC BY 4.0.”

When distributing a modified version, retain that credit, link to https://creativecommons.org/licenses/by/4.0/, and clearly state that you changed the material. For example: “Adapted from Editorial Interface System by AgentKogei under CC BY 4.0; modified by [name], [year].” Do not imply AgentKogei endorses the adaptation.

All prose, semantic tokens, component guidance, examples, validation guidance, implementation direction, and evaluation metadata in this Pack Release are original AgentKogei work. No third-party assets, remote fonts, copied interface resources, or executable code are included. AI-assisted drafting received human review for originality, accessibility, compatibility, and rights on 2026-07-19.

---

## Provenance

- Design Pack: Editorial (`editorial`)
- Pack Release: 1.0.0, published 2026-07-19 by AgentKogei
- Pack License: Creative Commons Attribution 4.0 International (CC-BY-4.0), https://creativecommons.org/licenses/by/4.0/
- Attribution: Editorial Interface System by AgentKogei, licensed under CC BY 4.0.
- Delivered by the AgentKogei Official Catalog as a single Design Contract.
