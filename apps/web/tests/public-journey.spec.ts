import AxeBuilder from "@axe-core/playwright";
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

test("a Builder can anonymously retrieve the complete Foundation Pack Release", async ({
	page,
	request,
}) => {
	const response = await request.get("/r/foundation/1.0.0.json");

	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toContain("application/json");
	const registryItem = (await response.json()) as {
		name: string;
		type: string;
		files: Array<{ content: string; target: string }>;
	};
	expect(registryItem).toMatchObject({
		name: "foundation",
		type: "registry:item",
	});
	const manifestFile = registryItem.files.find((file) =>
		file.target.endsWith("agentkogei.manifest.json"),
	);
	const manifest = JSON.parse(manifestFile?.content ?? "") as {
		access: string;
		release: { immutable: boolean; version: string };
	};
	expect(manifest).toMatchObject({
		access: "open",
		release: { immutable: true, version: "1.0.0" },
	});
	expect(
		registryItem.files.some((file) => file.target.endsWith("DESIGN.md")),
	).toBe(true);

	await page.goto("/catalog/foundation");
	await expect(
		page.getByRole("link", { name: "Retrieve Foundation 1.0.0" }),
	).toHaveAttribute("href", "/r/foundation/1.0.0.json");
	await expect(
		page.getByText("Desktop 1440×900 and mobile 390×844"),
	).toBeVisible();
	await expect(page.getByText("Light, dark, and reduced motion")).toBeVisible();
	await expect(
		page.getByText("Human visual, accessibility, and rights review passed"),
	).toBeVisible();
});

test("Foundation evaluation renders every required screen across evaluated modes", async ({
	page,
}) => {
	const screens = [
		"Marketing",
		"Authentication",
		"Onboarding",
		"Dashboard",
		"Table",
		"Form",
		"Settings",
		"States",
	] as const;
	const modes = [
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
		},
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "dark" as const,
			reducedMotion: "no-preference" as const,
		},
		{
			viewport: { width: 390, height: 844 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
		},
		{
			viewport: { width: 390, height: 844 },
			colorScheme: "dark" as const,
			reducedMotion: "no-preference" as const,
		},
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "light" as const,
			reducedMotion: "reduce" as const,
		},
	] as const;

	for (const mode of modes) {
		await page.setViewportSize(mode.viewport);
		await page.emulateMedia({
			colorScheme: mode.colorScheme,
			reducedMotion: mode.reducedMotion,
		});
		await page.goto("/catalog/foundation");
		const preview = page.getByLabel("Foundation rendered Pack Preview");
		for (const screen of screens) {
			await expect(preview.getByText(screen, { exact: true })).toBeVisible();
		}
		const accessibility = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
			.analyze();
		expect(accessibility.violations).toEqual([]);
		const hasHorizontalOverflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		);
		expect(hasHorizontalOverflow).toBe(false);
	}
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
