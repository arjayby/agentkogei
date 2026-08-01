import { afterAll, afterEach, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const cliCommand = new URL("../src/install-cli.ts", import.meta.url).pathname;
const temporaryDirectories: string[] = [];

/** One Design Contract, exactly as the Official Catalog delivers it. */
const designContract = `# Foundation Interface System

Neutral, crisp, highly legible direction for the whole product.
`;

type CapturedRequest = {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: string;
};

/** Records every byte sent across the CLI network boundary. */
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

const catalog = captureServer(
	() =>
		new Response(designContract, {
			headers: {
				"content-type": "text/markdown; charset=utf-8",
				"x-agentkogei-design-system": "Foundation",
				"x-agentkogei-design-system-release": "1.1.0",
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

/** Sensitive Project data that must never cross the Installation boundary. */
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
	test("Installation sends only one anonymous Design Contract request", async () => {
		const projectDirectory = await privateProject();
		const configDirectory = path.join(projectDirectory, ".agentkogei-config");
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
			expect(catalog.requests[0]?.headers.authorization).toBeUndefined();
			expect(diagnostics.requests).toEqual([]);
			expect(existsSync(configDirectory)).toBe(false);

			const outbound = JSON.stringify(catalog.requests);
			expect(outbound).not.toContain(path.basename(projectDirectory));
			for (const canary of projectCanaries) {
				expect(outbound).not.toContain(canary);
			}
		} finally {
			diagnostics.server.stop(true);
		}
	});

	test("account, credential, browser authorization, and diagnostics commands are absent", async () => {
		const projectDirectory = await temporaryDirectory("agentkogei-project-");
		const configDirectory = path.join(projectDirectory, ".agentkogei-config");
		const retiredCommands = [
			["login", "--server", catalog.server.url.origin],
			["logout"],
			["diagnostics", "status"],
		] as const;

		for (const arguments_ of retiredCommands) {
			const result = await runCli([...arguments_], {
				projectDirectory,
				configDirectory,
			});
			expect(result.exitCode, arguments_[0]).toBe(2);
			expect(result.stdout).toBe("");
			expect(result.stderr).toContain(
				"Usage:\n  agentkogei add <design-system[@version]> [--yes] [--force]",
			);
			expect(result.stderr).not.toMatch(
				/login|logout|credential|authorization|diagnostic/i,
			);
			expect(catalog.requests, arguments_[0]).toEqual([]);
			expect(existsSync(configDirectory), arguments_[0]).toBe(false);
		}
	});
});
