import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import {
	authorizePackCredential as authorizeStoredPackCredential,
	claimDeviceAuthorization as claimStoredDeviceAuthorization,
	consumeDeviceAuthorization as consumeStoredDeviceAuthorization,
	expireDeviceAuthorization as expireStoredDeviceAuthorization,
	findDeviceAuthorizationByDeviceCode,
	findDeviceAuthorizationByUserCode,
	insertDeviceAuthorization,
	listBuilderPackCredentials,
	type NewPackCredential,
	resolveDeviceAuthorization as resolveStoredDeviceAuthorization,
	revokeBuilderPackCredential,
	type StoredDeviceAuthorization,
	type StoredPackCredential,
} from "@agentkogei/db/pack-credentials";
import { env } from "@agentkogei/env/server";

export const packCredentialScope = "premium:retrieve" as const;
export const packCredentialClientId = "agentkogei-cli" as const;
export const deviceGrantType =
	"urn:ietf:params:oauth:grant-type:device_code" as const;

const deviceLifetimeMilliseconds = 10 * 60 * 1_000;
const pollingIntervalSeconds = 1;
const userCodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type TestPackCredentialState = {
	deviceRequests: Map<string, StoredDeviceAuthorization>;
	credentials: Map<string, StoredPackCredential>;
};

const testStateKey = Symbol.for("agentkogei.test-pack-credential-state");

function getTestState(): TestPackCredentialState {
	const globals = globalThis as typeof globalThis & {
		[testStateKey]?: TestPackCredentialState;
	};
	globals[testStateKey] ??= {
		deviceRequests: new Map(),
		credentials: new Map(),
	};
	return globals[testStateKey];
}

function usesTestBoundary() {
	return (
		env.NODE_ENV !== "production" && Boolean(env.GITHUB_OAUTH_TEST_BASE_URL)
	);
}

function hashSecret(secret: string) {
	return createHash("sha256").update(secret).digest("hex");
}

function normalizeUserCode(userCode: string) {
	return userCode.trim().replaceAll("-", "").toUpperCase();
}

function generateUserCode() {
	let code = "";
	for (let index = 0; index < 8; index += 1) {
		code += userCodeCharacters[randomInt(userCodeCharacters.length)];
	}
	return `${code.slice(0, 4)}-${code.slice(4)}`;
}

async function saveDeviceRequest(record: StoredDeviceAuthorization) {
	if (usesTestBoundary()) {
		getTestState().deviceRequests.set(record.id, record);
		return;
	}
	await insertDeviceAuthorization(record);
}

async function findByDeviceCodeHash(deviceCodeHash: string) {
	if (usesTestBoundary()) {
		return (
			[...getTestState().deviceRequests.values()].find(
				(record) => record.deviceCodeHash === deviceCodeHash,
			) ?? null
		);
	}
	return findDeviceAuthorizationByDeviceCode(deviceCodeHash);
}

async function findByUserCodeHash(userCodeHash: string) {
	if (usesTestBoundary()) {
		return (
			[...getTestState().deviceRequests.values()].find(
				(record) => record.userCodeHash === userCodeHash,
			) ?? null
		);
	}
	return findDeviceAuthorizationByUserCode(userCodeHash);
}

async function markExpired(record: StoredDeviceAuthorization) {
	if (usesTestBoundary()) {
		record.status = "expired";
		record.resolvedAt = new Date();
		return;
	}
	await expireStoredDeviceAuthorization(record.id);
}

export async function startDeviceAuthorization(input: {
	origin: string;
	credentialName: string;
}) {
	const deviceCode = randomBytes(32).toString("base64url");
	const userCode = generateUserCode();
	const now = new Date();
	const expiresAt = new Date(now.getTime() + deviceLifetimeMilliseconds);
	const record: StoredDeviceAuthorization = {
		id: randomUUID(),
		deviceCodeHash: hashSecret(deviceCode),
		userCodeHash: hashSecret(normalizeUserCode(userCode)),
		credentialName: input.credentialName,
		status: "pending",
		builderId: null,
		expiresAt,
		lastPolledAt: null,
		pollingInterval: pollingIntervalSeconds,
		createdAt: now,
		resolvedAt: null,
	};
	await saveDeviceRequest(record);

	const verificationUri = new URL("/device", input.origin);
	const verificationUriComplete = new URL(verificationUri);
	verificationUriComplete.searchParams.set("user_code", userCode);
	return {
		device_code: deviceCode,
		user_code: userCode,
		verification_uri: verificationUri.toString(),
		verification_uri_complete: verificationUriComplete.toString(),
		expires_in: Math.floor(deviceLifetimeMilliseconds / 1_000),
		interval: pollingIntervalSeconds,
	};
}

export type DeviceRequestInspection =
	| { ok: true; request: StoredDeviceAuthorization }
	| { ok: false; reason: "invalid" | "expired" | "claimed" | "resolved" };

