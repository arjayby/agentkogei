import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { watch } from "node:fs";
import {
	mkdir,
	mkdtemp,
	readFile,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
	applyInstallation,
	foundationReleaseDirectory,
	prepareInstallation,
} from "@agentkogei/design-packs";

const cliCommand = new URL("../src/install-cli.ts", import.meta.url).pathname;
const registryItem = new URL(
	"../../../apps/web/public/r/foundation/1.0.0.json",
	import.meta.url,
).pathname;
const catalogRegistryItem = new URL(
	"../../../apps/web/public/r/foundation/1.1.0.json",
	import.meta.url,
).pathname;
const catalogBaseUrl = new URL("../../../apps/web/public/r/", import.meta.url)
	.href;
const temporaryDirectories: string[] = [];

type CliResult = {
	exitCode: number;
	stdout: string;
	stderr: string;
};

async function temporaryProject() {
	const directory = await mkdtemp(path.join(tmpdir(), "agentkogei-project-"));
	temporaryDirectories.push(directory);
	return directory;
}

async function catalogFixture(
	mutate: (item: {
		files: Array<{ path: string; target: string; content: string }>;
	}) => void,
) {
	const directory = await temporaryProject();
	const item = JSON.parse(await readFile(registryItem, "utf8")) as {
		files: Array<{ path: string; target: string; content: string }>;
	};
	mutate(item);
	const itemDirectory = path.join(directory, "foundation");
	await mkdir(itemDirectory);
	await Promise.all([
		writeFile(path.join(itemDirectory, "1.0.0.json"), JSON.stringify(item)),
		writeFile(path.join(directory, "foundation.json"), JSON.stringify(item)),
	]);
	return pathToFileURL(`${directory}/`).href;
}

async function updateCatalogFixture(
	version: string,
	mutate: (item: {
		files: Array<{ path: string; target: string; content: string }>;
	}) => void = () => {},
) {
	const directory = await temporaryProject();
	const version100 = await readFile(registryItem, "utf8");
	const item = JSON.parse(await readFile(catalogRegistryItem, "utf8")) as {
		files: Array<{ path: string; target: string; content: string }>;
	};
	const manifestFile = item.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!manifestFile) {
		throw new Error("fixture is missing its manifest");
	}
	const manifest = JSON.parse(manifestFile.content) as {
		release: { version: string };
		changelog: {
			summary: string;
			breaking: boolean;
			migrationNotes: string | null;
		};
		files: Array<{ path: string; sha256: string }>;
	};
	manifest.release.version = version;
	if (version.startsWith("2.")) {
		manifest.changelog = {
			summary:
				"Reframes the Foundation density scale for a new major baseline.",
			breaking: true,
			migrationNotes:
				"Review compact tables and remap deprecated density tokens before adoption.",
		};
	}
	manifestFile.content = JSON.stringify(manifest, null, "\t");
	mutate(item);
	const mutatedManifest = JSON.parse(manifestFile.content) as typeof manifest;
	for (const file of item.files) {
		if (file.path === "agentkogei.manifest.json") {
			continue;
		}
		const declared = mutatedManifest.files.find(
			(candidate) => candidate.path === file.path,
		);
		if (declared) {
			declared.sha256 = createHash("sha256").update(file.content).digest("hex");
		}
	}
	manifestFile.content = JSON.stringify(mutatedManifest, null, "\t");
	const itemDirectory = path.join(directory, "foundation");
	await mkdir(itemDirectory);
	const serialized = JSON.stringify(item);
	await Promise.all([
		writeFile(path.join(itemDirectory, "1.0.0.json"), version100),
		writeFile(path.join(itemDirectory, `${version}.json`), serialized),
		writeFile(path.join(directory, "foundation.json"), serialized),
	]);
	return pathToFileURL(`${directory}/`).href;
}

