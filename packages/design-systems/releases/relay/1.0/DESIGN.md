# Relay Design System

## Identity and intended fit

Relay is the Design System name. It is a brisk, structured, optimistic system for workflow products, automation tools, scheduling software, campaign operations, collaborative queues, and other products where people move work through visible stages. Its intended fit is software that must make progress, ownership, readiness, and the next useful action obvious without making the interface feel severe.

The product experience should feel active but controlled: one clear cue moves through a calm field of evidence. Relay is unsuitable for luxury storytelling, meditative wellness, long form reading, solemn institutional publishing, or products that must disappear behind rich media. It should not be used when dense terminal output is the primary material. Choose Relay when momentum matters and every action needs context.

Relay keeps supplied behavior, information architecture, domain objects, permissions, and copy intact. It directs presentation and interaction quality. It never invents a workflow to complete a composition.

## Principles and system signature

Relay's system signature is bounded momentum: neutral planes form a stable route while one vivid primary cue identifies the active step, current handoff, or decisive action. Numbered chapter labels, compact process bands, crisp boundaries, and embedded evidence make a product feel ready to move without turning it into a dashboard mosaic.

1. **Principle: show the route.** Make the current position, completed work, remaining work, and next valid action understandable together.
2. **Principle: spend color on momentum.** Reserve the primary cue for actions, active selection, focus, live progress, and links. A colorful interface is not the goal.
3. **Principle: keep evidence attached.** Place status, ownership, timing, and consequences beside the object or action they describe.
4. **Principle: alternate pace.** Pair concise statements with compact working surfaces so comprehension and action have different rhythms.
5. **Principle: finish every state.** Loading, empty, error, success, disabled, destructive, narrow screen, and reduced motion treatments are part of the first composition.

The recognizable Relay combination is a nearly achromatic canvas, acid chartreuse in dark mode, deep citrus green in light mode, a modern sans voice, a small monospace indexing voice, four to six pixel corners, fine borders, shallow surface changes, and sequential bands that read from start to outcome. Avoid glowing neon, decorative racing stripes, generic gradient blobs, floating card clouds, ornamental grids, ticker marquees, and fake activity feeds.

## Semantic color

Relay defines complete light and dark color schemes through semantic tokens. The required roles are background, foreground, card, muted, muted foreground, border, primary, primary foreground, destructive, success, warning, info, and focus ring. Token usage creates hierarchy: background holds the route, card contains focused work, muted separates support regions, border explains structure, and primary identifies momentum. Raw color must never carry product meaning outside these roles.

Light mode uses a cool ivory background and white card surface with dark mineral foreground. Its primary is a deep citrus green so links, focus indicators, and compact text retain contrast. Dark mode uses a charcoal olive background, pale mineral foreground, and a vivid chartreuse primary. Primary foreground always provides measured contrast on the primary fill. The primary token is not a success token. Success, warning, info, and destructive roles keep distinct meanings and always pair color with text, shape, or an icon.

Normal text must meet at least 4.5:1 contrast. Large text and meaningful graphics must meet at least 3:1. The focus ring must meet 3:1 against adjacent colors. Muted foreground must remain readable on background, card, and muted surfaces. Disabled content uses explicit tokens and explanatory text, never opacity alone. Test every token pairing in both color schemes.

```css
:root {
	--relay-background: #f7f8f2;
	--relay-foreground: #171a12;
	--relay-card: #ffffff;
	--relay-muted: #ecefe4;
	--relay-muted-foreground: #555d4d;
	--relay-border: #b8bead;
	--relay-primary: #4f6800;
	--relay-primary-foreground: #ffffff;
	--relay-destructive: #aa2634;
	--relay-success: #35671b;
	--relay-warning: #775500;
	--relay-info: #245d91;
	--relay-ring: #5d7900;
}

.dark {
	--relay-background: #141610;
	--relay-foreground: #f3f5ec;
	--relay-card: #1c1f18;
	--relay-muted: #282c22;
	--relay-muted-foreground: #b6bcaa;
	--relay-border: #474d3e;
	--relay-primary: #ceff00;
	--relay-primary-foreground: #15190a;
	--relay-destructive: #ff7a78;
	--relay-success: #9bd467;
	--relay-warning: #efc15d;
	--relay-info: #8ec5f4;
	--relay-ring: #ceff00;
}
```

## Typography

Relay uses three typographic roles. Display and body use a locally available neo grotesk or geometric sans. Labels and code use a locally available technical monospace. Never fetch a remote font. Display type states outcomes with compact line height and tight tracking. Body type explains work in a calm voice. Label type indexes chapters, stages, timestamps, counters, and machine values. Code remains reserved for real commands, identifiers, and technical values.

