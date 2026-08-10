import { defineConfig, devices } from "@playwright/test";

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
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "bun run tests/build-acceptance-app.ts && bun run start:test",
		env: {
			NEXT_TEST_BUILD: "true",
		},
		url: "http://localhost:3011",
		reuseExistingServer: false,
		timeout: 120_000,
	},
});
