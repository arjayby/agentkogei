import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
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
		page.getByRole("link", { name: "Browse the Catalog" }),
	).toHaveAttribute("href", "/catalog");
	await expect(
		page.getByRole("link", { name: "Read the Docs" }),
	).toHaveAttribute("href", "/docs");
});

test("the landing page composes one add command from a package manager and a Design Pack", async ({
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

	await installation.getByLabel("Package manager").click();
	await page.getByRole("option", { name: /bunx/ }).click();
	await installation.getByLabel("Design Pack").click();
	await page.getByRole("option", { name: /signal.*Premium/ }).click();
	await expect(command).toHaveText("bunx agentkogei@latest add signal");

	await installation.getByRole("button", { name: "Copy command" }).click();
	await expect(
		installation.getByRole("button", { name: "Copied" }),
	).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		"bunx agentkogei@latest add signal",
	);
});

test("the landing page surfaces the newest Pack Releases, the full catalog, and the Premium offer", async ({
	page,
}) => {
	await page.goto("/");

	const recent = page.getByRole("region", {
		name: "The newest Pack Releases.",
	});
	await expect(
		recent.getByRole("link", { name: /Signal 1\.0\.0/ }),
	).toHaveAttribute("href", "/catalog/signal");
	await expect(
		recent.getByRole("link", { name: /Foundation 1\.1\.0/ }),
	).toHaveAttribute("href", "/catalog/foundation");

	const catalog = page.getByRole("region", {
		name: "One catalog. Four directions.",
	});
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

	await expect(
		page.getByRole("link", { name: "Explore Premium Access" }),
	).toHaveAttribute("href", "/premium");
});

test("the retired pricing route permanently redirects to Premium", async ({
	request,
}) => {
	const response = await request.get("/pricing", { maxRedirects: 0 });

	expect(response.status()).toBe(308);
	expect(response.headers().location).toBe("/premium");
});

