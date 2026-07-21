import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
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

import { cliPath } from "./support/cli";

const webOrigin = "http://localhost:3011";
const contractCatalogUrl = `${webOrigin}/contracts/`;
const commandContractPath = "/contracts/command/1.0.0";
const fixtureSource = `${webOrigin}/api/premium-source/delivery-fixture/1.0.0`;
const commandSource = `${webOrigin}/api/premium-source/command/1.0.0`;
const signalSource = `${webOrigin}/api/premium-source/signal/1.0.0`;
const premiumReleaseUnavailable =
	"Pack Release for the Premium Design Pack is invalid or unavailable";

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

async function signIn(page: Page) {
	await page.goto("/login?callbackURL=%2Fdashboard");
	await page.getByRole("button", { name: "Continue with GitHub" }).click();
	await expect(page).toHaveURL("/dashboard", { timeout: 20_000 });
}

function runCli(
	arguments_: string[],
	options: {
		configDirectory: string;
		projectDirectory: string;
		officialCatalogUrl?: string;
		contractCatalogUrl?: string;
	},
) {
	return new Promise<{ code: number | null; stdout: string; stderr: string }>(
		(resolve) => {
			const child = spawn("bun", [cliPath, ...arguments_], {
				cwd: options.projectDirectory,
				env: {
					...process.env,
					AGENTKOGEI_CONFIG_DIR: options.configDirectory,
					AGENTKOGEI_NO_BROWSER: "1",
					...(options.officialCatalogUrl
						? {
								AGENTKOGEI_OFFICIAL_CATALOG_URL: options.officialCatalogUrl,
							}
						: {}),
					...(options.contractCatalogUrl
						? {
								AGENTKOGEI_CONTRACT_CATALOG_URL: options.contractCatalogUrl,
							}
						: {}),
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
			child.on("exit", (code) => resolve({ code, stdout, stderr }));
		},
	);
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

async function runOfflineStatus(
	configDirectory: string,
	projectDirectory: string,
) {
	const storedCredential = await readFile(
		path.join(configDirectory, "credentials.json"),
		"utf8",
	);
	await rm(configDirectory, { recursive: true, force: true });
	const status = await runCli(["status"], {
		configDirectory,
		projectDirectory,
	});
	await mkdir(configDirectory, { recursive: true });
	await writeFile(
		path.join(configDirectory, "credentials.json"),
		storedCredential,
	);
	return status;
}

test.beforeEach(async ({ request }) => {
	const response = await request.delete("/api/test/polar/events");
	expect(response.ok()).toBe(true);
});

test("an actively subscribed Builder installs the exact protected Command Pack Release under a lasting Project License", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-command-installation-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	try {
		await mkdir(projectDirectory);
		const anonymous = await page.request.get(commandSource);
		expect(anonymous.status()).toBe(404);
		expect(await anonymous.text()).toBe(
			'{"error":"premium_release_unavailable"}',
		);
		for (const protectedSourcePath of [
			"/r/command.json",
			"/r/command/1.0.0.json",
		]) {
			const response = await page.request.get(protectedSourcePath);
			expect(response.status()).toBe(404);
			expect(await response.text()).not.toContain("Command Interface System");
		}
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "command-access-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory, "Command installation terminal");

		const installed = await runCli(["install", "command@1.0.0", "--yes"], {
			configDirectory,
			projectDirectory,
			officialCatalogUrl: `${webOrigin}/r/`,
		});
		expect(installed.code, installed.stderr).toBe(0);
		expect(installed.stdout).toContain("Command 1.0.0");
		expect(installed.stdout).toContain("AgentKogei Commercial Pack License");
		expect(installed.stdout).not.toContain("not a Published Pack");

		const record = JSON.parse(
			await readFile(
				path.join(projectDirectory, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as {
			pack: { id: string; version: string };
			projectLicense: string;
			source: string;
			targets: Array<{ target: string; sha256: string }>;
		};
		expect(record.pack).toEqual({ id: "command", version: "1.0.0" });
		expect(record.source).toBe(`${webOrigin}/r/command/1.0.0.json`);
		expect(record.projectLicense).toMatch(/^[0-9a-f-]{36}$/);
		expect(record.targets.length).toBeGreaterThan(9);
		for (const target of record.targets) {
			const contents = await readFile(
				path.join(projectDirectory, target.target),
			);
			expect(createHash("sha256").update(contents).digest("hex")).toBe(
				target.sha256,
			);
		}

		expect(
			await readFile(
				path.join(projectDirectory, ".agentkogei/command/DESIGN.md"),
				"utf8",
			),
		).toContain("# Command Interface System");
		expect(
			await readFile(
				path.join(
					projectDirectory,
					".agentkogei/command/evaluation/report.json",
				),
				"utf8",
			),
		).toContain('"standard": "WCAG 2.2 Level AA"');

		const storedLicense = await page.request.get(
			`/api/test/premium-delivery/licenses/${record.projectLicense}`,
		);
		expect(storedLicense.status()).toBe(200);
		expect(await storedLicense.json()).toEqual({
			id: record.projectLicense,
			packId: "command",
			packRelease: "1.0.0",
			status: "active",
			terminationReason: null,
			terminatedAt: null,
		});

		await rm(configDirectory, { recursive: true, force: true });
		const status = await runCli(["status"], {
			configDirectory,
			projectDirectory,
		});
		expect(status.code, status.stderr).toBe(0);
		expect(status.stdout).toContain(
			`Project License: ${record.projectLicense}`,
		);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("an actively subscribed Builder discovers and installs the exact protected Signal Pack Release under a lasting Project License", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-signal-installation-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	try {
		await mkdir(projectDirectory);
		for (const source of [signalSource, `${webOrigin}/r/signal/1.0.0.json`]) {
			const anonymous = await page.request.get(source);
			expect(anonymous.status()).toBe(404);
			expect(await anonymous.text()).not.toContain("# Signal Interface System");
		}

		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "signal-access-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		const { credential } = await authorizeCli(
			page,
			configDirectory,
			"Signal installation terminal",
		);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "signal-access-expired", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const inactive = await page.request.get(signalSource, {
			headers: {
				authorization: `Bearer ${credential}`,
				"x-agentkogei-project-license": randomUUID(),
				"x-agentkogei-action": "install",
			},
		});
		expect(inactive.status()).toBe(404);
		expect(await inactive.text()).toBe(
			'{"error":"premium_release_unavailable"}',
		);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "signal-access-renewed", state: "active" },
				})
			).ok(),
		).toBe(true);

		const installed = await runCli(["install", "signal@1.0.0", "--yes"], {
			configDirectory,
			projectDirectory,
			officialCatalogUrl: `${webOrigin}/r/`,
		});
		expect(installed.code, installed.stderr).toBe(0);
		expect(installed.stdout).toContain("Signal 1.0.0");
		expect(installed.stdout).toContain("AgentKogei Commercial Pack License");

		const record = JSON.parse(
			await readFile(
				path.join(projectDirectory, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as {
			pack: { id: string; version: string };
			projectLicense: string;
			source: string;
			targets: Array<{ target: string; sha256: string }>;
		};
		expect(record.pack).toEqual({ id: "signal", version: "1.0.0" });
		expect(record.source).toBe(`${webOrigin}/r/signal/1.0.0.json`);
		expect(record.projectLicense).toMatch(/^[0-9a-f-]{36}$/);
		expect(record.targets.length).toBeGreaterThan(11);
		for (const target of record.targets) {
			const contents = await readFile(
				path.join(projectDirectory, target.target),
			);
			expect(createHash("sha256").update(contents).digest("hex")).toBe(
				target.sha256,
			);
		}
		expect(
			await readFile(
				path.join(projectDirectory, ".agentkogei/signal/DESIGN.md"),
				"utf8",
			),
		).toContain("# Signal Interface System");
		const stackAdapter = await readFile(
			path.join(
				projectDirectory,
				".agentkogei/signal/adapters/react-tailwind-shadcn/README.md",
			),
			"utf8",
		);
		expect(stackAdapter).toContain("# Signal React / Next.js Stack Adapter");
		expect(stackAdapter).not.toContain("Foundation");
		expect(
			await readFile(
				path.join(
					projectDirectory,
					".agentkogei/signal/resources/orbit-field.svg",
				),
				"utf8",
			),
		).toContain("Signal orbit field");

		const storedLicense = await page.request.get(
			`/api/test/premium-delivery/licenses/${record.projectLicense}`,
		);
		expect(storedLicense.status()).toBe(200);
		expect(await storedLicense.json()).toMatchObject({
			id: record.projectLicense,
			packId: "signal",
			packRelease: "1.0.0",
			status: "active",
		});

		await rm(configDirectory, { recursive: true, force: true });
		const status = await runCli(["status"], {
			configDirectory,
			projectDirectory,
		});
		expect(status.code, status.stderr).toBe(0);
		expect(status.stdout).toContain(
			`Project License: ${record.projectLicense}`,
		);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("an actively subscribed Builder installs a licensed premium snapshot for offline use", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-premium-delivery-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	try {
		await mkdir(projectDirectory);
		await mkdir(path.join(projectDirectory, ".git"));
		await writeFile(
			path.join(projectDirectory, ".git/config"),
			'[remote "origin"]\nurl = git@example.com:private/secret-project.git\n',
		);
		await writeFile(
			path.join(projectDirectory, "private-project-content.txt"),
			"generated-ui-marker dependency-inventory-marker prompt-marker\n",
		);
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "premium-delivery-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory);

		const declined = await runCli(
			["install", "delivery-fixture@1.0.0", "--source", fixtureSource],
			{ configDirectory, projectDirectory },
		);
		expect(declined.code).toBe(2);
		expect(declined.stderr).toContain("Installation not confirmed");
		const declinedObservation = (await (
			await page.request.get("/api/test/premium-delivery/observation")
		).json()) as { headers: Record<string, string> };
		const declinedLicense =
			declinedObservation.headers["x-agentkogei-project-license"];
		expect(declinedLicense).toMatch(/^[0-9a-f-]{36}$/);
		expect(
			(
				await page.request.get(
					`/api/test/premium-delivery/licenses/${declinedLicense}`,
				)
			).status(),
		).toBe(404);

		const installed = await runCli(
			["install", "delivery-fixture@1.0.0", "--source", fixtureSource, "--yes"],
			{ configDirectory, projectDirectory },
		);
		expect(installed.code, installed.stderr).toBe(0);
		expect(installed.stdout).toContain("Delivery Fixture 1.0.0");
		expect(installed.stdout).toContain("not a Published Pack");
		const observationResponse = await page.request.get(
			"/api/test/premium-delivery/observation",
		);
		expect(observationResponse.ok()).toBe(true);
		const observation = (await observationResponse.json()) as {
			method: string;
			pathname: string;
			search: string;
			headers: Record<string, string>;
			hasBody: boolean;
		};
		expect(observation).toMatchObject({
			method: "GET",
			pathname: "/api/premium-source/delivery-fixture/1.0.0",
			search: "",
			hasBody: false,
		});
		const outbound = JSON.stringify(observation);
		for (const privateValue of [
			projectDirectory,
			"secret-project",
			"generated-ui-marker",
			"dependency-inventory-marker",
			"prompt-marker",
		]) {
			expect(outbound).not.toContain(privateValue);
		}

		const record = JSON.parse(
			await readFile(
				path.join(projectDirectory, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as { pack: { version: string }; projectLicense: string };
		expect(record.pack.version).toBe("1.0.0");
		expect(record.projectLicense).toMatch(/^[0-9a-f-]{36}$/);
		const storedLicense = await page.request.get(
			`/api/test/premium-delivery/licenses/${record.projectLicense}`,
		);
		expect(storedLicense.status()).toBe(200);
		expect(await storedLicense.json()).toEqual({
			id: record.projectLicense,
			packId: "delivery-fixture",
			packRelease: "1.0.0",
			status: "active",
			terminationReason: null,
			terminatedAt: null,
		});

		await rm(configDirectory, { recursive: true, force: true });
		const status = await runCli(["status"], {
			configDirectory,
			projectDirectory,
		});
		expect(status.code, status.stderr).toBe(0);
		expect(status.stdout).toContain(
			`Project License: ${record.projectLicense}`,
		);
		expect(
			await readFile(
				path.join(projectDirectory, ".agentkogei/delivery-fixture/DESIGN.md"),
				"utf8",
			),
		).toContain("Controlled Premium Delivery Fixture");
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("premium delivery is idempotent and denies every unauthorized state without gated bytes", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-premium-denials-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const marker = "Controlled Premium Delivery Fixture";
	const projectLicense = randomUUID();
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
		const authorizedHeaders = {
			authorization: `Bearer ${credential}`,
			"x-agentkogei-project-license": projectLicense,
			"x-agentkogei-action": "install",
		};

		const first = await page.request.get(fixtureSource, {
			headers: authorizedHeaders,
		});
		expect(first.status()).toBe(200);
		expect(first.headers()["cache-control"]).toContain("no-store");
		expect(first.headers()["x-agentkogei-project-license"]).toBe(
			projectLicense,
		);
		expect(await first.text()).toContain(marker);

		const repeated = await page.request.get(fixtureSource, {
			headers: authorizedHeaders,
		});
		expect(repeated.status()).toBe(200);
		expect(repeated.headers()["x-agentkogei-project-license"]).toBe(
			projectLicense,
		);
		expect(
			(
				await page.request.get(
					`/api/test/premium-delivery/licenses/${projectLicense}`,
				)
			).status(),
		).toBe(404);
		for (let attempt = 0; attempt < 2; attempt += 1) {
			const recorded = await page.request.post(fixtureSource, {
				headers: authorizedHeaders,
			});
			expect(recorded.status()).toBe(204);
		}
		expect(
			await (
				await page.request.get(
					`/api/test/premium-delivery/licenses/${projectLicense}`,
				)
			).json(),
		).toEqual({
			id: projectLicense,
			packId: "delivery-fixture",
			packRelease: "1.0.0",
			status: "active",
			terminationReason: null,
			terminatedAt: null,
		});

		const missing = await page.request.get(fixtureSource, {
			headers: {
				"x-agentkogei-project-license": randomUUID(),
				"x-agentkogei-action": "install",
			},
		});
		expect(
			(
				await page.request.post("/api/test/pack-credentials/scope", {
					data: { credential, scope: "account:read" },
				})
			).status(),
		).toBe(204);
		const insufficient = await page.request.get(fixtureSource, {
			headers: {
				authorization: `Bearer ${credential}`,
				"x-agentkogei-project-license": randomUUID(),
				"x-agentkogei-action": "install",
			},
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
		const inactive = await page.request.get(fixtureSource, {
			headers: {
				...authorizedHeaders,
				"x-agentkogei-project-license": randomUUID(),
			},
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
		const revoked = await page.request.get(fixtureSource, {
			headers: {
				...authorizedHeaders,
				"x-agentkogei-project-license": randomUUID(),
			},
		});

		for (const denial of [missing, insufficient, inactive, revoked]) {
			expect(denial.status()).toBe(404);
			expect(denial.headers()["cache-control"]).toContain("no-store");
			const body = await denial.text();
			expect(body).toBe('{"error":"premium_release_unavailable"}');
			expect(body).not.toContain(marker);
			expect(body).not.toContain(credential);
		}

		for (const publicPath of [
			"/r/delivery-fixture.json",
			"/r/delivery-fixture/1.0.0.json",
			"/catalog/delivery-fixture",
		]) {
			const response = await page.request.get(publicPath);
			expect(response.status()).toBe(404);
			expect(await response.text()).not.toContain(marker);
		}
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("cancelation preserves premium updates until expiration and renewal restores them", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-premium-update-lifecycle-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	const reinstallationDirectory = path.join(temporaryRoot, "reinstallation");
	const newInstallationDirectory = path.join(temporaryRoot, "new-installation");
	try {
		await mkdir(projectDirectory);
		await mkdir(reinstallationDirectory);
		await mkdir(newInstallationDirectory);
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "update-lifecycle-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory, "Update lifecycle terminal");
		const installed = await runCli(["install", "command@1.0.0", "--yes"], {
			configDirectory,
			projectDirectory,
			officialCatalogUrl: `${webOrigin}/r/`,
		});
		expect(installed.code, installed.stderr).toBe(0);

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "update-lifecycle-canceling", state: "canceling" },
				})
			).ok(),
		).toBe(true);
		await page.goto("/catalog/command");
		await expect(
			page.getByRole("heading", { level: 1, name: "Command" }),
		).toBeVisible();
		const offlineDuringPaidTerm = await runOfflineStatus(
			configDirectory,
			projectDirectory,
		);
		expect(offlineDuringPaidTerm.code, offlineDuringPaidTerm.stderr).toBe(0);
		const duringPaidTerm = await runCli(["update"], {
			configDirectory,
			projectDirectory,
		});
		expect(duringPaidTerm.code, duringPaidTerm.stderr).toBe(0);
		expect(duringPaidTerm.stdout).toContain("Command 1.0.0 is already current");
		const installedDuringPaidTerm = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: reinstallationDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(installedDuringPaidTerm.code, installedDuringPaidTerm.stderr).toBe(
			0,
		);

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "update-lifecycle-expired", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const afterExpiration = await runCli(["update"], {
			configDirectory,
			projectDirectory,
		});
		expect(afterExpiration.code).toBe(1);
		expect(afterExpiration.stderr).toContain(premiumReleaseUnavailable);
		const deniedNewInstallation = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: newInstallationDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(deniedNewInstallation.code).toBe(1);
		expect(deniedNewInstallation.stderr).toContain(premiumReleaseUnavailable);
		await rm(path.join(reinstallationDirectory, ".agentkogei"), {
			recursive: true,
			force: true,
		});
		await rm(path.join(reinstallationDirectory, "AGENTS.md"), { force: true });
		const deniedReinstallation = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: reinstallationDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(deniedReinstallation.code).toBe(1);
		expect(deniedReinstallation.stderr).toContain(premiumReleaseUnavailable);
		const offlineAfterExpiration = await runOfflineStatus(
			configDirectory,
			projectDirectory,
		);
		expect(offlineAfterExpiration.code, offlineAfterExpiration.stderr).toBe(0);
		expect(offlineAfterExpiration.stdout).toContain("Resource integrity:");
		await page.goto("/catalog/command");
		await expect(
			page.getByRole("heading", { level: 1, name: "Command" }),
		).toBeVisible();

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "update-lifecycle-renewed", state: "active" },
				})
			).ok(),
		).toBe(true);
		const afterRenewal = await runCli(["update"], {
			configDirectory,
			projectDirectory,
		});
		expect(afterRenewal.code, afterRenewal.stderr).toBe(0);
		expect(afterRenewal.stdout).toContain("Command 1.0.0 is already current");
		const reinstalledAfterRenewal = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: reinstallationDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(reinstalledAfterRenewal.code, reinstalledAfterRenewal.stderr).toBe(
			0,
		);
		const installedAfterRenewal = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: newInstallationDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(installedAfterRenewal.code, installedAfterRenewal.stderr).toBe(0);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("a refund terminates only Project Licenses from its affected paid term", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-affected-paid-term-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const firstTermProject = path.join(temporaryRoot, "first-term-project");
	const renewedTermProject = path.join(temporaryRoot, "renewed-term-project");
	const currentTermProject = path.join(temporaryRoot, "current-term-project");
	const firstPeriodStart = "2030-01-01T00:00:00.000Z";
	const firstPeriodEnd = "2030-12-31T23:59:59.000Z";
	const renewedPeriodStart = "2031-01-01T00:00:00.000Z";
	const renewedPeriodEnd = "2031-12-31T23:59:59.000Z";
	try {
		await mkdir(firstTermProject);
		await mkdir(renewedTermProject);
		await mkdir(currentTermProject);
		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: {
						eventId: "affected-term-first-active",
						state: "active",
						periodStart: firstPeriodStart,
						periodEnd: firstPeriodEnd,
					},
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory, "Affected term terminal");
		const firstInstall = await runCli(["install", "command@1.0.0", "--yes"], {
			configDirectory,
			projectDirectory: firstTermProject,
			officialCatalogUrl: `${webOrigin}/r/`,
		});
		expect(firstInstall.code, firstInstall.stderr).toBe(0);
		const firstRecord = JSON.parse(
			await readFile(
				path.join(firstTermProject, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as { projectLicense: string };

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: {
						eventId: "affected-term-renewed-active",
						state: "active",
						periodStart: renewedPeriodStart,
						periodEnd: renewedPeriodEnd,
					},
				})
			).ok(),
		).toBe(true);
		const renewedInstall = await runCli(["install", "command@1.0.0", "--yes"], {
			configDirectory,
			projectDirectory: renewedTermProject,
			officialCatalogUrl: `${webOrigin}/r/`,
		});
		expect(renewedInstall.code, renewedInstall.stderr).toBe(0);
		const renewedRecord = JSON.parse(
			await readFile(
				path.join(renewedTermProject, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as { projectLicense: string };
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: {
						eventId: "affected-term-unrelated-refund",
						state: "refunded",
						periodStart: renewedPeriodStart,
						periodEnd: renewedPeriodEnd,
						productId: "polar-unrelated-product",
					},
				})
			).ok(),
		).toBe(true);
		expect(
			await (
				await page.request.get(
					`/api/test/premium-delivery/licenses/${renewedRecord.projectLicense}`,
				)
			).json(),
		).toMatchObject({ status: "active", terminationReason: null });

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: {
						eventId: "affected-term-first-refunded",
						state: "refunded",
						periodStart: firstPeriodStart,
						periodEnd: firstPeriodEnd,
					},
				})
			).ok(),
		).toBe(true);
		expect(
			await (
				await page.request.get(
					`/api/test/premium-delivery/licenses/${firstRecord.projectLicense}`,
				)
			).json(),
		).toMatchObject({ status: "terminated", terminationReason: "refunded" });
		expect(
			await (
				await page.request.get(
					`/api/test/premium-delivery/licenses/${renewedRecord.projectLicense}`,
				)
			).json(),
		).toMatchObject({ status: "active", terminationReason: null });

		const currentTermInstall = await runCli(
			["install", "command@1.0.0", "--yes"],
			{
				configDirectory,
				projectDirectory: currentTermProject,
				officialCatalogUrl: `${webOrigin}/r/`,
			},
		);
		expect(currentTermInstall.code, currentTermInstall.stderr).toBe(0);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

for (const terminalState of ["refunded", "reversed"] as const) {
	test(`${terminalState} access terminates the Project License without modifying the Installed Pack`, async ({
		page,
	}) => {
		const temporaryRoot = await mkdtemp(
			path.join(tmpdir(), `agentkogei-${terminalState}-lifecycle-`),
		);
		const configDirectory = path.join(temporaryRoot, "configuration");
		const projectDirectory = path.join(temporaryRoot, "project");
		const reinstallationDirectory = path.join(temporaryRoot, "reinstallation");
		const deniedProjectDirectory = path.join(temporaryRoot, "denied-project");
		try {
			await mkdir(projectDirectory);
			await mkdir(reinstallationDirectory);
			await mkdir(deniedProjectDirectory);
			await signIn(page);
			expect(
				(
					await page.request.post("/api/test/polar/events", {
						data: {
							eventId: `${terminalState}-lifecycle-active`,
							state: "active",
						},
					})
				).ok(),
			).toBe(true);
			await authorizeCli(page, configDirectory, `${terminalState} terminal`);
			const installed = await runCli(["install", "command@1.0.0", "--yes"], {
				configDirectory,
				projectDirectory,
				officialCatalogUrl: `${webOrigin}/r/`,
			});
			expect(installed.code, installed.stderr).toBe(0);
			const installedForReinstallation = await runCli(
				["install", "command@1.0.0", "--yes"],
				{
					configDirectory,
					projectDirectory: reinstallationDirectory,
					officialCatalogUrl: `${webOrigin}/r/`,
				},
			);
			expect(
				installedForReinstallation.code,
				installedForReinstallation.stderr,
			).toBe(0);
			const record = JSON.parse(
				await readFile(
					path.join(projectDirectory, ".agentkogei/installed-pack.json"),
					"utf8",
				),
			) as { projectLicense: string };
			const designContractPath = path.join(
				projectDirectory,
				".agentkogei/command/DESIGN.md",
			);
			const installedDesignContract = await readFile(
				designContractPath,
				"utf8",
			);

			expect(
				(
					await page.request.post("/api/test/polar/events", {
						data: {
							eventId: `${terminalState}-lifecycle-terminal`,
							state: terminalState,
						},
					})
				).ok(),
			).toBe(true);
			const terminatedLicense = await page.request.get(
				`/api/test/premium-delivery/licenses/${record.projectLicense}`,
			);
			expect(terminatedLicense.status()).toBe(200);
			expect(await terminatedLicense.json()).toMatchObject({
				id: record.projectLicense,
				status: "terminated",
				terminationReason: terminalState,
			});
			const deniedUpdate = await runCli(["update"], {
				configDirectory,
				projectDirectory,
			});
			expect(deniedUpdate.code).toBe(1);
			expect(deniedUpdate.stderr).toContain(premiumReleaseUnavailable);
			await rm(path.join(reinstallationDirectory, ".agentkogei"), {
				recursive: true,
				force: true,
			});
			await rm(path.join(reinstallationDirectory, "AGENTS.md"), {
				force: true,
			});
			const deniedReinstallation = await runCli(
				["install", "command@1.0.0", "--yes"],
				{
					configDirectory,
					projectDirectory: reinstallationDirectory,
					officialCatalogUrl: `${webOrigin}/r/`,
				},
			);
			expect(deniedReinstallation.code).toBe(1);
			expect(deniedReinstallation.stderr).toContain(premiumReleaseUnavailable);

			const deniedInstallation = await runCli(
				["install", "command@1.0.0", "--yes"],
				{
					configDirectory,
					projectDirectory: deniedProjectDirectory,
					officialCatalogUrl: `${webOrigin}/r/`,
				},
			);
			expect(deniedInstallation.code).toBe(1);
			expect(deniedInstallation.stderr).toContain(premiumReleaseUnavailable);

			await rm(configDirectory, { recursive: true, force: true });
			const offlineStatus = await runCli(["status"], {
				configDirectory,
				projectDirectory,
			});
			expect(offlineStatus.code, offlineStatus.stderr).toBe(0);
			expect(offlineStatus.stdout).toContain("Resource integrity:");
			expect(await readFile(designContractPath, "utf8")).toBe(
				installedDesignContract,
			);
		} finally {
			await rm(temporaryRoot, { recursive: true, force: true });
		}
	});
}

test("a subscribed Builder adds the Premium Command Design Contract without creating a Project identifier", async ({
	page,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-command-design-contract-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");
	const designContractPath = path.join(projectDirectory, "DESIGN.md");
	const addCommand = (options: string[] = ["--yes"]) =>
		runCli(["add", "command@1.0.0", ...options], {
			configDirectory,
			projectDirectory,
			contractCatalogUrl,
		});
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

		for (const anonymousPath of ["/contracts/command", commandContractPath]) {
			const anonymous = await page.request.get(anonymousPath);
			expect(anonymous.status()).toBe(401);
			expect(await anonymous.text()).not.toContain("Command Interface System");
		}
		const withoutCredential = await addCommand();
		expect(withoutCredential.code).toBe(2);
		expect(withoutCredential.stderr).toContain("agentkogei login");
		expect(await readdir(projectDirectory)).not.toContain("DESIGN.md");

		await signIn(page);
		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "command-contract-active", state: "active" },
				})
			).ok(),
		).toBe(true);
		await authorizeCli(page, configDirectory, "Command contract terminal");

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "command-contract-expired", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const inactive = await addCommand();
		expect(inactive.code).toBe(1);
		expect(inactive.stderr).toContain("Premium Access");
		expect(inactive.stdout).not.toContain("Command Interface System");
		expect(await readdir(projectDirectory)).not.toContain("DESIGN.md");
		expect(
			await (
				await page.request.get("/api/test/premium-delivery/entitlement-events")
			).json(),
		).toEqual([]);

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "command-contract-renewed", state: "active" },
				})
			).ok(),
		).toBe(true);
		const added = await addCommand();
		expect(added.code, added.stderr).toBe(0);
		expect(added.stdout).toContain("Command 1.0.0 (command)");
		expect(added.stdout).toContain("AgentKogei Commercial Pack License");
		const designContract = await readFile(designContractPath, "utf8");
		expect(designContract.startsWith("# Command Interface System\n")).toBe(
			true,
		);
		expect(designContract).toContain("## Provenance");
		expect(designContract).not.toContain("sha256");
		expect(
			await readFile(path.join(projectDirectory, "AGENTS.md"), "utf8"),
		).toContain("<!-- agentkogei:design-pack:start -->");
		expect(await readdir(projectDirectory)).not.toContain(".agentkogei");

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
			pathname: commandContractPath,
			search: "",
			hasBody: false,
		});
		expect(observation.headers["x-agentkogei-project-license"]).toBeUndefined();
		const events = (await (
			await page.request.get("/api/test/premium-delivery/entitlement-events")
		).json()) as Array<Record<string, string>>;
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			packId: "command",
			packRelease: "1.0.0",
			action: "add",
		});
		expect(events[0]?.builderId).toBeTruthy();
		expect(Date.parse(events[0]?.occurredAt ?? "")).toBeGreaterThan(0);
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

		expect(
			(
				await page.request.post("/api/test/polar/events", {
					data: { eventId: "command-contract-lapsed", state: "expired" },
				})
			).ok(),
		).toBe(true);
		const afterExpiry = await addCommand(["--yes", "--force"]);
		expect(afterExpiry.code).toBe(1);
		expect(afterExpiry.stderr).toContain("Premium Access");
		await rm(configDirectory, { recursive: true, force: true });
		expect(await readFile(designContractPath, "utf8")).toBe(designContract);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});
