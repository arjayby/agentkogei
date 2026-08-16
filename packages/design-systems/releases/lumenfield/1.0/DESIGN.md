# Lumenfield Design System

## Identity and intended fit

Lumenfield is the Design System name. Its intended fit is climate technology, home services, energy products, consumer infrastructure, neighborhood platforms, and mission led products that need to make technical systems feel clear and human. It creates an experience that feels bright without becoming playful, editorial without becoming precious, and capable without becoming cold.

Lumenfield is unsuitable for dense trading terminals, severe security tooling, luxury heritage brands, children's entertainment, or products where a monochrome technical voice is essential. Do not use it to disguise a complicated expert workflow as a lifestyle campaign.

The system preserves supplied behavior, information architecture, permissions, domain terms, data, and copy. It defines visual hierarchy and interaction quality without inventing claims, metrics, workflows, or product identity.

## Principles and system signature

Lumenfield's system signature is the radiant window. A framed field is divided into a warm focal pane, a quiet evidence pane, and a narrow mono caption. The focal pane carries the current promise or decision. The evidence pane grounds it with concrete details. The caption names context, progress, or provenance. Use the signature at page introductions, meaningful section transitions, dashboards, and important outcomes. Do not repeat it on every card.

These five principles govern every implementation:

* **Principle: begin with the human outcome.** Lead with what becomes easier, safer, clearer, or more useful before explaining the system behind it.
* **Principle: let warmth guide attention.** Reserve burnt orange for the primary path, selected state, focus, and a small number of meaningful highlights.
* **Principle: pair atmosphere with proof.** Balance an editorial statement with specific evidence, status, or a next action in the same field.
* **Principle: keep the frame legible.** Use grid lines, captions, and measured spacing to organize content before adding containers.
* **Principle: make progress feel natural.** Reveal state changes calmly and keep every outcome explicit in text.

The recognizable Lumenfield combination is a warm cream field, deep umber text, burnt orange actions, editorial serif display type, direct humanist sans body text, compact mono captions, thin warm rules, modest radii, low elevation, framed compositions, and occasional spectral color used as supporting evidence. Do not add literal sunbursts, copied brand marks, orange logo treatments, ornamental rays, glass panels, floating gradients, oversized pill controls, or ambient animation.

## Semantic color

Lumenfield defines complete light and dark color schemes through semantic roles. Background is the warm open field. Foreground carries primary reading. Card separates a bounded task. Muted creates supporting panes. Muted foreground carries explanation and metadata. Border draws frames and control boundaries. Primary identifies the current path and decisive action. Primary foreground is text or icon color placed on primary. Destructive names irreversible loss. Success confirms completion. Warning signals a condition needing attention. Info provides neutral context. Ring identifies keyboard focus.

Light mode uses a cream background, white cards, deep umber text, and a contrast safe burnt orange primary. Dark mode uses an ember brown field, deeper cards, warm ivory text, and a luminous apricot primary. Dark mode preserves the warmth and hierarchy of the system rather than inverting individual colors.

Normal text must meet 4.5 to 1 contrast. Large text, meaningful graphics, control boundaries, and focus indicators must meet 3 to 1 against adjacent colors. Test every role on background, card, and muted surfaces in both schemes. Primary never substitutes for destructive, warning, success, or info. Pair every status color with text, an icon, or a structural cue.

Color usage follows meaning rather than decoration: neutrals establish the hierarchy, primary identifies the current path, and status roles communicate named outcomes.

