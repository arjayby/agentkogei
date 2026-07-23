# Foundation Interface System

Foundation is a neutral, crisp, highly legible Interface System for B2B software. It should make complex work feel calm and obvious without imposing a brand personality on the product. Apply this direction to marketing, authentication, onboarding, and application surfaces; do not use it to invent workflows, information architecture, business rules, or product copy.

## Principles

1. **Clarity before character.** Hierarchy comes from space, type, and contrast—not decoration.
2. **Quiet surfaces, decisive actions.** Most surfaces recede; primary actions and current state remain unmistakable.
3. **Density with breathing room.** Keep information compact enough for work while separating decisions into scannable groups.
4. **One system in every mode.** Mobile, dark mode, loading, and error states must feel designed, not appended.
5. **Accessible by construction.** Semantics, focus, target size, contrast, zoom, and reduced motion are baseline requirements.

## Semantic tokens

Use semantic roles from the Token definitions section; never bind product meaning directly to a raw color. The canvas is slightly cool and quiet, panels are distinct by border before shadow, text has three intentional levels, and accent is reserved for interactive emphasis. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text, controls, focus indicators, and meaningful graphics. Status must combine color with text or an icon.

Typography uses a modern system sans stack. Body text is 14–16px with 1.5–1.65 line height. Use 12–13px labels sparingly and never below 12px. Headings are medium weight with tight but readable tracking. Use tabular numerals for metrics and monospace only for machine identifiers, commands, and code.

Spacing follows a 4px base. Prefer 8, 12, 16, 24, 32, 48, and 64px. A control is normally 40px tall; dense tables may use 36px rows while retaining a 44px minimum touch target through padding or the hit area. Corners are modest: 6px for compact controls, 8px for cards, and 12px for large panels.

## Layout and responsiveness

Keep reading measures between 60 and 75 characters. Marketing sections use a centered 72rem maximum; application shells may reach 90rem. Align major surfaces to one grid and avoid nested cards when spacing and a divider are enough.

- **Desktop (1024px and wider):** persistent navigation may sit beside a flexible content column. Keep primary actions near the page title.
- **Tablet (768–1023px):** collapse secondary rails and reduce multi-column groups before shrinking controls.
- **Mobile (below 768px):** use one content column, preserve source order, make primary actions full-width when useful, and turn wide tables into labelled records or horizontal regions with an explicit affordance.
- At 200% zoom and 320 CSS pixels, no page-level horizontal scrolling is allowed except for intentionally scrollable data regions.

## Product surfaces

### Marketing and pricing

Lead with one outcome, a short explanation, and one primary action. Use proof, capability groups, and terms in that order. Pricing must state billing period, eligibility, renewal, cancellation, and refund terms beside the decision. Avoid decorative dashboards that imply unsupported functionality.

### Authentication and onboarding

Use a narrow, single-purpose panel with an explicit heading. Labels remain visible; placeholders are examples, not labels. Put validation beside the field and summarize submission errors at the top. Onboarding shows progress, permits safe backtracking, and distinguishes required from optional steps.

### Dashboard and product UI

Start with the Builder's current task, not decorative metrics. Summary cards answer a specific question. Tables have a caption or nearby heading, labelled columns, keyboard-reachable row actions, and useful empty and loading states. Forms group related fields with `fieldset` and `legend` where appropriate. Settings state scope and consequence before destructive actions.

## Components and interaction states

Follow the anatomy in the Foundation component guidance section. Every interactive component needs default, hover, focus-visible, active, disabled, loading, error, and success behavior where those states apply. Destructive actions use direct language and require confirmation when the consequence is difficult to reverse. Do not communicate disabled explanations through color alone; keep help text visible.

Focus indicators are a 2px semantic ring with at least 2px offset and must never be removed. Keyboard order follows the visual and reading order. Pointer targets are at least 24 by 24 CSS pixels under WCAG 2.2, with 44 by 44 preferred for primary mobile actions.

## Feedback states

- **Loading:** preserve the eventual layout, label long operations, and use indeterminate motion only when progress cannot be measured.
- **Empty:** name what is empty, explain why it matters, and offer the next valid action. A filtered-empty state must offer a reset.
- **Error:** state what failed, preserve entered data, and provide recovery. Never expose stack traces or blame the Builder.
- **Success:** confirm the completed outcome close to the action; use a toast only when the originating context remains visible.
- **Disabled:** use only when an action cannot currently succeed, and explain the prerequisite.
- **Destructive:** identify the affected object and whether recovery exists.

