import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

import { cliPath, runCli as runPackagedCli } from "./support/cli";

const webOrigin = "http://localhost:3011";
const contractCatalogUrl = `${webOrigin}/contracts/`;

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

async function signIn(page: Page) {
	await page.goto("/login?callbackURL=%2Fdashboard");
	await page.getByRole("button", { name: "Continue with GitHub" }).click();
	await expect(page).toHaveURL("/dashboard", { timeout: 20_000 });
}

async function runCli(
	arguments_: string[],
	options: { configDirectory: string; projectDirectory: string },
) {
	const { exitCode, stdout, stderr } = await runPackagedCli(arguments_, {
		cwd: options.projectDirectory,
		environment: {
			AGENTKOGEI_CONFIG_DIR: options.configDirectory,
			AGENTKOGEI_NO_BROWSER: "1",
			AGENTKOGEI_CONTRACT_CATALOG_URL: contractCatalogUrl,
		},
	});
	return { code: exitCode, stdout, stderr };
}

async function authorizeCli(
	page: Page,
	configDirectory: string,
	credentialName = "Premium delivery terminal",
) {
	const child = spawn("bun", [cliPath, "login", "--server", webOrigin], {
		env: {
			...process.env,
			AGENTKOGEI_CONFIG_DIR: configDirectory,
			AGENTKOGEI_CREDENTIAL_NAME: credentialName,
			AGENTKOGEI_NO_BROWSER: "1",
		},
	});
	let stdout = "";
	let stderr = "";
	child.stdout.setEncoding("utf8");
	child.stderr.setEncoding("utf8");
	child.stdout.on("data", (chunk: string) => {
		stdout += chunk;
	});
	child.stderr.on("data", (chunk: string) => {
		stderr += chunk;
	});

	await new Promise<void>((resolve, reject) => {
		const startedAt = Date.now();
		const interval = setInterval(() => {
			if (/http:\/\/localhost:3011\/device\b/.test(stdout)) {
				clearInterval(interval);
				resolve();
			} else if (Date.now() - startedAt > 10_000) {
				clearInterval(interval);
				child.kill();
				reject(new Error(`CLI authorization timed out:\n${stdout}\n${stderr}`));
			}
		}, 20);
	});
	const pending = await page.request.get("/api/test/device/pending", {
		params: { credential_name: credentialName },
	});
	expect(pending.status()).toBe(200);
	const authorization = (await pending.json()) as {
		userCode: string;
		verificationUriComplete: string;
	};
	expect(stdout).not.toContain(authorization.userCode);
	expect(stdout).not.toContain("user_code=");
	await page.goto(authorization.verificationUriComplete);
	await page.getByRole("button", { name: "Approve terminal" }).click();
	const code = await new Promise<number | null>((resolve) =>
		child.on("exit", resolve),
	);
	expect(code, stderr).toBe(0);
	return JSON.parse(
		await readFile(path.join(configDirectory, "credentials.json"), "utf8"),
	) as { server: string; credential: string };
}

test.beforeEach(async ({ request }) => {
	const response = await request.delete("/api/test/polar/events");
	expect(response.ok()).toBe(true);
});

