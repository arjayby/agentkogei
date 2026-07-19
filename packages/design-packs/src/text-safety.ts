export const hasTerminalControl = (value: string) =>
	/[\p{Cc}\p{Cf}]/u.test(value);
