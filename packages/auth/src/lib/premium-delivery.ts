import {
	recordProjectLicense,
	type StoredProjectLicense,
} from "@agentkogei/db/project-licenses";
import { env } from "@agentkogei/env/server";

import { getPremiumAccess } from "./entitlements";
import { verifyPackCredential } from "./pack-credentials";

type TestProjectLicenseState = Map<string, StoredProjectLicense>;
const testStateKey = Symbol.for("agentkogei.test-project-license-state");

function getTestState(): TestProjectLicenseState {
	const globals = globalThis as typeof globalThis & {
		[testStateKey]?: TestProjectLicenseState;
	};
	globals[testStateKey] ??= new Map();
	return globals[testStateKey];
}

function usesTestBoundary() {
	return (
		env.NODE_ENV !== "production" && Boolean(env.GITHUB_OAUTH_TEST_BASE_URL)
	);
}

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

async function persistProjectLicense(license: StoredProjectLicense) {
	if (usesTestBoundary()) {
		const existing = getTestState().get(license.id);
		if (existing) return existing;
		getTestState().set(license.id, license);
		return license;
	}
	return recordProjectLicense(license);
}

async function authorizedPremiumCredential(secret: string) {
	const credential = await verifyPackCredential(secret);
	if (!credential) return false;
	const access = await getPremiumAccess(credential.builderId);
	return hasActivePremiumAccess(access) ? credential : false;
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
	const credential = await authorizedPremiumCredential(input.credential);
	if (!credential) return false;

	const recorded = await persistProjectLicense({
		id: input.projectLicenseId,
		builderId: credential.builderId,
		packId: input.packId,
		packRelease: input.packRelease,
		createdAt: new Date(),
	});
	return Boolean(
		recorded &&
			recorded.builderId === credential.builderId &&
			recorded.packId === input.packId &&
			recorded.packRelease === input.packRelease,
	);
}

export function inspectTestProjectLicense(id: string) {
	if (!usesTestBoundary()) return null;
	const license = getTestState().get(id);
	if (!license) return null;
	return {
		id: license.id,
		packId: license.packId,
		packRelease: license.packRelease,
	};
}
