import {
	applyBillingProjection,
	findPremiumAccess,
} from "@agentkogei/db/billing";
import { premiumAccessStateValues } from "@agentkogei/db/schema/auth";
import { env } from "@agentkogei/env/server";

export const premiumAccessStates = premiumAccessStateValues;

export type PremiumAccessState = (typeof premiumAccessStates)[number];

export type PremiumAccess = {
	builderId: string;
	status: PremiumAccessState;
	currentPeriodEnd: Date | null;
	polarCustomerId: string | null;
	polarSubscriptionId: string | null;
	sourceEventAt: Date;
};

export type BillingEventProjection = PremiumAccess & {
	eventId: string;
};

const terminalStates = new Set<PremiumAccessState>(["refunded", "reversed"]);

function shouldApplyProjection(
	current: Pick<PremiumAccess, "sourceEventAt" | "status"> | null,
	next: Pick<PremiumAccess, "sourceEventAt" | "status">,
) {
	if (!current) return true;
	if (current.sourceEventAt > next.sourceEventAt) return false;
	return !(terminalStates.has(current.status) && next.status === "expired");
}

type TestBillingState = {
	events: Set<string>;
	entitlements: Map<string, PremiumAccess>;
};

const testStateKey = Symbol.for("agentkogei.test-billing-state");

function getTestState(): TestBillingState {
	const globals = globalThis as typeof globalThis & {
		[testStateKey]?: TestBillingState;
	};
	globals[testStateKey] ??= {
		events: new Set(),
		entitlements: new Map(),
	};
	return globals[testStateKey];
}

function isTestBillingBoundary() {
	return (
		env.NODE_ENV !== "production" && Boolean(env.GITHUB_OAUTH_TEST_BASE_URL)
	);
}

export async function getPremiumAccess(
	builderId: string,
): Promise<PremiumAccess | null> {
	if (isTestBillingBoundary()) {
		return getTestState().entitlements.get(builderId) ?? null;
	}

	const record = await findPremiumAccess(builderId);
	if (!record) return null;

	return record;
}

export async function recordBillingEvent(
	projection: BillingEventProjection,
): Promise<"applied" | "duplicate" | "stale"> {
	if (isTestBillingBoundary()) {
		const state = getTestState();
		if (state.events.has(projection.eventId)) return "duplicate";
		state.events.add(projection.eventId);

		const current = state.entitlements.get(projection.builderId);
		if (!shouldApplyProjection(current ?? null, projection)) {
			return "stale";
		}
		state.entitlements.set(projection.builderId, {
			builderId: projection.builderId,
			status: projection.status,
			currentPeriodEnd: projection.currentPeriodEnd,
			polarCustomerId: projection.polarCustomerId,
			polarSubscriptionId: projection.polarSubscriptionId,
			sourceEventAt: projection.sourceEventAt,
		});
		return "applied";
	}

	return applyBillingProjection(projection);
}

export function resetTestBillingState() {
	if (!isTestBillingBoundary()) return;
	const state = getTestState();
	state.events.clear();
	state.entitlements.clear();
}