async function runCli(
	project: string,
	arguments_: string[],
	environment: Record<string, string> = {},
): Promise<CliResult> {
	const process_ = Bun.spawn(
		[process.execPath, cliCommand, ...arguments_, "--project", project],
		{
			env: {
				...process.env,
				AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogBaseUrl,
				...environment,
			},
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { exitCode, stdout, stderr };
}

async function interruptUpdateAfterPreview(
	project: string,
	environment: Record<string, string>,
) {
	const process_ = Bun.spawn(
		[process.execPath, cliCommand, "update", "--yes", "--project", project],
		{
			env: { ...process.env, ...environment },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const reader = process_.stdout.getReader();
	const decoder = new TextDecoder();
	let stdout = "";
	while (!stdout.includes("Conflicts: none")) {
		const chunk = await reader.read();
		if (chunk.done) {
			break;
		}
		stdout += decoder.decode(chunk.value, { stream: true });
	}
	process_.kill("SIGTERM");
	await process_.exited;
}

async function interruptUpdateDuringCommit(
	project: string,
	environment: Record<string, string>,
	signal: "SIGTERM" | "SIGKILL" = "SIGTERM",
) {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	const backupObserved = new Promise<void>((resolve, reject) => {
		const watcher = watch(project, (_event, filename) => {
			if (filename?.toString().startsWith(".agentkogei-backup-")) {
				watcher.close();
				resolve();
			}
		});
		timeout = setTimeout(() => {
			watcher.close();
			reject(new Error("update did not enter its commit window"));
		}, 5_000);
	});
	const process_ = Bun.spawn(
		[process.execPath, cliCommand, "update", "--yes", "--project", project],
		{
			env: { ...process.env, ...environment },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	await backupObserved;
	if (timeout) {
		clearTimeout(timeout);
	}
	process_.kill(signal);
	const [stderr, exitCode] = await Promise.all([
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { stderr, exitCode };
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Foundation Installation CLI", () => {
	test("installs an exact offline snapshot after explicit non-interactive consent", async () => {
		const project = await temporaryProject();
		await writeFile(
			path.join(project, "AGENTS.md"),
			"# Existing instructions\n",
		);

		const result = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Foundation 1.0.0");
		expect(result.stdout).toContain("CC-BY-4.0");
		expect(result.stdout).toContain("Compatibility");
		expect(result.stdout).toContain("Planned writes");
		expect(result.stdout).toContain("Setup instructions");
		expect(result.stdout).toContain("Conflicts: none");

		const installedDesign = await readFile(
			path.join(project, ".agentkogei/foundation/DESIGN.md"),
			"utf8",
		);
		const releasedDesign = await readFile(
			path.join(foundationReleaseDirectory, "DESIGN.md"),
			"utf8",
		);
		expect(installedDesign).toBe(releasedDesign);

		const record = JSON.parse(
			await readFile(
				path.join(project, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as {
			pack: { id: string; version: string };
			source: string;
			license: { spdx: string };
			targets: Array<{ target: string; sha256: string }>;
		};
		expect(record.pack).toEqual({ id: "foundation", version: "1.0.0" });
		expect(record.source).toBe(pathToFileURL(registryItem).href);
		expect(record.license.spdx).toBe("CC-BY-4.0");
		expect(record.targets).toHaveLength(9);
		expect(record.targets.every((target) => target.sha256.length === 64)).toBe(
			true,
		);

		const agents = await readFile(path.join(project, "AGENTS.md"), "utf8");
		expect(agents).toStartWith("# Existing instructions\n");
		expect(agents.match(/agentkogei:design-pack:start/g)).toHaveLength(1);
		expect(agents).toContain(".agentkogei/foundation/DESIGN.md");
	});

	test("does not mutate the Project without explicit non-interactive consent", async () => {
		const project = await temporaryProject();
		await writeFile(path.join(project, "keep.txt"), "unchanged");

		const result = await runCli(project, ["install", "foundation@1.0.0"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("--yes");
		expect(await readFile(path.join(project, "keep.txt"), "utf8")).toBe(
			"unchanged",
		);
		expect(
			Bun.file(path.join(project, ".agentkogei/installed-pack.json")).size,
		).toBe(0);
	});

	test("refuses conflicts and a second Installation without changing existing work", async () => {
		const project = await temporaryProject();
		const conflict = path.join(project, ".agentkogei/foundation/DESIGN.md");
		await Bun.write(conflict, "Project-owned design");

		const conflicted = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);
		expect(conflicted.exitCode).toBe(1);
		expect(conflicted.stdout).toContain("Conflicts:");
		expect(await readFile(conflict, "utf8")).toBe("Project-owned design");
		expect(
			Bun.file(path.join(project, ".agentkogei/installed-pack.json")).size,
		).toBe(0);

		await rm(path.join(project, ".agentkogei"), { recursive: true });
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const recordBefore = await readFile(
			path.join(project, ".agentkogei/installed-pack.json"),
			"utf8",
		);
		const second = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);
		expect(second.exitCode).toBe(1);
		expect(second.stdout).toContain("already has an Installed Pack");
		expect(
			await readFile(
				path.join(project, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		).toBe(recordBefore);
	});

	test("rejects a target whose existing ancestor is a symbolic link", async () => {
		const project = await temporaryProject();
		const outside = await temporaryProject();
		await symlink(outside, path.join(project, ".agentkogei"));

		const result = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(`${result.stdout}${result.stderr}`).toContain("symbolic link");
		expect(Bun.file(path.join(outside, "installed-pack.json")).size).toBe(0);
	});

	test("rejects a symbolic-linked AGENTS.md without changing its outside target", async () => {
		const project = await temporaryProject();
		const outside = path.join(await temporaryProject(), "outside-agents.md");
		await writeFile(outside, "Outside instructions\n");
		await symlink(outside, path.join(project, "AGENTS.md"));

		const result = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(`${result.stdout}${result.stderr}`).toContain(
			"AGENTS.md is a symbolic link",
		);
		expect(await readFile(outside, "utf8")).toBe("Outside instructions\n");
		expect(
			Bun.file(path.join(project, ".agentkogei/installed-pack.json")).size,
		).toBe(0);
	});

	test("rejects targets outside the managed snapshot before Project mutation", async () => {
		const project = await temporaryProject();
		const catalogUrl = await catalogFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (!manifestFile) {
				return;
			}
			const manifest = JSON.parse(manifestFile.content) as {
				files: Array<{ path: string; target: string }>;
			};
			const firstFile = manifest.files[0];
			if (!firstFile) {
				return;
			}
			firstFile.target = "README.md";
			manifestFile.content = JSON.stringify(manifest);
			const design = item.files.find((file) => file.path === "DESIGN.md");
			if (design) {
				design.target = "README.md";
			}
		});

		const result = await runCli(
			project,
			["install", "foundation@1.0.0", "--yes"],
			{ AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl },
		);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("managed snapshot");
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("refuses orphaned managed state from another Design Pack", async () => {
		const project = await temporaryProject();
		const orphan = path.join(
			project,
			".agentkogei/other-pack/agentkogei.manifest.json",
		);
		await Bun.write(orphan, "{}");

		const result = await runCli(project, [
			"install",
			"foundation@1.0.0",
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("managed Design Pack state");
		expect(await readFile(orphan, "utf8")).toBe("{}");
		expect(
			Bun.file(path.join(project, ".agentkogei/foundation/DESIGN.md")).size,
		).toBe(0);
	});

	test("revalidates symlink conflicts introduced after preview", async () => {
		const project = await temporaryProject();
		const outside = await temporaryProject();
		const plan = await prepareInstallation({
			identity: "foundation",
			version: "1.0.0",
			projectDirectory: project,
			officialCatalogUrl: catalogBaseUrl,
		});
		await symlink(outside, path.join(project, ".agentkogei"));

		await expect(applyInstallation(plan)).rejects.toThrow(
			"changed after preview",
		);
		expect(Bun.file(path.join(outside, "installed-pack.json")).size).toBe(0);
		expect(Bun.file(path.join(outside, "foundation/DESIGN.md")).size).toBe(0);
	});

	test("rejects substituted release bytes before mutating the Project", async () => {
		const project = await temporaryProject();
		await writeFile(path.join(project, "keep.txt"), "unchanged");
		const catalogUrl = await catalogFixture((item) => {
			const design = item.files.find((file) => file.path === "DESIGN.md");
			if (design) {
				design.content = "substituted release bytes\n";
			}
		});

		const result = await runCli(
			project,
			["install", "foundation@1.0.0", "--yes"],
			{ AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl },
		);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("hash mismatch");
		expect(await readFile(path.join(project, "keep.txt"), "utf8")).toBe(
			"unchanged",
		);
		expect(
			Bun.file(path.join(project, ".agentkogei/installed-pack.json")).size,
		).toBe(0);
	});

	test("leaves the Project unchanged when Pack Source retrieval fails", async () => {
		const project = await temporaryProject();
		await writeFile(path.join(project, "keep.txt"), "unchanged");
		const missingCatalog = pathToFileURL(
			path.join(project, "missing-catalog/"),
		).href;

		const result = await runCli(
			project,
			["install", "foundation@1.0.0", "--yes"],
			{ AGENTKOGEI_OFFICIAL_CATALOG_URL: missingCatalog },
		);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("retrieval or parsing failed");
		expect(await readFile(path.join(project, "keep.txt"), "utf8")).toBe(
			"unchanged",
		);
		expect(
			Bun.file(path.join(project, ".agentkogei/installed-pack.json")).size,
		).toBe(0);
	});
});

describe("Installed Pack lifecycle CLI", () => {
	test("reports exact managed state and resource integrity", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);

		const result = await runCli(project, ["status"]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Installed Pack: Foundation (foundation)");
		expect(result.stdout).toContain("Pack Release: 1.0.0");
		expect(result.stdout).toContain(
			`Pack Source: ${pathToFileURL(registryItem).href}`,
		);
		expect(result.stdout).toContain("Pack License: CC-BY-4.0");
		expect(result.stdout).toContain("Managed state: managed");
		expect(result.stdout).toContain("Resource integrity: 10/10 verified");
	});

	test("discovers that the Installed Pack is already current without changing it", async () => {
		const project = await temporaryProject();
		const catalogUrl = await catalogFixture(() => {});
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);
		const recordPath = path.join(project, ".agentkogei/installed-pack.json");
		const recordBefore = await readFile(recordPath, "utf8");

		const result = await runCli(project, ["update"], environment);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Foundation 1.0.0 is already current");
		expect(await readFile(recordPath, "utf8")).toBe(recordBefore);
	});

	test("previews and applies only the exact explicitly confirmed Pack Release", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const recordPath = path.join(project, ".agentkogei/installed-pack.json");
		const recordBefore = await readFile(recordPath, "utf8");

		const declined = await runCli(project, ["update"]);

		expect(declined.exitCode).toBe(2);
		expect(declined.stdout).toContain("Current Pack Release: 1.0.0");
		expect(declined.stdout).toContain("Proposed Pack Release: 1.1.0");
		expect(declined.stdout).toContain("Semantic level: minor");
		expect(declined.stdout).toContain(
			"Adds semantic informational-state tokens",
		);
		expect(declined.stdout).toContain("Migration notes: none");
		expect(declined.stdout).toContain("Changed resources:");
		expect(declined.stdout).toContain("tokens.css");
		expect(declined.stdout).toContain("Conflicts: none");
		expect(declined.stderr).toContain("--yes");
		expect(await readFile(recordPath, "utf8")).toBe(recordBefore);

		const applied = await runCli(project, ["update", "--yes"]);

		expect(applied.exitCode).toBe(0);
		expect(applied.stdout).toContain("Updated Foundation from 1.0.0 to 1.1.0");
		const record = JSON.parse(await readFile(recordPath, "utf8")) as {
			pack: { version: string };
			source: string;
		};
		expect(record.pack.version).toBe("1.1.0");
		expect(record.source).toBe(
			new URL("foundation/1.1.0.json", catalogBaseUrl).href,
		);
		expect(
			await readFile(
				path.join(project, ".agentkogei/foundation/tokens.css"),
				"utf8",
			),
		).toContain("--foundation-info");
	});

	test("prominently warns about a major Pack Release and shows migration notes", async () => {
		const project = await temporaryProject();
		const catalogUrl = await updateCatalogFixture("2.0.0");
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);

		const result = await runCli(project, ["update"], environment);

		expect(result.exitCode).toBe(2);
		expect(result.stdout).toContain("Semantic level: major");
		expect(result.stdout).toContain("WARNING: Major Pack Release");
		expect(result.stdout).toContain(
			"Review compact tables and remap deprecated density tokens",
		);
	});

	test("reports changed managed resources as conflicts and preserves them", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const tokensPath = path.join(project, ".agentkogei/foundation/tokens.css");
		await writeFile(tokensPath, "Builder customization\n");

		const result = await runCli(project, ["update", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("Conflicts:");
		expect(result.stdout).toContain("tokens.css: hash mismatch");
		expect(await readFile(tokensPath, "utf8")).toBe("Builder customization\n");
		const status = await runCli(project, ["status"]);
		expect(status.stdout).toContain("Managed state: detached");
		expect(status.stdout).toContain("Pack Release: 1.0.0");
	});

	test("reports a damaged manifest as detached while preserving status identity", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		await writeFile(
			path.join(project, ".agentkogei/foundation/agentkogei.manifest.json"),
			"damaged manifest\n",
		);

		const status = await runCli(project, ["status"]);

		expect(status.exitCode).toBe(0);
		expect(status.stdout).toContain("Installed Pack: foundation (foundation)");
		expect(status.stdout).toContain("Pack Release: 1.0.0");
		expect(status.stdout).toContain("Pack License: CC-BY-4.0");
		expect(status.stdout).toContain("Managed state: detached");
		expect(status.stdout).toContain("manifest is missing or invalid");
	});

	test("preserves the previous usable snapshot when an update is interrupted", async () => {
		const project = await temporaryProject();
		const catalogUrl = await updateCatalogFixture("1.1.0", (item) => {
			const components = item.files.find(
				(file) => file.path === "components.md",
			);
			if (components) {
				components.content = "# Large staged resource\n".padEnd(
					32 * 1024 * 1024,
					"x",
				);
			}
		});
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);

		await interruptUpdateAfterPreview(project, environment);

		const status = await runCli(project, ["status"], environment);
		expect(status.exitCode).toBe(0);
		expect(status.stdout).toContain("Pack Release: 1.0.0");
		expect(status.stdout).toContain("Managed state: managed");
	});

	test("rolls back a validation failure to the previous usable snapshot", async () => {
		const project = await temporaryProject();
		const catalogUrl = await updateCatalogFixture("1.1.0");
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);
		const exactReleasePath = fileURLToPath(
			new URL("foundation/1.1.0.json", catalogUrl),
		);
		const exactRelease = JSON.parse(
			await readFile(exactReleasePath, "utf8"),
		) as { files: Array<{ path: string; content: string }> };
		const tokens = exactRelease.files.find(
			(file) => file.path === "tokens.css",
		);
		if (tokens) {
			tokens.content = "corrupted after publication\n";
		}
		await writeFile(exactReleasePath, JSON.stringify(exactRelease));

		const result = await runCli(project, ["update", "--yes"], environment);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("hash mismatch");
		const status = await runCli(project, ["status"], environment);
		expect(status.exitCode).toBe(0);
		expect(status.stdout).toContain("Pack Release: 1.0.0");
		expect(status.stdout).toContain("Managed state: managed");
	});

	test("rolls back when interrupted inside the update commit window", async () => {
		const project = await temporaryProject();
		const catalogUrl = await updateCatalogFixture("1.1.0");
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);

		const interrupted = await interruptUpdateDuringCommit(project, environment);

		expect(interrupted.exitCode).not.toBe(0);
		expect(interrupted.stderr).toContain("Update interrupted by SIGTERM");
		const status = await runCli(project, ["status"], environment);
		expect(status.exitCode).toBe(0);
		expect(status.stdout).toContain("Pack Release: 1.0.0");
		expect(status.stdout).toContain("Managed state: managed");
	});

	test("recovers the previous snapshot after an uncatchable commit interruption", async () => {
		const project = await temporaryProject();
		const catalogUrl = await updateCatalogFixture("1.1.0");
		const environment = { AGENTKOGEI_OFFICIAL_CATALOG_URL: catalogUrl };
		expect(
			(
				await runCli(
					project,
					["install", "foundation@1.0.0", "--yes"],
					environment,
				)
			).exitCode,
		).toBe(0);

		const interrupted = await interruptUpdateDuringCommit(
			project,
			environment,
			"SIGKILL",
		);

		expect(interrupted.exitCode).not.toBe(0);
		const status = await runCli(project, ["status"], environment);
		expect(status.exitCode).toBe(0);
		expect(status.stdout).toContain("Pack Release: 1.0.0");
		expect(status.stdout).toContain("Managed state: managed");
		expect(
			Bun.file(path.join(project, ".agentkogei-update-transaction.json")).size,
		).toBe(0);
	});
});
