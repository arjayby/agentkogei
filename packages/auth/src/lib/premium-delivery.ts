import { randomUUID } from "node:crypto";
import {
	type NewPremiumEntitlementEvent,
	recordPremiumEntitlementEvent as persistPremiumEntitlementEvent,
} from "@agentkogei/db/entitlement-events";
import {
	type NewProjectLicense,
	recordProjectLicense,
} from "@agentkogei/db/project-licenses";
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
import {
	findTestProjectLicense,
	recordTestProjectLicense,
} from "./test-project-licenses";

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

async function persistProjectLicense(license: NewProjectLicense) {
	if (inMemoryBlackBoxBoundaryEnabled) {
		return recordTestProjectLicense(license);
	}
	return recordProjectLicense(license);
}

async function authorizedPremiumCredential(secret: string) {
	const credential = await verifyPackCredential(secret);
	if (!credential) return null;
	const access = await getPremiumAccess(credential.builderId);
	return hasActivePremiumAccess(access) && access
		? { credential, access }
		: null;
}

export async function authorizePremiumDelivery(input: { credential: string }) {
	return Boolean(await authorizedPremiumCredential(input.credential));
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

export async function recordPremiumProjectLicense(input: {
	credential: string;
	projectLicenseId: string;
	packId: string;
	packRelease: string;
}) {
	const authorization = await authorizedPremiumCredential(input.credential);
	if (
		!authorization?.access.polarSubscriptionId ||
		!authorization.access.currentPeriodStart ||
		!authorization.access.currentPeriodEnd
	) {
		return false;
	}

	const recorded = await persistProjectLicense({
		id: input.projectLicenseId,
		builderId: authorization.credential.builderId,
		packId: input.packId,
		packRelease: input.packRelease,
		polarSubscriptionId: authorization.access.polarSubscriptionId,
		premiumAccessPeriodStart: authorization.access.currentPeriodStart,
		premiumAccessPeriodEnd: authorization.access.currentPeriodEnd,
		createdAt: new Date(),
	});
	return Boolean(
		recorded &&
			!recorded.terminatedAt &&
			recorded.builderId === authorization.credential.builderId &&
			recorded.packId === input.packId &&
			recorded.packRelease === input.packRelease,
	);
}

export async function inspectTestProjectLicense(id: string) {
	if (!blackBoxTestBoundaryEnabled) return null;
	const license = blackBoxDatabaseEnabled
		? await import("@agentkogei/db/project-licenses").then(
				({ findProjectLicense }) => findProjectLicense(id),
			)
		: findTestProjectLicense(id);
	if (!license) return null;
	return {
		id: license.id,
		packId: license.packId,
		packRelease: license.packRelease,
		status: license.terminatedAt ? "terminated" : "active",
		terminationReason: license.terminationReason,
		terminatedAt: license.terminatedAt?.toISOString() ?? null,
	};
}
