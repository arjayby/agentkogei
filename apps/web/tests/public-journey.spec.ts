import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { runCli } from "./support/cli";
import {
	discoverDesignSystemRoutes,
	readPublishedDesignSystem,
} from "./support/design-systems";

const removedNavigationDestinations = [
	"/pricing",
	"/premium",
	"/login",
	"/dashboard",
	"/terms",
	"/privacy",
] as const;

function runDesignContractInstallation(
	project: string,
	selector: string,
	options: string[] = ["--yes"],
) {
	return runCli(["add", selector, ...options], {
		cwd: project,
		environment: {
			AGENTKOGEI_CONTRACT_CATALOG_URL: "http://localhost:3011/contracts/",
		},
	});
}

test("a prospective Builder can understand what a Design System changes", async ({
	page,
}) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", {
			name: "Give your agents better taste.",
		}),
	).toBeVisible();
	await expect(
		page.getByText("generic design slop", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Choose a design system" }),
	).toHaveAttribute("href", "/design-systems");
	await expect(page.locator('a[href="/docs"]')).toHaveCount(0);
});

test("the landing page locks its brand artwork without URL evaluation options", async ({
	page,
}) => {
	await page.goto(
		"/?hero=paper&motion=ambient&mobile=hide&mark=horizontal&header=mark",
	);

	await expect(page.locator("main[data-mark], main[data-header]")).toHaveCount(
		0,
	);
	await expect(page.locator(".hero-artwork")).toBeVisible();
	await expect(page.locator(".hero-field-mark")).toHaveCount(9);
	await expect(page.locator(".site-brand-mark")).toBeVisible();
	await expect(page.locator(".site-brand-wordmark")).toBeVisible();
	await expect(page.locator(".hero-artwork")).toHaveCSS(
		"background-color",
		"rgba(0, 0, 0, 0)",
	);
	await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveCount(
		1,
	);
});

test("hero artwork honors reduced motion", async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");

	await expect(page.locator(".hero-field-mark").first()).toHaveCSS(
		"animation-name",
		"none",
	);
});

test("the landing page composes one add command from a package manager and a Design System", async ({
	context,
	page,
}) => {
	await context.grantPermissions(["clipboard-read", "clipboard-write"]);
	await page.goto("/");
	const installation = page.getByRole("region", {
		name: "Installation command",
	});
	const command = installation.getByLabel("Generated command");

	await expect(command).toHaveText("npx agentkogei@latest add foundation");
	await page.mouse.move(0, 0);
	await page.waitForTimeout(2200);
	await expect(command).toHaveText("npx agentkogei@latest add editorial");

	await installation.getByRole("tab", { name: "bun" }).click();
	await expect(command).toHaveText("bunx agentkogei@latest add editorial");

	await installation.getByRole("button", { name: "Copy command" }).click();
	await expect(
		installation.getByRole("button", { name: "Copied" }),
	).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		"bunx agentkogei@latest add editorial",
	);

	await page.mouse.move(0, 0);
	await page.waitForTimeout(2200);
	await expect(command).toHaveText("bunx agentkogei@latest add editorial");
});

test("the landing page presents every discovered visual direction without release details", async ({
	page,
}) => {
	await page.goto("/");

	const designSystemsRegion = page.getByRole("region", {
		name: "Choose your taste.",
	});
	const homeRoutes = await designSystemsRegion
		.getByRole("link")
		.evaluateAll((links) =>
			links.flatMap((link) => {
				const href = link.getAttribute("href");
				return href?.startsWith("/design-systems/") ? [href] : [];
			}),
		);
	await expect(
		designSystemsRegion.getByRole("link", { name: /Signal/i }),
	).toHaveCount(0);
	await expect(page.getByText(/Recently published/i)).toHaveCount(0);
	const identityEntries = designSystemsRegion.locator(
		"[data-design-system-identity]",
	);
	await expect(identityEntries).toHaveCount(homeRoutes.length);
	for (const entry of await identityEntries.all()) {
		await expect(entry.getByRole("img")).toHaveCount(1);
		await expect(entry.locator("[data-identity-summary]")).not.toBeEmpty();
		await expect(entry.locator("[data-identity-fit]")).not.toBeEmpty();
	}
	await expect(
		designSystemsRegion.locator(".catalog-preview-artwork"),
	).toHaveCount(0);
	await expect(
		designSystemsRegion.getByText("Clarity before character.", { exact: true }),
	).toHaveCount(0);
	const designSystemRoutes = await discoverDesignSystemRoutes(page);
	expect(homeRoutes.length).toBeGreaterThan(0);
	expect(new Set(homeRoutes)).toEqual(new Set(designSystemRoutes));
});

test("removed commercial, account, authorization, and telemetry routes are absent", async ({
	request,
}) => {
	const removedRoutes = [
		...removedNavigationDestinations,
		"/docs",
		"/success",
		"/device",
		"/device/result",
		"/test/polar/checkout",
		"/test/polar/portal",
		"/api/auth/session",
		"/api/rpc/privateData",
		"/api/billing/checkout",
		"/api/billing/portal",
		"/api/billing/polar/webhooks",
		"/api/device/code",
		"/api/device/token",
		"/api/device/decision",
		"/api/pack-credentials/verify",
		"/api/pack-credentials/example/revoke",
		"/api/cli-diagnostics",
		"/api/test/github/authorize",
		"/api/test/device/pending",
		"/api/test/device/expire",
		"/api/test/pack-credentials/scope",
		"/api/test/polar/complete",
		"/api/test/polar/events",
		"/api/test/premium-delivery/observation",
		"/api/test/premium-delivery/entitlement-events",
	] as const;

	for (const route of removedRoutes) {
		const response = await request.get(route, { maxRedirects: 0 });
		expect(response.status(), route).toBe(404);
		expect(response.headers().location, route).toBeUndefined();
	}
});

test("public Design Systems routes replace every former Catalog route", async ({
	page,
	request,
}) => {
	await page.goto("/design-systems");
	await expect(
		page.getByRole("heading", { name: "Published systems. Distinct voices." }),
	).toBeVisible();
	await expect(
		page.getByRole("main").getByRole("link", { name: "Explore Foundation" }),
	).toHaveAttribute("href", "/design-systems/foundation");

	await page.goto("/design-systems/foundation");
	await expect(
		page.getByRole("heading", { name: "Foundation", exact: true }),
	).toBeVisible();

	for (const route of [
		"/catalog",
		"/catalog/foundation",
		"/catalog/editorial",
		"/catalog/mono",
		"/catalog/command",
		"/catalog/unknown",
		"/catalog/foundation/releases",
	]) {
		const response = await request.get(route, { maxRedirects: 0 });
		expect(response.status(), route).toBe(404);
		expect(response.headers().location, route).toBeUndefined();
	}
});

