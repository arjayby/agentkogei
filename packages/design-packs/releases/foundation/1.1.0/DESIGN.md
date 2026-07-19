# Foundation Interface System

Foundation is a neutral, crisp, highly legible Interface System for B2B software. It should make complex work feel calm and obvious without imposing a brand personality on the product. Apply this direction to marketing, authentication, onboarding, and application surfaces; do not use it to invent workflows, information architecture, business rules, or product copy.

## Principles

1. **Clarity before character.** Hierarchy comes from space, type, and contrast—not decoration.
2. **Quiet surfaces, decisive actions.** Most surfaces recede; primary actions and current state remain unmistakable.
3. **Density with breathing room.** Keep information compact enough for work while separating decisions into scannable groups.
4. **One system in every mode.** Mobile, dark mode, loading, and error states must feel designed, not appended.
5. **Accessible by construction.** Semantics, focus, target size, contrast, zoom, and reduced motion are baseline requirements.

## Semantic tokens

Use semantic roles from `tokens.css`; never bind product meaning directly to a raw color. The canvas is slightly cool and quiet, panels are distinct by border before shadow, text has three intentional levels, and accent is reserved for interactive emphasis. Maintain at least 4.5:1 contrast for normal text and 3:1 for large text, controls, focus indicators, and meaningful graphics. Status must combine color with text or an icon.

Typography uses a modern system sans stack. Body text is 14–16px with 1.5–1.65 line height. Use 12–13px labels sparingly and never below 12px. Headings are medium weight with tight but readable tracking. Use tabular numerals for metrics and monospace only for machine identifiers, commands, and code.

Spacing follows a 4px base. Prefer 8, 12, 16, 24, 32, 48, and 64px. A control is normally 40px tall; dense tables may use 36px rows while retaining a 44px minimum touch target through padding or the hit area. Corners are modest: 6px for compact controls, 8px for cards, and 12px for large panels.

## Layout and responsiveness

Keep reading measures between 60 and 75 characters. Marketing sections use a centered 72rem maximum; application shells may reach 90rem. Align major surfaces to one grid and avoid nested cards when spacing and a divider are enough.

- **Desktop (1024px and wider):** persistent navigation may sit beside a flexible content column. Keep primary actions near the page title.
- **Tablet (768–1023px):** collapse secondary rails and reduce multi-column groups before shrinking controls.
- **Mobile (below 768px):** use one content column, preserve source order, make primary actions full-width when useful, and turn wide tables into labelled records or horizontal regions with an explicit affordance.
- At 200% zoom and 320 CSS pixels, no page-level horizontal scrolling is allowed except for intentionally scrollable data regions.

## Product surfaces

### Marketing and pricing

Lead with one outcome, a short explanation, and one primary action. Use proof, capability groups, and terms in that order. Pricing must state billing period, eligibility, renewal, cancellation, and refund terms beside the decision. Avoid decorative dashboards that imply unsupported functionality.

### Authentication and onboarding

Use a narrow, single-purpose panel with an explicit heading. Labels remain visible; placeholders are examples, not labels. Put validation beside the field and summarize submission errors at the top. Onboarding shows progress, permits safe backtracking, and distinguishes required from optional steps.

### Dashboard and product UI

Start with the Builder's current task, not decorative metrics. Summary cards answer a specific question. Tables have a caption or nearby heading, labelled columns, keyboard-reachable row actions, and useful empty and loading states. Forms group related fields with `fieldset` and `legend` where appropriate. Settings state scope and consequence before destructive actions.

## Components and interaction states

Follow the anatomy in `components.md`. Every interactive component needs default, hover, focus-visible, active, disabled, loading, error, and success behavior where those states apply. Destructive actions use direct language and require confirmation when the consequence is difficult to reverse. Do not communicate disabled explanations through color alone; keep help text visible.

Focus indicators are a 2px semantic ring with at least 2px offset and must never be removed. Keyboard order follows the visual and reading order. Pointer targets are at least 24 by 24 CSS pixels under WCAG 2.2, with 44 by 44 preferred for primary mobile actions.

## Feedback states

- **Loading:** preserve the eventual layout, label long operations, and use indeterminate motion only when progress cannot be measured.
- **Empty:** name what is empty, explain why it matters, and offer the next valid action. A filtered-empty state must offer a reset.
- **Error:** state what failed, preserve entered data, and provide recovery. Never expose stack traces or blame the Builder.
- **Success:** confirm the completed outcome close to the action; use a toast only when the originating context remains visible.
- **Disabled:** use only when an action cannot currently succeed, and explain the prerequisite.
- **Destructive:** identify the affected object and whether recovery exists.

## Motion

Motion explains continuity and feedback. Use 120–180ms for local control feedback and 180–240ms for panels. Prefer opacity and transform; avoid layout animation. Do not autoplay decorative motion. Under `prefers-reduced-motion: reduce`, remove parallax, continuous movement, and nonessential transforms, and make state changes immediate or use a short crossfade.

## Accessibility

Use native HTML semantics before ARIA. Each page has one primary heading and landmarks with unique labels where repeated. Every control has an accessible name; every input has a programmatic label and associated error. Images have useful alternative text or empty alt text when decorative. Announce asynchronous status through an appropriate live region without stealing focus. Support keyboard-only use, 400% text zoom, reflow at 320 CSS pixels, forced colors, light and dark color schemes, and reduced motion.

## Agent instructions

### Do

- Use semantic tokens and existing shadcn/ui primitives before creating a component.
- Compose pages from clear landmarks, headings, Cards, Tables, Fields, Alerts, and Empty states.
- Write the empty, loading, error, success, disabled, and destructive variants while designing the happy path.
- Verify mobile source order, keyboard order, focus visibility, light/dark contrast, and reduced motion.
- Keep product-specific language and workflows supplied by the Project.

### Do not

- Do not invent brand colors, gradients, glass effects, or dramatic shadows to make a screen feel “designed.”
- Do not use color, icon position, or placeholder text as the only carrier of meaning.
- Do not hide core actions behind hover, rely on desktop-only layouts, or shrink type below the stated scale.
- Do not prescribe navigation, domain objects, permissions, billing logic, or marketing claims.
- Do not add installation scripts, runtime dependencies, tracking, or remote assets.

## Final validation checklist

- [ ] All four required surfaces are represented and share the same hierarchy, tokens, and component anatomy.
- [ ] Responsive layouts work at 320, 390, 768, 1024, and 1440 CSS pixels without unintended overflow.
- [ ] Light, dark, forced-colors, and reduced-motion modes remain understandable.
- [ ] Keyboard navigation, focus order, focus visibility, labels, status announcements, and errors are complete.
- [ ] Normal text, large text, controls, focus indicators, and meaningful graphics meet WCAG 2.2 AA contrast.
- [ ] Loading, empty, error, success, disabled, and destructive states are present where applicable.
- [ ] No product workflow, information architecture, business logic, or final copy was invented by the Interface System.
- [ ] The implementation follows `adapters/react-tailwind-shadcn/README.md` and passes `validation.md`.
