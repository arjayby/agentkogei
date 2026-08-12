# Relay Grid Design System

## Identity and intended fit

Relay Grid is a structured, high clarity Design System for workflow products, coordination software, publishing tools, operations portals, and business applications that turn many small decisions into a dependable sequence.

Its intended fit is software where people scan changing status, move work between stages, compare records, and recover from exceptions. It creates the experience of a calm relay desk: every region has a named role, the next useful action is obvious, and dense information remains approachable.

Relay Grid is unsuitable for luxury storytelling, immersive entertainment, children’s products, expressive creator portfolios, and products whose main value is visual spectacle. Avoid using it when sparse content would be burdened by operational framing.

## Principles and system signature

- **Principle 1: Name every lane.** Give each major region a short label that explains its role before showing controls or data.
- **Principle 2: Sequence before decoration.** Arrange information in the order people inspect, decide, act, and confirm.
- **Principle 3: Density with breathing points.** Keep working surfaces compact, then create clear pauses between unrelated groups.
- **Principle 4: State travels with the object.** Put status, freshness, and recovery near the record they describe.

The system signature is the **relay header**: a narrow leading cell containing a coordinate label such as `A1`, followed by a ruled title band and an optional trailing state. Use it at the start of page regions, dialogs, onboarding steps, and important cards. The coordinate supports orientation but never replaces a semantic heading. Repeat the signature only where it clarifies sequence.

## Semantic color

Use semantic roles rather than raw palette names. The light and dark schemes preserve the same hierarchy and usage.

| Role | Light | Dark | Usage |
| --- | --- | --- | --- |
| Background | `#f6f3ea` | `#101713` | Page canvas and space between working regions |
| Foreground | `#17221c` | `#eef4ef` | Primary text and essential symbols |
| Card | `#fffdf7` | `#17201a` | Forms, grouped records, dialogs, and primary work surfaces |
| Muted | `#e4e7dd` | `#222d25` | Secondary regions, quiet controls, and empty placeholders |
| Muted foreground | `#4f5f55` | `#b2beb5` | Supporting copy, metadata, and timestamps |
| Border | `#748479` | `#687b6c` | Control boundaries, dividers, and table rules |
| Primary | `#365f4b` | `#9be0bd` | Primary actions, current navigation, selected work, and key links |
| Primary foreground | `#ffffff` | `#102117` | Text and icons on primary |
| Destructive | `#a52e3f` | `#ff909b` | Irreversible actions and critical failures |
| Success | `#28683f` | `#86d9a6` | Completed work and healthy results |
| Warning | `#765300` | `#f2c46d` | Attention that does not yet block progress |
| Info | `#235c88` | `#83c9f4` | Neutral guidance and informational status |
| Focus ring | `#0d5e4b` | `#b4f5d1` | Keyboard focus indicator outside component geometry |

Maintain text contrast of at least 4.5:1 and meaningful graphic or control contrast of at least 3:1. Foreground establishes the primary hierarchy, muted foreground supports it, and semantic colors communicate exceptional state. Do not use primary as a decorative fill across large areas. Pair destructive, success, warning, and info with written labels or icons so usage never depends on color alone.

## Typography

Use locally available font stacks and preserve these roles:

- **Display:** a sturdy neo grotesk sans, weight 650 to 750, line height 0.98 to 1.08, tracking from `-0.035em` to `-0.02em`. Use for one page promise or one decisive outcome.
- **Body:** a humanist sans, weight 400 or 500, line height 1.48 to 1.62, neutral tracking. Use for explanations, form guidance, and longer reading.
- **Label:** the body face at weight 650, line height 1.25, tracking `0.06em` for uppercase labels and `0.01em` otherwise. Use for relay coordinates, navigation, field labels, and metadata.
- **Code:** a technical monospace, weight 450 to 550, line height 1.45, neutral tracking, and tabular numerals. Use only for identifiers, timestamps, values, and technical input.

The responsive type scale uses 36px to 56px display, 26px to 34px page title, 18px to 22px section title, 16px body, 14px compact body, 12px label, and 12px code. Apply smaller values on mobile and larger values from the desktop breakpoint. Keep paragraphs below 68 characters per line. Allow wrapping at natural word boundaries, never force display copy into a single line, and reveal any truncated identifier through an accessible disclosure.

## Spacing and density

The base spacing unit is 4px. The scale is 4, 8, 12, 16, 24, 32, 48, 64, and 96px.

