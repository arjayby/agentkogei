import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const cliCommand = new URL("../src/install-cli.ts", import.meta.url).pathname;
const openRegistryItem = new URL(
	"../../../apps/web/public/r/foundation/1.0.0.json",
	import.meta.url,
).pathname;
const updatedOpenRegistryItem = new URL(
	"../../../apps/web/public/r/foundation/1.1.0.json",
	import.meta.url,
).pathname;
const temporaryDirectories: string[] = [];

type CapturedRequest = {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: string;
};

async function temporaryDirectory(label: string) {
	const directory = await mkdtemp(path.join(tmpdir(), label));
	temporaryDirectories.push(directory);
	return directory;
}

async function runCli(
	arguments_: string[],
	options: {
		projectDirectory: string;
		configDirectory: string;
		environment?: Record<string, string>;
	},
) {
	const process_ = Bun.spawn([process.execPath, cliCommand, ...arguments_], {
		cwd: options.projectDirectory,
		env: {
			...process.env,
			AGENTKOGEI_CONFIG_DIR: options.configDirectory,
			AGENTKOGEI_NO_BROWSER: "1",
			...options.environment,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { stdout, stderr, exitCode };
}

function captureServer(
	respond: (request: Request) => Response | Promise<Response>,
) {
	const requests: CapturedRequest[] = [];
	const server = Bun.serve({
		port: 0,
		async fetch(request) {
			requests.push({
				method: request.method,
				url: request.url,
				headers: Object.fromEntries(request.headers),
				body: await request.text(),
			});
			return respond(request);
		},
	});
	return { requests, server };
}

async function premiumRegistryPayload(
	registryPath: string,
	premiumResourceCanary: string,
) {
	const item = JSON.parse(await readFile(registryPath, "utf8")) as {
		files: Array<{ path: string; content: string }>;
	};
	const manifestFile = item.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	const designFile = item.files.find((file) => file.path === "DESIGN.md");
	if (!manifestFile || !designFile) throw new Error("invalid registry fixture");
	const manifest = JSON.parse(manifestFile.content) as {
		access: string;
		files: Array<{ path: string; sha256: string }>;
	};
	manifest.access = "premium";
	designFile.content = `${designFile.content}\n${premiumResourceCanary}\n`;
	const designDeclaration = manifest.files.find(
		(file) => file.path === "DESIGN.md",
	);
	if (!designDeclaration) throw new Error("invalid manifest fixture");
	designDeclaration.sha256 = createHash("sha256")
		.update(designFile.content)
		.digest("hex");
	manifestFile.content = JSON.stringify(manifest);
	return item;
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("CLI privacy boundary", () => {
	test("Installation of an Open Design Pack contacts only its selected Pack Source and diagnostics are off by default", async () => {
		const projectDirectory = await temporaryDirectory(
			"private-project-name-canary-",
		);
		const configDirectory = await temporaryDirectory("agentkogei-config-");
		const projectCanaries = [
			"private-file-contents-canary",
			"private-prompt-canary",
			"private-generated-ui-canary",
			"private-dependency-canary",
			"private-git-remote-canary",
		];
		await Promise.all([
			writeFile(path.join(projectDirectory, "PRIVATE.txt"), projectCanaries[0]),
			writeFile(path.join(projectDirectory, "PROMPT.md"), projectCanaries[1]),
			writeFile(
				path.join(projectDirectory, "GENERATED.tsx"),
				projectCanaries[2],
			),
			writeFile(
				path.join(projectDirectory, "package.json"),
				JSON.stringify({
					dependencies: { [projectCanaries[3] as string]: "1.0.0" },
				}),
			),
			mkdir(path.join(projectDirectory, ".git")),
		]);
		await writeFile(
			path.join(projectDirectory, ".git/config"),
			`[remote "origin"]\nurl = https://example.test/${projectCanaries[4]}\n`,
		);
		const [payload100, payload110] = await Promise.all([
			readFile(openRegistryItem, "utf8"),
			readFile(updatedOpenRegistryItem, "utf8"),
		]);
		let catalogAdvanced = false;
		let failRetrieval = false;
		const source = captureServer((request) => {
			if (failRetrieval) return new Response("unavailable", { status: 503 });
			return Response.json(
				JSON.parse(
					catalogAdvanced || request.url.endsWith("1.1.0.json")
						? payload110
						: payload100,
				) as unknown,
			);
		});
		const diagnostics = captureServer(
			() => new Response(null, { status: 204 }),
		);

		try {
			const result = await runCli(
				[
					"install",
					"foundation@1.0.0",
					"--source",
					new URL("foundation.json", source.server.url).href,
					"--yes",
				],
				{
					projectDirectory,
					configDirectory,
					environment: {
						AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
					},
				},
			);

			expect(result.exitCode, result.stderr).toBe(0);
			expect(source.requests).toHaveLength(1);
			expect(diagnostics.requests).toEqual([]);

			catalogAdvanced = true;
			const updated = await runCli(["update", "--yes"], {
				projectDirectory,
				configDirectory,
				environment: {
					AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
				},
			});
			expect(updated.exitCode, updated.stderr).toBe(0);
			failRetrieval = true;
			const failed = await runCli(["update", "--yes"], {
				projectDirectory,
				configDirectory,
				environment: {
					AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
				},
			});
			expect(failed.exitCode).toBe(1);
			expect(diagnostics.requests).toEqual([]);

			const outbound = JSON.stringify(source.requests);
			expect(outbound).not.toContain(path.basename(projectDirectory));
			for (const canary of projectCanaries) {
				expect(outbound).not.toContain(canary);
			}
		} finally {
			source.server.stop(true);
			diagnostics.server.stop(true);
		}
	});

	test("discloses the exact diagnostics destination and fields before separate opt-in", async () => {
		const projectDirectory = await temporaryDirectory("agentkogei-project-");
		const configDirectory = await temporaryDirectory("agentkogei-config-");
		const diagnostics = captureServer(
			() => new Response(null, { status: 204 }),
		);
		const options = {
			projectDirectory,
			configDirectory,
			environment: {
				AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
			},
		};

		try {
			const preview = await runCli(["diagnostics", "enable"], options);
			expect(preview.exitCode).toBe(2);
			expect(preview.stdout).toContain(
				`Destination: ${diagnostics.server.url.href}`,
			);
			for (const field of [
				"schema_version",
				"command",
				"outcome",
				"platform",
				"runtime",
			]) {
				expect(preview.stdout).toContain(field);
			}
			expect(preview.stdout).toContain("No Project names, paths, Git remotes");
			expect(preview.stderr).toContain("--yes");
			expect(diagnostics.requests).toEqual([]);

			const disabled = await runCli(["diagnostics", "status"], options);
			expect(disabled.stdout).toContain("Diagnostics: disabled");

			const enabled = await runCli(["diagnostics", "enable", "--yes"], options);
			expect(enabled.exitCode).toBe(0);
			expect(enabled.stdout).toContain("Diagnostics enabled");
			const status = await runCli(["diagnostics", "status"], options);
			expect(status.stdout).toContain("Diagnostics: enabled");
			expect(diagnostics.requests).toEqual([]);
		} finally {
			diagnostics.server.stop(true);
		}
	});

	test("sends only disclosed diagnostics fields and explicit opt-out stops delivery", async () => {
		const projectDirectory = await temporaryDirectory("agentkogei-project-");
		const configDirectory = await temporaryDirectory("agentkogei-config-");
		const diagnostics = captureServer(
			() => new Response("unavailable", { status: 503 }),
		);
		const options = {
			projectDirectory,
			configDirectory,
			environment: {
				AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
				AGENTKOGEI_OFFICIAL_CATALOG_URL: new URL(
					"../../../apps/web/public/r/",
					import.meta.url,
				).href,
			},
		};

		try {
			expect(
				(await runCli(["diagnostics", "enable", "--yes"], options)).exitCode,
			).toBe(0);
			const installed = await runCli(
				["install", "foundation@1.0.0", "--yes"],
				options,
			);
			expect(installed.exitCode, installed.stderr).toBe(0);
			expect(diagnostics.requests).toHaveLength(1);
			expect(JSON.parse(diagnostics.requests[0]?.body ?? "")).toEqual({
				schema_version: "1.0",
				command: "install",
				outcome: "success",
				platform: process.platform,
				runtime: "node",
			});
			const refused = await runCli(
				["install", "foundation@1.0.0", "--yes"],
				options,
			);
			expect(refused.exitCode).toBe(1);
			expect(JSON.parse(diagnostics.requests[1]?.body ?? "")).toEqual({
				schema_version: "1.0",
				command: "install",
				outcome: "error",
				platform: process.platform,
				runtime: "node",
			});
			const invalid = await runCli(
				["private-project-name-must-not-be-diagnostic-data"],
				options,
			);
			expect(invalid.exitCode).toBe(2);
			expect(diagnostics.requests).toHaveLength(2);

			const detached = await runCli(["detach", "--yes"], options);
			expect(detached.exitCode, detached.stderr).toBe(0);
			const loggedOut = await runCli(["logout"], options);
			expect(loggedOut.exitCode, loggedOut.stderr).toBe(0);
			expect(
				diagnostics.requests.slice(2).map((request) => {
					const payload = JSON.parse(request.body) as {
						command: string;
						outcome: string;
					};
					return [payload.command, payload.outcome];
				}),
			).toEqual([
				["detach", "success"],
				["logout", "success"],
			]);

			const disabled = await runCli(["diagnostics", "disable"], options);
			expect(disabled.exitCode).toBe(0);
			expect(disabled.stdout).toContain("Diagnostics disabled");
			const status = await runCli(["status"], options);
			expect(status.exitCode, status.stderr).toBe(0);
			expect(diagnostics.requests).toHaveLength(4);
		} finally {
			diagnostics.server.stop(true);
		}
	});

	test("Premium Design Pack Installation, update, and errors send only allowed authorization fields", async () => {
		const projectDirectory = await temporaryDirectory(
			"premium-private-project-canary-",
		);
		const configDirectory = await temporaryDirectory("agentkogei-config-");
		const credential = "ak_credential-secret-canary";
		const projectContent = "premium-project-content-canary";
		const premiumResource = "premium-design-resource-canary";
		await writeFile(path.join(projectDirectory, "PRIVATE.txt"), projectContent);
		const [version100, version110] = await Promise.all([
			premiumRegistryPayload(openRegistryItem, premiumResource),
			premiumRegistryPayload(updatedOpenRegistryItem, premiumResource),
		]);
		let failRetrieval = false;
		const source = captureServer((request) => {
			if (request.method === "POST") return new Response(null, { status: 204 });
			const projectLicense = request.headers.get(
				"x-agentkogei-project-license",
			);
			let payload = request.url.endsWith("1.0.0.json")
				? version100
				: version110;
			if (failRetrieval) {
				payload = structuredClone(version110);
				const gatedResource = payload.files.find(
					(file) => file.path === "DESIGN.md",
				);
				if (gatedResource) gatedResource.path = `../${premiumResource}`;
			}
			return Response.json(payload, {
				headers: {
					"x-agentkogei-project-license": projectLicense ?? "",
				},
			});
		});
		const diagnostics = captureServer(
			() => new Response(null, { status: 204 }),
		);
		await writeFile(
			path.join(configDirectory, "credentials.json"),
			JSON.stringify({ server: source.server.url.href, credential }),
		);
		const options = {
			projectDirectory,
			configDirectory,
			environment: {
				AGENTKOGEI_OFFICIAL_CATALOG_URL: source.server.url.href,
				AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
			},
		};

		try {
			expect(
				(await runCli(["diagnostics", "enable", "--yes"], options)).exitCode,
			).toBe(0);
			const installed = await runCli(
				["install", "foundation@1.0.0", "--yes"],
				options,
			);
			expect(installed.exitCode, installed.stderr).toBe(0);
			const installRequests = source.requests.splice(0);
			expect(installRequests.map((request) => request.method)).toEqual([
				"GET",
				"POST",
			]);
			const projectLicense =
				installRequests[0]?.headers["x-agentkogei-project-license"];
			expect(projectLicense).toMatch(/^[0-9a-f-]{36}$/);
			for (const request of installRequests) {
				expect(
					Object.keys(request.headers)
						.filter(
							(key) =>
								key === "authorization" || key.startsWith("x-agentkogei-"),
						)
						.sort(),
				).toEqual([
					"authorization",
					"x-agentkogei-action",
					"x-agentkogei-project-license",
				]);
				expect(request.headers.authorization).toBe(`Bearer ${credential}`);
				expect(request.headers["x-agentkogei-action"]).toBe("install");
				expect(request.headers["x-agentkogei-project-license"]).toBe(
					projectLicense,
				);
				expect(request.body).toBe("");
			}

			const updated = await runCli(["update", "--yes"], options);
			expect(updated.exitCode, updated.stderr).toBe(0);
			expect(source.requests.length).toBeGreaterThanOrEqual(2);
			for (const request of source.requests.splice(0)) {
				expect(request.method).toBe("GET");
				expect(request.headers.authorization).toBe(`Bearer ${credential}`);
				expect(request.headers["x-agentkogei-action"]).toBe("update");
				expect(request.headers["x-agentkogei-project-license"]).toBe(
					projectLicense,
				);
				expect(request.body).toBe("");
			}

			failRetrieval = true;
			const failed = await runCli(["update", "--yes"], options);
			expect(failed.exitCode).toBe(1);
			expect(failed.stderr).toContain(
				"Pack Release for the Premium Design Pack is invalid or unavailable",
			);
			for (const secret of [credential, projectContent, premiumResource]) {
				expect(`${failed.stdout}${failed.stderr}`).not.toContain(secret);
			}
			const failedOutbound = JSON.stringify(source.requests);
			expect(failedOutbound).not.toContain(projectContent);
			expect(failedOutbound).not.toContain(premiumResource);
			expect(failedOutbound).not.toContain(path.basename(projectDirectory));
			expect(diagnostics.requests).toHaveLength(3);
			expect(JSON.parse(diagnostics.requests[2]?.body ?? "")).toEqual({
				schema_version: "1.0",
				command: "update",
				outcome: "error",
				platform: process.platform,
				runtime: "node",
			});
		} finally {
			source.server.stop(true);
			diagnostics.server.stop(true);
		}
	});
});
