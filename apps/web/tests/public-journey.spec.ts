import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { runCli } from "./support/cli";

/**
 * The Design Systems a Builder can install without an account, named the way
 * the Official Catalog publishes them. These journeys observe only the HTTP
 * routes and the real CLI process, so the expected catalog is stated here
 * rather than imported from the delivery code under test.
 */
const publicDesignSystems = [
	{
		identity: "foundation",
		designSystem: "Foundation",
		releases: ["1.0.0", "1.1.0"],
	},
	{ identity: "editorial", designSystem: "Editorial", releases: ["1.0.0"] },
	{ identity: "mono", designSystem: "Mono", releases: ["1.0.0"] },
	{ identity: "command", designSystem: "Command", releases: ["1.0.0"] },
] as const;

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
	).toHaveAttribute("href", "/catalog");
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
	await expect(page.locator(".hero-artwork-caption")).toHaveText(
		"One direction, every screen",
	);
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

	await installation.getByLabel("Package manager").click();
	await page.getByRole("option", { name: /bunx/ }).click();
	await installation.getByLabel("Design System").click();
	await page.getByRole("option", { name: "command", exact: true }).click();
	await expect(command).toHaveText("bunx agentkogei@latest add command");

	await installation.getByRole("button", { name: "Copy command" }).click();
	await expect(
		installation.getByRole("button", { name: "Copied" }),
	).toBeVisible();
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
		"bunx agentkogei@latest add command",
	);
});

