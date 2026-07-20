import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	type APIRequestContext,
	request as createRequestContext,
	expect,
	type Page,
	test,
} from "@playwright/test";

const webOrigin = "http://localhost:3011";
const cliPath = path.resolve(
	process.cwd(),
	"../../packages/design-packs/src/install-cli.ts",
);

type RunningCli = {
	stdout: () => string;
	waitForOutput: (pattern: RegExp) => Promise<RegExpMatchArray>;
	waitForExit: () => Promise<{ code: number | null; stderr: string }>;
};

type DeviceRequest = {
	device_code: string;
	user_code: string;
	verification_uri_complete: string;
};

const tokenRequest = (deviceCode: string) => ({
	grant_type: "urn:ietf:params:oauth:grant-type:device_code",
	device_code: deviceCode,
	client_id: "agentkogei-cli",
});

async function authorizeInBrowser(page: Page, verificationUrl: string) {
	await page.goto(verificationUrl);
	if (new URL(page.url()).pathname === "/login") {
		await page.getByRole("button", { name: "Continue with GitHub" }).click();
	}
	await expect(
		page.getByRole("heading", { name: "Authorize this terminal" }),
	).toBeVisible();
}

async function pendingCliAuthorization(
	request: APIRequestContext,
	credentialName: string,
) {
	const response = await request.get("/api/test/device/pending", {
		params: { credential_name: credentialName },
	});
	expect(response.status()).toBe(200);
	return (await response.json()) as {
		userCode: string;
		verificationUriComplete: string;
	};
}

