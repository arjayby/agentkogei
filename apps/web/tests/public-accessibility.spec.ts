import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { discoverDesignSystemRoutes } from "./support/design-systems";

const publicRoutes = ["/", "/design-systems"] as const;

const viewports = [
	{ name: "desktop", width: 1440, height: 900 },
	{ name: "tablet", width: 768, height: 1024 },
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

for (const colorScheme of ["light", "dark"] as const) {
	test(`every discovered control specimen preserves names, focus, and validation in the ${colorScheme} theme`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme });
		const routes = await discoverDesignSystemRoutes(page);

		for (const route of routes) {
			await page.goto(route);
			const specimens = page.locator("[data-controls-composition]");
			const interactiveActions = specimens.getByRole("group", {
				name: "Interactive actions",
			});
			await expect(
				interactiveActions.getByRole("button"),
			).not.toHaveAccessibleName("");
			await expect(
				interactiveActions.getByRole("link"),
			).not.toHaveAccessibleName("");

			const navigationLinks = specimens
				.getByRole("navigation")
				.getByRole("link");
			await navigationLinks.last().focus();
			await expect(navigationLinks.last()).toHaveCSS("outline-style", "solid");

			const form = specimens.getByRole("form");
			await form.getByRole("button").click();
			await expect(form.getByRole("alert")).toBeVisible();

			const results = await new AxeBuilder({ page })
				.include("[data-controls-composition]")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations, route).toEqual([]);
		}
	});
}
