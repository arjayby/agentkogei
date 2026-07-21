/**
 * Renders the Design Pack selector a caller asked for so an unresolved request
 * can name it without echoing arbitrary request text back to the caller.
 */
export function catalogSelector(identity: string, version?: string) {
	const readable = (value: string) =>
		value.replaceAll(/[^a-zA-Z0-9._-]/g, "").slice(0, 40) || "unknown";
	return version
		? `${readable(identity)}@${readable(version)}`
		: readable(identity);
}
