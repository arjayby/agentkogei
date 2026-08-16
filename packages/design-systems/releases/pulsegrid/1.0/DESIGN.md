# Pulsegrid Design System

## Identity and intended fit

Pulsegrid is the Design System name. Its intended fit is operational software, infrastructure products, financial tools, service platforms, analytics, and business products that must turn live activity into clear decisions. It creates an experience that feels immediate without feeling frantic, technical without becoming cryptic, and confident without becoming promotional.

Pulsegrid is unsuitable for luxury storytelling, heritage publishing, playful entertainment, image led portfolios, wellness products that require softness, or products where atmospheric illustration carries the experience. Do not use it to make a quiet reading product resemble a control room.

The system preserves supplied behavior, information architecture, permissions, domain terms, data, and copy. It defines visual hierarchy and interaction quality without inventing claims, metrics, workflows, or product identity.

## Principles and system signature

Pulsegrid's system signature is the pulse rail. A concise label, a thin rule, and a sequence of three square cells connect context, current state, and next action. The rail appears at page introductions, section transitions, table captions, and important feedback, but never as an ambient pattern. Its cells use muted, primary, and outcome roles according to meaning, and every state remains explicit in text.

These five principles govern every implementation:

- **Principle: lead with the live question.** Begin each surface with the decision, condition, or outcome that matters now.
- **Principle: align proof with action.** Keep metrics, status, explanation, and the next valid action in one readable band.
- **Principle: make status structural.** Use position, labels, rules, and icons with color so state is never an ornamental badge cloud.
- **Principle: spend iris once.** Reserve the electric iris primary for the current path, decisive action, focus, and selected state.
- **Principle: keep a quiet floor.** Let neutral space and disciplined alignment absorb complexity before adding containers or decoration.

The recognizable Pulsegrid combination is a cool near white field, deep ink text, electric iris actions, neo grotesk display type, neutral sans body text, technical mono labels, defined rules, softly squared controls, flat layered bands, tabular data, and compact pulse rails. Do not add glowing circuitry, crypto imagery, pixel debris, floating dashboards, radial gradients, glass surfaces, animated data rain, or decorative grids.

## Semantic color

Pulsegrid defines complete light and dark color schemes through semantic roles. Background is the quiet workspace. Foreground carries primary reading. Card separates a bounded task. Muted supports secondary bands. Muted foreground carries explanation and metadata. Border defines controls and data groups. Primary marks the current path and decisive action. Primary foreground is text or icon color on primary. Destructive names irreversible loss. Success confirms completion. Warning calls attention to risk. Info provides neutral context. Focus ring identifies keyboard focus. This hierarchy and usage keep neutral information calm while making actions and status unmistakable.

Light mode uses a cool mist background, white cards, deep violet ink, and a saturated iris primary. Dark mode uses a blue black field, graphite cards, pale text, and a luminous iris primary. Dark mode preserves distinct surfaces rather than simply inverting the light palette.

Normal text must meet 4.5 to 1 contrast. Large text, meaningful graphics, control boundaries, and focus indicators must meet 3 to 1 against adjacent colors. Test every status role on background, card, and muted surfaces in both schemes. Primary never substitutes for destructive, warning, success, or info. Pair every status color with text, an icon, or a structural cue.

```css
:root {
	--pulsegrid-background: #f6f7fb;
	--pulsegrid-foreground: #171623;
	--pulsegrid-card: #ffffff;
	--pulsegrid-muted: #eceef6;
	--pulsegrid-muted-foreground: #5c5f70;
	--pulsegrid-border: #888da1;
	--pulsegrid-primary: #4f3fd7;
	--pulsegrid-primary-foreground: #ffffff;
	--pulsegrid-destructive: #aa263d;
	--pulsegrid-success: #246942;
	--pulsegrid-warning: #765400;
	--pulsegrid-info: #075d89;
	--pulsegrid-ring: #4f3fd7;
}

.dark {
	--pulsegrid-background: #11111a;
	--pulsegrid-foreground: #f3f2fa;
	--pulsegrid-card: #1b1b27;
	--pulsegrid-muted: #272836;
	--pulsegrid-muted-foreground: #bbbccc;
	--pulsegrid-border: #6f7286;
	--pulsegrid-primary: #a99cff;
	--pulsegrid-primary-foreground: #171326;
	--pulsegrid-destructive: #ff91a1;
	--pulsegrid-success: #7bd8aa;
	--pulsegrid-warning: #f0c56d;
	--pulsegrid-info: #79caf4;
	--pulsegrid-ring: #b5aaff;
}
```

## Typography

Display uses a precise neo grotesk voice for product statements, page titles, section decisions, and large metrics. Body uses a neutral humanist sans for explanation, navigation, controls, and sustained reading. Label uses a technical mono for short status, timestamps, units, identifiers, and pulse rail captions. Code uses the same mono only for commands, machine values, and source text.

