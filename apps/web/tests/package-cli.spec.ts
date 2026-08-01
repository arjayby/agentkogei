import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

import { runProcess } from "./support/cli";
import { cliTarball, packageRunners } from "./support/package-runners";

/**
 * Package runners download, unpack, and launch an executable before the CLI
 * ever runs, so these journeys are slower than the ones that spawn it directly.
 */
test.setTimeout(180_000);

const contractCatalogUrl = "http://localhost:3011/contracts/";

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
				[...runnerArguments, "add", "foundation", "--yes"],
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
				"Installed Foundation Design System Release 1.1.0",
			);
			const delivered = await request.get("/contracts/foundation");
			expect(await readFile(path.join(project, "DESIGN.md"), "utf8")).toBe(
				await delivered.text(),
			);
			expect(await readFile(path.join(project, "AGENTS.md"), "utf8")).toContain(
				"`DESIGN.md`",
			);
		} finally {
			await rm(project, { recursive: true, force: true });
		}
	});
}

test("the packed CLI installs every current and exact Design System Release anonymously", async ({
	request,
}) => {
	const runner = packageRunners.find(({ name }) => name === "npx");
	if (!runner) throw new Error("The npx package runner is unavailable");

	const designSystems = [
		{ identity: "foundation", currentRelease: "1.1.0", exactRelease: "1.0.0" },
		{ identity: "editorial", currentRelease: "1.0.0", exactRelease: "1.0.0" },
		{ identity: "mono", currentRelease: "1.0.0", exactRelease: "1.0.0" },
		{ identity: "command", currentRelease: "1.0.0", exactRelease: "1.0.0" },
	] as const;

	for (const { identity, currentRelease, exactRelease } of designSystems) {
		for (const selector of [identity, `${identity}@${exactRelease}`]) {
			const selectedRelease = selector.includes("@")
				? exactRelease
				: currentRelease;
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