Use a compact density inside tables, navigation, and repeated record cards. Use balanced density for forms, settings, authentication, and onboarding. Marketing may be spacious, but every large gap must separate distinct ideas.

- Control heights are 36px compact, 40px default, and 48px for prominent mobile actions.
- Content rhythm is 8px inside a control, 12px between related items, 24px between groups, and 48px between major product regions.
- Grouping uses one border and one shared heading before separate card shells.
- Tables use 40px rows on desktop and at least 44px when row actions must support touch.
- Relay headers use 8px vertical padding, a 40px coordinate cell, and a 12px gap between title and state.

Density must preserve readable labels, stable validation rows, and sufficient target spacing. Do not reduce component type below 12px or let dense controls lose their accessible name.

## Responsive layout

Use mobile from 320px, tablet from the 720px breakpoint, and desktop from the 1080px breakpoint. Treat these as content driven transitions: reflow sooner when labels or controls stop fitting.

- **Mobile:** one column, 16px gutters, a content width of the viewport minus gutters, and source order that follows inspect, decide, act, confirm. Navigation becomes a labelled sheet. Relay coordinates remain visible but decorative trailing metadata may move below the title.
- **Tablet:** a 6 column grid with 24px gutters. Pair a primary work region with a supporting panel only when both keep usable measures. Navigation may use a compact rail with persistent labels.
- **Desktop:** a 12 column grid, 32px gutters, maximum page width 1440px, and reading content width no greater than 68ch. Persistent navigation and one contextual rail are allowed.

Tables and timelines may use a named horizontal overflow region with keyboard access. The page itself must reflow at 320 CSS pixels without two dimensional scrolling. At 200 percent zoom, toolbars wrap into labelled groups, dialogs become near full width, and no content or navigation becomes clipped.

## Components and interaction states

Relay Grid component geometry is square to softly cut, with radii of 0, 4, and 8px. Use 1px defined borders for structure, 2px borders for selected regions, and shadows only for temporary menus and dialogs. Component behavior preserves footprint through asynchronous changes.

- **Buttons:** use explicit result labels. Primary buttons use primary and primary foreground. Secondary buttons use card and border. Destructive styling appears only at the final confirmation boundary.
- **Links:** underline links in prose. Navigation links may use a ruled selected cell with `aria-current`.
- **Inputs and text areas:** keep a persistent label above, help or error below, and reserve stable space for validation. A text area grows to a sensible maximum before it scrolls.
- **Selects:** show the current value and a visible indicator. Native semantics are preferred unless a custom list box fully supports keyboard behavior.
- **Checkboxes:** pair the control with a complete visible label and place consequence notes below the group.
- **Navigation:** name the landmark, expose current location in text and semantics, and keep the command palette as an alternate route only.
- **Cards:** describe one object or one decision. Use a relay header when sequence matters and plain headings otherwise.
- **Dialogs:** use one purpose, a visible title, initial focus on the least destructive useful control, trapped focus, safe Escape behavior, and focus restoration.
- **Menus:** open from a named trigger, support arrow keys and Escape, and never hide the only route to an action.
- **Tables:** use semantic table structure, visible captions, sticky headings where useful, row headings first, and actions last.
- **Feedback components:** combine tone, icon or shape, state text, consequence, and recovery.

Every interactive component defines default, hover, focus visible, active, selected, disabled, invalid, loading, success, error, and destructive interaction states when applicable. Hover increases contrast without moving layout. Focus uses the focus ring outside the border. Active uses an inset treatment. Selected adds a 2px leading rule and text state. Disabled preserves labels and explains why. Invalid identifies the error in text. Loading keeps the original label visible. Destructive controls repeat the affected object and consequence.

## Product surfaces

- **Marketing:** lead with a clear operational outcome, one primary action, and an original relay map showing work moving between named stages. Avoid generic card mosaics.
- **Authentication:** place a narrow, fully labelled form in the primary lane and concise trust or recovery context in a secondary lane. Never reveal account existence in errors.
- **Onboarding:** show the current relay coordinate, total steps, completed work, optional skips, and the effect of the next action.
- **Dashboard:** begin with exceptions and current throughput, then show fresh summaries connected to evidence. Each metric includes a label, time context, and route to detail.
- **Table:** use a captioned, ruled comparison surface with row identity, status text, freshness, and an explicit action column.
- **Form:** group fields by the decision they support. Keep instructions, input, error, and saved state within one scan path.
- **Settings:** use named groups, current values, save behavior, and consequences. Isolate dangerous settings in a clearly labelled region.
- **General state surfaces:** preserve the surrounding frame while loading, empty, error, success, disabled, or destructive state content changes.