```css
:root {
	--lumenfield-background: #fff8ec;
	--lumenfield-foreground: #1b1611;
	--lumenfield-card: #ffffff;
	--lumenfield-muted: #f2e5d2;
	--lumenfield-muted-foreground: #685a4d;
	--lumenfield-border: #9d8976;
	--lumenfield-primary: #b84200;
	--lumenfield-primary-foreground: #ffffff;
	--lumenfield-destructive: #a72f3f;
	--lumenfield-success: #26643f;
	--lumenfield-warning: #765400;
	--lumenfield-info: #175d7a;
	--lumenfield-ring: #b84200;
}

.dark {
	--lumenfield-background: #17110c;
	--lumenfield-foreground: #fff4e5;
	--lumenfield-card: #221811;
	--lumenfield-muted: #302218;
	--lumenfield-muted-foreground: #d8c2ad;
	--lumenfield-border: #8a6e59;
	--lumenfield-primary: #ff9a5c;
	--lumenfield-primary-foreground: #2a1206;
	--lumenfield-destructive: #ff9aa2;
	--lumenfield-success: #88d7aa;
	--lumenfield-warning: #f6c86f;
	--lumenfield-info: #8ecdf8;
	--lumenfield-ring: #ff9a5c;
}
```

## Typography

Display uses an editorial serif voice for human outcomes, page titles, section statements, and considered metrics. Body uses a humanist sans for explanation, navigation, forms, controls, settings, and sustained product reading. Accent uses a technical mono for short captions, step labels, status, units, dates, and identifiers. Code uses the same mono only for commands, machine values, and source text.

Display ranges from 42px on mobile to 88px on wide screens, with weight 400, line height from 0.94 to 1.02, and tracking from minus 0.035em to minus 0.015em. Section headings range from 28px to 52px. Body uses 15px to 18px, weight 400, line height from 1.5 to 1.65, and neutral tracking. Labels use 11px to 13px, weight 500, line height 1.4, and tracking from 0.06em to 0.12em. Metrics use the body family with tabular numerals when rapid comparison matters.

Use sentence case for authored copy. Uppercase is a visual treatment for short mono captions only. Use tabular numerals for measurements, dates, durations, and amounts. Keep display statements short enough to breathe, but never force line breaks into source content. Sustained reading stays between 52 and 68 characters. Responsive type shrinks before it clips or leaves a single orphaned word.

Wrapping remains natural in body copy, labels, controls, and data. Balance only short display statements, and preserve the authored word order at every responsive size.

## Spacing and density

The base spacing unit is 4px. Use the scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, and 160px. Caption and icon relationships use 4 to 8px. Controls and compact evidence groups use 12 to 24px. Cards and panels use 24 to 32px. Section fields use 64 to 128px. A single opening statement may use 128 to 160px when its action remains discoverable.

Default density is balanced and leans spacious on marketing and onboarding surfaces. Primary controls are 48px tall. Compact controls may be 36px only when the complete target remains at least 44px on touch surfaces. Table rows are 52px by default and may compress to 44px for expert workflows. Grouping comes from shared alignment, generous proximity, and thin rules before adding a card. Do not nest cards when a caption, divider, or field boundary communicates the relationship.

Content rhythm alternates open outcome fields with denser proof and action groups. Keep the vertical rhythm consistent inside a task, then increase separation when the user's question changes.

## Responsive layout

Use content driven transitions with reference breakpoints. The maximum content width is 92rem. Sustained reading is limited to 68 characters. The responsive grid uses twelve columns on desktop, six columns on tablet, and one mobile column. Gutters are 32px on desktop, 24px on tablet, and 16px on mobile.

* **Desktop at 1120px and wider:** place the leading outcome across six to eight columns and align evidence or action in the remaining field. Allow one asymmetrical focal pane per section.
* **Tablet from 768px to 1119px:** collapse secondary navigation, keep the focal pane above its proof, and reduce empty space before reducing readable type.
* **Mobile below 768px:** use one source ordered column, replace full navigation with a labelled menu trigger, make primary actions use the available width, and keep mono captions attached to the content they describe.
* At 200 percent zoom and 320 CSS pixels, reflow without page level horizontal overflow. Wide tables may use a labelled keyboard reachable scroll region with a visible affordance. Preserve row headings and never hide priority information without an equivalent presentation.

## Geometry and image direction

Geometry is softly framed. Use 2px for compact data cells, 4px for buttons and fields, 8px for cards, and 16px for large image or media frames. Borders are thin and visible. Elevation stays flat by default. Use one shallow shadow only for menus, dialogs, or content that must temporarily sit above the field.