Display ranges from 38px on mobile to 72px on wide screens, with weight 600, line height from 0.98 to 1.08, and tracking from minus 0.045em to minus 0.025em. Section headings range from 26px to 42px. Body uses 15px to 17px, weight 400, line height from 1.5 to 1.65, and neutral tracking. Labels use 11px to 13px, weight 600, line height 1.4, and tracking from 0.04em to 0.1em. Code uses 12px to 14px with line height 1.5.

Use sentence case for authored interface copy. Uppercase is a visual treatment for short labels only. Use tabular numerals for metrics, dates, durations, and amounts. Balance short display lines, allow natural wrapping elsewhere, and never force desktop line breaks into source content. Keep sustained reading between 55 and 72 characters. Responsive type shrinks before it clips or creates a single orphaned word.

## Spacing and density

The base spacing unit is 4px. Use the scale 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, and 128px. Pulse rail cells and icon relationships use 4 to 8px. Controls and compact data groups use 12 to 20px. Cards and panels use 20 to 32px. Section bands use 48 to 96px. A single high impact introduction may use 96 to 128px when its action remains visible.

Default density is balanced. Primary controls are 44px tall. Compact controls may be 36px only when their complete target remains at least 44px on touch surfaces. Table rows are 48px by default and may compress to 40px for expert workflows with visible row focus. Content rhythm alternates concise live questions with denser evidence bands and open decision transitions. Grouping comes from shared alignment, proximity, and rules before adding a card. Do not nest cards when a band, heading, or divider communicates the same relationship.

## Responsive layout

Use content driven transitions with reference breakpoints. The maximum operational width is 90rem. Sustained reading is limited to 68 characters. A twelve column desktop grid becomes a six column tablet grid and one mobile column. Gutters are 32px on desktop, 24px on tablet, and 16px on mobile.

- **Desktop at 1120px and wider:** keep primary navigation visible, place the live question across five to seven columns, and align evidence or action in the remaining columns. Use two or three bands for related operational groups.
- **Tablet from 768px to 1119px:** collapse secondary navigation, reduce wide groups before reducing type, and place supporting evidence beneath the principal decision when its measure becomes narrow.
- **Mobile below 768px:** use one source ordered column, replace the full navigation with a labelled menu trigger, let important actions fill the available width, and stack pulse rail cells before the label if needed.
- At 200 percent zoom and 320 CSS pixels, reflow without page level horizontal overflow. Wide tables may use a labelled keyboard reachable scroll region with a visible affordance. Preserve row headings, sticky context only when it does not obscure content, and never hide priority columns without an alternate presentation.

## Components and interaction states

Geometry is softly squared. Use 4px for compact controls and data cells, 6px for buttons and fields, 8px for cards, and 10px for dialogs. Borders are defined and flat. Use one shallow shadow only for temporary menus, dialogs, or draggable content. Never use elevation as the sole interaction cue.

- **Button:** use one filled primary action per decision region. Secondary buttons use a defined border. Quiet actions use text with a directional cue. Hover deepens color without movement. Active may compress by one pixel without shifting the layout.
- **Link:** underline links in prose. Navigation links use a text label plus a current rule or `aria-current`. Accessible names describe destinations rather than visual position.
- **Input, text area, select, and checkbox:** keep visible labels and persistent help. Fields use card background and a defined boundary. Invalid state reserves stable space for a specific correction. Selected state pairs the primary cue with a check, value, or explicit text.
- **Navigation:** keep the current destination explicit. Mobile menus open from a labelled button, preserve source order, support Escape, and restore focus.
- **Card:** group one bounded task, proof set, or decision. A card must have a clear heading relationship and must not exist only to add a border.
- **Dialog and menu:** modal dialogs trap focus, name their purpose, support safe cancellation, and restore focus to the opener. Menus stay close to their trigger and use roving focus or native menu behavior when appropriate.
- **Table:** provide a caption, semantic headers, tabular numerals, readable row labels, and keyboard reachable actions. Use rules to group related rows and avoid decorative striping.
- **Feedback:** attach status to the affected object or action and announce meaningful asynchronous outcomes deliberately.

Every applicable interactive component needs default, hover, focus visible, active, selected, disabled, loading, success, error, invalid, and destructive states. Disabled controls remain readable and explain the unmet prerequisite. Focus uses a 2px semantic ring with at least 2px offset. Destructive confirmation repeats the named object, scope, consequence, and true recovery status.

## Product surfaces

Pulsegrid applies one coherent pulse and band logic across marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces. Every surface begins with the current question, aligns proof with action, and preserves supplied workflows and language.

Marketing leads with one concrete outcome, a short explanation, and one ranked action. Follow with proof bands that connect capability, evidence, and a next step. Use only supplied metrics and claims. Authentication uses a narrow task panel with persistent labels, recovery, trust context, and stable submission feedback. Onboarding presents a short sequence with completed, current, optional, and upcoming steps, plus safe backtracking.

Dashboard surfaces lead with current health, pending work, or the next decision rather than decorative totals. A table keeps entity, state, owner, freshness, and action aligned. Forms group inputs by decision with `fieldset` and `legend` where appropriate, while retaining dirty, saving, saved, conflict, and failed states. Settings name whether a value applies to the person, workspace, or organization and place irreversible actions in a separate consequence band.