test("every page carries a footer naming Design Systems and public product surfaces", async ({
	page,
}) => {
	await page.goto("/");
	const footer = page.getByRole("contentinfo");

	for (const designSystem of ["Foundation", "Editorial", "Mono", "Command"]) {
		await expect(
			footer.getByRole("link", { name: designSystem, exact: true }),
		).toHaveAttribute("href", `/design-systems/${designSystem.toLowerCase()}`);
	}
	await expect(
		footer.getByRole("link", { name: "Design Systems", exact: true }),
	).toHaveAttribute("href", "/design-systems");
	await expect(footer.getByRole("link", { name: "Docs" })).toHaveCount(0);
	await expect(
		footer.getByRole("link", { name: "GitHub", exact: true }),
	).toHaveAttribute("href", "https://github.com/arjayby/agentkogei");
});

test("public navigation and calls to action expose no commercial or account journeys", async ({
	page,
}) => {
	for (const route of ["/", "/design-systems", "/design-systems/foundation"]) {
		await page.goto(route);
		const actionText = (await page.locator("a, button").allInnerTexts()).join(
			" ",
		);
		expect(actionText).not.toMatch(
			/pricing|premium|subscription|sign in|account|billing|checkout/i,
		);
		for (const destination of removedNavigationDestinations) {
			await expect(page.locator(`a[href="${destination}"]`)).toHaveCount(0);
		}
	}
});

test("public pages use Design System vocabulary without retired product claims", async ({
	page,
}) => {
	for (const route of [
		"/",
		"/design-systems",
		"/design-systems/foundation",
		"/design-systems/editorial",
		"/design-systems/mono",
		"/design-systems/command",
	]) {
		await page.goto(route);
		const visibleCopy = await page.locator("body").innerText();
		expect(visibleCopy, route).not.toMatch(
			/\b(?:catalog|pack|packs|premium|pricing|subscription|signal)\b/i,
		);
		expect(visibleCopy, route).not.toMatch(
			/(^|\n)Access(?:\s*·[^\n]*)?(?=\n|$)/i,
		);
		await expect(page.getByText("Open", { exact: true })).toHaveCount(0);
	}
});

test("public page metadata uses Design System vocabulary", async ({ page }) => {
	const expectations = [
		["/", /Give your agents better taste.*AgentKogei/i],
		["/design-systems", /Design Systems.*AgentKogei/i],
		[
			"/design-systems/foundation",
			/Foundation Design System Preview.*AgentKogei/i,
		],
	] as const;

	for (const [route, title] of expectations) {
		await page.goto(route);
		await expect(page).toHaveTitle(title);
		const description = await page
			.locator('meta[name="description"]')
			.getAttribute("content");
		expect(description, route).toMatch(/Design System/i);
		expect(description, route).not.toMatch(/\bpack\b/i);
	}
});

test("Design Systems retains every launch Design System", async ({ page }) => {
	await page.goto("/design-systems");
	const designSystems = page.getByRole("main");

	for (const designSystem of ["Foundation", "Editorial", "Mono", "Command"]) {
		await expect(
			designSystems.getByRole("tab", { name: designSystem, exact: true }),
		).toHaveCount(1);
	}
	await expect(designSystems.getByRole("tab", { name: /Signal/i })).toHaveCount(
		0,
	);
});

test("a Builder compares Design Systems through explicit tab activation and shareable hash state", async ({
	page,
}) => {
	await page.goto("/design-systems");
	const browser = page.getByRole("region", {
		name: "Published Design Systems",
	});
	const foundation = browser.getByRole("tab", {
		name: "Foundation",
		exact: true,
	});
	const editorial = browser.getByRole("tab", {
		name: "Editorial",
		exact: true,
	});

	await expect(foundation).toHaveAttribute("aria-selected", "true");
	const foundationPanel = browser.getByRole("tabpanel", { name: "Foundation" });
	await expect(foundationPanel).toBeVisible();
	await expect(
		foundationPanel.getByRole("img", {
			name: "Foundation Design System Mark",
		}),
	).toHaveAttribute("data-mark-size", "collection");
	await expect(
		foundationPanel.getByText("Neutral, crisp, and highly legible B2B SaaS."),
	).toBeVisible();
	await expect(
		foundationPanel.getByText("Clarity before character.", { exact: true }),
	).toBeVisible();
	await expect(foundationPanel.locator("ol").getByRole("listitem")).toHaveCount(
		3,
	);
	await expect(
		foundationPanel.getByRole("region", { name: "Current theme palette" }),
	).toBeVisible();
	await expect(
		foundationPanel.getByRole("region", { name: "Typography sample" }),
	).toBeVisible();
	await expect(
		foundationPanel.getByText("Versatile product foundations", {
			exact: true,
		}),
	).toBeVisible();
	const collectionShellColor = await page
		.locator("header.site-header")
		.evaluate((element) => getComputedStyle(element).backgroundColor);
	const foundationPanelPrimary = await foundationPanel
		.locator("[data-design-system-preview]")
		.evaluate((element) =>
			getComputedStyle(element).getPropertyValue("--preview-primary").trim(),
		);
	await editorial.hover();
	await expect(foundation).toHaveAttribute("aria-selected", "true");

	await foundation.focus();
	await page.keyboard.press("ArrowDown");
	await expect(editorial).toBeFocused();
	await expect(foundation).toHaveAttribute("aria-selected", "true");
	await page.keyboard.press("Enter");

	await expect(editorial).toHaveAttribute("aria-selected", "true");
	await expect(
		browser.getByRole("tabpanel", { name: "Editorial" }),
	).toBeVisible();
	await expect(page).toHaveURL(/\/design-systems#editorial$/);
	await expect(
		browser.getByRole("link", { name: "Explore Editorial" }),
	).toHaveAttribute("href", "/design-systems/editorial");
	await expect(page.locator("header.site-header")).toHaveCSS(
		"background-color",
		collectionShellColor,
	);
	const editorialPanelPrimary = await browser
		.getByRole("tabpanel", { name: "Editorial" })
		.locator("[data-design-system-preview]")
		.evaluate((element) =>
			getComputedStyle(element).getPropertyValue("--preview-primary").trim(),
		);
	expect(editorialPanelPrimary).not.toBe(foundationPanelPrimary);

	await page.goto("/design-systems#mono");
	await expect(
		browser.getByRole("tab", { name: "Mono", exact: true }),
	).toHaveAttribute("aria-selected", "true");
	await expect(browser.getByRole("tabpanel", { name: "Mono" })).toBeVisible();
});

test("the split browser uses a desktop rail and a horizontally scrollable mobile tab row", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/design-systems");
	const browser = page.locator(".design-system-browser");
	const rail = page.locator(".design-system-browser-rail");
	const tablist = page.getByRole("tablist", {
		name: "Design System selection",
	});
	const panel = page.getByRole("tabpanel", { name: "Foundation" });

	await expect(tablist).toHaveAttribute("aria-orientation", "vertical");
	const desktopRailBox = await rail.boundingBox();
	const desktopPanelBox = await panel.boundingBox();
	expect(desktopRailBox).not.toBeNull();
	expect(desktopPanelBox).not.toBeNull();
	expect(desktopRailBox?.x).toBeLessThan(desktopPanelBox?.x ?? 0);

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(tablist).not.toHaveAttribute("aria-orientation", "vertical");
	const [firstTabBox, secondTabBox, mobileRailBox, mobilePanelBox] =
		await Promise.all([
			tablist.getByRole("tab").nth(0).boundingBox(),
			tablist.getByRole("tab").nth(1).boundingBox(),
			rail.boundingBox(),
			panel.boundingBox(),
		]);
	expect(firstTabBox).not.toBeNull();
	expect(secondTabBox).not.toBeNull();
	expect(mobileRailBox).not.toBeNull();
	expect(mobilePanelBox).not.toBeNull();
	expect(firstTabBox?.x).toBeLessThan(secondTabBox?.x ?? 0);
	expect(mobileRailBox?.y).toBeLessThan(mobilePanelBox?.y ?? 0);
	expect(
		await rail.evaluate((element) => element.scrollWidth > element.clientWidth),
	).toBe(true);
	await expect(browser).toBeVisible();
});