## Motion

Motion explains continuity and feedback. Use 120–180ms for local control feedback and 180–240ms for panels. Prefer opacity and transform; avoid layout animation. Do not autoplay decorative motion. Under `prefers-reduced-motion: reduce`, remove parallax, continuous movement, and nonessential transforms, and make state changes immediate or use a short crossfade.

## Accessibility

Use native HTML semantics before ARIA. Each page has one primary heading and landmarks with unique labels where repeated. Every control has an accessible name; every input has a programmatic label and associated error. Images have useful alternative text or empty alt text when decorative. Announce asynchronous status through an appropriate live region without stealing focus. Support keyboard-only use, 400% text zoom, reflow at 320 CSS pixels, forced colors, light and dark color schemes, and reduced motion.

## Agent instructions

### Do

- Use semantic tokens and existing shadcn/ui primitives before creating a component.
- Compose pages from clear landmarks, headings, Cards, Tables, Fields, Alerts, and Empty states.
- Write the empty, loading, error, success, disabled, and destructive variants while designing the happy path.
- Verify mobile source order, keyboard order, focus visibility, light/dark contrast, and reduced motion.
- Keep product-specific language and workflows supplied by the Project.

### Do not

- Do not invent brand colors, gradients, glass effects, or dramatic shadows to make a screen feel “designed.”
- Do not use color, icon position, or placeholder text as the only carrier of meaning.
- Do not hide core actions behind hover, rely on desktop-only layouts, or shrink type below the stated scale.
- Do not prescribe navigation, domain objects, permissions, billing logic, or marketing claims.
- Do not add installation scripts, runtime dependencies, tracking, or remote assets.

## Final validation checklist

- [ ] All four required surfaces are represented and share the same hierarchy, tokens, and component anatomy.
- [ ] Responsive layouts work at 320, 390, 768, 1024, and 1440 CSS pixels without unintended overflow.
- [ ] Light, dark, forced-colors, and reduced-motion modes remain understandable.
- [ ] Keyboard navigation, focus order, focus visibility, labels, status announcements, and errors are complete.
- [ ] Normal text, large text, controls, focus indicators, and meaningful graphics meet WCAG 2.2 AA contrast.
- [ ] Loading, empty, error, success, disabled, and destructive states are present where applicable.
- [ ] No product workflow, information architecture, business logic, or final copy was invented by the Interface System.
- [ ] The implementation follows the React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction section and passes the Foundation validation guidance section.

## Token definitions

```css
:root {
	--foundation-background: oklch(0.985 0.003 247);
	--foundation-foreground: oklch(0.205 0.015 255);
	--foundation-card: oklch(1 0 0);
	--foundation-muted: oklch(0.955 0.006 247);
	--foundation-muted-foreground: oklch(0.49 0.02 255);
	--foundation-border: oklch(0.89 0.01 247);
	--foundation-primary: oklch(0.47 0.15 255);
	--foundation-primary-foreground: oklch(0.99 0.002 247);
	--foundation-destructive: oklch(0.55 0.2 27);
	--foundation-success: oklch(0.5 0.13 155);
	--foundation-warning: oklch(0.62 0.13 75);
	--foundation-ring: oklch(0.57 0.17 255);
	--foundation-radius-sm: 0.375rem;
	--foundation-radius-md: 0.5rem;
	--foundation-radius-lg: 0.75rem;
	--foundation-duration-fast: 120ms;
	--foundation-duration-default: 180ms;
}

.dark {
	--foundation-background: oklch(0.17 0.012 255);
	--foundation-foreground: oklch(0.94 0.007 247);
	--foundation-card: oklch(0.215 0.014 255);
	--foundation-muted: oklch(0.255 0.014 255);
	--foundation-muted-foreground: oklch(0.72 0.015 247);
	--foundation-border: oklch(0.34 0.018 255);
	--foundation-primary: oklch(0.72 0.13 255);
	--foundation-primary-foreground: oklch(0.17 0.012 255);
	--foundation-destructive: oklch(0.7 0.17 27);
	--foundation-success: oklch(0.7 0.12 155);
	--foundation-warning: oklch(0.78 0.12 75);
	--foundation-ring: oklch(0.72 0.13 255);
}

@media (prefers-reduced-motion: reduce) {
	:root {
		--foundation-duration-fast: 0ms;
		--foundation-duration-default: 0ms;
	}
}
```

## Foundation component guidance

### Buttons

