import { defineConfig, devices } from "@playwright/test";

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
			NEXT_TEST_BUILD: "true",
		},
		url: "http://localhost:3011",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