test("every discovered Design System route presents its complete published anatomy", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		const {
			identity,
			name,
			currentRelease: release,
		} = await readPublishedDesignSystem(page, route);
		const preview = page.getByLabel(`${name} rendered Design System Preview`);
		const coverage = await page
			.getByRole("region", { name: "Coverage" })
			.getByRole("listitem")
			.allInnerTexts();
		const renderedSurfaces = await preview
			.getByRole("heading", { level: 3 })
			.allTextContents();

		expect(coverage.length, route).toBeGreaterThan(0);
		expect(renderedSurfaces, route).toEqual(coverage);
		await expect(
			page.getByRole("region", { name: "Installation command" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", {
				name: `Read the ${name} ${release} Design Contract`,
			}),
		).toHaveAttribute("href", `/contracts/${identity}/${release}`);
	}
});

test("every discovered complete Preview uses its themed shell and Design System Mark", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);
	const initialMarkLabels = new Map([
		["foundation", "Stable aligned structural planes"],
		["editorial", "Layered page leaves around a reading axis"],
		["mono", "Nested apertures reducing toward a focal point"],
		["command", "Intersecting directional nodes"],
	]);

	for (const route of routes) {
		const { identity, name, currentRelease } = await readPublishedDesignSystem(
			page,
			route,
		);
		const preview = page.locator(
			`main[data-design-system-preview-page="${identity}"]`,
		);
		const marks = preview.getByRole("img", {
			name: `${name} Design System Mark`,
		});
		const compactMark = preview.locator('[data-mark-size="compact"]');
		const heroMark = preview.locator('[data-mark-size="hero"]');

		await expect(preview).toBeVisible();
		await expect(marks).toHaveCount(2);
		await expect(compactMark).toBeVisible();
		await expect(heroMark).toBeVisible();
		await expect(heroMark).toHaveAttribute("data-mark-recipe");
		const markSizes = await marks.evaluateAll((elements) =>
			elements.map((element) => element.getBoundingClientRect().width),
		);
		expect(markSizes[0], route).toBe(32);
		expect(markSizes[1], route).toBeGreaterThan(160);
		const expectedMarkLabel = initialMarkLabels.get(identity);
		if (expectedMarkLabel) {
			await expect(heroMark).toHaveAttribute(
				"aria-description",
				expectedMarkLabel,
			);
		}

		const sectionOrder = await preview
			.locator("[data-preview-section]")
			.evaluateAll((sections) =>
				sections.map((section) => section.getAttribute("data-preview-section")),
			);
		expect(sectionOrder.slice(0, 4), route).toEqual([
			"hero",
			"installation",
			"exploration",
			"release-details",
		]);

		const command = preview
			.getByRole("region", { name: "Installation command" })
			.getByLabel("Generated command");
		await expect(command).toHaveText(`npx agentkogei@latest add ${identity}`);
		await expect(
			preview.getByRole("heading", { name: "Release details" }),
		).toBeVisible();
		await expect(
			preview.getByText(`Release ${currentRelease}`, { exact: true }).first(),
		).toBeVisible();
		await expect(preview.getByText(/^Published /)).toHaveCount(0);
		await expect(
			preview.getByRole("heading", { name: "Release history" }),
		).toHaveCount(0);

		const shellColors = await page.evaluate(() => {
			const header = document.querySelector(".site-header");
			const main = document.querySelector("main");
			const footer = document.querySelector("footer");
			if (!(header && main && footer)) return null;
			return [header, main, footer].map(
				(element) => getComputedStyle(element).backgroundColor,
			);
		});
		expect(shellColors, route).not.toBeNull();
		expect(new Set(shellColors).size, route).toBe(1);
	}
});

test("a complete Preview preserves and switches the Builder's current theme", async ({
	page,
}) => {
	const consoleErrors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") consoleErrors.push(message.text());
	});
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/design-systems/foundation");

	await expect(page.locator("html")).toHaveClass(/dark/);
	const darkBackground = await page
		.locator('main[data-design-system-preview-page="foundation"]')
		.evaluate((main) => getComputedStyle(main).backgroundColor);

	await page.getByRole("button", { name: "Toggle theme" }).click();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	const lightBackground = await page
		.locator('main[data-design-system-preview-page="foundation"]')
		.evaluate((main) => getComputedStyle(main).backgroundColor);

	expect(lightBackground).not.toBe(darkBackground);
	expect(consoleErrors).toEqual([]);
});