test("the landing page presents four visual directions without release details", async ({
	page,
}) => {
	await page.goto("/");

	const catalog = page.getByRole("region", {
		name: "Choose your taste.",
	});
	for (const designSystem of ["Foundation", "Editorial", "Mono", "Command"]) {
		await expect(
			catalog.getByRole("link", { name: new RegExp(designSystem, "i") }),
		).toBeVisible();
	}
	await expect(catalog.getByRole("link", { name: /Signal/i })).toHaveCount(0);
	await expect(page.getByText(/Recently published/i)).toHaveCount(0);
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

test("every page carries a footer naming the catalog and public product surfaces", async ({
	page,
}) => {
	await page.goto("/");
	const footer = page.getByRole("contentinfo");

	for (const designSystem of ["Foundation", "Editorial", "Mono", "Command"]) {
		await expect(
			footer.getByRole("link", { name: designSystem, exact: true }),
		).toHaveAttribute("href", `/catalog/${designSystem.toLowerCase()}`);
	}
	await expect(
		footer.getByRole("link", { name: "Catalog", exact: true }),
	).toHaveAttribute("href", "/catalog");
	await expect(footer.getByRole("link", { name: "Docs" })).toHaveCount(0);
	await expect(
		footer.getByRole("link", { name: "GitHub", exact: true }),
	).toHaveAttribute("href", "https://github.com/arjayby/agentkogei");
});

test("public navigation and calls to action expose no commercial or account journeys", async ({
	page,
}) => {
	for (const route of ["/", "/catalog", "/catalog/foundation"]) {
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
		"/catalog",
		"/catalog/foundation",
		"/catalog/editorial",
		"/catalog/mono",
		"/catalog/command",
	]) {
		await page.goto(route);
		const visibleCopy = await page.locator("body").innerText();
		expect(visibleCopy, route).not.toMatch(
			/\b(?:pack|packs|premium|pricing|subscription|signal)\b/i,
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
		["/catalog", /Official Catalog.*AgentKogei/i],
		["/catalog/foundation", /Foundation Design System Preview.*AgentKogei/i],
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

test("the Official Catalog presents exactly Foundation, Editorial, Mono, and Command", async ({
	page,
}) => {
	await page.goto("/catalog");
	const catalog = page.getByRole("main");

	for (const designSystem of ["Foundation", "Editorial", "Mono", "Command"]) {
		await expect(
			catalog.getByRole("link", {
				name: new RegExp(designSystem, "i"),
			}),
		).toHaveCount(1);
	}
	await expect(catalog.getByRole("link", { name: /Signal/i })).toHaveCount(0);
});

for (const designSystem of [
	{
		slug: "foundation",
		name: "Foundation",
	},
	{
		slug: "editorial",
		name: "Editorial",
	},
	{
		slug: "mono",
		name: "Mono",
	},
	{
		slug: "command",
		name: "Command",
	},
] as const) {
	test(`${designSystem.name} launch smoke exposes its Design System Preview, compatibility, and evaluation evidence`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${designSystem.slug}`);
		const product = page.getByRole("main");

		await expect(
			product.getByRole("heading", { name: designSystem.name, exact: true }),
		).toBeVisible();
		await expect(
			product.getByText("React / Next.js · Tailwind CSS v4 · shadcn/ui", {
				exact: true,
			}),
		).toBeVisible();
		await expect(
			product.getByText(
				"Design System Evaluation passed · WCAG 2.2 Level AA reference implementation",
				{ exact: true },
			),
		).toBeVisible();
		await expect(
			product.getByLabel(`${designSystem.name} rendered Design System Preview`),
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

const launchDesignSystems = [
	{
		slug: "foundation",
		name: "Foundation",
		release: "1.1.0",
	},
	{ slug: "editorial", name: "Editorial", release: "1.0.0" },
	{ slug: "mono", name: "Mono", release: "1.0.0" },
	{ slug: "command", name: "Command", release: "1.0.0" },
] as const;

for (const designSystem of launchDesignSystems) {
	test(`the ${designSystem.name} Design System Preview shows one add command for every supported package runner`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${designSystem.slug}`);
		const installation = page.getByRole("region", {
			name: "Installation command",
		});

		await expect(installation.getByRole("term")).toHaveText(
			packageRunnerCommands(designSystem.slug).map(([runner]) => runner),
		);
		await expect(installation.getByRole("definition")).toHaveText(
			packageRunnerCommands(designSystem.slug).map(([, command]) => command),
		);
	});

	test(`the ${designSystem.name} Design System Preview promises one Design Contract and nothing beside it`, async ({
		page,
	}) => {
		await page.goto(`/catalog/${designSystem.slug}`);
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

for (const designSystem of launchDesignSystems) {
	test(`the ${designSystem.name} Design System Preview offers its raw Design Contract anonymously`, async ({
		page,
		request,
	}) => {
		await page.goto(`/catalog/${designSystem.slug}`);
		const preview = page.getByRole("main");
		const installation = preview.getByRole("region", {
			name: "Installation command",
		});

		await expect(
			preview.getByRole("link", {
				name: `Read the ${designSystem.name} ${designSystem.release} Design Contract`,
			}),
		).toHaveAttribute(
			"href",
			`/contracts/${designSystem.slug}/${designSystem.release}`,
		);
		await expect(
			installation.getByText("retrieved anonymously", { exact: false }),
		).toBeVisible();
		await expect(preview.locator('a[href*="/r/"]')).toHaveCount(0);

		const delivered = await request.get(
			`/contracts/${designSystem.slug}/${designSystem.release}`,
		);
		expect(delivered.status()).toBe(200);
		expect(delivered.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		// The Design System Preview advertises a version it does not itself deliver, so it
		// can drift behind the catalog. A Builder following the visible command
		// gets whatever a bare identity selects, and both must name one release.
		const current = await request.get(`/contracts/${designSystem.slug}`);
		expect(current.headers()["x-agentkogei-design-system-release"]).toBe(
			designSystem.release,
		);
	});
}

test("the public Command Design System Preview shows complete evidence and its raw Design Contract", async ({
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
		page.getByLabel("Command rendered Design System Preview"),
	).toBeVisible();
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
		page.getByRole("link", {
			name: "Read the Command 1.0.0 Design Contract",
		}),
	).toHaveAttribute("href", "/contracts/command/1.0.0");
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

test("a Builder can anonymously retrieve the complete Foundation Design System Release", async ({
	page,
	request,
}) => {
	const response = await request.get("/contracts/foundation/1.0.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toBe(
		"text/markdown; charset=utf-8",
	);
	expect(response.headers()["x-agentkogei-design-system-release"]).toBe(
		"1.0.0",
	);
	expect(response.headers()["x-agentkogei-design-pack"]).toBeUndefined();
	expect(response.headers()["x-agentkogei-pack-release"]).toBeUndefined();
	// An exact Design System Release is immutable, so it may be cached forever.
	expect(response.headers()["cache-control"]).toContain("immutable");
	const contract = await response.text();
	expect(contract).toContain("# Foundation Design System");
	expect(contract).toContain("## Final validation checklist");

	await page.goto("/catalog/foundation");
	await expect(
		page.getByText("Desktop 1440×900 and mobile 390×844"),
	).toBeVisible();
	await expect(page.getByText("Light, dark, and reduced motion")).toBeVisible();
	await expect(
		page.getByText("Human visual and accessibility review passed"),
	).toBeVisible();
});

test("a Builder can preview, retrieve, and distinguish the Editorial Design System", async ({
	page,
	request,
}) => {
	const response = await request.get("/contracts/editorial/1.0.0");

	expect(response.status()).toBe(200);
	expect(response.headers()["x-agentkogei-design-system"]).toBe("Editorial");
	const contract = await response.text();
	expect(contract).toContain("# Editorial Design System");
	expect(contract).toContain("Warmth comes from restraint");

	await page.goto("/catalog/editorial");
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
	const unknownRelease = await request.get("/contracts/foundation/9.9.9");

	expect(unknown.status()).toBe(404);
	expect(unknown.headers()["content-type"]).toContain("text/plain");
	expect(unknownRelease.status()).toBe(404);
});

test("Command is public while current and exact Signal selectors are ordinarily unknown", async ({
	request,
}) => {
	const currentCommand = await request.get("/contracts/command");
	const exactCommand = await request.get("/contracts/command/1.0.0");

	for (const response of [currentCommand, exactCommand]) {
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(response.headers()["x-agentkogei-design-system"]).toBe("Command");
		expect(response.headers()["x-agentkogei-design-system-release"]).toBe(
			"1.0.0",
		);
		expect(response.headers()["cache-control"]).toContain("public");
		expect(response.headers()["www-authenticate"]).toBeUndefined();
		expect(await response.text()).toContain("# Command Design System");
	}
	expect(currentCommand.headers()["cache-control"]).not.toContain("immutable");
	expect(exactCommand.headers()["cache-control"]).toContain("immutable");

	for (const selector of ["signal", "signal/1.0.0"]) {
		const response = await request.get(`/contracts/${selector}`);
		expect(response.status()).toBe(404);
		expect(response.headers()["content-type"]).toContain("text/plain");
		expect(response.headers()["cache-control"]).toBe("no-store");
		expect(await response.text()).toBe(
			`${selector.replace("/", "@")} is not a Design System Release in the AgentKogei Official Catalog.\n`,
		);
	}

	for (const selector of ["signal", "signal@1.0.0"]) {
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

for (const publishedDesignSystem of publicDesignSystems) {
	const { identity, designSystem, releases } = publishedDesignSystem;
	const currentRelease = releases[releases.length - 1] as string;

	test(`the Official Catalog delivers ${designSystem} as raw Design Contract Markdown`, async ({
		request,
	}) => {
		const current = await request.get(`/contracts/${identity}`);

		expect(current.status()).toBe(200);
		expect(current.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(current.headers()["x-agentkogei-design-system"]).toBe(designSystem);
		expect(current.headers()["x-agentkogei-design-system-release"]).toBe(
			currentRelease,
		);
		const contract = await current.text();
		expect(contract).toContain(`# ${designSystem} Design System`);
		expect(contract).toContain("\n## Final validation checklist\n");
		// The Official Catalog serves a document a Project can read on its own,
		// so nothing a Builder never receives may reach it.
		for (const machineMetadata of [
			"design-system-evaluation.json",
			"agentkogei.manifest.json",
			".agentkogei/",
			"registry:item",
			"sha256",
		]) {
			expect(contract).not.toContain(machineMetadata);
		}
	});

	test(`the retired registry transport serves no ${designSystem} Design System Release`, async ({
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
				`# ${designSystem} Design System`,
			);
		}
	});

	test(`every published ${designSystem} Design System Release has its own immutable raw route`, async ({
		request,
	}) => {
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
		const current = await request.get(`/contracts/${identity}`);

		expect(delivered.at(-1)).toBe(await current.text());
		expect(new Set(delivered).size).toBe(releases.length);
	});

	test(`the distributed CLI adds ${designSystem} to a Project as one Design Contract`, async ({
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
				`Design System: ${designSystem} (${identity})`,
			);
			expect(refused.stdout).toContain(
				`Design System Release: ${currentRelease}`,
			);
			expect(refused.stdout).toContain(path.join(project, "DESIGN.md"));
			expect(added.exitCode, added.stderr).toBe(0);
			expect(added.stdout).toContain(
				`Installed ${designSystem} Design System Release ${currentRelease}`,
			);
			expect(repeated.exitCode, repeated.stderr).toBe(0);
			expect(repeated.stdout).toContain(
				`${designSystem} Design System Release ${currentRelease} is already this Project's Design Contract`,
			);

			const delivered = await request.get(`/contracts/${identity}`);
			expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
				await delivered.text(),
			);
			const agents = await readFile(path.join(project, "AGENTS.md"), "utf8");
			expect(agents).toContain(existingInstructions);
			expect(agents).toContain("<!-- agentkogei:design-system:start -->");
			expect(agents.match(/agentkogei:design-system:start/g)).toHaveLength(1);
			expect(agents).toContain("`DESIGN.md`");
			expect(existsSync(path.join(project, ".agentkogei"))).toBe(false);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	});

	for (const release of releases) {
		test(`the distributed CLI adds the explicit ${designSystem} Design System Release ${release}`, async ({
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
				expect(added.stdout).toContain(
					`Installed ${designSystem} Design System Release ${release}`,
				);
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

for (const evaluatedDesignSystem of [
	"Foundation",
	"Editorial",
	"Mono",
	"Command",
] as const) {
	test(`${evaluatedDesignSystem} evaluation renders every required screen across evaluated modes`, async ({
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
			await page.goto(`/catalog/${evaluatedDesignSystem.toLowerCase()}`);
			const preview = page.getByLabel(
				`${evaluatedDesignSystem} rendered Design System Preview`,
			);
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

const responsiveRoutes = ["/", "/catalog", "/catalog/command"] as const;

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