Display text ranges from 36 to 64px on desktop and 30 to 44px on mobile, with weight 600, line height 0.98 to 1.08, and tracking from negative 0.045em to negative 0.025em. Page headings range from 28 to 40px. Body text is 14 to 16px with weight 400 or 500 and line height 1.5 to 1.65. Label text is 11 to 12px with weight 600, line height 1.35, and tracking up to 0.1em. Code is 12 to 14px with tabular numerals and normal tracking.

Responsive type uses `clamp()` or Project utilities with tested minimums. Wrapping is intentional: headings balance across no more than three lines, body copy stays below 72 characters, and control labels wrap only when the control grows with them. Never shrink interactive text to avoid wrapping. Keep uppercase treatment for short labels only. Do not use monospace for paragraphs, slogans, or every control.

## Spacing and density

Relay uses a four pixel base spacing unit. The preferred scale is 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, and 112px. Product density is balanced and becomes compact inside tables, queues, and process summaries. Marketing uses wider section intervals while keeping evidence surfaces dense enough to be credible.

Controls are normally 40 to 44px tall. Compact desktop controls may be 36px when their target area remains at least 24 by 24 CSS pixels and adjacent targets have sufficient separation. Touch oriented actions should reach 44px. Table rows are 40 to 48px. Card padding is 16 to 24px. Process band padding is 12 to 20px. Major content rhythm is 48 to 80px in product views and 64 to 112px in marketing.

Use 8 to 12px for tight grouping, 16 to 24px for one component, 32 to 48px between related regions, and 64px or more only for a real chapter break. Density must preserve labels, recovery guidance, and status. Never compress several unrelated decisions into one toolbar or add empty space merely to imply quality.

## Responsive layout

Relay uses content driven transitions within three practical breakpoint ranges. Mobile begins at 320px, tablet begins near 768px, and desktop begins near 1024px. The page content width is normally 80rem, while dense product shells may reach 92rem. Reading measure remains between 58 and 72 characters. A twelve column desktop grid, a six column tablet grid, and a single column mobile grid align the route without exposing decorative grid lines.

Desktop may pair a compact navigation rail with a flexible work region and a narrow context panel. Sequential bands can alternate text and evidence across the grid, but source order must remain logical. Tablet collapses the context panel into an inline disclosure and preserves the current stage above its details. Mobile uses one source ordered column. Navigation becomes a labelled sheet or compact row, process stages become a vertical sequence, and primary actions may fill the available width.

At 200% zoom, controls and headings wrap without overlap. At 400% zoom and 320 CSS pixels, the page must reflow into one direction without page level horizontal overflow. A table, timeline, or code sample may use a labelled overflow region only when conversion would remove meaning. Make that region keyboard reachable and expose the hidden extent. Do not preserve a desktop composition by shrinking text or hiding necessary actions.

## Components and interaction states

Relay component geometry uses four pixel corners for controls, six pixel corners for cards and panels, and pills only for short status badges. Default behavior is quiet and bordered. Hover deepens the surface or underline without movement. Focus visible uses a two pixel focus ring with a two pixel offset. Active states may translate by one pixel or deepen contrast without changing layout. Selected states combine the primary cue with text or an icon. Disabled states explain their prerequisite. Invalid states identify the field and recovery. Destructive states name the affected object and consequence.

Every button, link, input, text area, select, checkbox, navigation item, card, dialog, menu, table, and feedback component needs default, hover, focus, active, selected, disabled, loading, success, error, invalid, and destructive treatment where those states apply. Keep labels stable during async work. Never remove content to make room for a spinner.

**Buttons and links.** Use one filled primary button per decision region. Its label names the result, such as “Start review” or “Publish changes.” Secondary buttons use a card fill and visible border. Quiet actions remain legible without hover. Links retain an underline or another persistent noncolor cue. An icon only button has an accessible name and visible tooltip when the icon is unfamiliar.

**Inputs, text areas, selects, and checkboxes.** Labels remain visible above fields. Help text appears before an error in reading order. Input and text area values persist after failure. A select exposes its current value and expanded state. A checkbox uses a native input or a fully equivalent accessible primitive, enlarges its target without enlarging the glyph, and pairs any conditional consequence with persistent text.

**Navigation and menus.** Navigation names the current location and current scope. Process navigation shows complete, current, and upcoming steps with text, not color alone. A menu supplements a visible primary route. It never contains the only way to reach a critical setting. Menus restore focus to their trigger after closing.

**Cards and panels.** A card contains one object or decision. A panel contains a named group of related evidence. Prefer one outer boundary and internal rules over nested cards. The vivid primary may appear as a small stage marker, top rule, or active control, not as a wash behind every card.

**Dialogs.** A dialog has a visible title, concise description, predictable initial focus, trapped focus, Escape behavior when safe, and focus restoration. Confirmation copy names the object and result. Destructive confirmation puts initial focus on the least harmful sensible action.

