# Cabinet Design System

## Identity and intended fit

Cabinet is the Design System name. Its intended fit is digital archives, research libraries, media catalogs, documentation collections, educational products, cultural institutions, portfolios, and knowledge tools where individual records deserve context and room to be examined. It makes a product experience feel considered, humane, and quietly authoritative.

Cabinet is unsuitable for dense trading terminals, rapid dispatch consoles, arcade entertainment, aggressively promotional commerce, or products whose main value is constant live activity. Use it when browsing, comparing, reading, and returning to a collection matter more than watching a dashboard pulse.

The system preserves supplied behavior, information architecture, permissions, domain terms, and content. It directs hierarchy, composition, and interaction without inventing records, claims, provenance, or editorial copy.

## Principles and system signature

Cabinet's system signature is the specimen field: a broad paper like plane where one editorial note, a precise rule, and a small register of objects create hierarchy without surrounding every item with a card. Serif headings establish chapters, a plain sans voice carries explanation, compact labels identify records, and a single vermilion primary cue marks the path forward.

1. **Principle: give the record air.** Isolate important objects and decisions with generous negative space so their relationships remain legible.
2. **Principle: attach the caption.** Keep title, type, provenance, state, and action close to the record they explain.
3. **Principle: let rules organize.** Use alignment, hairlines, and section rhythm before containers, shadows, or decorative surfaces.
4. **Principle: reserve color for wayfinding.** Spend the primary cue on links, current selection, focus, and decisive action rather than decoration.
5. **Principle: complete the collection.** Design loading, empty, error, success, disabled, destructive, narrow screen, and reduced motion states as part of the same calm register.

The recognizable Cabinet combination is warm neutral paper, near black ink, editorial serif display type, direct sans body text, small tracked labels, square geometry, fine rules, flat surfaces, expansive vertical rhythm, and one vermilion cue. Avoid nostalgic computer ornament, distressed paper effects, decorative stamps, imitation artifacts, torn edges, generic masonry galleries, floating card clouds, and ornamental museum staging.

## Semantic color

Cabinet defines complete light and dark color schemes through semantic roles. The required roles are background, foreground, card, muted, muted foreground, border, primary, primary foreground, destructive, success, warning, info, and focus ring. Their usage creates hierarchy: background is the open collection field, card is a bounded reading or working surface, muted separates supporting records, border establishes registers, and primary identifies a destination or current decision.

Light mode uses warm paper background with dark umber foreground. Card is a clean ivory sheet, muted is a deeper paper step, and border is a visible archival rule. Primary is a dark vermilion that supports white primary foreground. Dark mode uses deep brown black background, warm pale foreground, and a coral vermilion primary with a dark primary foreground. Dark mode must preserve surface distinction and must not become a simple inversion.

Destructive names irreversible loss. Success confirms verified completion. Warning signals attention without failure. Info explains neutral context. The primary role never substitutes for status. Every status pairs color with text, an icon, or structure. Normal text must meet 4.5:1 contrast. Large text, controls, meaningful graphics, and the focus ring must meet 3:1 against adjacent colors. Test muted foreground on background, card, and muted surfaces in both schemes.

```css
:root {
	--cabinet-background: #f7f3eb;
	--cabinet-foreground: #1d1915;
	--cabinet-card: #fffdf8;
	--cabinet-muted: #ebe5da;
	--cabinet-muted-foreground: #625a50;
	--cabinet-border: #bdb4a5;
	--cabinet-primary: #9e2d17;
	--cabinet-primary-foreground: #ffffff;
	--cabinet-destructive: #9f2636;
	--cabinet-success: #37643b;
	--cabinet-warning: #765400;
	--cabinet-info: #365f7b;
	--cabinet-ring: #a8321b;
}

.dark {
	--cabinet-background: #171410;
	--cabinet-foreground: #f4eee4;
	--cabinet-card: #211d18;
	--cabinet-muted: #2c2721;
	--cabinet-muted-foreground: #c4baac;
	--cabinet-border: #5a5248;
	--cabinet-primary: #ff8066;
	--cabinet-primary-foreground: #27100a;
	--cabinet-destructive: #ff8792;
	--cabinet-success: #8fc692;
	--cabinet-warning: #e3bc65;
	--cabinet-info: #91bdd8;
	--cabinet-ring: #ff8066;
}
```

## Typography

Typography uses three clear voices. Display is an editorial serif for page titles, collection chapters, major record names, and meaningful statements. Body is a neutral humanist sans for explanations, navigation, controls, forms, and long reading. Label is the same sans in a compact size with modest positive tracking for categories, counts, dates, and metadata. Code is a monospace reserved for identifiers, commands, checksums, and machine values.

