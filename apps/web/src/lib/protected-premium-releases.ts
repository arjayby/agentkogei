import "server-only";

import { createHash } from "node:crypto";
import { env } from "@agentkogei/env/server";

const commandReleaseSha256 =
	"a133792d57a94895b045d39967fa990ba7fb454a907581ea533d316196982760";

const protectedReleaseLoaders = {
	"delivery-fixture": { "1.0.0": () => env.PREMIUM_DELIVERY_FIXTURE },
	command: { "1.0.0": () => env.COMMAND_PREMIUM_RELEASE },
	signal: { "1.0.0": () => env.SIGNAL_PREMIUM_RELEASE },
} satisfies Record<string, Record<string, () => string | undefined>>;

export type ProtectedPremiumReleaseIdentity =
	keyof typeof protectedReleaseLoaders;
export type OfficialPremiumPackIdentity = Exclude<
	ProtectedPremiumReleaseIdentity,
	"delivery-fixture"
>;

const officialPremiumPackIdentities = new Set<OfficialPremiumPackIdentity>([
	"command",
	"signal",
]);

export function isOfficialPremiumPackIdentity(
	identity: string,
): identity is OfficialPremiumPackIdentity {
	return officialPremiumPackIdentities.has(
		identity as OfficialPremiumPackIdentity,
	);
}

export function getProtectedPremiumRelease(identity: string, version: string) {
	if (!Object.hasOwn(protectedReleaseLoaders, identity)) return null;
	const protectedIdentity = identity as ProtectedPremiumReleaseIdentity;
	const releases: Record<string, () => string | undefined> =
		protectedReleaseLoaders[protectedIdentity];
	const serialized = releases[version]?.();
	if (!serialized) return null;
	if (identity === "command") {
		const expectedDigest =
			env.NODE_ENV !== "production" && env.GITHUB_OAUTH_TEST_BASE_URL
				? env.COMMAND_PREMIUM_RELEASE_SHA256
				: commandReleaseSha256;
		if (
			!expectedDigest ||
			createHash("sha256").update(serialized).digest("hex") !== expectedDigest
		) {
			return null;
		}
	}
	if (
		identity === "signal" &&
		(!env.SIGNAL_PREMIUM_RELEASE_SHA256 ||
			createHash("sha256").update(serialized).digest("hex") !==
				env.SIGNAL_PREMIUM_RELEASE_SHA256)
	) {
		return null;
	}
	try {
		return JSON.parse(serialized) as unknown;
	} catch {
		return null;
	}
}