**Tables.** Use semantic table markup for comparison. Provide a caption, true headers, sort state, units, aligned numerals, and keyboard reachable row actions. The first column owns row identity. The last column may hold actions. On narrow screens, choose prioritized columns, labelled record groups, or a clearly named horizontal region.

**Feedback.** Badges stay short. Alerts include a title, meaning, and recovery when needed. Toasts may confirm a local result only when the originating context remains visible. Durable errors and blocked work stay in the page.

## Product surfaces

Relay applies the same route, primary cue, compact evidence, and restrained geometry across marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces. Each surface preserves product behavior and supplied copy.

**Marketing.** Open with one concrete outcome, a short explanation, and one primary action. Follow with sequential chapters that alternate concise claims and credible product evidence. A product frame should show supplied interface content, not generic decoration. Pricing keeps period, renewal, trial, cancellation, eligibility, and limits next to the decision.

**Authentication.** Use a focused form beside concise trust or workspace context. Keep account recovery and alternate methods visible without competing with the main path. Errors must not reveal whether an account exists. Pending state preserves the identifier and announces progress.

**Onboarding.** Show the current stage, completed stages, remaining work, and what the next action changes. Allow safe backtracking. Optional steps are explicitly skippable. Connection checks distinguish waiting, verified, denied, expired, and retry states.

**Dashboard.** Lead with work in motion, blocked items, and the next decision. Pair every aggregate with freshness and a route to its evidence. Prefer a stage summary plus one principal queue or timeline over a uniform wall of metrics.

**Table.** Keep search, filters, sort, selection count, bulk action scope, pagination, and last update visible. Filtered empty state offers reset. Bulk actions confirm the selected object count and preserve selection after a recoverable failure.

**Form.** Group fields by outcome. Use a fieldset and legend where controls form one decision. Show unsaved, validating, saving, saved, conflict, and failed states close to the form title. Avoid a single remote save action for several unrelated sections.

**Settings.** Explain scope before each setting. Distinguish personal, workspace, and organization effects in text. Automatic save names what changed and when. Dangerous settings occupy a separate bounded region after routine settings.

**States.** Loading keeps stable geometry. Empty states explain the absent object and next valid action. Errors preserve context and recovery. Success confirms the resulting state. Permission limits identify the needed role without leaking protected data.

## Feedback states

Every meaningful region defines loading, empty, filtered empty, error, success, disabled, and destructive feedback states. Each state preserves a stable layout, names the affected object, and includes a recovery action when recovery is possible. Never replace the complete application frame with a centered spinner.

* **Loading:** keep headings, controls, and region dimensions stable; expose a concise status after one second; use static placeholders under reduced motion.
* **Empty:** distinguish a truly new region from a filtered empty result; explain what belongs here; offer one valid first action or reset.
* **Error:** state what failed, preserve entered or loaded data, name the recovery action, and include escalation context for terminal failures.
* **Success:** name the completed result beside the initiating control and update the visible object state before announcing completion.
* **Disabled:** keep the control discoverable when useful and explain the missing permission, data, connection, or prior step in persistent text.
* **Destructive:** identify the object, immediate consequence, recoverability, and confirmation boundary; show pending, failed, completed, and undo states when undo is real.

Background refresh must preserve usable data and disclose freshness. An optimistic update needs a rollback path. A queue item may show progress, but progress must never be inferred from animation alone.

## Motion

Relay motion communicates continuity along a route. Use 100 to 140ms duration for hover and compact feedback, 160 to 220ms for disclosure and local transitions, and 220 to 300ms for spatial movement between stages. Easing follows the action: enter motion uses ease out with opacity and no more than 8px translation, exit motion uses ease in and completes slightly faster, and reordering uses ease in out while preserving the relationship between origin and destination.

Continuity matters more than spectacle. A completed stage may settle into place, a context panel may reveal beside its trigger, and a selected record may move into a detail view. Avoid spring overshoot, parallax, autoplay carousels, continuously moving marquees, ambient pulses, and scroll hijacking.

Under `prefers-reduced-motion: reduce`, remove nonessential translation, scaling, loops, and smooth scrolling. State changes become instant or use a brief opacity change. Focus movement, progress text, and completion status remain available without motion.

```css
:root {
	--relay-duration-feedback: 120ms;
	--relay-duration-transition: 190ms;
	--relay-duration-spatial: 260ms;
	--relay-ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
	--relay-ease-exit: cubic-bezier(0.4, 0, 1, 1);
}

@media (prefers-reduced-motion: reduce) {
	:root {
		--relay-duration-feedback: 0ms;
		--relay-duration-transition: 0ms;
		--relay-duration-spatial: 0ms;
	}
}
```

