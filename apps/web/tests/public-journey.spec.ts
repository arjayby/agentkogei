import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { runCli } from "./support/cli";

/**
 * The Open Design Packs a Builder can install without an account, named the way
 * the Official Catalog publishes them. These journeys observe only the HTTP
 * routes and the real CLI process, so the expected catalog is stated here
 * rather than imported from the delivery code under test.
 */
const openDesignPacks = [
	{
		identity: "foundation",
		designPack: "Foundation",
		releases: ["1.0.0", "1.1.0"],
	},
	{ identity: "editorial", designPack: "Editorial", releases: ["1.0.0"] },
] as const;

function runLiveCatalogInstallation(
	project: string,
	pack: (typeof openDesignPacks)[number]["identity"],
) {
	return runCli(["install", `${pack}@1.0.0`, "--yes", "--project", project], {
		environment: {
			AGENTKOGEI_OFFICIAL_CATALOG_URL: "http://localhost:3011/r/",
		},
	});
}

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

for (const pack of [
	{
		slug: "foundation",
		name: "Foundation",
		access: "Open",
		license: "CC BY 4.0",
	},
	{
		slug: "editorial",
		name: "Editorial",
		access: "Open",
		license: "CC BY 4.0",
	},
	{
		slug: "command",
		name: "Command",
		access: "Premium",
		license: "Commercial Pack License",
	},
	{
		slug: "signal",
		name: "Signal",
		access: "Premium",
		license: "Commercial Pack License",
	},
] as const) {
	test(`${pack.name} launch smoke exposes Pack Preview, access, compatibility, license, and evaluation evidence`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${pack.slug}`);
		const product = page.getByRole("main");

		await expect(
			product.getByRole("heading", { name: pack.name, exact: true }),
		).toBeVisible();
		await expect(product.getByText(pack.access, { exact: true })).toBeVisible();
		await expect(
			product.getByText(pack.license, { exact: true }),
		).toBeVisible();
		await expect(
			product.getByText("React / Next.js · Tailwind CSS v4 · shadcn/ui", {
				exact: true,
			}),
		).toBeVisible();
		await expect(
			product.getByText(
				"Pack Evaluation passed · WCAG 2.2 Level AA reference implementation",
				{ exact: true },
			),
		).toBeVisible();
		await expect(
			product.getByLabel(`${pack.name} rendered Pack Preview`),
		).toBeVisible();
	});
}

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
	for (const surfaceEvidence of [
		"Ship with operational confidence.",
		"Continue securely",
		"Verify the runtime connection",
		"SYSTEM HEALTH",
		"v1.8.4",
		"Configuration verified",
		"Danger zone",
		"✓Verified",
	]) {
		await expect(
			page.getByText(surfaceEvidence, {
				exact: surfaceEvidence === "✓Verified",
			}),
		).toBeVisible();
	}
	await expect(
		page.getByText(
			"Installation retrieves the complete release only through the authenticated Premium Pack Source.",
		),
	).toBeVisible();
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

test("Signal publicly demonstrates its distinct evaluated Interface System without exposing gated resources", async ({
	page,
}) => {
	await page.goto("/catalog/signal");

	await expect(page.getByRole("heading", { name: "Signal" })).toBeVisible();
	await expect(page.getByLabel("Signal rendered Pack Preview")).toBeVisible();
	for (const surfaceEvidence of [
		"Turn ideas into momentum.",
		"Enter the studio",
		"Shape your first signal",
		"LIVE MOMENTUM",
		"Color system ready",
		"Motion preference",
		"Ready to launch",
	]) {
		await expect(
			page.getByText(surfaceEvidence, { exact: false }),
		).toBeVisible();
	}
	await expect(
		page.getByText("WCAG 2.2 Level AA", { exact: false }),
	).toBeVisible();
	await expect(page.getByText("Commercial Pack License")).toBeVisible();
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

test("a Builder can preview, retrieve, and distinguish the Editorial Open Design Pack", async ({
	page,
	request,
}) => {
	const response = await request.get("/r/editorial/1.0.0.json");

	expect(response.status()).toBe(200);
	const registryItem = (await response.json()) as {
		name: string;
		files: Array<{ content: string; target: string }>;
	};
	expect(registryItem.name).toBe("editorial");
	const manifestFile = registryItem.files.find((file) =>
		file.target.endsWith("agentkogei.manifest.json"),
	);
	const manifest = JSON.parse(manifestFile?.content ?? "") as {
		access: string;
		evaluation: { standard: string };
		release: { immutable: boolean; version: string };
	};
	expect(manifest).toMatchObject({
		access: "open",
		evaluation: { standard: "WCAG 2.2 Level AA" },
		release: { immutable: true, version: "1.0.0" },
	});
	expect(
		registryItem.files.some(
			(file) =>
				file.target.endsWith("DESIGN.md") &&
				file.content.includes("Warmth comes from restraint"),
		),
	).toBe(true);

	await page.goto("/catalog/editorial");
	await expect(page.getByRole("heading", { name: "Editorial" })).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Retrieve Editorial 1.0.0" }),
	).toHaveAttribute("href", "/r/editorial/1.0.0.json");
	await expect(
		page.getByLabel("Editorial rendered Pack Preview"),
	).toBeVisible();
	await expect(
		page.getByText("Preview is evidence, not Pack Source", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("WCAG 2.2 Level AA", { exact: false }),
	).toBeVisible();
});

for (const { identity: openPack } of openDesignPacks) {
	test(`the distributed CLI anonymously installs ${openPack} from the built Pack Source`, async () => {
		const project = await mkdtemp(path.join(tmpdir(), "agentkogei-live-web-"));
		try {
			const result = await runLiveCatalogInstallation(project, openPack);

			expect(result.exitCode, result.stderr).toBe(0);
			expect(result.stdout).toContain(`Installed ${openPack}@1.0.0`);
			const agents = await readFile(path.join(project, "AGENTS.md"), "utf8");
			const designContractPath = agents.match(
				new RegExp(`\\.agentkogei/${openPack}/DESIGN\\.md`),
			)?.[0];
			expect(designContractPath).toBeDefined();
			expect(
				await readFile(path.join(project, designContractPath ?? ""), "utf8"),
			).toContain(
				`# ${openPack[0]?.toUpperCase()}${openPack.slice(1)} Interface System`,
			);
			const record = await readFile(
				path.join(project, ".agentkogei/installed-pack.json"),
				"utf8",
			);
			expect(record).toContain(
				`"source": "http://localhost:3011/r/${openPack}/1.0.0.json"`,
			);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	});
}

