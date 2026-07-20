import { createDb } from "@agentkogei/db";
import * as schema from "@agentkogei/db/schema/auth";
import {
	blackBoxDatabaseEnabled,
	blackBoxTestBoundaryEnabled,
	env,
} from "@agentkogei/env/server";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import type { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import {
	polarClient,
	premiumAccessProductId,
	productionPaymentsEnabled,
} from "./lib/payments";

const githubClientCredentials = {
	clientId: env.GITHUB_CLIENT_ID,
	clientSecret: env.GITHUB_CLIENT_SECRET,
};

type TestAuthDatabase = Parameters<typeof memoryAdapter>[0];
const testAuthDatabaseKey = Symbol.for("agentkogei.test-auth-database");

function getTestAuthDatabase(): TestAuthDatabase {
	const globals = globalThis as typeof globalThis & {
		[testAuthDatabaseKey]?: TestAuthDatabase;
	};
	globals[testAuthDatabaseKey] ??= {
		user: [],
		session: [],
		account: [],
		verification: [],
	};
	return globals[testAuthDatabaseKey];
}

function createProductionIdentityBoundary() {
	return {
		database: drizzleAdapter(createDb(), {
			provider: "pg" as const,
			schema: schema,
		}),
		socialProviders: {
			github: {
				...githubClientCredentials,
			},
		},
		plugins: [
			polar({
				client: polarClient,
				createCustomerOnSignUp: true,
				enableCustomerPortal: true,
				use: [
					checkout({
						products:
							productionPaymentsEnabled && premiumAccessProductId
								? [
										{
											productId: premiumAccessProductId,
											slug: "premium-access",
										},
									]
								: [],
						successUrl: env.POLAR_SUCCESS_URL,
						authenticatedUsersOnly: true,
					}),
					portal(),
				],
			}),
		],
	};
}

function createTestPolarClient(baseURL: string) {
	return {
		checkouts: {
			create: async ({
				externalCustomerId,
				successUrl,
			}: {
				externalCustomerId?: string;
				successUrl?: string;
			}) => {
				const url = new URL("/test/polar/checkout", baseURL);
				if (externalCustomerId) {
					url.searchParams.set("builder_id", externalCustomerId);
				}
				if (successUrl) url.searchParams.set("success_url", successUrl);
				return { url: url.toString() };
			},
		},
		customerSessions: {
			create: async () => ({
				customerPortalUrl: new URL("/test/polar/portal", baseURL).toString(),
			}),
		},
	} as unknown as Polar;
}

function createTestIdentityBoundary(githubTestBoundaryBaseURL: string) {
	const testPolarClient = createTestPolarClient(env.BETTER_AUTH_URL);
	return {
		database: blackBoxDatabaseEnabled
			? drizzleAdapter(createDb(), {
					provider: "pg" as const,
					schema: schema,
				})
			: memoryAdapter(getTestAuthDatabase()),
		socialProviders: {},
		plugins: [
			genericOAuth({
				config: [
					{
						providerId: "github",
						...githubClientCredentials,
						authorizationUrl: `${githubTestBoundaryBaseURL}/authorize`,
						tokenUrl: `${githubTestBoundaryBaseURL}/token`,
						userInfoUrl: `${githubTestBoundaryBaseURL}/user`,
						scopes: ["read:user", "user:email"],
						authentication: "post" as const,
					},
				],
			}),
			polar({
				client: testPolarClient,
				createCustomerOnSignUp: false,
				use: [
					checkout({
						products: [
							{
								productId: "polar-premium-access",
								slug: "premium-access",
							},
						],
						successUrl: env.POLAR_SUCCESS_URL,
						authenticatedUsersOnly: true,
					}),
					portal(),
				],
			}),
		],
	};
}

export function createAuth() {
	const githubTestBoundaryBaseURL = blackBoxTestBoundaryEnabled
		? env.GITHUB_OAUTH_TEST_BASE_URL
		: undefined;
	const identityBoundary = githubTestBoundaryBaseURL
		? createTestIdentityBoundary(githubTestBoundaryBaseURL)
		: createProductionIdentityBoundary();

	return betterAuth({
		database: identityBoundary.database,
		...(blackBoxTestBoundaryEnabled ? { rateLimit: { enabled: false } } : {}),
		trustedOrigins: [env.CORS_ORIGIN],
		socialProviders: identityBoundary.socialProviders,
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [...identityBoundary.plugins, nextCookies()],
	});
}

export const auth = createAuth();
export { productionPaymentsEnabled };