test("every page carries a footer naming the catalog, the product surfaces, and the license boundary", async ({
	page,
}) => {
	await page.goto("/docs");
	const footer = page.getByRole("contentinfo");

	for (const pack of ["Foundation", "Editorial", "Command", "Signal"]) {
		await expect(
			footer.getByRole("link", { name: pack, exact: true }),
		).toHaveAttribute("href", `/catalog/${pack.toLowerCase()}`);
	}
	await expect(
		footer.getByRole("link", { name: "Catalog", exact: true }),
	).toHaveAttribute("href", "/catalog");
	await expect(
		footer.getByRole("link", { name: "Docs", exact: true }),
	).toHaveAttribute("href", "/docs");
	await expect(
		footer.getByRole("link", { name: "Premium", exact: true }),
	).toHaveAttribute("href", "/premium");
	await expect(
		footer.getByRole("link", { name: "GitHub", exact: true }),
	).toHaveAttribute("href", "https://github.com/arjayby/agentkogei");
	await expect(
		footer.getByText("MIT licensed", { exact: false }),
	).toBeVisible();
	await expect(footer.getByText("CC BY 4.0", { exact: false })).toBeVisible();
	await expect(
		footer.getByText("commercial Pack License", { exact: false }),
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

/**
 * The one-command Installation flow every Builder-facing surface advertises:
 * `npx` first because it is the shortest mainstream path, then the equivalent
 * command for each other package runner AgentKogei supports.
 */
function packageRunnerCommands(identity: string) {
	return [
		["npm (primary)", `npx agentkogei@latest add ${identity}`],
		["pnpm", `pnpm dlx agentkogei@latest add ${identity}`],
		["Yarn", `yarn dlx agentkogei@latest add ${identity}`],
		["Bun", `bunx agentkogei@latest add ${identity}`],
	] as const;
}

/**
 * Vocabulary these surfaces used to carry, each naming something `add` never
 * delivers. A Pack Preview that says any of it again is promising a Builder a
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

const launchPacks = [
	{
		slug: "foundation",
		name: "Foundation",
		access: "Open",
		release: "1.1.0",
	},
	{ slug: "editorial", name: "Editorial", access: "Open", release: "1.0.0" },
	{ slug: "command", name: "Command", access: "Premium", release: "1.0.0" },
	{ slug: "signal", name: "Signal", access: "Premium", release: "1.0.0" },
] as const;

const openLaunchPacks = launchPacks.filter(({ access }) => access === "Open");
const premiumLaunchPacks = launchPacks.filter(
	({ access }) => access === "Premium",
);

for (const pack of launchPacks) {
	test(`the ${pack.name} Pack Preview shows one add command for every supported package runner`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${pack.slug}`);
		const installation = page.getByRole("region", {
			name: "Installation command",
		});

		await expect(installation.getByRole("term")).toHaveText(
			packageRunnerCommands(pack.slug).map(([runner]) => runner),
		);
		await expect(installation.getByRole("definition")).toHaveText(
			packageRunnerCommands(pack.slug).map(([, command]) => command),
		);
	});

	test(`the ${pack.name} Pack Preview promises one Design Contract and nothing beside it`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${pack.slug}`);
		const preview = page.getByRole("main");

		await expect(
			preview.getByRole("heading", { name: "Inside the Design Contract" }),
		).toBeVisible();
		await expect(
			preview.getByText("one root DESIGN.md", { exact: false }),
		).toBeVisible();
		for (const retired of retiredInstallationPromises) {
			await expect(preview.getByText(retired, { exact: false })).toHaveCount(0);
		}
	});
}

for (const openPack of openLaunchPacks) {
	test(`the ${openPack.name} Pack Preview offers its raw Design Contract and account-free access`, async ({
		page,
		request,
	}) => {
		await page.goto(`/catalog/${openPack.slug}`);
		const preview = page.getByRole("main");
		const installation = preview.getByRole("region", {
			name: "Installation command",
		});

		await expect(
			preview.getByRole("link", {
				name: `Read the ${openPack.name} ${openPack.release} Design Contract`,
			}),
		).toHaveAttribute(
			"href",
			`/contracts/${openPack.slug}/${openPack.release}`,
		);
		await expect(
			installation.getByText("without an AgentKogei account", { exact: false }),
		).toBeVisible();
		await expect(preview.locator('a[href*="/r/"]')).toHaveCount(0);

		const delivered = await request.get(
			`/contracts/${openPack.slug}/${openPack.release}`,
		);
		expect(delivered.status()).toBe(200);
		expect(delivered.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		// The Pack Preview advertises a version it does not itself deliver, so it
		// can drift behind the catalog. A Builder following the visible command
		// gets whatever a bare identity selects, and both must name one release.
		const current = await request.get(`/contracts/${openPack.slug}`);
		expect(current.headers()["x-agentkogei-pack-release"]).toBe(
			openPack.release,
		);
	});
}

for (const premiumPack of premiumLaunchPacks) {
	test(`the ${premiumPack.name} Pack Preview justifies Premium Access without exposing its Design Contract`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${premiumPack.slug}`);
		const preview = page.getByRole("main");
		const installation = preview.getByRole("region", {
			name: "Installation command",
		});

		for (const premiumValue of [
			"creative distinctiveness",
			"production depth",
			"breadth of direction",
		]) {
			await expect(
				preview.getByText(premiumValue, { exact: false }),
			).toBeVisible();
		}
		await expect(
			installation.getByText("active Premium Access", { exact: false }),
		).toBeVisible();
		await expect(
			installation.getByText("browser authorization", { exact: false }),
		).toBeVisible();
		await expect(preview.locator('a[href^="/contracts/"]')).toHaveCount(0);
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
	await expect(
		page.getByRole("main").getByText("Commercial Pack License"),
	).toBeVisible();
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
			"The Official Catalog delivers the complete Pack Release only to a CLI authorized by a Builder with active Premium Access.",
		),
	).toBeVisible();
	await expect(page.getByRole("heading", { name: "Coverage" })).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Inside the Design Contract" }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Release history" }),
	).toBeVisible();
	await expect(page.getByRole("heading", { name: "Changelog" })).toBeVisible();
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
	await expect(
		page.getByRole("main").getByText("Commercial Pack License"),
	).toBeVisible();
	await expect(
		page.getByText("registry payload", { exact: false }),
	).toHaveCount(0);
});

test("a Builder can anonymously retrieve the complete Foundation Pack Release", async ({
	page,
	request,
}) => {
	const response = await request.get("/contracts/foundation/1.0.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toBe(
		"text/markdown; charset=utf-8",
	);
	expect(response.headers()["x-agentkogei-pack-release"]).toBe("1.0.0");
	// An exact Pack Release is immutable, so it may be cached forever.
	expect(response.headers()["cache-control"]).toContain("immutable");
	const contract = await response.text();
	expect(contract).toContain("# Foundation Interface System");
	expect(contract).toContain("## Final validation checklist");

	await page.goto("/catalog/foundation");
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
	const response = await request.get("/contracts/editorial/1.0.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["x-agentkogei-design-pack"]).toBe("Editorial");
	const contract = await response.text();
	expect(contract).toContain("# Editorial Interface System");
	expect(contract).toContain("Warmth comes from restraint");

	await page.goto("/catalog/editorial");
	await expect(page.getByRole("heading", { name: "Editorial" })).toBeVisible();
	await expect(
		page.getByLabel("Editorial rendered Pack Preview"),
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
		["install", "foundation@1.0.0", "--yes"],
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
			expect(result.stderr).toContain("agentkogei add <pack[@version]>");
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
			"pack-evaluation.json",
			"agentkogei.manifest.json",
			".agentkogei/",
			"registry:item",
			"sha256",
		]) {
			expect(contract).not.toContain(machineMetadata);
		}
	});

	test(`the retired registry transport serves no ${designPack} Pack Release`, async ({
		request,
	}) => {
		for (const retiredPath of [
			`/r/${identity}.json`,
			`/r/${identity}/${currentRelease}.json`,
			`/r/${identity}`,
			`/api/premium-source/${identity}/${currentRelease}`,
		]) {
			const response = await request.get(retiredPath);
			expect(response.status(), retiredPath).toBe(404);
			expect(await response.text()).not.toContain(
				`# ${designPack} Interface System`,
			);
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
		command: "add",
		outcome: "success",
		platform: "darwin",
		runtime: "node",
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

test("the Premium page discloses the complete Premium Access offer", async ({
	page,
}) => {
	await page.goto("/premium");

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
	await expect(
		page.getByText("unlimited Projects with one add command", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByText(
			"creative distinctiveness, production depth, and breadth of direction",
			{ exact: false },
		),
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
	await expect(
		page.getByRole("main").getByText("CC BY 4.0", { exact: false }),
	).toBeVisible();

	const hasHorizontalOverflow = await page.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth,
	);
	expect(hasHorizontalOverflow).toBe(false);
});

test("public documentation presents the same add command for every package runner", async ({
	page,
}) => {
	await page.goto("/docs");
	const installation = page.getByRole("region", {
		name: "Installation command",
	});

	await expect(installation.getByRole("term")).toHaveText(
		packageRunnerCommands("foundation").map(([runner]) => runner),
	);
	await expect(installation.getByRole("definition")).toHaveText(
		packageRunnerCommands("foundation").map(([, command]) => command),
	);
});

test("public documentation describes the single Design Contract Installation writes", async ({
	page,
}) => {
	await page.goto("/docs");
	const documentation = page.getByRole("main");

	await expect(
		documentation.getByText("one root DESIGN.md", { exact: false }),
	).toBeVisible();
	await expect(
		documentation.getByText("one marked AGENTS.md block", { exact: false }),
	).toBeVisible();
	for (const retired of retiredInstallationPromises) {
		await expect(
			documentation.getByText(retired, { exact: false }),
		).toHaveCount(0);
	}
});

test("public documentation retrieves Design Contracts as raw Markdown rather than registry JSON", async ({
	page,
	request,
}) => {
	await page.goto("/docs");
	const documentation = page.getByRole("main");

	await expect(
		documentation.getByRole("link", {
			name: "Read the Foundation Design Contract",
		}),
	).toHaveAttribute("href", "/contracts/foundation");
	await expect(documentation.locator('a[href*="/r/"]')).toHaveCount(0);

	const delivered = await request.get("/contracts/foundation");
	expect(delivered.status()).toBe(200);
	expect(delivered.headers()["content-type"]).toBe(
		"text/markdown; charset=utf-8",
	);
});

test("public documentation separates open software from third-party pack distribution", async ({
	page,
}) => {
	await page.goto("/docs");
	const documentation = page.getByRole("main");

	await expect(
		documentation.getByText("Open source under the MIT License.", {
			exact: true,
		}),
	).toBeVisible();
	await expect(
		documentation.getByText("contains only first-party Design Packs", {
			exact: false,
		}),
	).toBeVisible();
	await expect(
		documentation.getByText(
			"does not support installing a Design Pack from a third-party source",
			{ exact: false },
		),
	).toBeVisible();
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
		page.getByRole("main").getByText("commercial Pack License", {
			exact: false,
		}),
	).toBeVisible();
});

const responsiveRoutes = [
	"/",
	"/catalog",
	"/catalog/command",
	"/catalog/signal",
	"/premium",
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
			navigation.getByRole("link", { name: "Premium", exact: true }),
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
