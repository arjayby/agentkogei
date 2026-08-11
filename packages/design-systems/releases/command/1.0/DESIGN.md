# Command Design System

Command is a dark-first, dense, technical Design System for developer tools, infrastructure products, security consoles, data operations, and other software where Builders must inspect state, compare evidence, and act precisely.

Command should feel like a purpose-built instrument: compact without becoming cramped, severe without becoming hostile, and expressive through structure rather than decoration. It is not a generic dark theme. Its identity comes from a graphite field, disciplined monospace accents, luminous operational signals, hard alignment, shallow layering, and interfaces that keep context visible while work is in progress.

## Agent operating contract

When generating an interface with Command:

1. Preserve supplied product behavior, information architecture, domain objects, and copy. Do not invent workflows merely to fill a layout.
2. Start from the semantic tokens and surface recipes in this release. Do not substitute arbitrary colors, shadows, radii, or spacing.
3. Prefer compact disclosure over hiding essential context. Dense interfaces still need hierarchy, grouping, and readable line lengths.
4. Treat every asynchronous or destructive action as a state sequence, not a single button.
5. Validate keyboard operation, focus visibility, contrast, zoom, reflow, reduced motion, and narrow-screen data access before finishing.
6. If a product is primarily editorial, lifestyle, playful, or consumer-social, reconsider whether Command is the correct Design System.

## System signature

Command combines five recognizable decisions:

- Near-black graphite surfaces with cool blue-gray separation rather than pure black.
- A compact sans-serif interface face paired with monospace only for identifiers, values, commands, timestamps, and status telemetry.
- Square geometry with restrained two-pixel corner softening only where it improves focus or touch recognition.
- Thin rules, inset highlights, and luminance steps instead of floating card shadows.
- Operational cyan as the primary action signal, amber for attention, red for danger, and green for verified success. Status never relies on color alone.

Avoid neon cyberpunk gradients, terminal cosplay, scan-line effects, excessive monospace body copy, glowing text, rounded dashboard-card grids, and decorative code fragments. Command is technical because it clarifies systems, not because it imitates a movie terminal.

## Semantic color

Dark mode is the authored default. Light mode is a fully supported inspection mode, not an inversion filter.

### Dark mode

- `background`: graphite canvas, `#080b10`.
- `foreground`: cool near-white, `#e8edf5`.
- `surface-1`: primary working plane, `#0d1118`.
- `surface-2`: nested region, `#121823`.
- `surface-3`: selected or raised plane, `#192231`.
- `muted-foreground`: secondary evidence, `#98a4b5`.
- `border`: structural rule, `#283344`.
- `primary`: operational cyan, `#55d6ff`; primary text uses `#051015`.
- `success`: verified green, `#6ee7a8`.
- `warning`: attention amber, `#f6c85f`.
- `destructive`: critical red, `#ff6b7a`.

### Light mode

- `background`: cool paper, `#f3f6fa`.
- `foreground`: ink, `#111827`.
- `surface-1`: `#ffffff`.
- `surface-2`: `#e9eef5`.
- `surface-3`: `#dce5ef`.
- `muted-foreground`: `#526174`.
- `border`: `#aebdce`.
- `primary`: deep operational blue, `#006f95`; primary text uses white.
- Semantic success, warning, and destructive colors must retain at least 4.5:1 contrast for text and 3:1 for meaningful graphics.

Never place muted text on `surface-2` without measuring contrast. Never use opacity alone to derive disabled text; use the explicit disabled tokens.

## Typography

Use the Project's available system sans stack for interface prose and a system monospace stack for technical data. Command does not require remote fonts.

- Display: 40–64px, 0.94 line-height, −0.04em tracking; marketing statements only.
- Page title: 24–32px, 1.08 line-height, −0.025em tracking.
- Section title: 16–20px, 1.2 line-height, −0.01em tracking.
- Body: 14px, 1.5 line-height.
- Compact interface: 12–13px, 1.4 line-height.
- Telemetry: 11–12px monospace, 1.35 line-height, tabular numerals.
- Eyebrow: 10–11px monospace uppercase, 0.12em tracking; never for paragraphs.

Identifiers may truncate only when their full value is available by an accessible disclosure or copy action. Logs and code preserve whitespace and support selection.

## Spacing and density

Use a 4px base unit. Typical working rhythm is 4, 8, 12, 16, 24, 32, and 48px.

- Compact control height: 32px desktop, minimum 40px for primary touch targets on narrow screens.
- Table row: 36–40px desktop; 44px when rows contain touch actions.
- Panel padding: 12–16px; marketing sections may use 48–96px vertically.
- Inline gap: 6–8px.
- Related-group gap: 12–16px.
- Major-region gap: 24–32px.

Density is earned through alignment and persistent context. Do not reduce type below 12px for interactive content or collapse unrelated controls into one toolbar.

## Layout

Command uses a stable application frame:

- 48px global header for Project identity, environment, search, and account controls.
- 220–256px navigation rail on wide screens; compact 48px rail only when labels remain accessible.
- Optional 280–360px inspector rail for selected-object detail.
- Main content uses hard grid lines and a maximum readable prose width of 72ch.
- Data-heavy regions may fill the viewport but must retain labelled landmarks and visible headings.

Marketing surfaces use asymmetric technical compositions: one strong outcome, a compact evidence rail, and a real product-state preview. Avoid generic three-card benefit rows as the main identity.

At widths below 768px, navigation becomes a labelled drawer, inspectors become explicit sheets or inline detail, and toolbars wrap into named groups. Never compress a desktop three-column console into unreadable columns.

## Components

### Buttons