test("every discovered Preview renders the complete visual foundations specimen in one order", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);
	const sectionOrder = [
		"principles",
		"semantic-colors",
		"typography",
		"spacing",
		"layout-responsive",
		"radius-borders-elevation",
	];
	for (const route of routes) {
		const { name } = await readPublishedDesignSystem(page, route);
		const foundations = page.getByRole("region", {
			name: `${name} visual foundations`,
		});
		const composition = await page
			.getByRole("main")
			.getAttribute("data-preview-composition");

		await expect(foundations).toBeVisible();
		await expect(foundations).toHaveAttribute(
			"data-foundations-composition",
			composition ?? "",
		);
		expect(
			await foundations
				.locator("[data-foundation-section]")
				.evaluateAll((sections) =>
					sections.map((section) =>
						section.getAttribute("data-foundation-section"),
					),
				),
			route,
		).toEqual(sectionOrder);

		for (const scheme of ["Light", "Dark"]) {
			const colors = foundations.getByRole("region", {
				name: `${scheme} semantic colors`,
			});
			await expect(colors.getByRole("listitem")).toHaveCount(13);
			await expect(colors.locator("code")).toHaveCount(13);
		}

		expect(
			await foundations.locator("[data-type-role]").count(),
			route,
		).toBeGreaterThanOrEqual(4);
		expect(
			await foundations.locator("[data-spacing-step]").count(),
			route,
		).toBeGreaterThanOrEqual(7);
		await expect(foundations.locator("[data-responsive-mode]")).toHaveCount(5);
		expect(
			await foundations.locator("[data-radius-specimen]").count(),
			route,
		).toBeGreaterThanOrEqual(3);
		await expect(foundations.locator("[data-border-specimen]")).toHaveCount(3);
		await expect(foundations.locator("[data-elevation-specimen]")).toHaveCount(
			3,
		);
	}
});

test("every discovered Preview exposes self contained controls and content containers", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);
	const stateNames = [
		"Default",
		"Hover",
		"Focus",
		"Active",
		"Disabled",
		"Loading",
		"Success",
		"Error",
	];

	for (const route of routes) {
		const { name } = await readPublishedDesignSystem(page, route);
		const externalRequests: string[] = [];
		const captureSpecimenRequest = (request: {
			resourceType(): string;
			url(): string;
		}) => {
			const url = new URL(request.url());
			if (
				["fetch", "xhr"].includes(request.resourceType()) &&
				!url.searchParams.has("_rsc")
			) {
				externalRequests.push(request.url());
			}
		};
		page.on("request", captureSpecimenRequest);
		const specimens = page.getByRole("region", {
			name: `${name} controls and content containers`,
		});

		await expect(specimens).toBeVisible();
		await expect(specimens.getByRole("heading", { level: 3 })).toHaveText([
			"Buttons and links",
			"Forms and inputs",
			"Cards and panels",
			"Navigation",
		]);

		for (const groupName of ["Button states", "Link states"]) {
			const stateGroup = specimens.getByRole("group", { name: groupName });
			for (const stateName of stateNames) {
				await expect(
					stateGroup.getByText(stateName, { exact: true }),
				).toBeVisible();
			}
		}

		const primaryAction = specimens
			.getByRole("group", { name: "Interactive actions" })
			.getByRole("button");
		await primaryAction.click();
		await expect(
			specimens.getByRole("status", { name: "Action result" }),
		).toContainText(/complete/i);

		const form = specimens.getByRole("form");
		await form.getByRole("button").click();
		await expect(form.getByRole("alert")).toBeVisible();
		await form
			.getByRole("textbox", { name: /email|address/i })
			.fill("builder@example.com");
		await form.getByRole("button").click();
		await expect(form.getByRole("status")).toBeVisible();

		const navigation = specimens.getByRole("navigation");
		const navigationLinks = navigation.getByRole("link");
		await expect(navigationLinks.first()).toHaveAttribute(
			"aria-current",
			"page",
		);
		await navigationLinks.last().focus();
		await page.keyboard.press("Enter");
		await expect(navigationLinks.last()).toHaveAttribute(
			"aria-current",
			"page",
		);
		expect(externalRequests, route).toEqual([]);
		page.off("request", captureSpecimenRequest);
	}
});

test("every discovered Preview exposes accessible data, feedback, dialogs, and local destructive actions", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);
	const feedbackStates = [
		"Loading",
		"Empty",
		"Filtered empty",
		"Error",
		"Success",
		"Disabled",
		"Destructive",
	];

	for (const route of routes) {
		const { name } = await readPublishedDesignSystem(page, route);
		const externalRequests: string[] = [];
		const captureSpecimenRequest = (request: {
			resourceType(): string;
			url(): string;
		}) => {
			const url = new URL(request.url());
			if (
				["fetch", "xhr"].includes(request.resourceType()) &&
				!url.searchParams.has("_rsc")
			) {
				externalRequests.push(request.url());
			}
		};
		page.on("request", captureSpecimenRequest);
		const specimens = page.getByRole("region", {
			name: `${name} data, feedback, and consequential interactions`,
		});

		await expect(specimens).toBeVisible();
		await expect(specimens.getByRole("heading", { level: 3 })).toHaveText([
			"Tables, lists, and data display",
			"Badges, alerts, and feedback states",
			"Dialogs and destructive actions",
		]);

		const table = specimens.getByRole("table");
		await expect(table.getByRole("columnheader")).toHaveCount(3);
		await expect(table.getByRole("rowheader")).toHaveCount(3);
		await expect(
			specimens.getByRole("region", { name: /scroll region/i }),
		).toHaveAttribute("tabindex", "0");
		await expect(
			specimens.getByRole("list", { name: /summary|details|context/i }),
		).toBeVisible();

		const states = specimens.getByRole("group", { name: "Feedback states" });
		for (const state of feedbackStates) {
			await expect(states.getByText(state, { exact: true })).toBeVisible();
		}

		const dialogOpener = specimens.getByRole("button", {
			name: /open .*dialog|open .*note|open .*details|open .*summary/i,
		});
		await dialogOpener.click();
		const dialog = page
			.getByRole("dialog")
			.filter({ hasNotText: /cannot be undone/i });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole("button").first()).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(dialog).not.toBeVisible();
		await expect(dialogOpener).toBeFocused();

		const destructiveOpener = specimens.getByRole("button", {
			name: /remove|delete/i,
		});
		await destructiveOpener.click();
		const destructiveDialog = page
			.getByRole("dialog")
			.filter({ hasText: /recover|restore|reversible|no persistence/i });
		await expect(destructiveDialog).toBeVisible();
		await expect(destructiveDialog.getByRole("button").first()).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(destructiveDialog).not.toBeVisible();
		await expect(destructiveOpener).toBeFocused();

		await destructiveOpener.click();
		await destructiveDialog
			.getByRole("button", { name: /remove|delete/i })
			.click();
		const restoreAction = specimens.getByRole("button", { name: /^restore/i });
		await expect(restoreAction).toBeFocused();
		await expect(
			specimens.getByRole("status", { name: "Destructive action result" }),
		).toContainText(/removed|deleted/i);
		await restoreAction.click();
		await expect(
			specimens.getByRole("status", { name: "Destructive action result" }),
		).toContainText(/remains available/i);
		expect(externalRequests, route).toEqual([]);
		page.off("request", captureSpecimenRequest);
	}
});

