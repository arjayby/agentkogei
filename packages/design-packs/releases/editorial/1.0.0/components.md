# Editorial component guidance

## Buttons and links

Use one filled primary action per region. Secondary actions use an outline or quiet variant; inline actions should read as links and remain identifiable without color alone. Keep labels stable while loading and prevent duplicate submission. Icon-only buttons need an accessible name and tooltip.

## Articles, cards, and panels

An Article region has a heading, optional deck, metadata, body, and contextual actions in that reading order. A Card groups one decision or short record; it is not the default wrapper for prose. Prefer whitespace and a fine rule over nested surfaces. Pull quotes must be supplied content and cannot interrupt keyboard or screen-reader order.

## Forms

Use visible labels, quiet descriptions, persistent values after failure, and errors adjacent to their fields. Group related controls with a section heading or fieldset. Keep a form's reading measure narrow even inside a wide shell. Required state is written in text.

## Navigation and contents

Mark the current destination semantically. A table of contents links only to real page headings and exposes the active location without color alone. On mobile, preserve primary destinations and source order without horizontal overflow. Breadcrumbs express hierarchy rather than browser history.

## Tables, lists, and metadata

Use tables for comparison, lists for repeated records, and definition lists for metadata. Tables need a caption or nearby heading, labelled columns, sorting state, keyboard-reachable row actions, pagination context, and a responsive plan. On narrow screens, preserve the most important label and value before optional metadata.

## Dialogs, disclosures, and alerts

Dialogs have a title, description, predictable initial focus, trapped focus, Escape behavior, and restored focus. Disclosures keep their trigger adjacent to the revealed content. Alerts are persistent and contextual; toasts only confirm an outcome when its source stays visible.

## State matrix

| State | Required treatment |
| --- | --- |
| Loading | Stable reading geometry, plain progress label, no motion when reduced |
| Empty | Named absence, why it matters, next valid action |
| Error | Direct heading, preserved content, recovery path |
| Success | Named outcome beside the originating action |
| Disabled | Persistent prerequisite and non-color cue |
| Destructive | Object, consequence, reversibility, confirmation |
| Informational | Calm context, semantic icon or label, no false urgency |
