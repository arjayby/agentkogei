# Foundation component guidance

## Buttons

Use one primary action per region. Secondary actions are outline or quiet variants; destructive actions use explicit text. Preserve the label while loading, add a progress indicator, and disable duplicate submission. Icon-only buttons require an accessible name and tooltip.

## Cards and panels

A Card groups one decision or related dataset and uses header, title, description, content, and footer when applicable. Prefer a divider or whitespace when a container adds no meaning. Avoid nested Cards.

## Forms

Use visible labels, descriptions before errors, and persistent values after failure. Group related controls with a field group or fieldset. Required state is conveyed in text. Submission errors receive focus only when the Builder must act before continuing.

## Navigation

Mark the current destination semantically. On mobile, preserve access to the primary destinations without horizontal overflow. Breadcrumbs represent hierarchy rather than browser history.

## Tables and lists

Use tables for comparative data and lists for repeated records. Provide headings, meaningful column labels, sorting state, keyboard-reachable row actions, pagination context, and a responsive strategy. Never encode status with color alone.

Pagination names the current range and total when known. Keep previous and next controls in a stable location, preserve active filters while paging, and move focus only when the Builder explicitly requests a new page. On narrow screens, keep the range label and essential navigation before optional direct-page controls.

## Dialogs and alerts

Dialogs have a title, description, initial focus, trapped focus, Escape behavior, and restored focus. Use alerts for persistent, contextual feedback and toasts for transient confirmation only.

## State matrix

| State | Required treatment |
| --- | --- |
| Loading | Stable geometry, progress label, no duplicate action |
| Empty | Cause, value, next valid action |
| Error | Plain-language cause, preserved input, recovery |
| Success | Named outcome, appropriate live announcement |
| Disabled | Visible prerequisite and non-color cue |
| Destructive | Object, consequence, reversibility, confirmation |
| Informational | Named context, non-color cue, no false urgency |
