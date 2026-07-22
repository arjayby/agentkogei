import "server-only";

import { createHash } from "node:crypto";
import { env } from "@agentkogei/env/server";
import {
	comparePackReleaseVersions,
	type PackReleaseVersion,
} from "agentkogei/src/release-version";

/**
 * How each protected Pack Release is provisioned: the Design Contract payload
 * itself and the digest it must match. Provisioning both together keeps the
 * pinned digest describing the release actually being served rather than an
 * earlier edition of it.
 */
const protectedReleaseLoaders = {
	command: {
		"1.0.0": {
			release: () => env.COMMAND_PREMIUM_RELEASE,
			sha256: () => env.COMMAND_PREMIUM_RELEASE_SHA256,
		},
	},
	signal: {
		"1.0.0": {
			release: () => env.SIGNAL_PREMIUM_RELEASE,
			sha256: () => env.SIGNAL_PREMIUM_RELEASE_SHA256,
		},
	},
} satisfies Record<string, Record<string, ProtectedReleaseLoader>>;

type ProtectedReleaseLoader = {
	release: () => string | undefined;
	sha256: () => string | undefined;
};

export type OfficialPremiumPackIdentity = keyof typeof protectedReleaseLoaders;

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

/**
 * The Pack Release a bare Premium identity selects, resolved the same way an
 * Open pack's current release is: the highest semantic version published.
 */
export function currentOfficialPremiumRelease(
	identity: OfficialPremiumPackIdentity,
) {
	return (
		Object.keys(protectedReleaseLoaders[identity]) as PackReleaseVersion[]
	)
		.toSorted(comparePackReleaseVersions)
		.at(-1);
}

export function getProtectedPremiumRelease(identity: string, version: string) {
	if (!Object.hasOwn(protectedReleaseLoaders, identity)) return null;
	const releases: Record<string, ProtectedReleaseLoader> =
		protectedReleaseLoaders[identity as OfficialPremiumPackIdentity];
	const loader = releases[version];
	if (!loader) return null;
	const serialized = loader.release();
	if (!serialized) return null;
	// A Premium Pack Release is immutable, so a payload that does not match its
	// pinned digest is not the release the Official Catalog published.
	const expectedDigest = loader.sha256();
	if (
		!expectedDigest ||
		createHash("sha256").update(serialized).digest("hex") !== expectedDigest
	) {
		return null;
	}
	try {
		return JSON.parse(serialized) as unknown;
	} catch {
		return null;
	}
}
