import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { discoverDesignSystemRoutes } from "./support/design-systems";

const publicRoutes = [
	"/",
	"/design-systems",
	"/guides",
	"/guides/design-md",
	"/methodology",
] as const;

const viewports = [
	{
		name: "desktop light",
		width: 1440,
		height: 900,
		colorScheme: "light",
	},
	{ name: "tablet dark", width: 768, height: 1024, colorScheme: "dark" },
	{ name: "mobile light", width: 390, height: 844, colorScheme: "light" },
] as const;

for (const route of publicRoutes) {
	for (const viewport of viewports) {
		test(`${route} has no detectable WCAG A or AA violations at the ${viewport.name} viewport`, async ({
			page,
		}) => {
			await page.setViewportSize(viewport);
			await page.emulateMedia({ colorScheme: viewport.colorScheme });
			await page.goto(route);

			const results = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations).toEqual([]);
		});
	}
}

for (const colorScheme of ["light", "dark"] as const) {
	test(`every selected Design System identity has no detectable WCAG A or AA violations in the ${colorScheme} theme`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme });
		await page.goto("/design-systems");
		const browser = page.getByRole("region", {
			name: "Published Design Systems",
		});
		const tabs = browser.getByRole("tab");

		for (let index = 0; index < (await tabs.count()); index += 1) {
			await tabs.nth(index).click();
			const results = await new AxeBuilder({ page })
				.include('[aria-label="Published Design Systems"]')
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations).toEqual([]);
		}
	});
}

for (const viewport of viewports) {
	test(`every discovered Design System Preview has no detectable WCAG A or AA violations at the ${viewport.name} viewport`, async ({
		page,
	}) => {
		await page.setViewportSize(viewport);
		await page.emulateMedia({ colorScheme: viewport.colorScheme });
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

for (const colorScheme of ["light", "dark"] as const) {
	test(`every discovered interaction specimen preserves semantics and modal focus in the ${colorScheme} theme`, async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme });
		const routes = await discoverDesignSystemRoutes(page);

		for (const route of routes) {
			await page.goto(route);
			const specimens = page.locator("[data-interactions-composition]");
			const tableRegion = specimens.getByRole("region", {
				name: /scroll region/i,
			});
			await tableRegion.focus();
			await expect(tableRegion).toHaveCSS("outline-style", "solid");

			const opener = specimens.getByRole("button", {
				name: /open .*dialog|open .*note|open .*details|open .*summary/i,
			});
			await opener.click();
			const dialog = page
				.getByRole("dialog")
				.filter({ hasNotText: /recover|restore|reversible|no persistence/i });
			await expect(dialog.getByRole("button").first()).toBeFocused();
			await page.keyboard.press("Shift+Tab");
			expect(
				await dialog.evaluate((element) =>
					element.contains(document.activeElement),
				),
				route,
			).toBe(true);
			await page.keyboard.press("Escape");
			await expect(opener).toBeFocused();

			const results = await new AxeBuilder({ page })
				.include("[data-interactions-composition]")
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
				.analyze();

			expect(results.violations, route).toEqual([]);
		}
	});
}

test("every discovered interaction specimen supports forced colors and narrow reflow", async ({
	page,
}) => {
	await page.emulateMedia({ forcedColors: "active" });
	await page.setViewportSize({ width: 320, height: 844 });
	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		await page.goto(route);
		const specimens = page.locator("[data-interactions-composition]");
		const tableRegion = specimens.getByRole("region", {
			name: /scroll region/i,
		});

		await expect(specimens).toBeVisible();
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
			route,
		).toBe(true);
		expect(
			await tableRegion.evaluate(
				(region) => region.scrollWidth > region.clientWidth,
			),
			route,
		).toBe(true);
		await tableRegion.focus();
		await expect(tableRegion).toHaveCSS("outline-style", "solid");
	}
});

test("every discovered behavior specimen removes nonessential reduced motion while preserving state changes", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		await page.goto(route);
		const specimen = page.getByRole("group", { name: "Motion specimen" });
		const state = specimen.getByRole("status", {
			name: "Motion specimen state",
		});
		const movingExample = specimen.getByText("Ready to move", { exact: true });

		await expect(state).toContainText(/does not autoplay/i);
		await expect(movingExample).toHaveCSS("transform", "none");
		await specimen.getByRole("button", { name: "Demonstrate motion" }).click();
		await expect(state).toContainText(/settled/i);
		await expect(
			specimen.getByText("State settled", { exact: true }),
		).toHaveCSS("transform", "none");

		const results = await new AxeBuilder({ page })
			.include("[data-behavior-composition]")
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
			.analyze();

		expect(results.violations, route).toEqual([]);
	}
});
