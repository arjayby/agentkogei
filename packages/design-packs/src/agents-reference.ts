/**
 * The markers that delimit the one AgentKogei block in a Project's `AGENTS.md`.
 * They are shared by every writer so a Project can only ever hold one such
 * reference, and a Builder can always find and remove it by hand.
 */
export const managedBlockStart = "<!-- agentkogei:design-pack:start -->";
export const managedBlockEnd = "<!-- agentkogei:design-pack:end -->";
