import "server-only";

import { createHash } from "node:crypto";
import { env } from "@agentkogei/env/server";

const commandReleaseSha256 =
	"a133792d57a94895b045d39967fa990ba7fb454a907581ea533d316196982760";

const protectedReleaseLoaders: Record<
	string,
	Record<string, () => string | undefined>
> = {
	"delivery-fixture": { "1.0.0": () => env.PREMIUM_DELIVERY_FIXTURE },
	command: { "1.0.0": () => env.COMMAND_PREMIUM_RELEASE },
};

export function getProtectedPremiumRelease(identity: string, version: string) {
	const serialized = protectedReleaseLoaders[identity]?.[version]?.();
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
	try {
		return JSON.parse(serialized) as unknown;
	} catch {
		return null;
	}
}