Use one primary action per region. Secondary actions are outline or quiet variants; destructive actions use explicit text. Preserve the label while loading, add a progress indicator, and disable duplicate submission. Icon-only buttons require an accessible name and tooltip.

### Cards and panels

A Card groups one decision or related dataset and uses header, title, description, content, and footer when applicable. Prefer a divider or whitespace when a container adds no meaning. Avoid nested Cards.

### Forms

Use visible labels, descriptions before errors, and persistent values after failure. Group related controls with a field group or fieldset. Required state is conveyed in text. Submission errors receive focus only when the Builder must act before continuing.

### Navigation

Mark the current destination semantically. On mobile, preserve access to the primary destinations without horizontal overflow. Breadcrumbs represent hierarchy rather than browser history.

### Tables and lists

Use tables for comparative data and lists for repeated records. Provide headings, meaningful column labels, sorting state, keyboard-reachable row actions, pagination context, and a responsive strategy. Never encode status with color alone.

### Dialogs and alerts

Dialogs have a title, description, initial focus, trapped focus, Escape behavior, and restored focus. Use alerts for persistent, contextual feedback and toasts for transient confirmation only.

### State matrix

| State | Required treatment |
| --- | --- |
| Loading | Stable geometry, progress label, no duplicate action |
| Empty | Cause, value, next valid action |
| Error | Plain-language cause, preserved input, recovery |
| Success | Named outcome, appropriate live announcement |
| Disabled | Visible prerequisite and non-color cue |
| Destructive | Object, consequence, reversibility, confirmation |

## React / Next.js, Tailwind CSS v4, and shadcn/ui implementation direction

This direction translates Foundation without changing its Interface System.

1. Import the Token definitions section into the Project's existing Tailwind CSS v4 global stylesheet and map the Foundation variables to the Project's semantic theme variables in `@theme inline`.
2. Keep Server Components as the default in Next.js. Add `"use client"` only to components that need browser state, effects, event handlers, or client-only APIs.
3. Compose existing shadcn/ui primitives before adding custom components. Use Button, Card, Table, Field, Alert, Empty, Skeleton, Dialog, Sheet, Dropdown Menu, and Tooltip according to their documented anatomy.
4. Use semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, and `ring-ring`; do not place Foundation's OKLCH values directly in component class names.
5. Use `gap-*` for layout spacing, `size-*` for equal dimensions, built-in component variants, and `cn()` for conditional classes. Avoid one-off color, type, radius, and shadow overrides.
6. Dependencies are guidance only. The Builder chooses and runs package-manager commands; this pack contains no hooks, scripts, executable files, or remote imports.

Compatibility: React 19 or Next.js 16, Tailwind CSS 4.x, and shadcn/ui with either Radix or Base primitives. The Design Contract remains valid for React 18 and Next.js 15, but this release's evaluated baseline is React 19 / Next.js 16.

## Agent examples

### Good dashboard request

“Build the supplied account-activity workflow with a page heading, one primary action, a compact summary, and a responsive activity table. Use Project copy and domain objects unchanged. Include loading, empty, filtered-empty, error, and success feedback. Verify keyboard order, 320px reflow, dark mode, and reduced motion against Foundation.”

### Good authentication request

“Compose the supplied GitHub sign-in flow in a narrow authentication panel. Keep the visible heading and terms, expose submission errors without clearing context, and return focus predictably. Do not invent alternate providers or account rules.”

### Bad request

“Make it look modern with blue gradients, glass cards, tiny labels, and animated charts. Invent a sidebar, KPIs, and upgrade flow.”

The bad request adds ungrounded styling and product behavior. Replace it with explicit Project requirements and Foundation's semantic direction.

## Foundation validation guidance

Validate representative marketing, authentication, onboarding, dashboard, table, form, settings, loading, empty, error, success, disabled, and destructive screens.

- Run structure, type, lint, and application tests in the Project.
- Use an automated accessibility engine on every reference screen, then manually verify headings, landmarks, names, descriptions, keyboard paths, focus order, and focus visibility.
- Test desktop at 1440×900 and mobile at 390×844 in light and dark modes.
- Test reflow at 320 CSS pixels and text resizing to 200%; isolate intentionally scrollable data regions.
- Test `prefers-reduced-motion: reduce`, forced colors, and 400% zoom where the workflow permits.
- Measure text, control, focus, and meaningful-graphic contrast against WCAG 2.2 Level AA.
- Human review must confirm hierarchy, consistency, responsive decisions, and that no product behavior was invented.
