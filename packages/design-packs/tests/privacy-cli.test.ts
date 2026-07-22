import { afterAll, afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const cliCommand = new URL("../src/install-cli.ts", import.meta.url).pathname;
const temporaryDirectories: string[] = [];

/** One Design Contract, exactly as the Official Catalog delivers it. */
const designContract = `# Foundation Interface System

Neutral, crisp, highly legible direction for the whole product.

---

## Provenance

- Design Pack: Foundation (\`foundation\`)
- Pack License: Creative Commons Attribution 4.0 International (CC-BY-4.0)
`;

type CapturedRequest = {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: string;
};

/**
 * A server that records every byte it is sent. Privacy is only observable from
 * the outside, so these journeys inspect what left the CLI rather than what it
 * intended to send.
 */
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

const catalogFailure = { current: false };
const catalog = captureServer(() =>
	catalogFailure.current
		? new Response("unavailable", { status: 503 })
		: new Response(designContract, {
				headers: {
					"content-type": "text/markdown; charset=utf-8",
					"x-agentkogei-design-pack": "Foundation",
					"x-agentkogei-pack-release": "1.1.0",
					"x-agentkogei-pack-license":
						"Creative Commons Attribution 4.0 International (CC-BY-4.0)",
				},
			}),
);

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
			AGENTKOGEI_CONTRACT_CATALOG_URL: new URL("contracts/", catalog.server.url)
				.href,
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

/**
 * A Project full of exactly the things a Builder never wants disclosed: its
 * name, its contents, its prompts, its generated interface, its dependencies,
 * and its Git remote.
 */
const projectCanaries = [
	"private-file-contents-canary",
	"private-prompt-canary",
	"private-generated-ui-canary",
	"private-dependency-canary",
	"private-git-remote-canary",
] as const;

async function privateProject() {
	const projectDirectory = await temporaryDirectory(
		"private-project-name-canary-",
	);
	await Promise.all([
		writeFile(path.join(projectDirectory, "PRIVATE.txt"), projectCanaries[0]),
		writeFile(path.join(projectDirectory, "PROMPT.md"), projectCanaries[1]),
		writeFile(path.join(projectDirectory, "GENERATED.tsx"), projectCanaries[2]),
		writeFile(
			path.join(projectDirectory, "package.json"),
			JSON.stringify({ dependencies: { [projectCanaries[3]]: "1.0.0" } }),
		),
		mkdir(path.join(projectDirectory, ".git")),
	]);
	await writeFile(
		path.join(projectDirectory, ".git/config"),
		`[remote "origin"]\nurl = https://example.test/${projectCanaries[4]}\n`,
	);
	return projectDirectory;
}

afterEach(async () => {
	catalogFailure.current = false;
	catalog.requests.length = 0;
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

afterAll(() => {
	catalog.server.stop(true);
});

describe("CLI privacy boundary", () => {
	test("adding a Design Contract contacts only the Official Catalog and sends nothing about the Project", async () => {
		const projectDirectory = await privateProject();
		const configDirectory = await temporaryDirectory("agentkogei-config-");
		const diagnostics = captureServer(
			() => new Response(null, { status: 204 }),
		);

		try {
			const added = await runCli(["add", "foundation", "--yes"], {
				projectDirectory,
				configDirectory,
				environment: {
					AGENTKOGEI_DIAGNOSTICS_URL: diagnostics.server.url.href,
				},
			});

			expect(added.exitCode, added.stderr).toBe(0);
			expect(catalog.requests).toHaveLength(1);
			expect(catalog.requests[0]?.method).toBe("GET");
			expect(catalog.requests[0]?.body).toBe("");
			expect(diagnostics.requests).toEqual([]);

			const outbound = JSON.stringify(catalog.requests);
			expect(outbound).not.toContain(path.basename(projectDirectory));
			for (const canary of projectCanaries) {
				expect(outbound).not.toContain(canary);
			}
		} finally {
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

	test("sends only the disclosed diagnostics fields and explicit opt-out stops delivery", async () => {
		const projectDirectory = await privateProject();
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
		const reported = () =>
			diagnostics.requests.map((request) => {
				const payload = JSON.parse(request.body) as Record<string, string>;
				return [payload.command, payload.outcome];
			});

		try {
			expect(
				(await runCli(["diagnostics", "enable", "--yes"], options)).exitCode,
			).toBe(0);

			const added = await runCli(["add", "foundation", "--yes"], options);
			expect(added.exitCode, added.stderr).toBe(0);
			expect(diagnostics.requests).toHaveLength(1);
			expect(JSON.parse(diagnostics.requests[0]?.body ?? "")).toEqual({
				schema_version: "1.0",
				command: "add",
				outcome: "success",
				platform: process.platform,
				runtime: "node",
			});

			catalogFailure.current = true;
			const refused = await runCli(["add", "foundation", "--yes"], options);
			expect(refused.exitCode).toBe(1);
			const loggedOut = await runCli(["logout"], options);
			expect(loggedOut.exitCode, loggedOut.stderr).toBe(0);
			expect(reported()).toEqual([
				["add", "success"],
				["add", "error"],
				["logout", "success"],
			]);

			// An unknown command is never itself reported, because the word a
			// Builder typed could be anything about their Project.
			const unknown = await runCli(
				["private-project-name-must-not-be-diagnostic-data"],
				options,
			);
			expect(unknown.exitCode).toBe(2);
			expect(diagnostics.requests).toHaveLength(3);

			const disabled = await runCli(["diagnostics", "disable"], options);
			expect(disabled.exitCode).toBe(0);
			expect(disabled.stdout).toContain("Diagnostics disabled");
			catalogFailure.current = false;
			const afterOptOut = await runCli(
				["add", "foundation", "--yes", "--force"],
				options,
			);
			expect(afterOptOut.exitCode, afterOptOut.stderr).toBe(0);
			expect(diagnostics.requests).toHaveLength(3);

			const outbound = JSON.stringify(diagnostics.requests);
			expect(outbound).not.toContain(path.basename(projectDirectory));
			for (const canary of projectCanaries) {
				expect(outbound).not.toContain(canary);
			}
		} finally {
			diagnostics.server.stop(true);
		}
	});
});