export async function inspectDeviceAuthorization(
	userCode: string,
	builderId: string,
): Promise<DeviceRequestInspection> {
	const record = await findByUserCodeHash(
		hashSecret(normalizeUserCode(userCode)),
	);
	if (!record) return { ok: false, reason: "invalid" };
	if (record.expiresAt <= new Date()) {
		await markExpired(record);
		return { ok: false, reason: "expired" };
	}
	if (record.status !== "pending") {
		return { ok: false, reason: "resolved" };
	}
	if (record.builderId && record.builderId !== builderId) {
		return { ok: false, reason: "claimed" };
	}
	if (record.builderId === builderId) return { ok: true, request: record };

	if (usesTestBoundary()) {
		record.builderId = builderId;
		return { ok: true, request: record };
	}
	const claimed = await claimStoredDeviceAuthorization(record.id, builderId);
	if (!claimed || claimed.builderId !== builderId) {
		return { ok: false, reason: "claimed" };
	}
	return { ok: true, request: claimed };
}

export async function decideDeviceAuthorization(input: {
	userCode: string;
	builderId: string;
	decision: "approved" | "denied";
}) {
	const inspection = await inspectDeviceAuthorization(
		input.userCode,
		input.builderId,
	);
	if (!inspection.ok) return false;
	if (usesTestBoundary()) {
		inspection.request.status = input.decision;
		inspection.request.resolvedAt = new Date();
		return true;
	}
	return Boolean(
		await resolveStoredDeviceAuthorization(
			inspection.request.id,
			input.builderId,
			input.decision,
		),
	);
}

type DeviceTokenError =
	| "authorization_pending"
	| "access_denied"
	| "expired_token"
	| "invalid_grant";

export type DeviceTokenResult =
	| { ok: true; credential: string }
	| { ok: false; error: DeviceTokenError };

export async function exchangeDeviceAuthorization(
	deviceCode: string,
): Promise<DeviceTokenResult> {
	const record = await findByDeviceCodeHash(hashSecret(deviceCode));
	if (!record) return { ok: false, error: "invalid_grant" };
	if (record.expiresAt <= new Date() || record.status === "expired") {
		await markExpired(record);
		return { ok: false, error: "expired_token" };
	}
	if (record.status === "pending") {
		return { ok: false, error: "authorization_pending" };
	}
	if (record.status === "denied") {
		return { ok: false, error: "access_denied" };
	}
	if (record.status !== "approved" || !record.builderId) {
		return { ok: false, error: "invalid_grant" };
	}

	const credential = `ak_pack_${randomBytes(32).toString("base64url")}`;
	const storedCredential: NewPackCredential = {
		id: randomUUID(),
		builderId: record.builderId,
		name: record.credentialName,
		secretHash: hashSecret(credential),
		secretSuffix: credential.slice(-4),
		scope: packCredentialScope,
		createdAt: new Date(),
		lastUsedAt: null,
		revokedAt: null,
	};

	if (usesTestBoundary()) {
		if (record.status !== "approved") {
			return { ok: false, error: "invalid_grant" };
		}
		record.status = "consumed";
		getTestState().credentials.set(storedCredential.id, {
			...storedCredential,
			createdAt: storedCredential.createdAt ?? new Date(),
			lastUsedAt: storedCredential.lastUsedAt ?? null,
			revokedAt: storedCredential.revokedAt ?? null,
			scope: storedCredential.scope ?? packCredentialScope,
		});
		return { ok: true, credential };
	}

	const consumed = await consumeStoredDeviceAuthorization(
		record.id,
		storedCredential,
	);
	return consumed
		? { ok: true, credential }
		: { ok: false, error: "invalid_grant" };
}

export async function listPackCredentials(builderId: string) {
	if (usesTestBoundary()) {
		return [...getTestState().credentials.values()]
			.filter((credential) => credential.builderId === builderId)
			.toSorted(
				(left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
			);
	}
	return listBuilderPackCredentials(builderId);
}

export async function revokePackCredential(id: string, builderId: string) {
	if (usesTestBoundary()) {
		const credential = getTestState().credentials.get(id);
		if (
			!credential ||
			credential.builderId !== builderId ||
			credential.revokedAt
		) {
			return false;
		}
		credential.revokedAt = new Date();
		return true;
	}
	return Boolean(await revokeBuilderPackCredential(id, builderId));
}

export async function verifyPackCredential(secret: string) {
	const secretHash = hashSecret(secret);
	if (usesTestBoundary()) {
		const credential = [...getTestState().credentials.values()].find(
			(candidate) => candidate.secretHash === secretHash,
		);
		if (
			!credential ||
			credential.revokedAt ||
			credential.scope !== packCredentialScope
		) {
			return null;
		}
		credential.lastUsedAt = new Date();
		return credential;
	}
	return authorizeStoredPackCredential(secretHash);
}

export async function expireTestDeviceAuthorization(deviceCode: string) {
	if (!usesTestBoundary()) return false;
	const record = await findByDeviceCodeHash(hashSecret(deviceCode));
	if (!record) return false;
	record.status = "expired";
	record.resolvedAt = new Date();
	return true;
}