When supplied photography is part of the product, favor natural light, candid activity, attainable environments, warm interiors, material detail, and broad elemental scale. Keep imagery specific to the product's real subject. Use a restrained grain or soft contrast only when it does not obscure important content. Never invent people, places, equipment, results, or documentary claims. Do not place text over busy imagery without a measured contrast treatment.

Supporting spectral color may appear in one contained evidence pane or data graphic. Use amber, lavender, or sky as separate supporting roles, never as a decorative rainbow and never as a substitute for semantic status.

## Components and interaction states

Component geometry is softly framed and component behavior is calm, direct, and stable. Borders, labels, and position carry interaction meaning before shadow or motion.

* **Button:** use one filled primary action per decision region. Secondary buttons use a defined border or muted surface. Hover deepens the fill without movement. Active may compress by one pixel without shifting adjacent content.
* **Link:** underline links in prose. Navigation links use an explicit current state through text, rule, and `aria-current`. Accessible names describe destinations rather than visual position.
* **Input, text area, select, and checkbox:** keep visible labels and persistent help. Fields use card background and a defined warm boundary. Invalid state reserves stable space for a specific correction. Selection pairs color with a check, value, or explicit text.
* **Navigation:** keep the current destination explicit. Mobile menus open from a labelled button, preserve source order, support Escape, and restore focus.
* **Card:** group one bounded task, story, proof set, or decision. A card needs a heading relationship and must not exist only to add decoration.
* **Dialog and menu:** modal dialogs trap focus, name their purpose, support safe cancellation, and restore focus to the opener. Menus stay near their trigger and use appropriate keyboard behavior.
* **Table:** provide a caption, semantic headers, tabular numerals, readable row labels, and keyboard reachable actions. Use warm rules and spacing rather than decorative striping.
* **Feedback:** attach status to the affected object or action and announce meaningful asynchronous outcomes deliberately.

Every applicable interactive component needs default, hover, focus visible, active, selected, disabled, loading, success, error, invalid, and destructive states. Disabled controls remain readable and explain the unmet prerequisite. Focus uses a 2px semantic ring with at least 2px offset. Destructive confirmation repeats the named object, scope, consequence, and true recovery status.

## Product surfaces

Lumenfield applies one coherent outcome, proof, and action logic across marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces. Every surface uses the radiant window only where it clarifies hierarchy and preserves supplied workflows and language.

Marketing leads with one human outcome, a short explanation, and one ranked action. Follow with framed proof that connects capability, evidence, and a next step. Use only supplied claims and media. Authentication uses a narrow task panel with persistent labels, recovery, trust context, and stable submission feedback. Onboarding pairs a clear current step with a compact progress caption and safe backtracking.

Dashboard surfaces lead with current health, the most useful outcome, or the next decision rather than decorative totals. Tables keep entity, status, owner, freshness, and action aligned. Forms group inputs by decision with `fieldset` and `legend` where appropriate, while retaining dirty, saving, saved, conflict, and failed states. Settings name whether a value applies to the person, workspace, or organization and separate irreversible actions into a consequence field.

General state surfaces preserve the surrounding frame. Loading, empty, filtered empty, error, success, disabled, and destructive states name the affected object and provide a recovery or next valid action.

## Feedback states

* **Loading:** preserve the eventual layout, keep useful data visible, and label operations that last longer than a brief control response.
* **Empty:** name the absent object, explain its purpose, and offer the first valid action. Filtered empty states include a clear reset.
* **Error:** identify the failed operation and affected object, preserve entered content and useful data, and provide a recovery action.
* **Success:** confirm the named result beside its source action. Use a toast only when the originating context remains visible.
* **Disabled:** explain the unmet condition near the unavailable action and do not rely on low opacity.
* **Destructive:** state object, scope, consequence, and recovery truth before confirmation.

Keep a stable layout by reserving space for changing feedback. A pending refresh never erases useful existing information. Status text must remain understandable without color, icon, position, or motion.

## Motion