## Feedback states

Every meaningful region defines stable layout for these feedback states:

- **Loading:** retain headings and region dimensions, expose written progress, and announce only meaningful changes.
- **Empty:** explain what belongs here and provide one relevant creation or learning action.
- **Filtered empty:** name the active filter and offer a reset recovery action.
- **Error:** identify what failed, what remains safe, and a retry or alternate recovery action.
- **Success:** name the completed result and the next useful action without relying on a transient toast.
- **Disabled:** preserve context and explain the unmet condition.
- **Destructive:** state the object, consequence, recoverability, pending status, failure path, and completed result.

Do not replace the whole product frame with a spinner. Reserve status rows and message regions so state changes do not cause avoidable layout shift.

## Motion

Use motion to preserve continuity through a sequence. Feedback duration is 90ms, ordinary transition duration is 150ms, and spatial movement duration is 220ms. Enter uses ease out with up to 8px of axis aligned movement. Exit uses ease in with up to 6px. Reordering and disclosure use ease in out and maintain object continuity.

The easing roles are ease out for enter, ease in for exit, and ease in out for spatial continuity.

Do not autoplay ornamental motion. Avoid bounce, spring overshoot, parallax, and continuous pulses. With reduced motion, remove nonessential translation, scaling, smooth scrolling, and looping indicators. Make state changes instant while preserving focus movement, text status, and static progress.

## Accessibility

Target WCAG 2.2 Level AA across every surface.

- Use semantic landmarks, heading order, native controls, lists, tables, and dialog semantics before ARIA.
- Provide an accessible name and visible label for every control. Associate help and error identification programmatically with the relevant field.
- Keep all behavior available by keyboard with a logical source order, no keyboard trap outside an active dialog, and visible focus using the focus ring at 3:1 contrast.
- Meet 4.5:1 text contrast and 3:1 contrast for large text, meaningful graphics, boundaries, and component states in both schemes.
- Provide a target size of at least 24 by 24 CSS pixels, with 44px preferred for primary touch actions.
- Support 200 percent text zoom and 400 percent browser zoom. Preserve reflow at 320 CSS pixels except for named data regions with intentional overflow.
- Announce loading results, validation, and durable status through restrained status or alert regions for assistive technology.
- Pair state color with text and shape, support forced colors, preserve focus restoration, and honor reduced motion.

## Supported stack

Relay Grid targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Map each semantic token to Tailwind theme variables, then use semantic utility names in components. Map geometry and density into shadcn/ui component variants such as `compact`, `default`, `relay`, and `destructive`.

Keep behavior in React components and visual policy in tokens and variants. Extend existing primitives for dialog focus, menu keyboard behavior, table semantics, and form labelling. The stack must not require a particular font service or icon library.

## Agent examples

**Good request from a Builder:** “Create a Relay Grid operations page for our approval queue. Keep our existing fields and actions. Show urgent exceptions first, use a relay header for each stage, include loading and filtered empty states, and verify the narrow layout.”

This is a faithful request because it preserves product language, applies the system signature to sequence, and asks for required states.

**Bad request from a Builder:** “Make a futuristic dashboard with glowing gradients, floating glass cards, an unrelated winged mascot, and animated grid lines everywhere.”

This request causes prohibited visual drift. It replaces semantic hierarchy with decoration, introduces unrelated identity cues, and conflicts with the palette, geometry, motion, and accessibility rules.

## Final validation

- Verify marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces.
- Verify loading, empty, filtered empty, error, success, disabled, invalid, selected, and destructive state coverage.
- Verify mobile, tablet, and desktop viewport classes, 320px reflow, 200 percent text zoom, and 400 percent browser zoom.
- Verify light and dark color scheme contrast and hierarchy.
- Verify default and reduced motion preferences.
- Verify every component interaction by keyboard and pointer, including focus restoration and async status.
- Verify the React or Next.js, Tailwind CSS v4, and shadcn/ui stack mapping.
- Verify all WCAG 2.2 Level AA accessibility obligations, including semantics, names, contrast, target size, reflow, and error identification.