General state surfaces preserve the surrounding band structure. Loading, empty, filtered empty, error, success, disabled, and destructive states name the affected object and provide a recovery or next valid action.

## Feedback states

- **Loading:** preserve the eventual layout, keep available data visible, and label operations that last longer than a brief control response.
- **Empty:** name the absent object, explain its purpose, and offer the first valid action. Filtered empty states include a clear reset.
- **Error:** identify the failed operation and affected object, preserve entered content and useful data, and provide a recovery action.
- **Success:** confirm the named result beside its source action. Use a toast only when the originating context remains visible.
- **Disabled:** explain the unmet condition near the unavailable action and do not rely on low opacity.
- **Destructive:** state object, scope, consequence, and recovery truth before confirmation.

Keep a stable layout by reserving space for changing feedback so bands do not jump. A pending refresh never erases useful existing information. Status text must remain understandable without color, icon, position, or motion.

## Motion

Motion communicates response and continuity. Feedback duration is 100ms, ordinary transition duration is 160ms, and spatial movement duration is 220ms. Easing uses ease out for enter, ease in for exit, and ease in out for rearrangement. Limit spatial movement to 6px and scale from no lower than 0.985.

Pulse rail cells may fill in sequence only after a user action, never as an ambient loop. Panels enter with a short fade and translation when the relationship to the trigger is clear. Exits are shorter than entrances. Do not autoplay carousels, count animations, scanning effects, or decorative motion. Under reduced motion, remove translation, scaling, smooth scrolling, and sequential cell fills. Make state changes instant while preserving labels and focus.

## Accessibility

Target WCAG 2.2 Level AA. Use native semantics through landmarks, headings, lists, buttons, links, forms, dialogs, tables, and status regions before ARIA. Every control and meaningful graphic has an accessible name. Decorative pulse rails are hidden from assistive technology while their meaning appears in real text. Data values include units and table relationships are programmatic.

Keep all navigation, menus, filters, selection, sorting, overflow regions, row actions, and dialogs keyboard operable in logical source order. Provide visible focus in light, dark, and forced colors modes. Maintain measured contrast for text, controls, boundaries, status, meaningful graphics, and focus. Target size is at least 24 by 24 CSS pixels with adequate spacing, with 44 by 44 preferred for important touch actions.

Support 200 percent page zoom, 400 percent browser zoom, and reflow at 320 CSS pixels without loss of content or two dimensional page scrolling. Error identification combines a summary when helpful with field level messages and correction guidance. Announce asynchronous status intentionally without stealing focus or repeating static content. Honor reduced motion and preserve the same information when motion is removed.

## Supported stack

Pulsegrid targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Map every semantic token into the Project theme layer and expose spacing, radius, border, and duration through shared variables. Extend shadcn/ui with pulse, band, compact, selected, status, and destructive component variants rather than copying component source.

Keep semantic document structure in React, server rendering safe behavior in Next.js, and responsive composition in CSS. Prefer native HTML, existing Project code, Tailwind CSS v4 utilities, and shadcn/ui primitives before adding a dependency. This Design Contract supplies direction and contains no executable installation steps.

## Agent examples

**Good request for a Builder:** “Build a service operations dashboard with current health, pending incidents, a readable event table, and complete loading, empty, error, and recovery states using Pulsegrid.” This is faithful because it connects live questions, evidence, status, and action through pulse rails and operational bands.

**Good request for a Builder:** “Restyle this analytics product in Pulsegrid while preserving its routes, permissions, metrics, and language.” This is faithful because it changes presentation without inventing product behavior.

**Bad request for a Builder:** “Copy a well known finance landing page exactly, including its branding, layouts, graphics, and product claims.” This requests recognizable replication rather than an original Pulsegrid implementation.

**Bad request for a Builder:** “Cover every surface in glowing iris grids, animated counters, glass panels, and floating charts.” This is prohibited drift because it spends the primary color decoratively, adds ambient motion, and destroys the quiet floor.

## Final validation

Before completion, verify marketing, authentication, onboarding, dashboard, table, form, settings, and state surfaces. Verify loading, empty, filtered empty, error, success, disabled, invalid, and destructive states. Test desktop and mobile viewports, 320px reflow, 200 percent page zoom, both color schemes, forced colors, and reduced motion.

Exercise every applicable component with keyboard, pointer, and assistive technology. Confirm default, hover, focus visible, active, selected, disabled, loading, success, error, invalid, and destructive interactions. Measure text, control, border, status, meaningful graphic, and focus contrast. Confirm that pulse rails remain purposeful, the iris primary remains reserved, tables retain context on narrow screens, and no supplied behavior or content was invented.

Confirm the React or Next.js, Tailwind CSS v4, and shadcn/ui mapping. Do not mark the implementation complete until every required surface, state, viewport class, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation under WCAG 2.2 Level AA has been verified.

## Final validation checklist

Use the preceding validation direction as the release checklist. Complete every named surface, state, viewport, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation before shipping.
