import { createDb } from "@agentkogei/db";
import * as schema from "@agentkogei/db/schema/auth";
import { env } from "@agentkogei/env/server";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins/generic-oauth";

import { polarClient } from "./lib/payments";

const githubClientCredentials = {
	clientId: env.GITHUB_CLIENT_ID,
	clientSecret: env.GITHUB_CLIENT_SECRET,
};

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
						products: [
							{
								productId: "your-product-id",
								slug: "pro",
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

function createTestIdentityBoundary(githubTestBoundaryBaseURL: string) {
	return {
		database: memoryAdapter({
			user: [],
			session: [],
			account: [],
			verification: [],
		}),
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
		],
	};
}

export function createAuth() {
	const githubTestBoundaryBaseURL =
		env.NODE_ENV === "production" ? undefined : env.GITHUB_OAUTH_TEST_BASE_URL;
	const identityBoundary = githubTestBoundaryBaseURL
		? createTestIdentityBoundary(githubTestBoundaryBaseURL)
		: createProductionIdentityBoundary();

	return betterAuth({
		database: identityBoundary.database,
		trustedOrigins: [env.CORS_ORIGIN],
		socialProviders: identityBoundary.socialProviders,
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		plugins: [...identityBoundary.plugins, nextCookies()],
	});
}

export const auth = createAuth();
