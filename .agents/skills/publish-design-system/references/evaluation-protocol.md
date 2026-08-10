# Design System Evaluation protocol

The isolated evaluation Project is disposable evidence producing infrastructure. It is not a Published Design System, Official Catalog source, or production source. Keep it outside `packages/design-systems/releases` and do not modify the candidate.

## Required reference screens

Generate marketing, authentication, onboarding, dashboard, table, form, settings, and general state screens. General states include loading, empty, error, success, disabled, and destructive behavior. Every screen must follow the copied Design Contract rather than the Design Reference or candidate metadata.

## Required coverage

Exercise 1440 by 900 desktop and 390 by 844 mobile viewports, light and dark color schemes, and reduced motion. Perform every independent agent generation run declared in the evaluation state. A later run may receive the same product requirements, but it must not receive another run's generated implementation or transcript.

## Automated checks

Run all four checks against the generated implementation:

1. Structure checks semantic document structure, heading order, landmarks, accessible names, and expected screen and state coverage.
2. Accessibility checks the configured WCAG 2.2 Level A and AA rules and preserves the complete machine report.
3. Responsive overflow checks both required viewports, zoom and reflow where supported, and unexpected horizontal overflow.
4. Color contrast checks text, controls, focus indicators, and meaningful graphics in light and dark schemes.

Write raw command output or a raw structured report to a regular file inside the isolated Project. Evidence paths must be relative, cannot traverse outside the Project, and cannot point at `DESIGN.md` or workflow state. Recording a result pins the evidence digest. Any later evidence change blocks proposal preparation. A failed check is terminal for this evaluation. Do not overwrite it with a later pass.