test("every discovered Preview demonstrates motion, accessibility, illustrative product surfaces, and public evidence", async ({
	page,
}) => {
	const routes = await discoverDesignSystemRoutes(page);
	const accessibilityTopics = [
		"Semantics",
		"Keyboard",
		"Focus",
		"Contrast",
		"Target size",
		"Zoom",
		"Reflow",
		"Forced colors",
		"Status communication",
	];
	const productSurfaceStructures = [
		["Marketing", "region", "Marketing action hierarchy"],
		["Authentication", "region", "Authentication input structure"],
		["Onboarding", "list", "Onboarding progress structure"],
		["Dashboard", "list", "Dashboard summary regions"],
		["Table", "table", "Table comparison structure"],
		["Form", "region", "Form input structure"],
		["Settings", "list", "Settings preference groups"],
		["States", "list", "State communication examples"],
	] as const;

	for (const route of routes) {
		const { name } = await readPublishedDesignSystem(page, route);
		const behavior = page.getByRole("region", {
			name: `${name} motion and accessibility`,
		});
		const motion = behavior.getByRole("group", {
			name: "Motion specimen",
		});

		await expect(behavior).toBeVisible();
		await expect(behavior.getByRole("heading", { level: 3 })).toHaveText([
			"Motion and reduced motion",
			"Accessibility guidance",
		]);
		await expect(
			motion.getByRole("button", { name: "Demonstrate motion" }),
		).toBeVisible();
		await motion.getByRole("button", { name: "Demonstrate motion" }).click();
		await expect(
			motion.getByRole("status", { name: "Motion specimen state" }),
		).toContainText(/settled/i);
		await expect(
			behavior
				.getByRole("list", { name: "Accessibility guidance topics" })
				.getByRole("listitem"),
			route,
		).toContainText(accessibilityTopics);

		const productSurfaces = page.getByRole("region", {
			name: `${name} product surface examples`,
		});
		await expect(productSurfaces.getByRole("article")).toHaveCount(8);
		await expect(
			productSurfaces.getByText("Illustrative structure", { exact: true }),
		).toHaveCount(8);
		for (const [
			index,
			[surface, role, structureName],
		] of productSurfaceStructures.entries()) {
			const article = productSurfaces.getByRole("article").nth(index);
			await expect(
				article.getByRole("heading", {
					level: 3,
					name: surface,
					exact: true,
				}),
				route,
			).toBeVisible();
			await expect(
				article.getByRole(role, { name: structureName }),
				route,
			).toBeVisible();
		}
		await expect(productSurfaces).toContainText(
			"Replace the illustrative copy with real Project language, workflows, and claims.",
		);
		await expect(productSurfaces).not.toContainText(
			/24 active|Connect the supplied Project|Delete Project|Published · Jul/i,
		);

		const evidence = page.getByRole("region", {
			name: `${name} public evaluation evidence`,
		});
		await expect(evidence).toContainText(
			"The Design System Preview is a public visual and descriptive specimen",
		);
		await expect(evidence).toContainText(
			"The complete Design Contract is the public raw Markdown",
		);
		await expect(evidence).toContainText(
			"Evaluation metadata and raw evidence paths remain public",
		);
	}
});

test("an isolated valid release reaches Design System discovery and its complete public journey", async ({
	page,
	request,
}) => {
	await page.goto("/design-systems");
	await expect(
		page.getByRole("tab", { name: "Aperture", exact: true }),
	).toHaveAttribute("data-design-system-route", "/design-systems/aperture");

	await page.goto("/design-systems/aperture");
	await expect(
		page.getByRole("heading", { name: "Aperture", exact: true }),
	).toBeVisible();
	await expect(
		page.getByLabel("Aperture rendered Design System Preview"),
	).toBeVisible();

	for (const route of ["/contracts/aperture", "/contracts/aperture/1.0"]) {
		const response = await request.get(route);
		expect(response.status(), route).toBe(200);
		expect(response.headers()["x-agentkogei-design-system"]).toBe("Aperture");
		expect(response.headers()["x-agentkogei-design-system-release"]).toBe(
			"1.0",
		);
		expect(await response.text()).toContain("# Aperture Design System");
	}
});

