# Editorial validation guidance

Validate representative marketing, authentication, onboarding, dashboard, article or content detail, table, form, settings, loading, empty, error, success, disabled, and destructive screens.

- Run structure, type, lint, and application tests in the Project.
- Use an automated accessibility engine on every reference screen, then manually verify landmarks, heading outline, accessible names, descriptions, keyboard paths, focus order, focus visibility, link identification, and media alternatives.
- Test desktop at 1440×900 and mobile at 390×844 in light and dark modes.
- Test reflow at 320 CSS pixels, text resizing to 200%, and zoom to 400%; isolate and label intentionally scrollable data regions.
- Confirm marginal metadata follows a sensible source order when columns collapse.
- Test `prefers-reduced-motion: reduce`, forced colors, and disabled smooth scrolling.
- Measure text, controls, links, focus, rules, and meaningful graphics against WCAG 2.2 Level AA.
- Compare against Foundation: reject a result that only changes color or font while retaining its centered grid, density, radii, and component rhythm.
- Human review must confirm editorial hierarchy, consistent warm restraint, responsive reading decisions, rights, and that no product behavior or copy was invented.
