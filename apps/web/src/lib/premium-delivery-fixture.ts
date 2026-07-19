import "server-only";

import { env } from "@agentkogei/env/server";

export function getPremiumDeliveryFixture() {
	if (!env.PREMIUM_DELIVERY_FIXTURE) return null;
	try {
		return JSON.parse(env.PREMIUM_DELIVERY_FIXTURE) as unknown;
	} catch {
		return null;
	}
}
