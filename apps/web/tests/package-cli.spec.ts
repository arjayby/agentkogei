import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import {
	copyFile,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

import {
	discoverCatalogRoutes,
	readPublishedDesignSystem,
} from "./support/catalog";
import { runProcess } from "./support/cli";
import { cliTarball, packageRunners } from "./support/package-runners";

/**
 * Package runners download, unpack, and launch an executable before the CLI
 * ever runs, so these journeys are slower than the ones that spawn it directly.
 */
test.setTimeout(180_000);

const contractCatalogUrl = "http://localhost:3011/contracts/";
const apertureContractPath = path.resolve(
	process.cwd(),
	"../../packages/design-systems/tests/fixtures/releases/aperture/1.0.0/DESIGN.md",
);

type CapturedRequest = {
	method: string | undefined;
	url: string | undefined;
	headers: Record<string, string | string[] | undefined>;
	body: string;
};

async function requestInspectionCatalog() {
	const requests: CapturedRequest[] = [];
	const server = createServer((request, response) => {
		const chunks: Buffer[] = [];
		request.on("data", (chunk: Buffer) => chunks.push(chunk));
		request.on("end", () => {
			requests.push({
				method: request.method,
				url: request.url,
				headers: request.headers,
				body: Buffer.concat(chunks).toString("utf8"),
			});
			response.writeHead(200, {
				"content-type": "text/markdown; charset=utf-8",
				"x-agentkogei-design-system": "Foundation",
				"x-agentkogei-design-system-release": "1.1.0",
			});
			response.end("# Foundation Design System\n\nPublic direction.\n");
		});
	});
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Request inspection catalog did not bind a TCP port");
	}
	return {
		requests,
		url: `http://127.0.0.1:${address.port}/contracts/`,
		port: address.port,
		close: () => new Promise<void>((resolve) => server.close(() => resolve())),
	};
}

/**
 * Every runner keeps its own download cache keyed by the package it was asked
 * for. Giving each run a fresh tarball name guarantees the matrix exercises the
 * artifact this build produced rather than one a previous run left behind.
 */
let runTarball: string;
let runDirectory: string;

test.beforeAll(async () => {
	runDirectory = await mkdtemp(path.join(tmpdir(), "agentkogei-packaged-"));
	runTarball = path.join(runDirectory, `agentkogei-${randomUUID()}.tgz`);
	await copyFile(cliTarball, runTarball);
});

test.afterAll(async () => {
	await rm(runDirectory, { recursive: true, force: true });
});

for (const runner of packageRunners) {
	test(`a Builder completes an Installation through ${runner.name}`, async ({
		request,
	}) => {
		const project = await mkdtemp(path.join(tmpdir(), "agentkogei-runner-"));
		try {
			const { command, arguments: runnerArguments } =
				runner.command(runTarball);

			const added = await runProcess(
				command,
				[...runnerArguments, "add", "aperture", "--yes"],
				{
					cwd: project,
					environment: {
						AGENTKOGEI_CONTRACT_CATALOG_URL: contractCatalogUrl,
						AGENTKOGEI_CONFIG_DIR: path.join(project, ".agentkogei-config"),
					},
				},
			);

			expect(added.exitCode, added.stderr).toBe(0);
			expect(added.stdout).toContain(
				"Installed Aperture Design System Release 1.0.0",
			);
			const delivered = await request.get("/contracts/aperture");
			const installed = await readFile(path.join(project, "DESIGN.md"), "utf8");
			expect(installed).toBe(await delivered.text());
			expect(installed).toBe(await readFile(apertureContractPath, "utf8"));
			expect(await readFile(path.join(project, "AGENTS.md"), "utf8")).toContain(
				"`DESIGN.md`",
			);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	});
}

test("the packed CLI installs every discovered current and exact Design System Release anonymously", async ({
	page,
	request,
}) => {
	const runner = packageRunners.find(({ name }) => name === "npx");
	if (!runner) throw new Error("The npx package runner is unavailable");

	const routes = await discoverCatalogRoutes(page);

	for (const route of routes) {
		const { identity, currentRelease, exactReleases } =
			await readPublishedDesignSystem(page, route);

		for (const selector of [
			identity,
			...exactReleases.map((release) => `${identity}@${release}`),
		]) {
			const selectedRelease = selector.split("@")[1] ?? currentRelease;
			const project = await mkdtemp(path.join(tmpdir(), "agentkogei-command-"));
			try {
				const { command, arguments: runnerArguments } =
					runner.command(runTarball);
				const added = await runProcess(
					command,
					[...runnerArguments, "add", selector, "--yes"],
					{
						cwd: project,
						environment: {
							AGENTKOGEI_CONTRACT_CATALOG_URL: contractCatalogUrl,
							AGENTKOGEI_CONFIG_DIR: path.join(project, ".agentkogei-config"),
						},
					},
				);

				expect(added.exitCode, added.stderr).toBe(0);
				expect(added.stdout).toContain(
					`Design System Release ${selectedRelease}`,
				);
				const delivered = await request.get(
					`/contracts/${identity}/${selectedRelease}`,
				);
				expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
					await delivered.text(),
				);
				expect(added.stderr).not.toContain("login");
			} finally {
				await rm(project, { recursive: true, force: true });
			}
		}
	}
});

