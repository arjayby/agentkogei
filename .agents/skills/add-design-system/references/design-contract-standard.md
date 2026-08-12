# Design Contract standard

Write `DESIGN.md` as an inert, self contained Design Contract. It must stand alone after Installation. Do not mention metadata, evaluation evidence, Design References, scripts, hooks, remote imports, or supporting resources. Label every fenced block CSS or SVG.

Use every heading below exactly once. Give concrete, agent executable direction beneath each heading.

## Identity and intended fit

Define the Design System name, product fit, unsuitable uses, and the experience it creates.

## Principles and system signature

Define three to five principles as Markdown list items and one original signature that can recur across product surfaces without becoming decoration.

## Semantic color

Define light and dark semantic roles for background, foreground, card, muted, muted foreground, border, primary, primary foreground, destructive, success, warning, info, and focus ring. Explain contrast, hierarchy, and usage.

## Typography

Define display, body, label, and code roles, weights, line heights, tracking, wrapping, and a responsive type scale.

## Spacing and density

Define the base spacing unit, scale, control heights, content rhythm, grouping, and density rules.

## Responsive layout

Define mobile, tablet, and desktop behavior, breakpoints or content driven transitions, content widths, grids, navigation changes, reflow, and overflow handling.

## Components and interaction states

Define geometry and behavior for buttons, links, inputs, text areas, selects, checkboxes, navigation, cards, dialogs, menus, tables, and feedback components. Cover default, hover, focus visible, active, selected, disabled, invalid, and destructive interactions.

## Product surfaces

Apply the system to marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces.

## Feedback states

Define loading, empty, error, success, disabled, and destructive states with recovery actions and stable layouts.

## Motion

Define duration, easing, spatial movement, enter and exit behavior, continuity, and a reduced motion alternative.

## Accessibility

Target WCAG 2.2 Level AA. Define keyboard access, visible focus, semantics, accessible names, contrast, target size, zoom, reflow, error identification, assistive technology behavior, and reduced motion.

## Supported stack

Target React or Next.js, Tailwind CSS v4, and shadcn/ui. Explain how semantic tokens and component variants map to that stack without executable installation steps.

## Agent examples

Give at least one good Builder request and one bad request. Show faithful use of the system and prohibited visual drift without pointing back to the Design Reference.

## Final validation

Provide a checklist covering every required surface, state, viewport class, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation.
