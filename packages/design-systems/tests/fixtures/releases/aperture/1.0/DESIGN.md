# Aperture Design System

## Identity and intended fit

Aperture is a calm, luminous direction for analytical products. It uses clear framing, measured contrast, and precise status color so dense information remains approachable.

## Principles and signature

1. Frame the decision before presenting detail.
2. Use light as hierarchy, never as decoration.
3. Keep status meaning visible in text and color.

## Semantic color

Light and dark modes use semantic background, foreground, card, muted, border, primary, destructive, success, warning, information, and focus ring roles. Every role must preserve WCAG 2.2 Level AA contrast.

## Typography, spacing, and responsive layout

Use a balanced sans scale, compact labels, and spacious section rhythm. Reflow from multi column layouts to one reading column at narrow widths without hiding actions or content.

## Components and interaction states

Compose React or Next.js interfaces from shadcn/ui primitives and Tailwind CSS v4 utilities. Every control defines default, hover, focus visible, active, disabled, loading, error, success, and destructive states.

## Product surfaces

Apply the same hierarchy to marketing, authentication, onboarding, dashboard, table, form, settings, loading, empty, error, and success surfaces.

## Motion and accessibility

Motion explains spatial change, remains brief, and stops when reduced motion is requested. Preserve keyboard access, visible focus, semantic structure, zoom, reflow, and assistive technology names.

## Agent examples

Good request: Build an analytical dashboard that frames the primary decision, keeps filters keyboard accessible, and provides complete loading, empty, error, and success states.

Bad request: Copy a distinctive existing analytics product or use color alone to communicate status.

## Final validation checklist

- Confirm React or Next.js, Tailwind CSS v4, and shadcn/ui compatibility.
- Confirm light and dark semantic color roles meet WCAG 2.2 Level AA.
- Confirm every interaction and feedback state is represented.
- Confirm mobile reflow and reduced motion behavior.
- Confirm the result expresses Aperture without copying a third party product.