test("Design Systems and Design System Previews present published metadata", async ({
	page,
}) => {
	await page.goto("/design-systems");
	await expect(
		page.getByRole("heading", { name: "Published systems. Distinct voices." }),
	).toBeVisible();
	expect(
		await page.locator('meta[name="description"]').getAttribute("content"),
	).not.toMatch(/\bfour\b/i);

	const publishedMetadata = [
		{
			identity: "foundation",
			name: "Foundation",
			signature: "Clarity before character.",
			fit: "Versatile product foundations",
			viewports: "1440x900 · 390x844",
			changelog:
				"Initial Published Design System with complete cross-surface guidance, semantic informational-state tokens, and responsive pagination direction.",
		},
		{
			identity: "editorial",
			name: "Editorial",
			signature: "Ideas need room.",
			fit: "Knowledge and content products",
			viewports: "1440x900 · 390x844 · 320x844",
			changelog:
				"Initial Published Design System with complete cross-surface guidance, evaluated implementation direction, and WCAG 2.2 AA evidence.",
		},
		{
			identity: "mono",
			name: "Mono",
			signature: "Ink and paper.",
			fit: "Media and creative tooling",
			viewports: "1440x900 · 390x844",
			changelog:
				"Initial Published Design System with complete cross-surface coverage and evaluation evidence.",
		},
		{
			identity: "command",
			name: "Command",
			signature: "Purpose-built instrument.",
			fit: "Developer and operations products",
			viewports: "1440x900 · 390x844",
			changelog:
				"Initial Published Design System with dense technical patterns and complete state coverage.",
		},
	] as const;

	for (const published of publishedMetadata) {
		await page
			.getByRole("tab", {
				name: published.name,
				exact: true,
			})
			.click();
		const selectedPanel = page.getByRole("tabpanel", {
			name: published.name,
		});
		await expect(selectedPanel.getByText(published.signature)).toBeVisible();
		await expect(selectedPanel.getByText(published.fit)).toBeVisible();

		await page.goto(`/design-systems/${published.identity}`);
		const preview = page.getByRole("main");
		await expect(preview.getByText(published.signature)).toBeVisible();
		await expect(preview.getByText(published.viewports)).toBeVisible();
		await expect(
			preview.getByText(
				"React >=18 <20 · Next.js >=15 <17 · Tailwind >=4 <5 · shadcn/ui",
			),
		).toBeVisible();
		await expect(preview.getByText(published.changelog)).toBeVisible();

		await page.goto("/design-systems");
	}
});

/**
 * Vocabulary these surfaces used to carry, each naming something `add` never
 * delivers. A Design System Preview that says any of it again is promising a Builder a
 * resource tree, a transport envelope, or a lifecycle that does not exist.
 */
const retiredInstallationPromises = [
	"Included resources",
	"Stack Adapter",
	"Pack Source",
	"manifest",
	"registry",
	"managed update",
] as const;

test("every discovered Design System Preview advertises the complete Installation path", async ({
	page,
	request,
}) => {
	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		const {
			identity,
			name,
			currentRelease: release,
		} = await readPublishedDesignSystem(page, route);
		const preview = page.getByRole("main");
		const installation = preview.getByRole("region", {
			name: "Installation command",
		});

		const generatedCommand = installation.getByLabel("Generated command");
		await expect(installation.getByRole("tab")).toHaveText([
			"npm",
			"pnpm",
			"yarn",
			"bun",
		]);
		await expect(generatedCommand).toHaveText(
			`npx agentkogei@latest add ${identity}`,
		);
		await expect(
			preview.getByRole("heading", { name: "Inside the Design Contract" }),
		).toBeVisible();
		await expect(
			preview.getByText("one root DESIGN.md", { exact: false }),
		).toBeVisible();
		for (const retired of retiredInstallationPromises) {
			await expect(preview.getByText(retired, { exact: false })).toHaveCount(0);
		}
		await expect(
			preview.getByRole("link", {
				name: `Read the ${name} ${release} Design Contract`,
			}),
		).toHaveAttribute("href", `/contracts/${identity}/${release}`);
		await expect(
			installation.getByText("retrieved anonymously", { exact: false }),
		).toBeVisible();
		await expect(preview.locator('a[href*="/r/"]')).toHaveCount(0);

		const delivered = await request.get(`/contracts/${identity}/${release}`);
		expect(delivered.status()).toBe(200);
		expect(delivered.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		const current = await request.get(`/contracts/${identity}`);
		expect(current.headers()["x-agentkogei-design-system-release"]).toBe(
			release,
		);
	}
});

