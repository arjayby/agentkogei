import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const outputArgument = process.argv[2];
if (!outputArgument || !path.isAbsolute(outputArgument)) {
	throw new Error(
		"Usage: bun run scripts/capture-command-evaluation.ts <absolute-output-directory>",
	);
}

const origin = process.env.COMMAND_EVALUATION_ORIGIN ?? "http://localhost:3011";
await mkdir(outputArgument, { recursive: true });

const modes = [
	{
		name: "desktop-light",
		viewport: { width: 1440, height: 900 },
		colorScheme: "light" as const,
		reducedMotion: "no-preference" as const,
	},
	{
		name: "desktop-dark",
		viewport: { width: 1440, height: 900 },
		colorScheme: "dark" as const,
		reducedMotion: "no-preference" as const,
	},
	{
		name: "mobile-light",
		viewport: { width: 390, height: 844 },
		colorScheme: "light" as const,
		reducedMotion: "no-preference" as const,
	},
	{
		name: "mobile-dark",
		viewport: { width: 390, height: 844 },
		colorScheme: "dark" as const,
		reducedMotion: "no-preference" as const,
	},
	{
		name: "desktop-reduced-motion",
		viewport: { width: 1440, height: 900 },
		colorScheme: "dark" as const,
		reducedMotion: "reduce" as const,
	},
] as const;

const browser = await chromium.launch();
try {
	for (const mode of modes) {
		const context = await browser.newContext({
			viewport: mode.viewport,
			colorScheme: mode.colorScheme,
			reducedMotion: mode.reducedMotion,
		});
		const page = await context.newPage();
		await page.goto(`${origin}/catalog/command`, { waitUntil: "networkidle" });
		await page.addStyleTag({
			content: "nextjs-portal { display: none !important; }",
		});
		await page.screenshot({
			path: path.join(outputArgument, `${mode.name}-page.png`),
			fullPage: true,
		});
		await page.locator("body > header").evaluate((header) => {
			header.style.display = "none";
		});
		await page.getByLabel("Command rendered Pack Preview").screenshot({
			path: path.join(outputArgument, `${mode.name}-preview.png`),
		});
		await context.close();
	}
} finally {
	await browser.close();
}

console.log(`Captured Command evaluation screenshots in ${outputArgument}`);
