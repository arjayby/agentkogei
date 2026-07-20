import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

function getVercelOrigin() {
	const vercelUrl =
		process.env.VERCEL_ENV === "production"
			? (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL)
			: (process.env.VERCEL_URL ?? process.env.VERCEL_PROJECT_PRODUCTION_URL);
	if (!vercelUrl) return undefined;
	return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
}

const vercelOrigin = getVercelOrigin();
const githubCredentialSchema =
	process.env.NODE_ENV === "production"
		? z.string().min(1)
		: z.string().min(1).default("local-development");

const runtimeEnv = {
	...process.env,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? vercelOrigin,
	CORS_ORIGIN: process.env.CORS_ORIGIN ?? vercelOrigin,
};

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		GITHUB_CLIENT_ID: githubCredentialSchema,
		GITHUB_CLIENT_SECRET: githubCredentialSchema,
		GITHUB_OAUTH_TEST_BASE_URL: z.url().optional(),
		AGENTKOGEI_BLACK_BOX_TEST: z.literal("true").optional(),
		AGENTKOGEI_TEST_DATABASE_PATH: z.string().min(1).optional(),
		POLAR_ACCESS_TOKEN: z.string().min(1),
		POLAR_PREMIUM_ACCESS_PRODUCT_ID: z.string().min(1).optional(),
		POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
		POLAR_SUCCESS_URL: z.url(),
		POLAR_WEBHOOK_SECRET: z.string().min(1).optional(),
		POLAR_LEGAL_REVIEW_REFERENCE: z.string().min(1).optional(),
		PREMIUM_DELIVERY_FIXTURE: z.string().min(1).optional(),
		COMMAND_PREMIUM_RELEASE: z.string().min(1).optional(),
		COMMAND_PREMIUM_RELEASE_SHA256: z
			.string()
			.regex(/^[a-f0-9]{64}$/)
			.optional(),
		SIGNAL_PREMIUM_RELEASE: z.string().min(1).optional(),
		SIGNAL_PREMIUM_RELEASE_SHA256: z
			.string()
			.regex(/^[a-f0-9]{64}$/)
			.optional(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
	},
	runtimeEnv: runtimeEnv,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});

const authHostname = new URL(env.BETTER_AUTH_URL).hostname;

export const blackBoxTestBoundaryEnabled =
	env.AGENTKOGEI_BLACK_BOX_TEST === "true" &&
	process.env.VERCEL_ENV !== "production" &&
	["localhost", "127.0.0.1", "::1"].includes(authHostname);

export const blackBoxDatabaseEnabled =
	blackBoxTestBoundaryEnabled && Boolean(env.AGENTKOGEI_TEST_DATABASE_PATH);

export const inMemoryBlackBoxBoundaryEnabled =
	blackBoxTestBoundaryEnabled && !blackBoxDatabaseEnabled;
