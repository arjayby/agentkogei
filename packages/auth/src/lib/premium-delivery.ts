import { randomUUID } from "node:crypto";
import {
	type NewPremiumEntitlementEvent,
	recordPremiumEntitlementEvent as persistPremiumEntitlementEvent,
} from "@agentkogei/db/entitlement-events";
import {
	blackBoxDatabaseEnabled,
	blackBoxTestBoundaryEnabled,
	inMemoryBlackBoxBoundaryEnabled,
} from "@agentkogei/env/server";

import { getPremiumAccess } from "./entitlements";
import { verifyPackCredential } from "./pack-credentials";
import {
	listTestPremiumEntitlementEvents,
	recordTestPremiumEntitlementEvent,
} from "./test-entitlement-events";

function hasActivePremiumAccess(
	access: Awaited<ReturnType<typeof getPremiumAccess>>,
) {
	if (!access) return false;
	if (access.status === "active") return true;
	return (
		access.status === "canceling" &&
		Boolean(access.currentPeriodEnd && access.currentPeriodEnd > new Date())
	);
}

/**
 * Why a Premium Design Contract retrieval may proceed or not. The CLI needs the
 * two denials kept apart: a missing or rejected Pack Credential is worth a
 * browser authorization, while inactive Premium Access never is.
 */
export type PremiumRetrievalAuthorization =
	| { outcome: "authorized"; builderId: string }
	| { outcome: "unauthenticated" }
	| { outcome: "inactive" };

export async function authorizePremiumRetrieval(
	credential: string | null,
): Promise<PremiumRetrievalAuthorization> {
	if (!credential) return { outcome: "unauthenticated" };
	const verified = await verifyPackCredential(credential);
	if (!verified) return { outcome: "unauthenticated" };
	const access = await getPremiumAccess(verified.builderId);
	return hasActivePremiumAccess(access)
		? { outcome: "authorized", builderId: verified.builderId }
		: { outcome: "inactive" };
}

/**
 * Records that an entitled Builder retrieved one Pack Release. A Design
 * Contract Installation has no per-Project identifier, so the evidence carries
 * only the Builder, the Pack Release, the action, and when it happened. The
 * action is the retrieval itself rather than the Installation: the Official
 * Catalog releases the gated document before the Builder consents to write it,
 * and never learns whether they did.
 */
export async function recordPremiumEntitlementEvent(input: {
	builderId: string;
	packId: string;
	packRelease: string;
	action: "retrieval";
}) {
	const event: NewPremiumEntitlementEvent = {
		id: randomUUID(),
		builderId: input.builderId,
		packId: input.packId,
		packRelease: input.packRelease,
		action: input.action,
		occurredAt: new Date(),
	};
	if (inMemoryBlackBoxBoundaryEnabled) {
		recordTestPremiumEntitlementEvent(event);
		return;
	}
	await persistPremiumEntitlementEvent(event);
}

export async function inspectTestPremiumEntitlementEvents() {
	if (!blackBoxTestBoundaryEnabled) return null;
	const events = blackBoxDatabaseEnabled
		? await import("@agentkogei/db/testing").then(
				({ listBlackBoxPremiumEntitlementEvents }) =>
					listBlackBoxPremiumEntitlementEvents(),
			)
		: listTestPremiumEntitlementEvents();
	return events.map((event) => ({
		builderId: event.builderId,
		packId: event.packId,
		packRelease: event.packRelease,
		action: event.action,
		occurredAt: event.occurredAt.toISOString(),
	}));
}