## Accessibility

Relay targets WCAG 2.2 Level AA. Use native semantics before ARIA. Every page has one primary heading and labelled landmarks. Every control has an accessible name. Every field has a programmatic label, description, and error identification. Status changes use an appropriate live region without repeating continuous updates. Assistive technology must receive the same stage, ownership, freshness, selection, and consequence information visible on screen.

All functionality is keyboard operable. Keyboard order follows source order. Visible focus uses the semantic focus ring and never depends on color alone. Dialogs trap and restore focus. Menus, disclosures, tabs, and grids use their documented keyboard patterns only when their semantics are correct.

Normal text contrast is at least 4.5:1. Large text, controls, boundaries, focus, and meaningful graphics meet at least 3:1 where required. Touch target size follows WCAG 2.2 expectations, with 44px preferred for primary touch actions. Support 200% text size, 400% zoom, reflow at 320 CSS pixels, forced colors, both color schemes, and reduced motion. Do not use color, position, animation, or sound as the only status communication.

Images use useful alternative text or empty alternative text when decorative. Supplied audio and video receive captions or transcripts. Errors are associated with their fields and summarized when several occur. Time limits, drag interactions, and gestures require accessible alternatives.

## Supported stack

Relay directly supports React or Next.js, Tailwind CSS v4, and shadcn/ui. Map Relay semantic tokens into the Project theme, then express component variants through those roles. Keep Server Components as the default in Next.js and add client boundaries only for browser state, event handling, effects, or client APIs.

Use Project owned Button, Card, Field, Input, Textarea, Select, Checkbox, Table, Tabs, Alert, Dialog, Sheet, Dropdown Menu, Tooltip, Skeleton, Empty, and Separator primitives before making new components. Use semantic utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, and `ring-ring`. Do not place raw Relay colors inside component class names.

Build process bands and route layouts with CSS Grid and Flexbox while keeping DOM order meaningful. Use `max-w-*`, `grid-cols-*`, `gap-*`, container queries where already available, and standard responsive variants. Keep the design token layer separate from product rules. Dependencies remain implementation direction only. The Project owner chooses and runs installation commands.

Compatibility covers React 18 and 19, Next.js 15 and 16, Tailwind CSS 4, and shadcn/ui with either supported primitive family.

## Agent examples

**Good request, workflow dashboard:** “Build the supplied approval workflow with Relay. Keep the existing stages, permissions, and copy. Show the current stage, blocked items, owner, freshness, and next valid action in a compact route. Include loading, filtered empty, error, success, disabled, and destructive states. Verify the result at 1440 by 900 and 390 by 844 in both color schemes with reduced motion.” This is faithful to the supplied product and guards against prohibited drift.

**Good request, onboarding:** “Compose the existing connection sequence as a Relay onboarding route. Preserve every integration rule and validation message. Keep optional work skippable, announce verification, and move context inline on mobile. Do not invent providers or steps.” This requests faithful presentation without changing behavior.

**Good request, settings:** “Apply Relay to the supplied workspace settings. Separate personal, workspace, and destructive scope. Show dirty, saving, saved, conflict, and failed feedback. Keep every current permission and label.” This makes consequence visible and prohibits visual drift into a generic card grid.

**Bad request:** “Copy a recognizable product page, reuse its logo and illustrations, animate a ticker across the hero, and invent a three step automation so the layout feels complete.” This violates product identity boundaries, invents behavior, and creates prohibited drift. Generalize traits into Relay's own route, tokens, components, and mark instead.

## Final validation

Before delivery, validate every required surface and state at each target viewport and color scheme. Confirm motion and reduced motion behavior, every component interaction, the supported stack mapping, and all accessibility obligations.

## Final validation checklist

* Marketing, authentication, onboarding, dashboard, table, form, settings, and state surfaces share the Relay system signature.
* Loading, empty, filtered empty, error, success, disabled, destructive, permission, and background refresh states preserve context.
* Mobile, tablet, desktop, 200% text size, 400% zoom, and 320px reflow keep every action reachable without unintended overflow.
* Light and dark color schemes pass text, control, focus, border, status, and meaningful graphic contrast checks.
* Default, hover, focus, active, selected, disabled, loading, invalid, success, error, and destructive component interaction states are complete.
* Keyboard operation, visible focus, semantics, accessible names, status announcements, target size, error identification, and assistive technology paths work.
* Reduced motion removes nonessential movement while preserving state and continuity.
* React or Next.js, Tailwind CSS v4, and shadcn/ui direction uses semantic tokens and existing component variants.
* The result is recognizably Relay through bounded momentum, process bands, compact evidence, restrained geometry, and one primary cue.
* No product workflow, business rule, final copy, proprietary asset, recognizable composition, or executable behavior was invented.
