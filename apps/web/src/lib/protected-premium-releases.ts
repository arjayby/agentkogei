import "server-only";

import { env } from "@agentkogei/env/server";

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
	try {
		return JSON.parse(serialized) as unknown;
	} catch {
		return null;
	}
}