test("premium delivery is idempotent and denies every unauthorized state without gated bytes", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-premium-denials-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const gatedSource = "/contracts/command/1.0.0";
	const marker = "# Command Interface System";
	try {
		await signIn(page);
		const activeEvent = await page.request.post("/api/test/polar/events", {
			data: { eventId: "event-premium-denials-active", state: "active" },
		});
		expect(activeEvent.ok(), await activeEvent.text()).toBe(true);
		const { credential } = await authorizeCli(
			page,
			configDirectory,
			"Premium denial terminal",
		);
		const authorized = { authorization: `Bearer ${credential}` };

		const first = await page.request.get(gatedSource, { headers: authorized });
		expect(first.status()).toBe(200);
		expect(first.headers()["content-type"]).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(first.headers()["cache-control"]).toContain("no-store");
		expect(await first.text()).toContain(marker);

		// The same authorized retrieval repeats without additional consent or
		// state, because delivery writes nothing on the Builder's behalf.
		const repeated = await page.request.get(gatedSource, {
			headers: authorized,
		});
		expect(repeated.status()).toBe(200);
		expect(await repeated.text()).toBe(await first.text());

		const missing = await page.request.get(gatedSource);
		expect(
			(
				await page.request.post("/api/test/pack-credentials/scope", {
					data: { credential, scope: "account:read" },
				})
			).status(),
		).toBe(204);
		const insufficient = await page.request.get(gatedSource, {
			headers: authorized,
		});
		expect(
			(
				await page.request.post("/api/test/pack-credentials/scope", {
					data: { credential, scope: "premium:retrieve" },
				})
			).status(),
		).toBe(204);

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "event-premium-denials-expired", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const inactive = await page.request.get(gatedSource, {
			headers: authorized,
		});
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "event-premium-denials-renewed", state: "active" },
				})
			).ok(),
		).toBe(true);

		await page.goto("/dashboard");
		const credentialRow = page.getByRole("article", {
			name: "Pack Credential Premium denial terminal",
		});
		await credentialRow.getByRole("button", { name: "Revoke" }).click();
		await expect(credentialRow.getByText("Revoked")).toBeVisible();
		const revoked = await page.request.get(gatedSource, {
			headers: authorized,
		});

		for (const denial of [
			{ response: missing, status: 401 },
			{ response: insufficient, status: 401 },
			{ response: inactive, status: 403 },
			{ response: revoked, status: 401 },
		]) {
			expect(denial.response.status()).toBe(denial.status);
			expect(denial.response.headers()["cache-control"]).toContain("no-store");
			expect(denial.response.headers()["content-type"]).toContain("text/plain");
			const body = await denial.response.text();
			expect(body).not.toContain(marker);
			expect(body).not.toContain(credential);
		}

		// The registry transport is gone: no envelope, no resource tree, and no
		// public route for a gated Pack Release.
		for (const retiredPath of [
			"/r/command.json",
			"/r/command/1.0.0.json",
			"/api/premium-source/command/1.0.0",
		]) {
			const response = await page.request.get(retiredPath, {
				headers: authorized,
			});
			expect(response.status()).toBe(404);
			expect(await response.text()).not.toContain(marker);
		}
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

for (const terminalState of ["refunded", "reversed"] as const) {
	test(`a ${terminalState} paid term terminates only the Project Licenses it paid for`, async ({
		page,
	}) => {
		const temporaryRoot = await mkdtemp(
			path.join(tmpdir(), `agentkogei-${terminalState}-term-`),
		);
		const configDirectory = path.join(temporaryRoot, "configuration");
		const firstTermLicense = randomUUID();
		const renewedTermLicense = randomUUID();
		const firstTerm = {
			periodStart: "2030-01-01T00:00:00.000Z",
			periodEnd: "2030-12-31T23:59:59.000Z",
		};
		const renewedTerm = {
			periodStart: "2031-01-01T00:00:00.000Z",
			periodEnd: "2031-12-31T23:59:59.000Z",
		};
		const premiumAccess = async (data: Record<string, string>) =>
			expect(
				(await page.request.post("/api/test/polar/events", { data })).ok(),
			).toBe(true);
		const storedLicense = async (id: string) =>
			(
				await page.request.get(`/api/test/premium-delivery/licenses/${id}`)
			).json() as Promise<Record<string, string | null>>;

		try {
			await signIn(page);
			await premiumAccess({
				eventId: `${terminalState}-term-first-active`,
				state: "active",
				...firstTerm,
			});
			const { credential } = await authorizeCli(
				page,
				configDirectory,
				`${terminalState} term terminal`,
			);
			const recordLicense = async (projectLicense: string) =>
				expect(
					(
						await page.request.post(
							`/api/test/premium-delivery/licenses/${projectLicense}`,
							{
								data: {
									credential,
									packId: "command",
									packRelease: "1.0.0",
								},
							},
						)
					).status(),
				).toBe(204);

			await recordLicense(firstTermLicense);
			await premiumAccess({
				eventId: `${terminalState}-term-renewed-active`,
				state: "active",
				...renewedTerm,
			});
			await recordLicense(renewedTermLicense);

			// Another product's reversal is not this subscription's paid term.
			await premiumAccess({
				eventId: `${terminalState}-term-unrelated`,
				state: terminalState,
				...renewedTerm,
				productId: "polar-unrelated-product",
			});
			expect(await storedLicense(renewedTermLicense)).toMatchObject({
				status: "active",
				terminationReason: null,
			});

			await premiumAccess({
				eventId: `${terminalState}-term-first-terminal`,
				state: terminalState,
				...firstTerm,
			});
			expect(await storedLicense(firstTermLicense)).toMatchObject({
				status: "terminated",
				terminationReason: terminalState,
			});
			expect(await storedLicense(renewedTermLicense)).toMatchObject({
				status: "active",
				terminationReason: null,
			});
		} finally {
			await rm(temporaryRoot, { recursive: true, force: true });
		}
	});
}