Motion communicates warmth, response, and continuity. Feedback duration is 100ms, ordinary transition duration is 180ms, and spatial movement duration is 260ms. Easing uses ease out for enter, ease in for exit, and ease in out for rearrangement. Limit spatial movement to 8px and scale from no lower than 0.985.

The radiant window may reveal its focal and evidence panes in sequence only after navigation or a user action. Buttons and controls do not drift, bounce, or glow. Media transitions use a short fade when the relationship remains clear. Do not autoplay carousels, looping gradients, parallax, grain animation, or decorative counters. Under reduced motion, remove translation, scaling, smooth scrolling, and sequential reveals. Make state changes instant while preserving labels and focus.

## Accessibility

Target WCAG 2.2 Level AA. Use native semantics through landmarks, headings, lists, buttons, links, forms, dialogs, tables, and status regions before ARIA. Every control and meaningful graphic has an accessible name. Decorative frame divisions are hidden from assistive technology while their meaning appears in real text. Data values include units and table relationships are programmatic.

Keep all navigation, menus, filters, selection, sorting, overflow regions, row actions, and dialogs keyboard operable in logical source order. Provide visible focus in light, dark, and forced colors modes. Maintain measured contrast for text, controls, boundaries, status, meaningful graphics, and focus. Target size is at least 24 by 24 CSS pixels with adequate spacing, with 44 by 44 preferred for important touch actions.

Support 200 percent page zoom, 400 percent browser zoom, and reflow at 320 CSS pixels without loss of content or two dimensional page scrolling. Error identification combines a summary when helpful with field level messages and correction guidance. Announce asynchronous status intentionally without stealing focus or repeating static content. Honor reduced motion and preserve the same information when motion is removed.

## Supported stack

Lumenfield targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Map every semantic token into the Project theme layer and expose spacing, radius, border, and duration through shared variables. Extend shadcn/ui with framed, focal, selected, status, and destructive variants rather than copying component source.

Keep semantic document structure in React, server rendering safe behavior in Next.js, and responsive composition in CSS. Prefer native HTML, existing Project code, Tailwind CSS v4 utilities, and shadcn/ui primitives before adding a dependency. This Design Contract supplies direction and contains no executable installation steps.

## Agent examples

**Good request for a Builder:** “Build a home energy dashboard with current production, upcoming service, readable usage history, and complete loading, empty, error, and recovery states using Lumenfield.” This is faithful because it pairs a human outcome with specific proof and a clear next action.

**Good request for a Builder:** “Restyle this climate product in Lumenfield while preserving its routes, permissions, measurements, and language.” This is faithful because it changes presentation without inventing product behavior.

**Bad request for a Builder:** “Copy a named energy company's identity, page layouts, photography, graphics, and claims exactly.” This requests recognizable replication rather than an original Lumenfield implementation.

**Bad request for a Builder:** “Cover every surface in animated orange gradients, literal sun rays, glass cards, and oversized serif slogans.” This is prohibited drift because it spends the primary color decoratively, adds ambient motion, and weakens product clarity.

## Final validation

Before completion, verify marketing, authentication, onboarding, dashboard, table, form, settings, and state surfaces. Verify loading, empty, filtered empty, error, success, disabled, invalid, and destructive states. Test desktop and mobile viewports, 320px reflow, 200 percent page zoom, both color schemes, forced colors, and reduced motion.

Exercise every applicable component with keyboard, pointer, and assistive technology. Confirm default, hover, focus visible, active, selected, disabled, loading, success, error, invalid, and destructive interactions. Measure text, control, border, status, meaningful graphic, and focus contrast. Confirm that radiant windows remain purposeful, burnt orange remains reserved, editorial type never obscures function, tables retain context on narrow screens, and no supplied behavior or content was invented.

Confirm the React or Next.js, Tailwind CSS v4, and shadcn/ui mapping. Do not mark the implementation complete until every required surface, state, viewport class, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation under WCAG 2.2 Level AA has been verified.

## Final validation checklist

Use the preceding validation direction as the release checklist. Complete every named surface, state, viewport, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation before shipping.
