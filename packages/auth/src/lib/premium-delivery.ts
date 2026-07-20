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
