# Editorial Interface System

Editorial is a warm, spacious, content-forward Interface System for knowledge products and thoughtful SaaS. It gives writing, evidence, and considered decisions room to lead. Apply it across marketing, authentication, onboarding, and application surfaces without inventing workflows, information architecture, business rules, or product copy.

## Principles

1. **Content sets the rhythm.** Begin with the reading sequence, then place controls where the next decision naturally occurs.
2. **Warmth comes from restraint.** Use paper-like surfaces, ink-like text, generous space, and precise rules instead of ornamental nostalgia.
3. **Contrast creates hierarchy.** Pair an expressive editorial display face with a quiet interface sans; do not make every element expressive.
4. **Utilities support the story.** Navigation, filters, metadata, and actions remain direct and compact around more generous reading regions.
5. **Access is part of authorship.** Semantics, reflow, contrast, focus, target size, reduced motion, and readable measures are required.

## Semantic tokens

Use the roles in `tokens.css`; never attach product meaning to a raw color. The light canvas resembles warm paper, cards are a slightly lifted sheet, borders resemble fine rules, and aubergine is reserved for interactive emphasis. Dark mode uses warm charcoal rather than inverted cream. Status always combines color with text or an icon. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text, controls, focus indicators, and meaningful graphics.

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

Follow `components.md`. Every interactive component needs default, hover, focus-visible, active, disabled, loading, error, and success behavior where applicable. Primary actions use a filled ink treatment; secondary actions use a rule or quiet text treatment. Links are visibly identifiable without relying on color alone. Destructive actions use literal language and confirmation when difficult to reverse.

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
- [ ] The implementation follows `adapters/react-tailwind-shadcn/README.md` and passes `validation.md`.
