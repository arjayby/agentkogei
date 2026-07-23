import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
	"/",
	"/catalog",
	"/catalog/foundation",
	"/catalog/editorial",
	"/catalog/command",
	"/catalog/signal",
	"/premium",
	"/docs",
] as const;

for (const route of publicRoutes) {
	test(`${route} has no detectable WCAG A or AA violations`, async ({
		page,
	}) => {
		await page.goto(route);

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
			.analyze();

		expect(results.violations).toEqual([]);
	});
}