test("an unresolved Design Contract selector is refused as plain text", async ({
	request,
}) => {
	const unknown = await request.get("/contracts/fondation");
	const unknownRelease = await request.get("/contracts/foundation/9.9.9");

	expect(unknown.status()).toBe(404);
	expect(unknown.headers()["content-type"]).toContain("text/plain");
	expect(unknownRelease.status()).toBe(404);
});

for (const openPack of openDesignPacks) {
	const { identity, designPack, releases } = openPack;
	const currentRelease = releases[releases.length - 1] as string;

	test(`the Official Catalog delivers ${designPack} as raw Design Contract Markdown`, async ({
		request,
	}) => {
		const current = await request.get(`/contracts/${identity}`);

		expect(current.status()).toBe(200);
		expect(current.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(current.headers()["x-agentkogei-design-pack"]).toBe(designPack);
		expect(current.headers()["x-agentkogei-pack-release"]).toBe(currentRelease);
		expect(current.headers()["x-agentkogei-pack-license"]).toBe(
			"Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		);
		const contract = await current.text();
		expect(contract).toContain(`# ${designPack} Interface System`);
		expect(contract).toContain("\n## Token definitions\n");
		expect(contract).toContain("shadcn/ui");
		expect(contract).toContain(
			`- Design Pack: ${designPack} (\`${identity}\`)`,
		);
		// The Official Catalog serves a document a Project can read on its own,
		// so nothing a Builder never receives may reach it.
		for (const machineMetadata of [
			"agentkogei.manifest.json",
			".agentkogei/",
			"registry:item",
			"sha256",
		]) {
			expect(contract).not.toContain(machineMetadata);
		}
	});

	test(`every published ${designPack} Pack Release has its own immutable raw route`, async ({
		request,
	}) => {
		const delivered = await Promise.all(
			releases.map(async (release) => {
				const response = await request.get(`/contracts/${identity}/${release}`);
				expect(response.status()).toBe(200);
				expect(response.headers()["x-agentkogei-pack-release"]).toBe(release);
				return response.text();
			}),
		);
		const current = await request.get(`/contracts/${identity}`);

		expect(delivered.at(-1)).toBe(await current.text());
		expect(new Set(delivered).size).toBe(releases.length);
	});

	test(`the distributed CLI adds ${designPack} to a Project as one Design Contract`, async ({
		request,
	}) => {
		const project = await mkdtemp(path.join(tmpdir(), "agentkogei-add-web-"));
		const existingInstructions =
			"# Project agents\n\nKeep the Makefile current.\n";
		try {
			await writeFile(path.join(project, "AGENTS.md"), existingInstructions);

			const refused = await runDesignContractInstallation(
				project,
				identity,
				[],
			);
			const added = await runDesignContractInstallation(project, identity);
			const repeated = await runDesignContractInstallation(project, identity);

			expect(refused.exitCode).toBe(2);
			expect(refused.stdout).toContain(
				`${designPack} ${currentRelease} (${identity})`,
			);
			expect(refused.stdout).toContain(path.join(project, "DESIGN.md"));
			expect(added.exitCode, added.stderr).toBe(0);
			expect(added.stdout).toContain(`Added ${designPack} ${currentRelease}`);
			expect(repeated.exitCode, repeated.stderr).toBe(0);

			const delivered = await request.get(`/contracts/${identity}`);
			expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
				await delivered.text(),
			);
			const agents = await readFile(path.join(project, "AGENTS.md"), "utf8");
			expect(agents).toContain(existingInstructions);
			expect(agents).toContain("<!-- agentkogei:design-pack:start -->");
			expect(agents.match(/agentkogei:design-pack:start/g)).toHaveLength(1);
			expect(agents).toContain("`DESIGN.md`");
			expect(existsSync(path.join(project, ".agentkogei"))).toBe(false);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	});

	for (const release of releases) {
		test(`the distributed CLI adds the explicit ${designPack} Pack Release ${release}`, async ({
			request,
		}) => {
			const project = await mkdtemp(
				path.join(tmpdir(), "agentkogei-add-release-"),
			);
			try {
				const added = await runDesignContractInstallation(
					project,
					`${identity}@${release}`,
				);

				expect(added.exitCode, added.stderr).toBe(0);
				expect(added.stdout).toContain(`Added ${designPack} ${release}`);
				const delivered = await request.get(
					`/contracts/${identity}/${release}`,
				);
				expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
					await delivered.text(),
				);
				expect(
					await readFile(path.join(project, "AGENTS.md"), "utf8"),
				).toContain("`DESIGN.md`");
			} finally {
				await rm(project, { recursive: true, force: true });
			}
		});
	}
}

test("the diagnostics endpoint accepts only the disclosed non-Project fields", async ({
	request,
}) => {
	const diagnostic = {
		schema_version: "1.0",
		command: "install",
		outcome: "success",
		platform: "darwin",
		runtime: "bun",
	};
	const accepted = await request.post("/api/cli-diagnostics", {
		data: diagnostic,
	});
	expect(accepted.status()).toBe(204);

	const rejected = await request.post("/api/cli-diagnostics", {
		data: { ...diagnostic, project_name: "private-project" },
	});
	expect(rejected.status()).toBe(400);
});

for (const evaluatedPack of [
	"Foundation",
	"Editorial",
	"Command",
	"Signal",
] as const) {
	test(`${evaluatedPack} evaluation renders every required screen across evaluated modes`, async ({
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
		] as const;

		for (const mode of modes) {
			await page.setViewportSize(mode.viewport);
			await page.emulateMedia({
				colorScheme: mode.colorScheme,
				reducedMotion: mode.reducedMotion,
				forcedColors: mode.forcedColors,
			});
			await page.goto(`/catalog/${evaluatedPack.toLowerCase()}`);
			const preview = page.getByLabel(`${evaluatedPack} rendered Pack Preview`);
			for (const screen of screens) {
				await expect(preview.getByText(screen, { exact: true })).toBeVisible();
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
			expect(accessibility.violations).toEqual([]);
			const overflow = await page.evaluate(() => ({
				document: {
					clientWidth: document.documentElement.clientWidth,
					scrollWidth: document.documentElement.scrollWidth,
				},
				elements: [...document.querySelectorAll("body *")]
					.filter(
						(element) =>
							element instanceof HTMLElement &&
							element.getBoundingClientRect().right >
								document.documentElement.clientWidth,
					)
					.slice(0, 5)
					.map((element) => ({
						className: element.getAttribute("class"),
						text: element.textContent?.slice(0, 80),
					})),
			}));
			expect(overflow).toEqual({
				document: {
					clientWidth: mode.viewport.width,
					scrollWidth: mode.viewport.width,
				},
				elements: [],
			});
		}
	});
}

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
	await expect(
		page.getByText("genuine public end product", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("reusing it in another Project", { exact: false }),
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

test("public documentation states the complete Project License boundary", async ({
	page,
}) => {
	await page.goto("/docs");
	await expect(
		page.getByText("including a genuine public end-product Project", {
			exact: false,
		}),
	).toBeVisible();
	await expect(
		page.getByText("without credentials, runtime checks, or DRM", {
			exact: false,
		}),
	).toBeVisible();
	await expect(
		page.getByText(
			"extraction, resale, republishing, credential sharing, or cross-Project reuse",
			{ exact: false },
		),
	).toBeVisible();
	await expect(
		page.getByText("A refund or payment reversal terminates", {
			exact: false,
		}),
	).toBeVisible();
});

test("public documentation distinguishes software, Open Design Packs, Premium Design Packs, and self-hosting rights", async ({
	page,
}) => {
	await page.goto("/docs");
	await expect(
		page.getByText(
			"application, CLI, Design Pack specification, and validators",
			{
				exact: false,
			},
		),
	).toBeVisible();
	await expect(
		page.getByText("Open source under the MIT License.", { exact: true }),
	).toBeVisible();
	await expect(
		page.getByText("retain required attribution", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("self-hosting does not grant", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText("commercial Pack License", { exact: false }),
	).toBeVisible();
});

const responsiveRoutes = [
	"/",
	"/catalog",
	"/catalog/command",
	"/catalog/signal",
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