test("the public Command Design System Preview shows complete evidence and its raw Design Contract", async ({
	page,
}) => {
	await page.goto("/design-systems/command");

	await expect(page.getByRole("heading", { name: "Command" })).toBeVisible();
	await expect(
		page.getByText("WCAG 2.2 Level AA", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText(
			"React >=18 <20 · Next.js >=15 <17 · Tailwind >=4 <5 · shadcn/ui",
		),
	).toBeVisible();
	await expect(
		page.getByLabel("Command rendered Design System Preview"),
	).toBeVisible();
	for (const publishedEvidence of [
		"Purpose-built instrument.",
		"Graphite working planes",
		"Operational cyan signals",
		"Dense persistent context",
		"1440x900 · 390x844",
	]) {
		await expect(
			page.getByText(publishedEvidence, { exact: true }).first(),
		).toBeVisible();
	}
	await expect(
		page.getByRole("link", {
			name: "Read the Command 1.0 Design Contract",
		}),
	).toHaveAttribute("href", "/contracts/command/1.0");
	await page.getByText("View raw Design Contract", { exact: true }).click();
	await expect(
		page
			.frameLocator('iframe[title="Command raw Design Contract"]')
			.locator("body"),
	).toContainText("# Command Design System");
	await expect(page.getByRole("heading", { name: "Coverage" })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Inside the Design Contract" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Release details" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Changelog", exact: true }),
	).toBeVisible();
	await expect(
		page.getByText("registry payload", { exact: false }),
	).toHaveCount(0);
});

test("a Builder can anonymously retrieve the complete Foundation Design System Release", async ({
	page,
	request,
}) => {
	const response = await request.get("/contracts/foundation/1.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toBe(
		"text/markdown; charset=utf-8",
	);
	expect(response.headers()["x-agentkogei-design-system-release"]).toBe("1.0");
	expect(response.headers()["x-agentkogei-design-pack"]).toBeUndefined();
	expect(response.headers()["x-agentkogei-pack-release"]).toBeUndefined();
	// An exact Design System Release is immutable, so it may be cached forever.
	expect(response.headers()["cache-control"]).toContain("immutable");
	const contract = await response.text();
	expect(contract).toContain("# Foundation Design System");
	expect(contract).toContain("## Final validation checklist");

	await page.goto("/design-systems/foundation");
	await expect(page.getByText("1440x900 · 390x844")).toBeVisible();
	await expect(page.getByText("Light · Dark · Reduced motion")).toBeVisible();
	await expect(
		page.getByText("Human review passed · Rights review passed"),
	).toBeVisible();
});

test("an unknown Design System identity returns not found", async ({
	request,
}) => {
	const response = await request.get("/design-systems/unknown");

	expect(response.status()).toBe(404);
});

test("release details link to Foundation's sole exact Design Contract", async ({
	page,
}) => {
	await page.goto("/design-systems/foundation");

	await expect(
		page.getByRole("link", {
			name: "Read Foundation 1.0 Design Contract",
		}),
	).toHaveAttribute("href", "/contracts/foundation/1.0");
	await expect(page.getByText("1.1.0", { exact: false })).toHaveCount(0);
});

test("a Design System Preview exposes its published evaluation provenance", async ({
	page,
}) => {
	await page.goto("/design-systems/editorial");

	await expect(
		page.getByText(
			"structure · accessibility · responsive overflow · text reflow and source order · color contrast",
		),
	).toBeVisible();
	await expect(
		page.getByText("evaluation/report.json · evaluation/agent-runs.md"),
	).toBeVisible();
});

test("a Builder can preview, retrieve, and distinguish the Editorial Design System", async ({
	page,
	request,
}) => {
	const response = await request.get("/contracts/editorial/1.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["x-agentkogei-design-system"]).toBe("Editorial");
	const contract = await response.text();
	expect(contract).toContain("# Editorial Design System");
	expect(contract).toContain("Warmth comes from restraint");

	await page.goto("/design-systems/editorial");
	await expect(page.getByRole("heading", { name: "Editorial" })).toBeVisible();
	await expect(
		page.getByLabel("Editorial rendered Design System Preview"),
	).toBeVisible();
	await expect(
		page.getByText("Preview is evidence, not the Design Contract", {
			exact: false,
		}),
	).toBeVisible();
	await expect(
		page.getByText("WCAG 2.2 Level AA", { exact: false }),
	).toBeVisible();
});

/**
 * The interface AgentKogei retired before publishing the CLI. Each entry is an
 * invocation a Builder might copy from a stale note; none of them may quietly
 * work, and none of them may touch the Project on the way to refusing.
 */
const retiredInvocations = (elsewhere: string) =>
	[
		["install", "foundation@1.0", "--yes"],
		["status"],
		["update", "--yes"],
		["detach", "--yes"],
		["add", "foundation", "--source", "http://localhost:3011/r/", "--yes"],
		["add", "foundation", "--project", elsewhere, "--yes"],
	] as const;

test("the distributed CLI rejects every retired command and flag without touching a Project", async () => {
	const project = await mkdtemp(path.join(tmpdir(), "agentkogei-retired-"));
	const elsewhere = await mkdtemp(path.join(tmpdir(), "agentkogei-elsewhere-"));
	try {
		for (const invocation of retiredInvocations(elsewhere)) {
			const result = await runCli([...invocation], {
				cwd: project,
				environment: {
					AGENTKOGEI_CONTRACT_CATALOG_URL: "http://localhost:3011/contracts/",
				},
			});

			expect(result.exitCode, `${invocation.join(" ")}: ${result.stdout}`).toBe(
				2,
			);
			expect(result.stdout).toBe("");
			for (const retiredVerb of ["install", "status", "update", "detach"]) {
				expect(result.stderr).not.toContain(`agentkogei ${retiredVerb}`);
			}
			expect(result.stderr).toContain(
				"agentkogei add <design-system[@version]>",
			);
			// Neither the directory the CLI ran in nor the one a retired flag
			// named may gain a file on the way to a refusal.
			expect(await readdir(project)).toEqual([]);
			expect(await readdir(elsewhere)).toEqual([]);
		}
	} finally {
		await rm(project, { recursive: true, force: true });
		await rm(elsewhere, { recursive: true, force: true });
	}
});

test("an unresolved Design Contract selector is refused as plain text", async ({
	request,
}) => {
	const unknown = await request.get("/contracts/fondation");
	const unknownRelease = await request.get("/contracts/foundation/9.9");

	expect(unknown.status()).toBe(404);
	expect(unknown.headers()["content-type"]).toContain("text/plain");
	expect(unknownRelease.status()).toBe(404);
});

test("Command is public while current and exact Signal selectors are ordinarily unknown", async ({
	request,
}) => {
	const currentCommand = await request.get("/contracts/command");
	const exactCommand = await request.get("/contracts/command/1.0");

	for (const response of [currentCommand, exactCommand]) {
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(response.headers()["x-agentkogei-design-system"]).toBe("Command");
		expect(response.headers()["x-agentkogei-design-system-release"]).toBe(
			"1.0",
		);
		expect(response.headers()["cache-control"]).toContain("public");
		expect(response.headers()["www-authenticate"]).toBeUndefined();
		expect(await response.text()).toContain("# Command Design System");
	}
	expect(currentCommand.headers()["cache-control"]).not.toContain("immutable");
	expect(exactCommand.headers()["cache-control"]).toContain("immutable");

	for (const selector of ["signal", "signal/1.0"]) {
		const response = await request.get(`/contracts/${selector}`);
		expect(response.status()).toBe(404);
		expect(response.headers()["content-type"]).toContain("text/plain");
		expect(response.headers()["cache-control"]).toBe("no-store");
		expect(await response.text()).toBe(
			`${selector.replace("/", "@")} is not a Design System Release in the AgentKogei Official Catalog.\n`,
		);
	}

	for (const selector of ["signal", "signal@1.0"]) {
		const project = await mkdtemp(path.join(tmpdir(), "agentkogei-signal-"));
		try {
			const result = await runDesignContractInstallation(project, selector);
			expect(result.exitCode).toBe(1);
			expect(result.stderr).toContain(
				`Official Catalog has no Design Contract for ${selector} (404)`,
			);
			expect(await readdir(project)).toEqual([]);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	}
});

test("every discovered release is delivered and installed through identity independent paths", async ({
	page,
	request,
}) => {
	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		const {
			identity,
			name: designSystem,
			currentRelease,
			exactReleases: releases,
		} = await readPublishedDesignSystem(page, route);

		const current = await request.get(`/contracts/${identity}`);
		expect(current.status()).toBe(200);
		expect(current.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(current.headers()["x-agentkogei-design-system"]).toBe(designSystem);
		expect(current.headers()["x-agentkogei-design-system-release"]).toBe(
			currentRelease,
		);
		const currentContract = await current.text();
		expect(currentContract).toContain(`# ${designSystem} Design System`);
		expect(currentContract).toContain("\n## Final validation checklist\n");
		for (const machineMetadata of [
			"design-system-evaluation.json",
			"agentkogei.manifest.json",
			".agentkogei/",
			"registry:item",
			"sha256",
		]) {
			expect(currentContract).not.toContain(machineMetadata);
		}

		for (const retiredPath of [
			`/r/${identity}.json`,
			`/r/${identity}/${currentRelease}.json`,
			`/r/${identity}`,
			`/api/premium-source/${identity}/${currentRelease}`,
		]) {
			const response = await request.get(retiredPath);
			expect(response.status(), retiredPath).toBe(404);
		}

		const delivered = await Promise.all(
			releases.map(async (release) => {
				const response = await request.get(`/contracts/${identity}/${release}`);
				expect(response.status()).toBe(200);
				expect(response.headers()["x-agentkogei-design-system-release"]).toBe(
					release,
				);
				return response.text();
			}),
		);
		expect(delivered[releases.indexOf(currentRelease)]).toBe(currentContract);
		expect(new Set(delivered).size).toBe(releases.length);

		for (const selector of [
			identity,
			...releases.map((release) => `${identity}@${release}`),
		]) {
			const selectedRelease = selector.split("@")[1] ?? currentRelease;
			const project = await mkdtemp(
				path.join(tmpdir(), "agentkogei-add-release-"),
			);
			try {
				const added = await runDesignContractInstallation(project, selector);
				expect(added.exitCode, added.stderr).toBe(0);
				expect(added.stdout).toContain(
					`Installed ${designSystem} Design System Release ${selectedRelease}`,
				);
				const response = await request.get(
					`/contracts/${identity}/${selectedRelease}`,
				);
				expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
					await response.text(),
				);
				expect(
					await readFile(path.join(project, "AGENTS.md"), "utf8"),
				).toContain("`DESIGN.md`");
			} finally {
				await rm(project, { recursive: true, force: true });
			}
		}
	}
});

test("every discovered Design System Preview remains evaluated across supported modes", async ({
	page,
}) => {
	// This journey intentionally runs Axe for every discovered Preview and mode.
	// Keep its exhaustive coverage without constraining it to the default unit timeout.
	test.setTimeout(120_000);

	const modes = [
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "dark" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 390, height: 844 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 768, height: 1024 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 390, height: 844 },
			colorScheme: "dark" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "light" as const,
			reducedMotion: "reduce" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 320, height: 844 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
		},
		{
			viewport: { width: 1440, height: 900 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "active" as const,
		},
		{
			// A 1440 by 900 browser viewport at 200% page zoom exposes a
			// 720 by 450 CSS viewport to layout and media queries.
			viewport: { width: 720, height: 450 },
			colorScheme: "light" as const,
			reducedMotion: "no-preference" as const,
			forcedColors: "none" as const,
			scenario: "200% page zoom equivalent",
		},
	] as const;

	const routes = await discoverDesignSystemRoutes(page);

	for (const route of routes) {
		for (const mode of modes) {
			await page.setViewportSize(mode.viewport);
			await page.emulateMedia({
				colorScheme: mode.colorScheme,
				reducedMotion: mode.reducedMotion,
				forcedColors: mode.forcedColors,
			});
			await page.goto(route);
			const name = await page.getByRole("heading", { level: 1 }).innerText();
			await expect(
				page.getByLabel(`${name} rendered Design System Preview`),
			).toBeVisible();
			if (mode.viewport.width === 320 || mode.viewport.width === 1440) {
				const endpoint = mode.viewport.width === 320 ? "mobile" : "desktop";
				const mismatches = await page
					.locator("[data-type-role]")
					.evaluateAll((specimens, sizeEndpoint) => {
						const rootSize = Number.parseFloat(
							getComputedStyle(document.documentElement).fontSize,
						);
						return specimens.flatMap((specimen) => {
							const declared = Number(
								specimen.getAttribute(`data-${sizeEndpoint}-size-rem`),
							);
							const sample = specimen.querySelector(":scope > p");
							const rendered = sample
								? Number.parseFloat(getComputedStyle(sample).fontSize)
								: Number.NaN;
							return Math.abs(rendered - declared * rootSize) <= 0.1
								? []
								: [{ declared, rendered }];
						});
					}, endpoint);
				expect(mismatches, `${route} ${endpoint} type scale`).toEqual([]);
			}

			let accessibilityCheck = new AxeBuilder({ page }).withTags([
				"wcag2a",
				"wcag2aa",
				"wcag21a",
				"wcag21aa",
				"wcag22aa",
			]);
			if (mode.forcedColors === "active") {
				accessibilityCheck = accessibilityCheck.disableRules([
					"color-contrast",
				]);
			}
			const accessibility = await accessibilityCheck.analyze();
			expect(accessibility.violations, route).toEqual([]);
			const overflow = await page.evaluate(() => ({
				document: {
					clientWidth: document.documentElement.clientWidth,
					scrollWidth: document.documentElement.scrollWidth,
				},
				elements: [...document.querySelectorAll("body *")]
					.filter((element) => {
						if (!(element instanceof HTMLElement)) return false;
						if (
							element.getBoundingClientRect().right <=
							document.documentElement.clientWidth
						) {
							return false;
						}
						const overflowRegion = element.closest(
							".preview-data-table-region",
						);
						return !(
							overflowRegion instanceof HTMLElement &&
							overflowRegion.getBoundingClientRect().right <=
								document.documentElement.clientWidth &&
							["auto", "scroll"].includes(
								getComputedStyle(overflowRegion).overflowX,
							)
						);
					})
					.slice(0, 5)
					.map((element) => ({
						className: element.getAttribute("class"),
						text: element.textContent?.slice(0, 80),
					})),
			}));
			expect(overflow, route).toEqual({
				document: {
					clientWidth: mode.viewport.width,
					scrollWidth: mode.viewport.width,
				},
				elements: [],
			});
		}
	}
});

const responsiveRoutes = [
	"/",
	"/design-systems",
	"/design-systems/command",
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
			navigation.getByRole("link", { name: "Design Systems", exact: true }),
		).toBeVisible();
		await expect(
			navigation.getByRole("link", { name: "Docs", exact: true }),
		).toHaveCount(0);

		const hasHorizontalOverflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		);
		expect(hasHorizontalOverflow).toBe(false);
	});
}