Display begins at 40px on mobile and grows responsively to 72px on wide screens, with weight 500 to 600, line height from 0.98 to 1.08, and tracking from minus 0.035em to minus 0.015em. Section headings use 28px to 44px. Body uses 15px to 17px, weight 400, and line height from 1.55 to 1.7. Label uses 11px to 13px, weight 600, line height 1.35, and tracking from 0.06em to 0.12em. Code uses 12px to 14px with line height 1.5.

Use sentence case for interface copy. Uppercase may appear only through styling on short labels, never in authored content. Allow natural wrapping, balance only short display statements, and do not use manual line breaks to force desktop composition. Responsive type must shrink before it clips. Keep prose between 55 and 72 characters and use tabular numerals for counts and dates.

## Spacing and density

The base spacing unit is 4px. The working scale is 4, 8, 12, 16, 24, 32, 48, 64, 96, and 128px. Compact metadata may use 4 to 8px. Controls and record internals use 12 to 24px. Section transitions use 48 to 96px. Major collection chapters may use 96 to 128px when the content remains connected.

Default density is spacious for browsing and balanced for forms, tables, and settings. Controls are 44px tall, with a 36px compact variant only where the complete hit area remains at least 44px on touch surfaces. Content rhythm alternates a concise editorial note with a more open record field. Grouping comes from alignment, proximity, captions, and hairlines before card boundaries. Never add empty space that separates an object from its label or action.

## Responsive layout

Use content driven transitions with reference breakpoints rather than designing fixed screenshots. The content width is 88rem for collection fields and 42rem for sustained reading. A twelve column desktop grid becomes a six column tablet grid and one mobile column. Gutters are 32px on desktop, 24px on tablet, and 16px on mobile.

- **Desktop at 1024px and wider:** keep navigation in a restrained top row or slim rail. Place editorial context across four to five columns and the record field across the remaining columns. Two or three records may share a row when their captions remain attached.
- **Tablet from 768px to 1023px:** reduce the grid before reducing text. Keep a note beside one featured record only when both retain useful measure. Move secondary navigation into an explicit menu.
- **Mobile below 768px:** use one source ordered column. Put a caption immediately after its object, let actions span the available width when useful, and convert wide comparison tables into labelled records or an explicitly scrollable region.
- At 200 percent zoom and 320 CSS pixels, reflow without page level horizontal overflow. Preserve intrinsic media proportions, wrap metadata, and keep navigation, labels, and recovery actions visible.

## Components and interaction states

Component geometry is square to softly rounded: 0 to 2px for rules and compact controls, 4px for fields and buttons, and 6px for dialogs or bounded reading panels. Behavior should feel direct and quiet. Use flat surfaces by default, a shallow shadow only for a dialog or temporary menu, and never use elevation as the sole sign of interaction.

- **Button:** use one filled primary button per decision region. Secondary buttons use a border, and tertiary actions behave as links. Keep result focused labels. Hover deepens color without movement. Active may translate by one pixel at most.
- **Link:** underline links in prose and record captions. Navigation links may use a primary rule or text cue. The accessible name must describe the destination.
- **Input, text area, select, and checkbox:** keep visible labels, persistent help, and stable space for invalid feedback. Fields use card background and defined borders. Selected options use both a primary cue and a check or text state.
- **Navigation:** expose the current collection or chapter with text and `aria-current`. Preserve source order and make overflow explicit rather than silently clipping items.
- **Card:** use a card only when a record needs a bounded action or independent background. Ordinary specimens should remain unboxed in the open field.
- **Dialog and menu:** trap focus only in modal dialogs, support Escape when cancellation is safe, restore focus to the opener, and keep menus close to their trigger.
- **Table:** provide a caption, semantic headers, readable row labels, and keyboard reachable actions. Use rules between logical groups rather than striping every row.
- **Feedback:** place status beside the affected record and announce asynchronous results intentionally.

Every interactive component needs complete default, hover, visible focus, active, selected, disabled, loading, success, error, invalid, and destructive states where applicable. Disabled controls stay readable and explain the missing condition. Focus uses a 2px semantic ring with at least 2px offset. Destructive actions repeat the named object, consequence, and true recovery status before confirmation.

## Product surfaces

Cabinet applies one coherent collection logic across marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces. Each surface pairs concise context with records, keeps captions and actions attached, and preserves supplied product behavior.

### Marketing

Lead with one editorial statement, one clear action, and a small credibility register. Follow with thematic chapters that alternate concise context and real product evidence. Use supplied images, records, and metrics only. Pricing must state billing period, renewal, cancellation, and refund terms beside the decision.

### Authentication and onboarding

Place authentication in a narrow reading column with a clear heading, persistent labels, recovery, and trust context. Onboarding reads as a short catalog sequence: show current step, completed work, optional sections, safe backtracking, and a visible finish.

### Dashboard and table

Make the dashboard a collection overview rather than a mosaic of unrelated metrics. Lead with recent, important, or unresolved records and explain the organizing principle. A table keeps title, state, owner, date, and action aligned. On narrow screens, preserve complete comparison through labelled records or controlled overflow.