function startCli(
	arguments_: string[],
	configDirectory: string,
	workingDirectory?: string,
): RunningCli {
	const child = spawn("bun", [cliPath, ...arguments_], {
		cwd: workingDirectory,
		env: {
			...process.env,
			AGENTKOGEI_CONFIG_DIR: configDirectory,
			AGENTKOGEI_CREDENTIAL_NAME: "Test terminal",
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
	const exit = new Promise<{ code: number | null; stderr: string }>(
		(resolve) => {
			child.on("exit", (code) => resolve({ code, stderr }));
		},
	);

	return {
		stdout: () => stdout,
		waitForOutput: (pattern) =>
			new Promise((resolve, reject) => {
				const startedAt = Date.now();
				const interval = setInterval(() => {
					const match = stdout.match(pattern);
					if (match) {
						clearInterval(interval);
						resolve(match);
						return;
					}
					if (Date.now() - startedAt > 10_000) {
						clearInterval(interval);
						child.kill();
						reject(new Error(`CLI output timed out:\n${stdout}\n${stderr}`));
					}
				}, 20);
			}),
		waitForExit: () => exit,
	};
}

test("a Builder approves a terminal Pack Credential with retrieval-only authority", async ({
	page,
	request,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-credential-journey-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	const projectDirectory = path.join(temporaryRoot, "project");

	try {
		await mkdir(projectDirectory);
		const cli = startCli(
			["login", "--server", webOrigin],
			configDirectory,
			projectDirectory,
		);
		await cli.waitForOutput(/http:\/\/localhost:3011\/device\b/);
		const verification = await pendingCliAuthorization(
			request,
			"Test terminal",
		);

		expect(cli.stdout()).toContain("authorization code is redacted");
		expect(cli.stdout()).not.toContain(verification.userCode);
		expect(cli.stdout()).not.toContain("user_code=");
		await authorizeInBrowser(page, verification.verificationUriComplete);
		await expect(
			page.getByText("Premium Design Pack retrieval only"),
		).toBeVisible();
		await expect(page.getByText(verification.userCode)).toBeVisible();
		await page.getByRole("button", { name: "Approve terminal" }).click();
		await expect(page.getByText("Terminal authorized")).toBeVisible();

		const result = await cli.waitForExit();
		expect(result.code, result.stderr).toBe(0);
		expect(cli.stdout()).toContain(
			"Pack Credential saved outside your Project",
		);

		const credentials = JSON.parse(
			await readFile(path.join(configDirectory, "credentials.json"), "utf8"),
		) as { server: string; credential: string };
		expect(credentials.server).toBe(webOrigin);
		expect(credentials.credential).toMatch(/^ak_pack_/);

		const authorized = await request.get("/api/pack-credentials/verify", {
			headers: { authorization: `Bearer ${credentials.credential}` },
		});
		expect(authorized.status()).toBe(200);
		expect(await authorized.json()).toEqual({
			authorized: true,
			scope: "premium:retrieve",
		});

		await page.goto("/dashboard");
		await expect(page.getByText("Test terminal")).toBeVisible();
		const credentialRow = page.getByRole("article", {
			name: "Pack Credential Test terminal",
		});
		await expect(
			credentialRow.getByText(/Authorized [A-Z][a-z]{2} /),
		).toBeVisible();
		await expect(credentialRow.getByText(/Last used /)).toBeVisible();
		await expect(page.getByText(credentials.credential)).toHaveCount(0);
		await expect(
			readFile(path.join(projectDirectory, "credentials.json")),
		).rejects.toThrow();

		const credentialOnly = await createRequestContext.newContext({
			baseURL: webOrigin,
			extraHTTPHeaders: {
				authorization: `Bearer ${credentials.credential}`,
			},
		});
		try {
			expect((await credentialOnly.post("/api/billing/portal")).status()).toBe(
				401,
			);
		} finally {
			await credentialOnly.dispose();
		}

		const logout = startCli(["logout"], configDirectory);
		expect((await logout.waitForExit()).code).toBe(0);
		expect(logout.stdout()).toContain(
			"Other Pack Credentials remain authorized",
		);
		await expect(
			readFile(path.join(configDirectory, "credentials.json")),
		).rejects.toThrow();
		expect(
			(
				await request.get("/api/pack-credentials/verify", {
					headers: { authorization: `Bearer ${credentials.credential}` },
				})
			).status(),
		).toBe(200);

		await credentialRow.getByRole("button", { name: "Revoke" }).click();
		await expect(credentialRow.getByText("Revoked")).toBeVisible();
		expect(
			(
				await request.get("/api/pack-credentials/verify", {
					headers: { authorization: `Bearer ${credentials.credential}` },
				})
			).status(),
		).toBe(401);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("device polling distinguishes pending, malformed, and replayed requests", async ({
	page,
	request,
}) => {
	const issued = await request.post("/api/device/code", {
		data: {
			client_id: "agentkogei-cli",
			scope: "premium:retrieve",
			credential_name: "Protocol terminal",
		},
	});
	expect(issued.status()).toBe(200);
	const device = (await issued.json()) as DeviceRequest;

	const pending = await request.post("/api/device/token", {
		data: tokenRequest(device.device_code),
	});
	expect(pending.status()).toBe(400);
	expect(await pending.json()).toEqual({ error: "authorization_pending" });

	const malformed = await request.post("/api/device/token", {
		data: tokenRequest("not-a-device-code"),
	});
	expect(malformed.status()).toBe(400);
	expect(await malformed.json()).toEqual({ error: "invalid_grant" });

	await authorizeInBrowser(page, device.verification_uri_complete);
	await page.getByRole("button", { name: "Approve terminal" }).click();
	const approved = await request.post("/api/device/token", {
		data: tokenRequest(device.device_code),
	});
	expect(approved.status()).toBe(200);
	expect((await approved.json()).access_token).toMatch(/^ak_pack_/);

	const replayed = await request.post("/api/device/token", {
		data: tokenRequest(device.device_code),
	});
	expect(replayed.status()).toBe(400);
	expect(await replayed.json()).toEqual({ error: "invalid_grant" });
});

test("a denied browser request never creates a local Pack Credential", async ({
	page,
	request,
}) => {
	const temporaryRoot = await mkdtemp(
		path.join(tmpdir(), "agentkogei-denied-credential-"),
	);
	const configDirectory = path.join(temporaryRoot, "configuration");
	try {
		const cli = startCli(["login", "--server", webOrigin], configDirectory);
		await cli.waitForOutput(/http:\/\/localhost:3011\/device\b/);
		const verification = await pendingCliAuthorization(
			request,
			"Test terminal",
		);
		expect(cli.stdout()).not.toContain(verification.userCode);
		await authorizeInBrowser(page, verification.verificationUriComplete);
		await page.getByRole("button", { name: "Deny" }).click();
		await expect(page.getByText("Authorization denied")).toBeVisible();
		const result = await cli.waitForExit();
		expect(result.code).toBe(1);
		expect(result.stderr).toContain("authorization was denied");
		await expect(
			readFile(path.join(configDirectory, "credentials.json")),
		).rejects.toThrow();
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
});

test("an expired device request cannot issue a Pack Credential", async ({
	request,
}) => {
	const issued = await request.post("/api/device/code", {
		data: {
			client_id: "agentkogei-cli",
			scope: "premium:retrieve",
			credential_name: "Expired terminal",
		},
	});
	const device = (await issued.json()) as DeviceRequest;

	expect(
		(
			await request.post("/api/test/device/expire", {
				data: { device_code: device.device_code },
			})
		).status(),
	).toBe(204);
	const expired = await request.post("/api/device/token", {
		data: tokenRequest(device.device_code),
	});
	expect(expired.status()).toBe(400);
	expect(await expired.json()).toEqual({ error: "expired_token" });
});
