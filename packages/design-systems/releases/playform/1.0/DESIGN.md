# Playform Design System

## Identity and intended fit

Playform is the Design System name. Its intended fit is collaborative SaaS, creative tools, education products, workflow builders, community platforms, approachable business software, and products that turn complex work into something tangible. The experience feels optimistic, capable, and tactile without becoming childish or visually noisy.

Playform is unsuitable for solemn institutional records, austere luxury, high frequency trading, emergency operations, dense code environments, or products where decoration would compete with urgent decisions. Do not use it when strict compression or severe formality is the primary requirement.

Preserve supplied behavior, information architecture, permissions, data, domain terms, and copy. Playform changes hierarchy and expression without inventing product identity, claims, metrics, or workflows.

## Principles and system signature

Playform's system signature is the form orbit: one useful object sits at the center while two or three softly rounded forms show context, progress, or possibility around it. Use the orbit for page introductions, empty states, onboarding milestones, and section transitions. Keep it structural and sparse. It must never become a field of decorative blobs.

- **Principle: make the next move obvious.** Lead with one plain statement and one ranked action before presenting supporting detail.
- **Principle: turn systems into objects.** Give related work a tangible boundary, label, state, and place in the composition.
- **Principle: pair rigor with delight.** Keep semantics, data, and controls precise while allowing color, scale, and geometry to feel welcoming.
- **Principle: spend color with intent.** Reserve cobalt primary for action and orientation, then use citrus and status roles only for distinct meaning.
- **Principle: let the field breathe.** Use generous ivory space, strong alignment, and large rounded frames instead of card clutter.

The recognizable Playform combination is a warm ivory field, near black type, vivid cobalt actions, citrus highlights, confident grotesk display type, humanist body text, compact mono labels, broad rounded section frames, dark anchored controls, simple dimensional forms, and asymmetrical layouts that remain easy to scan. Avoid glossy character illustration, rainbow confetti, clay texture, inflated letterforms, ornamental gradients, floating product screenshots, glass panels, or copied brand motifs.

## Semantic color

Playform defines complete light and dark schemes with semantic roles. Background is the open field. Foreground carries essential reading. Card contains a single useful object or task. Muted separates supporting regions. Muted foreground carries explanation and metadata. Border makes controls and bounded objects legible. Primary identifies the next action, current path, and selected state. Primary foreground is the text or icon on primary. Destructive identifies irreversible loss. Success confirms a completed outcome. Warning marks a condition needing attention. Info carries neutral guidance. Focus ring makes keyboard focus persistent.

Light mode uses warm ivory, white cards, charcoal text, cobalt primary, and restrained citrus highlights. Dark mode uses blue black, lifted slate cards, pale neutral text, and a lighter cobalt primary. Dark surfaces keep their own hierarchy rather than inverting light values.

This hierarchy and usage are mandatory. Normal text must meet 4.5 to 1 contrast. Large text, meaningful graphics, control boundaries, and focus indicators must meet 3 to 1 against adjacent colors. Test every status role on background, card, and muted surfaces in both color schemes. Never use primary for destructive, warning, success, or info. Pair status color with text, icon, or structure.

```css
:root {
	--playform-background: #f7f5ef;
	--playform-foreground: #171614;
	--playform-card: #ffffff;
	--playform-muted: #ebe9e1;
	--playform-muted-foreground: #625f58;
	--playform-border: #8c8880;
	--playform-primary: #3157f5;
	--playform-primary-foreground: #ffffff;
	--playform-destructive: #b4233f;
	--playform-success: #267044;
	--playform-warning: #765400;
	--playform-info: #135d89;
	--playform-ring: #3157f5;
	--playform-citrus: #d9e72d;
}

.dark {
	--playform-background: #121722;
	--playform-foreground: #f8f7f2;
	--playform-card: #1c2330;
	--playform-muted: #283140;
	--playform-muted-foreground: #bec6d2;
	--playform-border: #707b8e;
	--playform-primary: #8198ff;
	--playform-primary-foreground: #101520;
	--playform-destructive: #ff91a5;
	--playform-success: #78d8a4;
	--playform-warning: #efc763;
	--playform-info: #7bcaf1;
	--playform-ring: #9aabff;
	--playform-citrus: #dbe96a;
}
```

## Typography

Display uses a confident neo grotesk for product promises, page titles, section statements, and large values. Body uses a warm humanist sans for explanation, navigation, controls, and sustained reading. Label uses a technical mono for short categories, steps, status, dates, units, and compact metadata. Code uses the same mono only for commands, machine values, and source text.

Display ranges from 44px on mobile to 88px on wide desktop, weight 600, line height from 0.94 to 1.04, and tracking from minus 0.055em to minus 0.03em. Section headings range from 28px to 48px. Body uses 16px to 18px, weight 400, line height from 1.5 to 1.65, and neutral tracking. Labels use 11px to 13px, weight 600, line height 1.4, and tracking from 0.08em to 0.16em. Code uses 12px to 14px with line height 1.5.

