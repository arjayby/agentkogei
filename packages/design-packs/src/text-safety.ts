export const hasTerminalControl = (value: string) =>
	/[\p{Cc}\p{Cf}]/u.test(value);

/**
 * A Design Contract is prose an AI coding agent reads. Line breaks and tabs are
 * ordinary Markdown, but every other control or format character—including
 * bidirectional overrides—can hide direction from the Builder reviewing it.
 */
export const hasHiddenDocumentControl = (value: string) =>
	/[^\P{Cc}\n\r\t]|\p{Cf}/u.test(value);
