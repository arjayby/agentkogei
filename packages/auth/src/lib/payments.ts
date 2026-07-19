import { env } from "@agentkogei/env/server";
import { Polar } from "@polar-sh/sdk";

export const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN,
	server: env.POLAR_SERVER,
});

export const productionPaymentsEnabled =
	env.POLAR_SERVER !== "production" ||
	Boolean(env.POLAR_LEGAL_REVIEW_REFERENCE);

export const premiumAccessProductId = env.POLAR_PREMIUM_ACCESS_PRODUCT_ID;