Primary buttons use operational cyan and describe the result: “Deploy release,” not “Continue.” Secondary buttons use a visible border and surface fill. Quiet buttons retain a visible hover and focus treatment. Destructive actions use red only at the confirmation boundary, not for routine navigation.

Every button needs default, hover, focus-visible, active, disabled, pending, success, and error behavior where applicable. Pending buttons keep their label width stable and announce progress without relying on animation.

### Inputs and forms

Labels stay visible above fields. Help and error text occupy a stable region below. Technical inputs use monospace only for values such as hostnames, tokens, paths, and commands. Validation occurs on blur or submit unless immediate feedback prevents a costly error.

Group related fields inside ruled sections with a concise legend. Required status must be conveyed in text. Errors identify the problem and recovery action; do not rely on red borders alone.

### Tables and data grids

Tables are the primary comparison surface. Use semantic table markup for static tabular content and an accessible grid pattern only when cell-level interaction truly requires it.

- Keep headers visible when scrolling long datasets.
- Align numbers and use tabular numerals.
- Put row identity first and row actions last.
- Provide sorting state in text and semantics.
- Use one compact status badge plus an adjacent timestamp or explanation.
- At narrow widths, choose a labelled horizontal scroll region, prioritized columns, or record cards. Never convert data blindly.

### Navigation and command palette

Navigation communicates location, scope, and environment. The command palette accelerates known actions but never becomes the only route to them. Keyboard shortcuts appear as secondary hints and must not conflict with browser or assistive-technology commands.

### Logs, terminals, and code

Technical output lives in a labelled region with selection, copy, wrap, pause, filter, and clear controls as appropriate. Streaming output must not steal focus or force the viewport to the newest line after the Builder scrolls away. Errors include timestamp, source, severity text, and recovery context.

### Status and telemetry

Use shape or icon, text, and color together. Distinguish observed state from desired state. Freshness is explicit: “Updated 18s ago,” not a pulsing dot alone. Charts include titles, units, accessible summaries, and tabular alternatives when needed.

### Dialogs and destructive confirmation

Dialogs have one purpose, a visible title, initial focus on the least destructive sensible control, trapped keyboard focus, Escape behavior when safe, and restored focus on close. High-impact actions name the affected object and irreversible consequence. Typed confirmation is reserved for genuinely catastrophic actions.

## Surface recipes

### Marketing

Lead with a concrete operational outcome and one primary action. Show credible product evidence: deployment state, audit history, performance telemetry, or a technical workflow. Pair concise prose with an annotated product frame rather than abstract gradients.

### Authentication

Use a narrow form beside trust and environment context. Keep recovery, organization, and security-key paths visible. Errors do not reveal account existence. Pending authentication preserves the submitted identifier and announces progress.

### Onboarding

Show the current step, total steps, completed work, and what will change. Preserve progress across navigation. Optional integrations are explicitly skippable. Connection checks expose pending, verified, denied, and retry states.

### Dashboard

Begin with system health and actionable exceptions, not decorative metrics. Pair each aggregate with freshness and a route to evidence. Use one primary timeline or topology instead of a uniform card mosaic.

### Forms and settings

Group settings by operational consequence. Save at section boundaries or explain autosave explicitly. Dirty, saving, saved, conflict, and failed states remain visible. Dangerous settings are isolated behind a ruled boundary.

## State model

Every meaningful region defines:

- Initial loading with stable geometry and an accessible status.
- Incremental refresh that preserves existing data.
- Empty state explaining what the region normally contains.
- Filtered-empty state that offers reset.
- Permission-denied state that identifies the required authority without leaking data.
- Recoverable error with retry or alternate action.
- Terminal error with escalation context.
- Success with resulting state and next relevant action.
- Disabled state with a discoverable reason.
- Destructive pending, confirmed, failed, and completed states.

Do not replace a full application frame with a centered spinner. Do not use toast messages as the only durable record of failure or success.

## Motion

Motion communicates continuity and change:

- 100–140ms for hover, focus, and compact control feedback.
- 160–220ms for panels, disclosure, and selection changes.
- 240–320ms for major navigation transitions when they materially preserve context.
- Use opacity and short axis-aligned translation; avoid springy overshoot.
- Streaming indicators may pulse slowly, but text must communicate status.

Under `prefers-reduced-motion: reduce`, remove non-essential translation, parallax, looping pulses, and smooth scrolling. Preserve immediate state changes, focus movement, and static progress indication.

## Accessibility

Command targets WCAG 2.2 Level AA for its reference implementation.

- Preserve semantic headings, landmarks, labels, descriptions, and table structure.
- All functionality is keyboard operable with a visible 2px focus indicator meeting 3:1 contrast.
- Text meets 4.5:1 contrast; large text and meaningful graphics meet applicable AA thresholds.
- Reflow at 320 CSS pixels without two-dimensional page scrolling; intentionally scrollable tables and logs are labelled and keyboard reachable.
- Support 200% text resize and 400% zoom.
- Do not convey status, selection, or severity by color alone.
- Announce asynchronous results intentionally; avoid chatty live regions for streaming telemetry.
- Touch targets meet WCAG 2.2 target-size expectations or provide sufficient spacing and alternatives.
- Forced-colors mode preserves boundaries, selection, and focus.

## Final validation checklist

- The result is recognizably Command, not a darkened generic dashboard.
- Supplied product behavior and copy remain intact.
- All required surfaces and state variants are represented.
- Desktop and mobile layouts preserve priority and access.
- Light and dark modes are deliberate.
- Reduced motion removes non-essential movement.
- Keyboard paths, focus order, focus restoration, and accessible names work.
- Contrast, reflow, zoom, target size, and meaningful graphic checks pass.
- No third-party product identity, trademark, proprietary asset, or living-designer imitation appears.