test("a canceled subscription keeps delivering until its paid term ends", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-canceling-term-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	try {
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "canceling-term-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		const { credential } = await authorizeCli(
			page,
			configDirectory,
			"Canceling term terminal",
		);
		const authorized = { authorization: `Bearer ${credential}` };

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: {
						eventId: "canceling-term-canceling",
						state: "canceling",
						periodEnd: "2031-12-31T23:59:59.000Z",
					},
				})
			).ok(),
		).toBe(true);
		const duringPaidTerm = await page.request.get("/contracts/command", {
			headers: authorized,
		});
		expect(duringPaidTerm.status()).toBe(200);
		expect(await duringPaidTerm.text()).toContain("# Command Interface System");

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "canceling-term-expired", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const afterExpiration = await page.request.get("/contracts/command", {
			headers: authorized,
		});
		expect(afterExpiration.status()).toBe(403);
		expect(await afterExpiration.text()).not.toContain(
			"# Command Interface System",
		);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

/**
 * The Premium Design Packs the Official Catalog gates, with the direction each
 * Design Contract must carry. These journeys observe only the HTTP routes and
 * the real CLI process, so what a pack contains is stated here rather than
 * imported from the delivery code under test.
 */
const premiumDesignPacks = [
	{
		identity: "command",
		designPack: "Command",
		direction: [
			"## Command component and state recipes",
			"## Token definitions",
			"--command-primary: oklch(0.72 0.16 195);",
			"## Command operations patterns",
			"## Command on React / Next.js, Tailwind CSS v4, and shadcn/ui",
		],
		otherPack: "Signal",
	},
	{
		identity: "signal",
		designPack: "Signal",
		direction: [
			"## Signal motion patterns",
			"## Token definitions",
			"--signal-primary: oklch(0.53 0.25 293);",
			// A meaningful graphic arrives in the document under its own
			// accessible name rather than as a resource beside it.
			"## Signal orbit field",
			'<circle cx="230" cy="55" r="42"',
			"## Signal on React / Next.js, Tailwind CSS v4, and shadcn/ui",
		],
		otherPack: "Command",
	},
] as const;

