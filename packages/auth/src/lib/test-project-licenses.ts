import type {
	NewProjectLicense,
	StoredProjectLicense,
} from "@agentkogei/db/project-licenses";

type TestProjectLicenseState = Map<string, StoredProjectLicense>;
const testStateKey = Symbol.for("agentkogei.test-project-license-state");

function getState(): TestProjectLicenseState {
	const globals = globalThis as typeof globalThis & {
		[testStateKey]?: TestProjectLicenseState;
	};
	globals[testStateKey] ??= new Map();
	return globals[testStateKey];
}

export function recordTestProjectLicense(license: NewProjectLicense) {
	const existing = getState().get(license.id);
	if (existing) return existing;
	const stored: StoredProjectLicense = {
		...license,
		createdAt: license.createdAt ?? new Date(),
		polarSubscriptionId: license.polarSubscriptionId ?? null,
		premiumAccessPeriodStart: license.premiumAccessPeriodStart ?? null,
		premiumAccessPeriodEnd: license.premiumAccessPeriodEnd ?? null,
		terminatedAt: license.terminatedAt ?? null,
		terminationReason: license.terminationReason ?? null,
	};
	getState().set(stored.id, stored);
	return stored;
}

export function findTestProjectLicense(id: string) {
	return getState().get(id) ?? null;
}

export function terminateTestProjectLicenses(
	builderId: string,
	reason: "refunded" | "reversed",
	terminatedAt: Date,
	polarSubscriptionId: string | null,
	affectedPeriodStart: Date | null,
) {
	if (!polarSubscriptionId || !affectedPeriodStart) return;
	for (const [id, license] of getState()) {
		if (
			license.builderId === builderId &&
			license.polarSubscriptionId === polarSubscriptionId &&
			license.premiumAccessPeriodStart?.getTime() ===
				affectedPeriodStart.getTime() &&
			!license.terminatedAt
		) {
			getState().set(id, {
				...license,
				terminatedAt,
				terminationReason: reason,
			});
		}
	}
}

export function resetTestProjectLicenses() {
	getState().clear();
}