Use sentence case for interface copy. Uppercase is reserved for brief labels, never paragraphs or control text. Balance only short display lines. Allow natural wrapping everywhere else and never encode desktop line breaks in source content. Keep sustained reading between 52 and 70 characters. Responsive type must shrink before it clips or leaves a single orphaned word. Use tabular numerals for quantities, dates, and progress.

## Spacing and density

The base spacing unit is 4px. Use the scale 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, and 160px. Compact object details use 4 to 12px. Controls use 12 to 20px internally. Cards use 24 to 40px. Section frames use 48 to 96px. A single marketing introduction may use 128 to 160px when the action remains discoverable.

Default density is spacious. Primary controls are 48px tall. Compact controls may be 40px when their complete touch target remains at least 44px. Table rows are 52px by default and may compress to 44px for repeated expert work. Content rhythm alternates large declarative moments, useful objects, and calm explanatory bands. Grouping comes from proximity, a shared rounded frame, or alignment before borders. Avoid nested cards and avoid turning every sentence into a separate object.

## Responsive layout

Use content driven transitions with reference breakpoints. Maximum content width is 90rem. Sustained reading measure is 66 characters. A twelve column desktop grid becomes a six column tablet grid and one mobile column. Gutters are 40px on desktop, 24px on tablet, and 16px on mobile.

- **Desktop at 1120px and wider:** keep primary navigation visible, place the main statement across six to eight columns, and align its supporting action or object within the remaining columns. Alternate centered frames with useful asymmetry.
- **Tablet from 768px to 1119px:** collapse secondary navigation, reduce empty space before reducing clarity, and move supporting objects beneath the main statement when their width becomes awkward.
- **Mobile below 768px:** use one source ordered column, replace full navigation with a labelled menu trigger, make primary actions full width when useful, and simplify form orbits to one central object plus one contextual form.
- At 200 percent zoom and 320 CSS pixels, reflow without page level horizontal overflow. Wide tables may use a labelled, keyboard reachable overflow region with a visible cue. Preserve row headings and provide an alternate stacked view when comparison is not essential.

Navigation, headings, controls, and status remain in logical source order at every viewport. Never hide necessary content merely to preserve an illustration or asymmetrical composition.

## Components and interaction states

Geometry is rounded and substantial. Use 10px for compact controls, 14px for standard controls, 20px for cards, and 32px to 48px for major section frames. Borders are defined on controls and quiet on large surfaces. Elevation is layered but restrained, with one soft shadow for menus, dialogs, draggable objects, or a singular focal card.

- **Button:** use one filled cobalt primary button per decision region. Secondary buttons use a warm muted surface or a defined border. Quiet actions use text and a directional cue. Hover deepens color without movement. Active may compress by one pixel without shifting layout.
- **Link:** underline links in prose. Navigation links use text plus `aria-current` or a visible current marker. Accessible names describe the destination.
- **Input, text area, select, and checkbox:** retain visible labels and persistent help. Fields use card background, a clear border, and generous control height. Invalid state reserves stable space for a specific correction. Selected state pairs color with a check, value, or explicit text.
- **Navigation:** show the current destination in text and structure. Mobile menus open from a labelled button, support Escape, retain logical order, and restore focus.
- **Card:** contain one useful object, task, or proof set. Use a complete heading relationship. A card must not exist only to add rounded corners.
- **Dialog and menu:** dialogs name their purpose, trap focus, provide safe cancellation, and restore focus to the opener. Menus stay close to their trigger and support expected keyboard behavior.
- **Table:** provide a caption, semantic headers, readable row labels, tabular numerals, and keyboard reachable actions. Use spacing and rules before decorative striping.
- **Feedback:** place status beside the affected object or action and announce meaningful asynchronous outcomes deliberately.

Every applicable component needs default, hover, focus visible, active, selected, disabled, loading, success, error, invalid, and destructive states. Disabled controls remain legible and explain the unmet condition. Focus uses a 2px semantic ring with at least 2px offset. Destructive confirmation repeats the named object, scope, consequence, and true recovery status.

## Product surfaces

Playform applies the same object and frame logic across marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces. Each surface places one useful object at the center, shows context nearby, and keeps the next action unmistakable.

Marketing leads with one plain outcome, concise explanation, and one ranked action inside a generous rounded frame. Follow with varied proof objects and capability bands using only supplied claims. Authentication uses one quiet task card, persistent labels, recovery, trust context, and stable submission feedback. Onboarding uses a short visible sequence where completed, current, optional, and upcoming steps remain explicit.

Dashboard surfaces prioritize current work, progress, or the next decision instead of ornamental totals. A table keeps entity, state, owner, freshness, and actions aligned. Forms group fields by decision with `fieldset` and `legend` where appropriate, while preserving dirty, saving, saved, conflict, and failed states. Settings state whether each value affects the person, workspace, or organization and isolate irreversible actions in a consequence frame.