for (const pack of premiumDesignPacks) {
	const { identity, designPack, direction, otherPack } = pack;
	const heading = `# ${designPack} Interface System`;

	test(`a subscribed Builder adds the Premium ${designPack} Design Contract without creating a Project identifier`, async ({
		page,
	}) => {
		const temporaryRoot = await mkdtemp(
			path.join(tmpdir(), `agentkogei-${identity}-design-contract-`),
		);
		const configDirectory = path.join(temporaryRoot, "configuration");
		const projectDirectory = path.join(temporaryRoot, "project");
		const revokedProjectDirectory = path.join(temporaryRoot, "revoked-project");
		const designContractPath = path.join(projectDirectory, "DESIGN.md");
		const addPack = (selector: string, options: string[] = ["--yes"]) =>
			runCli(["add", selector, ...options], {
				configDirectory,
				projectDirectory,
			});
		const premiumAccess = async (eventId: string, state: string) =>
			expect(
				(
					await page.request.post("/api/test/polar/events", {
						data: { eventId, state },
					})
				).ok(),
			).toBe(true);
		const entitlementEvents = async () =>
			(await (
				await page.request.get("/api/test/premium-delivery/entitlement-events")
			).json()) as Array<Record<string, string>>;

		try {
			await mkdir(projectDirectory);
			await mkdir(path.join(projectDirectory, ".git"));
			await writeFile(
				path.join(projectDirectory, ".git/config"),
				'[remote "origin"]\nurl = git@example.com:private/secret-project.git\n',
			);
			await writeFile(
				path.join(projectDirectory, "package.json"),
				'{"name":"secret-project","dependencies":{"dependency-marker":"1.0.0"}}',
			);
			await mkdir(revokedProjectDirectory);

			for (const anonymousPath of [
				`/contracts/${identity}`,
				`/contracts/${identity}/1.0.0`,
			]) {
				const anonymous = await page.request.get(anonymousPath);
				expect(anonymous.status()).toBe(401);
				expect(await anonymous.text()).not.toContain(heading);
			}
			const unknownRelease = await page.request.get(
				`/contracts/${identity}/9.9.9`,
			);
			expect(unknownRelease.status()).toBe(404);
			const withoutCredential = await addPack(`${identity}@1.0.0`);
			expect(withoutCredential.code).toBe(2);
			expect(withoutCredential.stderr).toContain("agentkogei login");
			expect(await readdir(projectDirectory)).not.toContain("DESIGN.md");

			await signIn(page);
			await premiumAccess(`${identity}-contract-active`, "active");
			const { credential } = await authorizeCli(
				page,
				configDirectory,
				`${designPack} contract terminal`,
			);

			await premiumAccess(`${identity}-contract-expired`, "expired");
			const beforeDenial = await entitlementEvents();
			const inactive = await addPack(`${identity}@1.0.0`);
			expect(inactive.code).toBe(1);
			expect(inactive.stderr).toContain("Premium Access");
			expect(inactive.stdout).not.toContain(heading);
			expect(await readdir(projectDirectory)).not.toContain("DESIGN.md");
			expect(await entitlementEvents()).toEqual(beforeDenial);

			await premiumAccess(`${identity}-contract-renewed`, "active");
			const added = await addPack(identity);
			expect(added.code, added.stderr).toBe(0);
			expect(added.stdout).toContain(`${designPack} 1.0.0 (${identity})`);
			expect(added.stdout).toContain("AgentKogei Commercial Pack License");
			const designContract = await readFile(designContractPath, "utf8");
			expect(designContract.startsWith(`${heading}\n`)).toBe(true);
			for (const line of direction) {
				expect(designContract).toContain(line);
			}
			expect(designContract).toContain("## Provenance");
			expect(designContract).toContain(
				`- Design Pack: ${designPack} (\`${identity}\`)`,
			);
			// One self-contained document: no other pack's direction, no resource
			// a Project never receives, and no machine metadata.
			for (const absent of [
				otherPack,
				"Foundation",
				"sha256",
				"pack-evaluation.json",
				"agentkogei.manifest.json",
				".agentkogei/",
				"evaluation/",
			]) {
				expect(designContract).not.toContain(absent);
			}
			expect(
				await readFile(path.join(projectDirectory, "AGENTS.md"), "utf8"),
			).toContain("<!-- agentkogei:design-pack:start -->");
			expect(await readdir(projectDirectory)).not.toContain(".agentkogei");

			// The bare identity and the explicit version select one immutable
			// Pack Release, so naming it changes nothing in the Project.
			const exactRelease = await addPack(`${identity}@1.0.0`);
			expect(exactRelease.code, exactRelease.stderr).toBe(0);
			expect(exactRelease.stdout).toContain(
				`${designPack} 1.0.0 is already this Project's Design Contract`,
			);
			expect(await readFile(designContractPath, "utf8")).toBe(designContract);

			const observation = (await (
				await page.request.get("/api/test/premium-delivery/observation")
			).json()) as {
				method: string;
				pathname: string;
				search: string;
				headers: Record<string, string>;
				hasBody: boolean;
			};
			expect(observation).toMatchObject({
				method: "GET",
				pathname: `/contracts/${identity}/1.0.0`,
				search: "",
				hasBody: false,
			});
			expect(
				observation.headers["x-agentkogei-project-license"],
			).toBeUndefined();
			const events = await entitlementEvents();
			const retrievals = events.filter((event) => event.packId === identity);
			expect(retrievals).toHaveLength(2);
			for (const event of retrievals) {
				expect(event).toMatchObject({
					packId: identity,
					packRelease: "1.0.0",
					action: "retrieval",
				});
				expect(event.builderId).toBeTruthy();
				expect(Date.parse(event.occurredAt ?? "")).toBeGreaterThan(0);
			}
			for (const evidence of [
				JSON.stringify(observation),
				JSON.stringify(events),
			]) {
				for (const privateValue of [
					projectDirectory,
					"secret-project",
					"dependency-marker",
					"projectLicense",
				]) {
					expect(evidence).not.toContain(privateValue);
				}
			}

			// The Pack Preview stays public evidence and never carries the gated
			// document a Builder pays for.
			const preview = await page.request.get(`/catalog/${identity}`);
			expect(preview.status()).toBe(200);
			const previewBody = await preview.text();
			for (const line of [heading, ...direction]) {
				expect(previewBody).not.toContain(line);
			}

			await premiumAccess(`${identity}-contract-lapsed`, "expired");
			const afterExpiry = await addPack(`${identity}@1.0.0`, [
				"--yes",
				"--force",
			]);
			expect(afterExpiry.code).toBe(1);
			expect(afterExpiry.stderr).toContain("Premium Access");
			expect(await readFile(designContractPath, "utf8")).toBe(designContract);

			await premiumAccess(`${identity}-contract-refunded`, "refunded");
			const refunded = await page.request.get(`/contracts/${identity}`, {
				headers: { authorization: `Bearer ${credential}` },
			});
			expect(refunded.status()).toBe(403);
			expect(refunded.headers()["cache-control"]).toContain("no-store");
			expect(await refunded.text()).not.toContain(heading);

			await premiumAccess(`${identity}-contract-restored`, "active");
			await page.goto("/dashboard");
			const credentialRow = page.getByRole("article", {
				name: `Pack Credential ${designPack} contract terminal`,
			});
			await credentialRow.getByRole("button", { name: "Revoke" }).click();
			await expect(credentialRow.getByText("Revoked")).toBeVisible();
			const afterRevocation = await runCli(["add", identity, "--yes"], {
				configDirectory,
				projectDirectory: revokedProjectDirectory,
			});
			expect(afterRevocation.code).toBe(2);
			expect(afterRevocation.stdout).not.toContain(heading);
			expect(await readdir(revokedProjectDirectory)).toEqual([]);

			// An Installed Pack stays usable with no credential, no Premium
			// Access, and no network.
			await rm(configDirectory, { recursive: true, force: true });
			expect(await readFile(designContractPath, "utf8")).toBe(designContract);
		} finally {
			await rm(temporaryRoot, { recursive: true, force: true });
		}
	});
}

test("replacing one Premium Design Contract with another needs explicit force", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-premium-replacement-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	const designContractPath = path.join(projectDirectory, "DESIGN.md");
	const addPack = (selector: string, options: string[] = ["--yes"]) =>
		runCli(["add", selector, ...options], {
			configDirectory,
			projectDirectory,
		});
	try {
		await mkdir(projectDirectory);
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "premium-replacement-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory, "Premium replacement terminal");

		const added = await addPack("command@1.0.0");
		expect(added.code, added.stderr).toBe(0);
		const commandContract = await readFile(designContractPath, "utf8");

		const refused = await addPack("signal@1.0.0");
		expect(refused.code).toBe(2);
		expect(refused.stderr).toContain("requires --yes --force");
		expect(await readFile(designContractPath, "utf8")).toBe(commandContract);

		const replaced = await addPack("signal@1.0.0", ["--yes", "--force"]);
		expect(replaced.code, replaced.stderr).toBe(0);
		expect(replaced.stdout).toContain("Replacing the existing DESIGN.md");
		const signalContract = await readFile(designContractPath, "utf8");
		expect(signalContract.startsWith("# Signal Interface System\n")).toBe(true);
		expect(signalContract).not.toContain("Command");
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});
