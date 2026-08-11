import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { discoverDesignSystemRoutes } from "./support/design-systems";

const publicRoutes = ["/", "/design-systems"] as const;

const viewports = [
	{ name: "desktop", width: 1440, height: 900 },
	{ name: "mobile", width: 390, height: 844 },
] as const;

for (const route of publicRoutes) {
	for (const viewport of viewports) {
		test(`${route} has no detectable WCAG A or AA violations at the ${viewport.name} viewport`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			await page.goto(route);

			const results = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations).toEqual([]);
		});
	}
}

for (const viewport of viewports) {
	test(`every discovered Design System Preview has no detectable WCAG A or AA violations at the ${viewport.name} viewport`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		const routes = await discoverDesignSystemRoutes(page);

		for (const route of routes) {
			await page.goto(route);
			const results = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations, route).toEqual([]);
		}
	});
}