test("the packed CLI preserves consent, replacement, and failure rollback", async ({
	request,
}) => {
	const runner = packageRunners.find(({ name }) => name === "npx");
	if (!runner) throw new Error("The npx package runner is unavailable");
	const packedRunner = runner;
	const project = await mkdtemp(
		path.join(tmpdir(), "agentkogei-packed-safety-"),
	);
	const existingInstructions =
		"# Project agents\n\nKeep the Makefile current.\n";
	const unrelatedContents = "Project data that Installation must preserve.\n";
	const handWrittenContract = "# Hand written direction\n";
	const agentsPath = path.join(project, "AGENTS.md");
	const contractPath = path.join(project, "DESIGN.md");
	const unrelatedPath = path.join(project, "UNRELATED.txt");

	async function runPackedAdd(arguments_: string[]) {
		const { command, arguments: runnerArguments } =
			packedRunner.command(runTarball);
		return runProcess(command, [...runnerArguments, "add", ...arguments_], {
			cwd: project,
			environment: {
				AGENTKOGEI_CONTRACT_CATALOG_URL: contractCatalogUrl,
			},
		});
	}

	try {
		await Promise.all([
			writeFile(agentsPath, existingInstructions),
			writeFile(unrelatedPath, unrelatedContents),
		]);

		const unconfirmed = await runPackedAdd(["foundation"]);
		expect(unconfirmed.exitCode).toBe(2);
		expect(unconfirmed.stdout).toContain("Create");
		expect(existsSync(contractPath)).toBe(false);
		expect(await readFile(agentsPath, "utf8")).toBe(existingInstructions);

		await writeFile(contractPath, handWrittenContract);
		const unforced = await runPackedAdd(["foundation", "--yes"]);
		expect(unforced.exitCode).toBe(2);
		expect(unforced.stderr).toContain("--yes --force");
		expect(await readFile(contractPath, "utf8")).toBe(handWrittenContract);
		expect(await readFile(agentsPath, "utf8")).toBe(existingInstructions);

		const failed = await runPackedAdd(["foundation@9.9.9", "--yes", "--force"]);
		expect(failed.exitCode).toBe(1);
		expect(await readFile(contractPath, "utf8")).toBe(handWrittenContract);
		expect(await readFile(agentsPath, "utf8")).toBe(existingInstructions);
		expect(await readFile(unrelatedPath, "utf8")).toBe(unrelatedContents);

		const replaced = await runPackedAdd(["foundation", "--yes", "--force"]);
		expect(replaced.exitCode, replaced.stderr).toBe(0);
		expect(replaced.stdout).toContain("Replace");
		const delivered = await request.get("/contracts/foundation");
		expect(await readFile(contractPath, "utf8")).toBe(await delivered.text());
		const agents = await readFile(agentsPath, "utf8");
		expect(agents.startsWith(existingInstructions)).toBe(true);
		expect(agents.match(/agentkogei:design-system:start/g)).toHaveLength(1);
		expect(await readFile(unrelatedPath, "utf8")).toBe(unrelatedContents);
	} finally {
		await rm(project, { recursive: true, force: true });
	}
});

