import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const webOrigin = "http://localhost:3011";
const cliPath = path.resolve(
	process.cwd(),
	"../../packages/design-packs/src/install-cli.ts",
);
const fixtureSource = `${webOrigin}/api/premium-source/delivery-fixture/1.0.0`;
const commandSource = `${webOrigin}/api/premium-source/command/1.0.0`;

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

	const verificationUrl = await new Promise<string>((resolve, reject) => {
		const startedAt = Date.now();
		const interval = setInterval(() => {
			const match = stdout.match(
				/http:\/\/localhost:3011\/device\?user_code=[A-Z0-9-]+/,
			);
			if (match) {
				clearInterval(interval);
				resolve(match[0]);
			} else if (Date.now() - startedAt > 10_000) {
				clearInterval(interval);
				child.kill();
				reject(new Error(`CLI authorization timed out:\n${stdout}\n${stderr}`));
			}
		}, 20);
	});
	await page.goto(verificationUrl);
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
