import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

import {
	buildTestCommandPackRelease,
	buildTestPremiumDeliveryFixture,
	buildTestSignalPackRelease,
} from "./tests/support/premium-delivery-fixture";

const commandPremiumRelease = buildTestCommandPackRelease();
const signalPremiumRelease = buildTestSignalPackRelease();
const testDatabasePath = resolve(".black-box/postgres");

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: "line",
	use: {
		baseURL: "http://localhost:3011",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			testIgnore: /premium-delivery-journey\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "premium-delivery",
			dependencies: ["chromium"],
			testMatch: /premium-delivery-journey\.spec\.ts/,
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command:
			"bun run database:test:prepare && AGENTKOGEI_BLACK_BOX_TEST= AGENTKOGEI_TEST_DATABASE_PATH= bun run build && bun run start:test 2>&1 | tee .black-box/application.log",
		env: {
			AGENTKOGEI_BLACK_BOX_TEST: "true",
			AGENTKOGEI_TEST_DATABASE_PATH: testDatabasePath,
			BETTER_AUTH_URL: "http://localhost:3011",
			CORS_ORIGIN: "http://localhost:3011",
			GITHUB_CLIENT_ID: "deterministic-github-client",
			GITHUB_CLIENT_SECRET: "deterministic-github-secret",
			GITHUB_OAUTH_TEST_BASE_URL: "http://localhost:3011/api/test/github",
			POLAR_ACCESS_TOKEN: "deterministic-polar-token",
			POLAR_PREMIUM_ACCESS_PRODUCT_ID: "polar-premium-access",
			POLAR_SUCCESS_URL:
				"http://localhost:3011/success?checkout_id={CHECKOUT_ID}",
			POLAR_WEBHOOK_SECRET: "deterministic-polar-webhook-secret",
			NEXT_TEST_BUILD: "true",
			PREMIUM_DELIVERY_FIXTURE: buildTestPremiumDeliveryFixture(),
			COMMAND_PREMIUM_RELEASE: commandPremiumRelease,
			COMMAND_PREMIUM_RELEASE_SHA256: createHash("sha256")
				.update(commandPremiumRelease)
				.digest("hex"),
			SIGNAL_PREMIUM_RELEASE: signalPremiumRelease,
			SIGNAL_PREMIUM_RELEASE_SHA256: createHash("sha256")
				.update(signalPremiumRelease)
				.digest("hex"),
		},
		url: "http://localhost:3011",
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
