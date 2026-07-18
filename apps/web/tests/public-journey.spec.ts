import { expect, test } from "@playwright/test";

test("a prospective Builder can understand what a Design Pack changes", async ({
	page,
}) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", {
			name: "One interface system. Every agent. Every screen.",
		}),
	).toBeVisible();
	await expect(page.getByText("design drift", { exact: false })).toBeVisible();
	await expect(
		page.getByText("not a theme or application template", { exact: false }),
	).toBeVisible();
});

test("the Official Catalog presents every launch pack with its access class", async ({
	page,
}) => {
	await page.goto("/catalog");

	const catalog = page.getByRole("main");
	await expect(
		catalog.getByRole("link", { name: /Foundation.*Open/i }),
	).toBeVisible();
	await expect(
		catalog.getByRole("link", { name: /Editorial.*Open/i }),
	).toBeVisible();
	await expect(
		catalog.getByRole("link", { name: /Command.*Premium/i }),
	).toBeVisible();
	await expect(
		catalog.getByRole("link", { name: /Signal.*Premium/i }),
	).toBeVisible();
});

test("a premium Pack Preview shows complete evidence without exposing gated resources", async ({
	page,
}) => {
	await page.goto("/catalog/command");

	await expect(page.getByRole("heading", { name: "Command" })).toBeVisible();
	await expect(
		page.getByText("WCAG 2.2 Level AA", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("React / Next.js · Tailwind CSS v4 · shadcn/ui"),
	).toBeVisible();
	await expect(page.getByText("Commercial Pack License")).toBeVisible();
	await expect(
		page.getByText(
			"remains licensed in that Project after Premium Access expires",
			{ exact: false },
		),
	).toBeVisible();
	await expect(page.getByLabel("Command rendered Pack Preview")).toBeVisible();
	await expect(page.getByRole("heading", { name: "Coverage" })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Included resources" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Release history" }),
	).toBeVisible();
	await expect(page.getByRole("heading", { name: "Changelog" })).toBeVisible();
	await expect(page.getByText("DESIGN.md", { exact: true })).toHaveCount(0);
	await expect(
		page.getByText("registry payload", { exact: false }),
	).toHaveCount(0);
});

test("pricing discloses the complete Premium Access offer", async ({
	page,
}) => {
	await page.goto("/pricing");

	await expect(page.getByText("$99", { exact: true })).toBeVisible();
	await expect(
		page.getByText("one named Builder", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("unlimited Projects", { exact: false }),
	).toBeVisible();
	await expect(page.getByText("No trial", { exact: false })).toBeVisible();
	await expect(
		page.getByText("No voluntary refunds", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("one Material Release per quarter", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("remains licensed in that Project", { exact: false }),
	).toBeVisible();
});

test("public documentation explains Installation and remains usable on mobile", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/docs");

	await expect(
		page.getByRole("heading", { name: "Installation", exact: true }),
	).toBeVisible();
	await expect(
		page.getByText("one Installed Pack", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("React or Next.js", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("never executes pack-supplied code", { exact: false }),
	).toBeVisible();
	await expect(page.getByText("CC BY 4.0", { exact: false })).toBeVisible();

	const hasHorizontalOverflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth,
	);
	expect(hasHorizontalOverflow).toBe(false);
});

const responsiveRoutes = [
	"/",
	"/catalog",
	"/catalog/command",
	"/pricing",
	"/docs",
] as const;

for (const route of responsiveRoutes) {
	test(`${route} remains navigable without horizontal overflow on mobile`, async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(route);

		const navigation = page.getByRole("navigation", {
			name: "Primary navigation",
		});
		await expect(
			navigation.getByRole("link", { name: "Catalog", exact: true }),
		).toBeVisible();
		await expect(
			navigation.getByRole("link", { name: "Pricing", exact: true }),
		).toBeVisible();
		await expect(
			navigation.getByRole("link", { name: "Docs", exact: true }),
		).toBeVisible();

		const hasHorizontalOverflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		);
		expect(hasHorizontalOverflow).toBe(false);
	});
}