### Form and settings

Group a form by the record being described, with `fieldset` and `legend` where appropriate. Keep dirty, saving, saved, conflict, and failed states in a stable position. Settings name whether a value applies to the person, workspace, or organization. Separate destructive settings with an explicit rule and consequence.

### State surfaces

Loading, empty, filtered empty, error, success, disabled, and destructive state surfaces retain the surrounding collection structure. State copy names what is affected and provides a recovery action or next valid action.

## Feedback states

- **Loading:** preserve a stable layout with quiet blocks matching the eventual object and caption. Label longer operations and report determinate progress when known.
- **Empty:** name the absent collection, explain its purpose, and offer the first valid action. A filtered empty result includes a clear reset.
- **Error:** identify the failed operation and affected record, preserve entered content, and provide a recovery action without blame.
- **Success:** confirm the named outcome beside its record. Use a toast only when the originating context remains visible.
- **Disabled:** state the unmet prerequisite near the unavailable action rather than relying on opacity.
- **Destructive:** repeat the record name, consequence, scope, and recovery truth before confirmation.

Status regions must keep a stable layout as copy changes. Do not remove useful existing records while a refresh or mutation is pending.

## Motion

Motion supports continuity and orientation, never atmosphere. Feedback duration is 120ms, ordinary transition duration is 180ms, and spatial movement duration is 240ms. Easing uses ease out for enter, ease in for exit, and ease in out for rearrangement. Spatial movement is limited to 6px with scale beginning no lower than 0.985.

Use a short fade and translation when a record enters or changes position, while keeping its caption attached. Preserve continuity by animating from the previous location only when the relationship remains obvious. Do not autoplay carousels, ambient loops, or decorative scans. Under reduced motion, remove translation, scaling, smooth scrolling, and nonessential fades; state changes become instant and remain explicitly labelled.

## Accessibility

Target WCAG 2.2 Level AA. Use native semantics through landmarks, headings, lists, buttons, links, forms, dialogs, and tables before ARIA. Every control and meaningful graphic needs an accessible name. Keep all browsing, filtering, selection, menus, overflow regions, and dialogs keyboard operable in logical source order.

Provide visible focus in both color schemes and forced colors. Maintain measured contrast for text, controls, boundaries, status, and focus. Pointer target size is at least 24 by 24 CSS pixels with adequate spacing, with 44 by 44 preferred on touch surfaces. Support 200 percent page zoom, 400 percent browser zoom, and reflow at 320 CSS pixels without loss of content or two dimensional page scrolling.

Error identification combines a summary when useful with field level messages and instructions for correction. Send deliberate loading and outcome announcements to assistive technology without repeating static content. Never rely on color, position, shape, or motion alone. Honor reduced motion and preserve the same information when motion is removed.

## Supported stack

Cabinet targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Map each semantic token to the Project's theme layer and express geometry through shared variables. Extend shadcn/ui with component variants for specimen, caption, editorial, compact, selected, and destructive treatments rather than duplicating component source.

Keep document structure semantic in React, keep server rendering safe in Next.js, and use CSS for responsive composition. Do not add a dependency when native HTML, existing Project code, Tailwind CSS v4, or a shadcn/ui primitive already solves the need. This document supplies direction, not executable installation steps.

## Agent examples

**Good request:** “Build a searchable oral history archive with a featured record, compact captions, filters, and complete empty and error states using Cabinet.” This is faithful because it applies the specimen field, editorial hierarchy, and attached metadata to supplied content.

**Good request:** “Restyle this research library in Cabinet while preserving its routes, filters, permissions, and copy.” This is faithful because the system changes presentation without inventing product behavior.

**Bad request:** “Recreate a particular collection page exactly, including its branding, artifacts, layout, and copy.” This asks for replication rather than an original Cabinet implementation.

**Bad request:** “Make every panel vermilion and turn the catalog into a dense grid of floating cards.” This is prohibited drift because it spends the primary cue decoratively and erases the specimen field.

## Final validation

Before completion, confirm every required surface: marketing, authentication, onboarding, dashboard, table, form, settings, and state surfaces. Confirm loading, empty, filtered empty, error, success, disabled, invalid, and destructive states. Test desktop and mobile viewports, 320px reflow, 200 percent page zoom, both color schemes, forced colors, and reduced motion.

Verify every component interaction with keyboard, pointer, and assistive technology where applicable. Measure text, control, status, border, and focus contrast. Confirm that record captions stay attached, primary color remains reserved for wayfinding, and no supplied behavior or content was invented. Confirm the React or Next.js, Tailwind CSS v4, and shadcn/ui stack direction and all WCAG 2.2 Level AA accessibility obligations before shipping.

## Final validation checklist

Use the preceding validation direction as the release checklist. Do not mark the implementation complete until every named surface, state, viewport, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation has been verified.