General state surfaces keep surrounding navigation and hierarchy visible. Loading, empty, filtered empty, error, success, disabled, and destructive states name the affected object and offer a recovery or next valid action.

## Feedback states

- **Loading:** preserve the eventual layout, keep useful data visible, and label operations that last longer than a brief control response.
- **Empty:** name the absent object, explain its purpose, and offer the first valid action. A filtered empty state includes a clear reset.
- **Error:** identify the failed operation and affected object, preserve entered content and useful data, and provide a recovery action.
- **Success:** confirm the named result beside its source action. Use a toast only when the originating context remains visible.
- **Disabled:** explain the unmet condition near the unavailable action and do not rely on low opacity.
- **Destructive:** state the object, scope, consequence, and recovery truth before confirmation.

Maintain a stable layout by reserving space for changing feedback. A pending refresh must not erase useful existing information. Status remains understandable without color, icon, position, shape, or motion.

## Motion

Motion communicates tactility and continuity. Feedback duration is 100ms, ordinary transition duration is 180ms, and spatial movement duration is 260ms. Easing uses ease out for enter, ease in for exit, and ease in out for rearrangement. Limit spatial movement to 8px and scale from no lower than 0.98.

Objects may enter with a short fade and vertical translation when their relationship to the trigger is clear. A form orbit may rotate by no more than six degrees after a completed action, never as an ambient loop. Exits are shorter than entrances. Do not autoplay carousels, bouncing controls, decorative parallax, or looping object motion. Under reduced motion, remove translation, rotation, scaling, smooth scrolling, and nonessential fades. Make state changes instant while retaining labels and focus.

## Accessibility

Target WCAG 2.2 Level AA. Use native semantics through landmarks, headings, lists, buttons, links, forms, dialogs, tables, and status regions before ARIA. Every control and meaningful graphic needs an accessible name. Decorative form orbits are hidden from assistive technology while their meaning appears in text.

Keep all navigation, menus, filtering, selection, sorting, overflow regions, row actions, and dialogs keyboard operable in logical source order. Provide visible focus in light, dark, and forced colors modes. Maintain measured contrast for text, controls, boundaries, status, meaningful graphics, and focus. Minimum target size is 24 by 24 CSS pixels with adequate spacing, with 44 by 44 preferred for important touch actions.

Support 200 percent page zoom, 400 percent browser zoom, and reflow at 320 CSS pixels without loss of content or two dimensional page scrolling. Error identification combines a summary when helpful with field level messages and correction guidance. Announce asynchronous status to assistive technology without stealing focus or repeating static content. Honor reduced motion and preserve the same information when motion is removed.

## Supported stack

Playform targets React or Next.js, Tailwind CSS v4, and shadcn/ui. Map every semantic token into the Project theme layer and expose spacing, radius, border, elevation, and duration through shared variables. Extend shadcn/ui with rounded, framed, object, selected, status, and destructive component variants rather than copying component source.

Keep semantic document structure in React, server rendering safe behavior in Next.js, and responsive composition in CSS. Prefer native HTML, existing Project code, Tailwind CSS v4 utilities, and shadcn/ui primitives before adding a dependency. This Design Contract contains direction and no executable installation steps.

## Agent examples

**Good request for a Builder:** “Build a collaborative campaign planner with a clear next action, tangible work objects, calm progress states, and complete empty and error handling using Playform.” This is faithful because it pairs rigorous workflow structure with confident color and rounded frames.

**Good request for a Builder:** “Restyle this education product in Playform while preserving its routes, permissions, data, and language.” This is faithful because it changes expression without inventing product behavior.

**Bad request for a Builder:** “Copy a recognizable software homepage exactly, including its branding, illustrations, layouts, and claims.” This requests replication rather than an original Playform implementation.

**Bad request for a Builder:** “Fill every screen with glossy blobs, rainbow gradients, bouncing cards, and oversized rounded containers.” This is prohibited drift because it turns purposeful objects and color into decoration.

## Final validation

Before completion, confirm every required surface: marketing, authentication, onboarding, dashboard, table, form, settings, and state surfaces. Confirm loading, empty, filtered empty, error, success, disabled, invalid, and destructive states. Test desktop and mobile viewports, 320px reflow, 200 percent page zoom, both color schemes, forced colors, and reduced motion.

Verify every component interaction with keyboard, pointer, and assistive technology where applicable. Measure text, control, status, border, and focus contrast. Confirm form orbits remain sparse, the primary color stays reserved for action and orientation, and no supplied behavior or content was invented. Confirm the React or Next.js, Tailwind CSS v4, and shadcn/ui stack direction and all WCAG 2.2 Level AA accessibility obligations before shipping.

## Final validation checklist

Use the preceding validation direction as the release checklist. Do not mark the implementation complete until every named surface, state, viewport, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation has been verified.
