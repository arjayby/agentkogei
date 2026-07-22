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
	test(`a Builder completes an Open Installation through ${runner.name}`, async ({
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
			expect(added.stdout).toContain("Added Foundation");
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
