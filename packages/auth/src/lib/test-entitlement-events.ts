import type {
	NewPremiumEntitlementEvent,
	StoredPremiumEntitlementEvent,
} from "@agentkogei/db/entitlement-events";

type TestEntitlementEventState = Map<string, StoredPremiumEntitlementEvent>;
const testStateKey = Symbol.for("agentkogei.test-entitlement-event-state");

function getState(): TestEntitlementEventState {
	const globals = globalThis as typeof globalThis & {
		[testStateKey]?: TestEntitlementEventState;
	};
	globals[testStateKey] ??= new Map();
	return globals[testStateKey];
}

export function recordTestPremiumEntitlementEvent(
	event: NewPremiumEntitlementEvent,
) {
	const stored: StoredPremiumEntitlementEvent = {
		...event,
		occurredAt: event.occurredAt ?? new Date(),
	};
	getState().set(stored.id, stored);
	return stored;
}

export function listTestPremiumEntitlementEvents() {
	return [...getState().values()].toSorted(
		(left, right) => right.occurredAt.getTime() - left.occurredAt.getTime(),
	);
}

export function resetTestPremiumEntitlementEvents() {
	getState().clear();
}