test("the packed CLI sends only the anonymous Design Contract request", async () => {
	const project = await mkdtemp(path.join(tmpdir(), "private-project-canary-"));
	const catalog = await requestInspectionCatalog();
	const networkLog = path.join(project, "network.log");
	const networkMonitor = path.join(project, "network-monitor.cjs");
	const projectCanaries = [
		"private-file-contents-canary",
		"private-prompt-canary",
		"private-generated-ui-canary",
		"private-dependency-canary",
		"private-git-remote-canary",
		"private-credential-canary",
	] as const;

	try {
		await Promise.all([
			writeFile(path.join(project, "PRIVATE.txt"), projectCanaries[0]),
			writeFile(path.join(project, "PROMPT.md"), projectCanaries[1]),
			writeFile(path.join(project, "GENERATED.tsx"), projectCanaries[2]),
			writeFile(
				path.join(project, "package.json"),
				JSON.stringify({ private: true }),
			),
			mkdir(path.join(project, ".git")),
		]);
		const installed = await runProcess("npm", ["install", runTarball], {
			cwd: project,
		});
		expect(installed.exitCode, installed.stderr).toBe(0);
		await writeFile(
			path.join(project, "package.json"),
			JSON.stringify({ dependencies: { [projectCanaries[3]]: "1.0.0" } }),
		);
		await writeFile(
			path.join(project, ".git/config"),
			`[remote "origin"]\nurl = https://example.test/${projectCanaries[4]}\n`,
		);
		await writeFile(
			networkMonitor,
			`const fs = require("node:fs");
const net = require("node:net");
const originalConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
	const target = args[0];
	fs.appendFileSync(
		process.env.AGENTKOGEI_NETWORK_LOG,
		JSON.stringify(typeof target === "object" ? target : args.slice(0, 2)) + "\\n",
	);
	return originalConnect.apply(this, args);
};
`,
		);

		const executable = path.join(
			project,
			"node_modules/agentkogei/dist/agentkogei.js",
		);
		const added = await runProcess(
			"node",
			[executable, "add", "foundation", "--yes"],
			{
				cwd: project,
				environment: {
					AGENTKOGEI_CONTRACT_CATALOG_URL: catalog.url,
					AGENTKOGEI_DIAGNOSTICS_URL: new URL("../diagnostics", catalog.url)
						.href,
					AGENTKOGEI_NETWORK_LOG: networkLog,
					AGENTKOGEI_PACK_CREDENTIAL: projectCanaries[5],
					NODE_OPTIONS: `--require=${networkMonitor}`,
				},
			},
		);

		expect(added.exitCode, added.stderr).toBe(0);
		expect(catalog.requests).toHaveLength(1);
		expect(catalog.requests[0]).toMatchObject({
			method: "GET",
			url: "/contracts/foundation",
			body: "",
		});
		expect(catalog.requests[0]?.headers.authorization).toBeUndefined();
		const connections = (await readFile(networkLog, "utf8"))
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line) as Record<string, unknown>);
		expect(connections).toHaveLength(1);
		expect(JSON.stringify(connections[0])).toContain("127.0.0.1");
		expect(JSON.stringify(connections[0])).toContain(String(catalog.port));

		const outbound = JSON.stringify(catalog.requests);
		expect(outbound).not.toContain(path.basename(project));
		for (const canary of projectCanaries) {
			expect(outbound).not.toContain(canary);
		}
	} finally {
		await catalog.close();
		await rm(project, { recursive: true, force: true });
	}
});

test("the packed CLI exposes no account, credential, authorization, or diagnostics commands", async () => {
	const runner = packageRunners.find(({ name }) => name === "npx");
	if (!runner) throw new Error("The npx package runner is unavailable");
	const project = await mkdtemp(path.join(tmpdir(), "agentkogei-public-cli-"));
	const configDirectory = path.join(project, ".agentkogei-config");

	try {
		const { command, arguments: runnerArguments } = runner.command(runTarball);
		for (const retiredCommand of ["login", "logout", "diagnostics"]) {
			const result = await runProcess(
				command,
				[...runnerArguments, retiredCommand],
				{
					cwd: project,
					environment: {
						AGENTKOGEI_CONFIG_DIR: configDirectory,
					},
				},
			);

			expect(result.exitCode, retiredCommand).toBe(2);
			expect(result.stdout, retiredCommand).toBe("");
			expect(result.stderr, retiredCommand).toContain(
				"Usage:\n  agentkogei add <design-system[@version]> [--yes] [--force]",
			);
			expect(result.stderr, retiredCommand).not.toMatch(
				/login|logout|credential|authorization|diagnostic/i,
			);
			expect(existsSync(configDirectory), retiredCommand).toBe(false);
		}
	} finally {
		await rm(project, { recursive: true, force: true });
	}
});

test("the published package offers one Node executable and no library entry", async () => {
	const consumer = await mkdtemp(path.join(tmpdir(), "agentkogei-consumer-"));
	try {
		await writeFile(
			path.join(consumer, "package.json"),
			JSON.stringify({ name: "consumer", private: true, type: "module" }),
		);
		const installed = await runProcess("npm", ["install", runTarball], {
			cwd: consumer,
		});
		expect(installed.exitCode, installed.stderr).toBe(0);

		const executables = path.join(consumer, "node_modules/.bin");
		expect(existsSync(path.join(executables, "agentkogei"))).toBe(true);
		expect(existsSync(path.join(executables, "agentkogei-validate-pack"))).toBe(
			false,
		);

		const packaged = JSON.parse(
			await readFile(
				path.join(consumer, "node_modules/agentkogei/package.json"),
				"utf8",
			),
		);
		expect(Object.keys(packaged.bin)).toEqual(["agentkogei"]);
		expect(packaged.exports).toBeUndefined();
		expect(packaged.main).toBeUndefined();
		expect(packaged.engines.node).toBe(">=20");

		const imported = await runProcess(
			"node",
			["--input-type=module", "--eval", 'await import("agentkogei")'],
			{ cwd: consumer },
		);
		expect(imported.exitCode).not.toBe(0);

		const executable = await readFile(
			path.join(consumer, "node_modules/agentkogei", packaged.bin.agentkogei),
			"utf8",
		);
		expect(executable.split("\n")[0]).toBe("#!/usr/bin/env node");
	} finally {
		await rm(consumer, { recursive: true, force: true });
	}
});
