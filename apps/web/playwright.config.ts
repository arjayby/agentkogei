import { defineConfig, devices } from "@playwright/test";

import { buildTestPremiumDeliveryFixture } from "./tests/support/premium-delivery-fixture";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
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
		command: "bun run dev:test",
		env: {
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
		},
		url: "http://localhost:3011",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
