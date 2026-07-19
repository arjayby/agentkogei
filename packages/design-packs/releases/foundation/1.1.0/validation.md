# Foundation validation guidance

Validate representative marketing, authentication, onboarding, dashboard, table, form, settings, loading, empty, error, success, disabled, and destructive screens.

- Run structure, type, lint, and application tests in the Project.
- Use an automated accessibility engine on every reference screen, then manually verify headings, landmarks, names, descriptions, keyboard paths, focus order, and focus visibility.
- Test desktop at 1440×900 and mobile at 390×844 in light and dark modes.
- Test reflow at 320 CSS pixels and text resizing to 200%; isolate intentionally scrollable data regions.
- Test `prefers-reduced-motion: reduce`, forced colors, and 400% zoom where the workflow permits.
- Measure text, control, focus, and meaningful-graphic contrast against WCAG 2.2 Level AA.
- Human review must confirm hierarchy, consistency, responsive decisions, and that no product behavior was invented.
