import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { watch } from "node:fs";
import {
	mkdir,
	mkdtemp,
	readdir,
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
	detachInstalledPack,
	foundationReleaseDirectory,
	inspectInstalledPack,
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
const editorialRegistryItem = new URL(
	"../../../apps/web/public/r/editorial/1.0.0.json",
	import.meta.url,
).pathname;
const catalogBaseUrl = new URL("../../../apps/web/public/r/", import.meta.url)
	.href;
const temporaryDirectories: string[] = [];
// These tests race a real CLI subprocess, so the window they wait for opens
// whenever the machine gets around to it. A cold CI runner is an order of
// magnitude slower than a warm laptop.
const commitWindowTimeoutMs = 20_000;

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

async function thirdPartySourceFixture(
	mutate: (item: {
		files: Array<{ path: string; target: string; content: string }>;
	}) => void = () => {},
) {
	const directory = await temporaryProject();
	const item = JSON.parse(await readFile(registryItem, "utf8")) as {
		name: string;
		title: string;
		files: Array<{ path: string; target: string; content: string }>;
	};
	const manifestFile = item.files.find(
		(file) => file.path === "agentkogei.manifest.json",
	);
	if (!manifestFile) {
		throw new Error("fixture is missing its manifest");
	}
	const manifest = JSON.parse(manifestFile.content) as {
		id: string;
		name: string;
		publisher: string;
		license: { spdx: string; name: string; url: string; attribution: string };
		files: Array<{ target: string }>;
	};
	item.name = "community-grid";
	item.title = "Community Grid";
	manifest.id = "community-grid";
	manifest.name = "Community Grid";
	manifest.publisher = "Grid Guild";
	manifest.license = {
		...manifest.license,
		spdx: "MIT",
		name: "MIT License",
		url: "https://opensource.org/license/mit",
		attribution: "Copyright 2026 Grid Guild contributors",
	};
	for (const file of [...manifest.files, ...item.files]) {
		file.target = file.target.replace(
			".agentkogei/foundation/",
			".agentkogei/community-grid/",
		);
	}
	manifestFile.content = JSON.stringify(manifest, null, "\t");
	mutate(item);
	const releaseDirectory = path.join(directory, "community-grid");
	await mkdir(releaseDirectory);
	const serialized = JSON.stringify(item);
	const source = path.join(directory, "community-grid.json");
	await Promise.all([
		writeFile(source, serialized),
		writeFile(path.join(releaseDirectory, "1.0.0.json"), serialized),
	]);
	return {
		itemUrl: pathToFileURL(source).href,
		baseUrl: pathToFileURL(`${directory}/`).href,
	};
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

const backupPrefix = ".agentkogei-backup-";

/**
 * Waits for an update to enter its commit window, which the backup directory
 * marks. File-system events and a directory poll race each other because the
 * two do not report identically across platforms, and the window is brief.
 */
function watchForCommitWindow(project: string) {
	let observe: (backup: string) => void = () => {};
	const observed = new Promise<string>((resolve) => {
		observe = resolve;
	});
	const watcher = watch(project, (_event, filename) => {
		const entry = filename ? path.basename(filename.toString()) : undefined;
		if (entry?.startsWith(backupPrefix)) {
			observe(entry);
		}
	});
	let polling = true;
	void (async () => {
		while (polling) {
			const entry = (await readdir(project)).find((name) =>
				name.startsWith(backupPrefix),
			);
			if (entry) {
				observe(entry);
				return;
			}
			await Bun.sleep(2);
		}
	})();
	return {
		observed,
		close() {
			polling = false;
			watcher.close();
		},
	};
}

/**
 * Reports why the window never opened. Without the subprocess's own output a
 * failure here is indistinguishable from a slow machine.
 */
async function reportMissingCommitWindow(
	process_: ReturnType<typeof Bun.spawn>,
): Promise<never> {
	await Bun.sleep(commitWindowTimeoutMs);
	process_.kill("SIGKILL");
	const [stdout, stderr] = await Promise.all([
		new Response(process_.stdout as ReadableStream).text(),
		new Response(process_.stderr as ReadableStream).text(),
	]);
	throw new Error(
		`update did not enter its commit window\nstdout:\n${stdout}\nstderr:\n${stderr}`,
	);
}

async function interruptUpdateDuringCommit(
	project: string,
	environment: Record<string, string>,
	signal: "SIGTERM" | "SIGKILL" = "SIGTERM",
) {
	const commitWindow = watchForCommitWindow(project);
	const process_ = Bun.spawn(
		[process.execPath, cliCommand, "update", "--yes", "--project", project],
		{
			env: { ...process.env, ...environment },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	try {
		await Promise.race([
			commitWindow.observed,
			reportMissingCommitWindow(process_),
		]);
	} finally {
		commitWindow.close();
	}
	process_.kill(signal);
	const [stderr, exitCode] = await Promise.all([
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { stderr, exitCode };
}

async function modifyUpdateDuringCommit(
	project: string,
	environment: Record<string, string>,
) {
	const commitWindow = watchForCommitWindow(project);
	const process_ = Bun.spawn(
		[process.execPath, cliCommand, "update", "--yes", "--project", project],
		{
			env: { ...process.env, ...environment },
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	let backup: string;
	try {
		backup = await Promise.race([
			commitWindow.observed,
			reportMissingCommitWindow(process_),
		]);
	} finally {
		commitWindow.close();
	}
	await writeFile(
		path.join(project, backup, "foundation/tokens.css"),
		"Late Builder customization\n",
	);
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { stdout, stderr, exitCode };
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

describe("Editorial Installation CLI", () => {
	test("discovers and installs the anonymously retrievable Pack Release for agent use", async () => {
		const project = await temporaryProject();
		await writeFile(
			path.join(project, "AGENTS.md"),
			"# Project instructions\n",
		);

		expect(Bun.file(editorialRegistryItem).size).toBeGreaterThan(0);
		const result = await runCli(project, [
			"install",
			"editorial@1.0.0",
			"--yes",
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Editorial 1.0.0");
		expect(result.stdout).toContain("CC-BY-4.0");
		expect(result.stdout).toContain("Conflicts: none");
		expect(
			await readFile(
				path.join(project, ".agentkogei/editorial/DESIGN.md"),
				"utf8",
			),
		).toContain("# Editorial Interface System");
		expect(
			await readFile(
				path.join(project, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		).toContain('"id": "editorial"');
		expect(await readFile(path.join(project, "AGENTS.md"), "utf8")).toContain(
			".agentkogei/editorial/DESIGN.md",
		);
	});
});

describe("third-party Pack Source Installation CLI", () => {
	test("installs a compatible explicit source with informed consent", async () => {
		const project = await temporaryProject();
		const { itemUrl: source } = await thirdPartySourceFixture();

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			source,
			"--yes",
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("Publisher: Grid Guild");
		expect(result.stdout).toContain(`Pack Source: ${source}`);
		expect(result.stdout).toContain("License: MIT License (MIT)");
		expect(result.stdout).toContain(
			"License URL: https://opensource.org/license/mit",
		);
		expect(result.stdout).toContain("License file: LICENSE.md");
		expect(result.stdout).toContain(
			"License attribution: Copyright 2026 Grid Guild contributors",
		);
		expect(result.stdout).toContain("Compatibility:");
		expect(result.stdout).toContain("Planned writes:");
		expect(result.stdout).toContain("Setup instructions:");
		expect(result.stdout).toContain("Conflicts: none");
		expect(result.stdout).toContain("not a Published Pack");
		expect(result.stdout).toContain("no AgentKogei Pack Evaluation guarantee");

		const record = JSON.parse(
			await readFile(
				path.join(project, ".agentkogei/installed-pack.json"),
				"utf8",
			),
		) as { source: string; pack: { id: string }; license: { spdx: string } };
		expect(record).toMatchObject({
			source,
			pack: { id: "community-grid" },
			license: { spdx: "MIT" },
		});
		expect(
			await readFile(
				path.join(project, ".agentkogei/community-grid/DESIGN.md"),
				"utf8",
			),
		).toContain("# Foundation");
	});

	test("resolves an immutable release from an explicit registry base URL", async () => {
		const project = await temporaryProject();
		const { baseUrl } = await thirdPartySourceFixture();

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			baseUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain(
			`Pack Source: ${baseUrl}community-grid/1.0.0.json`,
		);
	});

	test("accepts an explicit registry item endpoint without a JSON path suffix", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture();
		const endpoint = path.join(path.dirname(fileURLToPath(itemUrl)), "pack");
		await writeFile(endpoint, await readFile(fileURLToPath(itemUrl)));
		const source = pathToFileURL(endpoint).href;

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			source,
			"--yes",
		]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain(`Pack Source: ${source}`);
	});

	test("accepts a query-based item endpoint whose path ends in a slash", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture();
		const payload = await readFile(fileURLToPath(itemUrl), "utf8");
		const requestedUrls: string[] = [];
		const sourceServer = Bun.serve({
			port: 0,
			fetch(request) {
				requestedUrls.push(request.url);
				return Response.json(JSON.parse(payload));
			},
		});

		try {
			const source = new URL("api/?pack=community-grid", sourceServer.url).href;
			const result = await runCli(project, [
				"install",
				"community-grid@1.0.0",
				"--source",
				source,
				"--yes",
			]);

			expect(result.exitCode).toBe(0);
			expect(requestedUrls).toEqual([source]);
		} finally {
			sourceServer.stop(true);
		}
	});

	test("rejects a third-party manifest with executable hooks before Project mutation", async () => {
		const project = await temporaryProject();
		await writeFile(path.join(project, "keep.txt"), "unchanged");
		const { itemUrl } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (manifestFile) {
				const manifest = JSON.parse(manifestFile.content) as Record<
					string,
					unknown
				>;
				manifest.hooks = { postinstall: "node install.js" };
				manifestFile.content = JSON.stringify(manifest);
			}
		});

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain(
			"executable hooks and scripts are prohibited",
		);
		expect(await readFile(path.join(project, "keep.txt"), "utf8")).toBe(
			"unchanged",
		);
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("rejects terminal control sequences before showing a third-party preview", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (manifestFile) {
				const manifest = JSON.parse(manifestFile.content) as {
					publisher: string;
				};
				manifest.publisher = "\u001b]8;;https://malicious.example\u0007Trusted";
				manifestFile.content = JSON.stringify(manifest);
			}
		});

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toContain("terminal control characters");
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("rejects terminal control sequences in a publisher license URL before preview", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (manifestFile) {
				const manifest = JSON.parse(manifestFile.content) as {
					license: { url: string };
				};
				manifest.license.url =
					"https://licenses.example/\u001b]8;;https://malicious.example\u0007terms";
				manifestFile.content = JSON.stringify(manifest);
			}
		});

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toContain("terminal control characters");
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("rejects terminal control sequences in the registry envelope before preview", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (manifestFile) {
				manifestFile.target =
					"\u001b]8;;https://malicious.example\u0007manifest";
			}
		});

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toBe("");
		expect(result.stderr).toContain("terminal control characters");
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("rejects third-party package-manager execution instructions before Project mutation", async () => {
		const project = await temporaryProject();
		const { itemUrl } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (manifestFile) {
				const manifest = JSON.parse(manifestFile.content) as {
					dependencies: { setup: string[] };
				};
				manifest.dependencies.setup = ["npm install unsafe-package"];
				manifestFile.content = JSON.stringify(manifest);
			}
		});

		const result = await runCli(project, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain(
			"dependency guidance must be non-executable",
		);
		expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
	});

	test("rejects third-party unsafe targets and substituted hashes before Project mutation", async () => {
		const unsafeProject = await temporaryProject();
		const { itemUrl: unsafeSource } = await thirdPartySourceFixture((item) => {
			const manifestFile = item.files.find(
				(file) => file.path === "agentkogei.manifest.json",
			);
			if (!manifestFile) return;
			const manifest = JSON.parse(manifestFile.content) as {
				files: Array<{ path: string; target: string }>;
			};
			const design = manifest.files.find((file) => file.path === "DESIGN.md");
			const transported = item.files.find((file) => file.path === "DESIGN.md");
			if (design && transported) {
				design.target = "../outside.md";
				transported.target = "../outside.md";
			}
			manifestFile.content = JSON.stringify(manifest);
		});

		const unsafe = await runCli(unsafeProject, [
			"install",
			"community-grid@1.0.0",
			"--source",
			unsafeSource,
			"--yes",
		]);
		expect(unsafe.exitCode).toBe(1);
		expect(unsafe.stderr).toContain("safe relative target");
		expect(Bun.file(path.join(unsafeProject, ".agentkogei")).size).toBe(0);

		const substitutedProject = await temporaryProject();
		const { itemUrl: substitutedSource } = await thirdPartySourceFixture(
			(item) => {
				const design = item.files.find((file) => file.path === "DESIGN.md");
				if (design) design.content = "substituted bytes\n";
			},
		);
		const substituted = await runCli(substitutedProject, [
			"install",
			"community-grid@1.0.0",
			"--source",
			substitutedSource,
			"--yes",
		]);
		expect(substituted.exitCode).toBe(1);
		expect(substituted.stderr).toContain("hash mismatch");
		expect(Bun.file(path.join(substitutedProject, ".agentkogei")).size).toBe(0);
	});

	test("leaves third-party symlink and overwrite conflicts unchanged", async () => {
		const { itemUrl } = await thirdPartySourceFixture();
		const symlinkProject = await temporaryProject();
		const outside = await temporaryProject();
		await symlink(outside, path.join(symlinkProject, ".agentkogei"));

		const symlinkResult = await runCli(symlinkProject, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);
		expect(symlinkResult.exitCode).toBe(1);
		expect(`${symlinkResult.stdout}${symlinkResult.stderr}`).toContain(
			"symbolic link",
		);
		expect(Bun.file(path.join(outside, "installed-pack.json")).size).toBe(0);

		const conflictProject = await temporaryProject();
		const conflict = path.join(
			conflictProject,
			".agentkogei/community-grid/DESIGN.md",
		);
		await Bun.write(conflict, "Project-owned design\n");
		const conflictResult = await runCli(conflictProject, [
			"install",
			"community-grid@1.0.0",
			"--source",
			itemUrl,
			"--yes",
		]);
		expect(conflictResult.exitCode).toBe(1);
		expect(conflictResult.stdout).toContain("already exists");
		expect(await readFile(conflict, "utf8")).toBe("Project-owned design\n");
	});

	test("contacts only the chosen third-party source without Project data", async () => {
		const project = await temporaryProject();
		const projectSecret = "private-project-content-4caa12";
		await writeFile(path.join(project, "PRIVATE.txt"), projectSecret);
		const { itemUrl } = await thirdPartySourceFixture();
		const payload = await readFile(fileURLToPath(itemUrl), "utf8");
		const officialRequests: string[] = [];
		const sourceRequests: string[] = [];
		const officialServer = Bun.serve({
			port: 0,
			fetch(request) {
				officialRequests.push(request.url);
				return new Response("unexpected", { status: 500 });
			},
		});
		const sourceServer = Bun.serve({
			port: 0,
			fetch(request) {
				sourceRequests.push(
					`${request.method} ${request.url}\n${JSON.stringify(Object.fromEntries(request.headers))}`,
				);
				return Response.json(JSON.parse(payload));
			},
		});

		try {
			const source = new URL("community-grid/1.0.0.json", sourceServer.url)
				.href;
			const result = await runCli(
				project,
				["install", "community-grid@1.0.0", "--source", source, "--yes"],
				{ AGENTKOGEI_OFFICIAL_CATALOG_URL: officialServer.url.href },
			);

			expect(result.exitCode).toBe(0);
			expect(officialRequests).toEqual([]);
			expect(sourceRequests).toHaveLength(1);
			expect(sourceRequests[0]).not.toContain(path.basename(project));
			expect(sourceRequests[0]).not.toContain(projectSecret);
		} finally {
			officialServer.stop(true);
			sourceServer.stop(true);
		}
	});

	test("refuses a redirect to an unchosen Pack Source without contacting it", async () => {
		const project = await temporaryProject();
		await writeFile(path.join(project, "keep.txt"), "unchanged");
		const unchosenRequests: string[] = [];
		const unchosenServer = Bun.serve({
			port: 0,
			fetch(request) {
				unchosenRequests.push(request.url);
				return new Response("unexpected", { status: 500 });
			},
		});
		const chosenServer = Bun.serve({
			port: 0,
			fetch() {
				return Response.redirect(
					new URL("community-grid.json", unchosenServer.url),
					302,
				);
			},
		});

		try {
			const result = await runCli(project, [
				"install",
				"community-grid@1.0.0",
				"--source",
				new URL("community-grid.json", chosenServer.url).href,
				"--yes",
			]);

			expect(result.exitCode).toBe(1);
			expect(result.stderr).toContain(
				"redirected outside the chosen Pack Source",
			);
			expect(unchosenRequests).toEqual([]);
			expect(await readFile(path.join(project, "keep.txt"), "utf8")).toBe(
				"unchanged",
			);
			expect(Bun.file(path.join(project, ".agentkogei")).size).toBe(0);
		} finally {
			chosenServer.stop(true);
			unchosenServer.stop(true);
		}
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

	test("distinguishes unchanged, modified, missing, and unexpectedly replaced resources", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		await writeFile(
			path.join(project, ".agentkogei/foundation/tokens.css"),
			"Builder customization\n",
		);
		await rm(path.join(project, ".agentkogei/foundation/components.md"));
		await rm(path.join(project, ".agentkogei/foundation/examples.md"));
		await mkdir(path.join(project, ".agentkogei/foundation/examples.md"));

		const result = await runCli(project, ["status"]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain(
			".agentkogei/foundation/DESIGN.md: unchanged",
		);
		expect(result.stdout).toContain(
			".agentkogei/foundation/tokens.css: modified",
		);
		expect(result.stdout).toContain(
			".agentkogei/foundation/components.md: missing",
		);
		expect(result.stdout).toContain(
			".agentkogei/foundation/examples.md: unexpectedly replaced",
		);
	});

	test("requires explicit confirmation and keeps Detached Pack guidance usable", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const designPath = path.join(project, ".agentkogei/foundation/DESIGN.md");
		const tokensPath = path.join(project, ".agentkogei/foundation/tokens.css");
		const agentsPath = path.join(project, "AGENTS.md");
		await writeFile(designPath, "# Builder Design Contract\n");
		await writeFile(tokensPath, "/* Builder tokens */\n");
		const agentsBefore = await readFile(agentsPath, "utf8");

		const declined = await runCli(project, ["detach"]);

		expect(declined.exitCode).toBe(2);
		expect(declined.stdout).toContain(
			"Detaching keeps the Design Contract and supporting resources available locally",
		);
		expect(declined.stdout).toContain(
			"Managed Pack Release updates will remain blocked for the Detached Pack",
		);
		expect(declined.stdout).toContain(
			".agentkogei/foundation/tokens.css: modified",
		);
		expect(declined.stdout).not.toContain("/* Builder tokens */");
		expect(declined.stderr).toContain("--yes");

		const detached = await runCli(project, ["detach", "--yes"]);

		expect(detached.exitCode).toBe(0);
		expect(detached.stdout).toContain("Detached Foundation 1.0.0");
		expect(await readFile(designPath, "utf8")).toBe(
			"# Builder Design Contract\n",
		);
		expect(await readFile(tokensPath, "utf8")).toBe("/* Builder tokens */\n");
		expect(await readFile(agentsPath, "utf8")).toBe(agentsBefore);
		const status = await runCli(project, ["status"]);
		expect(status.stdout).toContain("Detached Pack: Foundation (foundation)");
		expect(status.stdout).toContain("Managed state: detached");
	});

	test("refuses to detach resources that changed after preview", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const tokensPath = path.join(project, ".agentkogei/foundation/tokens.css");
		await writeFile(tokensPath, "Builder customization\n");
		const previewed = await inspectInstalledPack(project);
		await rm(path.join(project, ".agentkogei/foundation/components.md"));

		await expect(detachInstalledPack(previewed)).rejects.toThrow(
			"changed after detach preview",
		);
		const status = await inspectInstalledPack(project);
		expect(status.managedState).toBe("managed");
	});

	test("treats concurrent repeated detach calls as an idempotent no-op", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		await writeFile(
			path.join(project, ".agentkogei/foundation/tokens.css"),
			"Builder customization\n",
		);
		const previewed = await inspectInstalledPack(project);
		expect(await detachInstalledPack(previewed)).toBe(true);

		expect(await detachInstalledPack(previewed)).toBe(false);
	});

	test("keeps repeated detach operations idempotent and blocks managed updates", async () => {
		const project = await temporaryProject();
		expect(
			(await runCli(project, ["install", "foundation@1.0.0", "--yes"]))
				.exitCode,
		).toBe(0);
		const tokensPath = path.join(project, ".agentkogei/foundation/tokens.css");
		await writeFile(tokensPath, "Builder customization\n");
		expect((await runCli(project, ["detach", "--yes"])).exitCode).toBe(0);
		const recordPath = path.join(project, ".agentkogei/installed-pack.json");
		const recordBefore = await readFile(recordPath, "utf8");

		const repeated = await runCli(project, ["detach", "--yes"]);
		const update = await runCli(project, ["update", "--yes"]);

		expect(repeated.exitCode).toBe(0);
		expect(repeated.stdout).toContain("already detached");
		expect(await readFile(recordPath, "utf8")).toBe(recordBefore);
		expect(update.exitCode).toBe(1);
		expect(update.stderr).toContain(
			"Managed update refused because this is a Detached Pack",
		);
		expect(await readFile(tokensPath, "utf8")).toBe("Builder customization\n");
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
		expect(result.stdout).toContain("tokens.css: modified");
		expect(await readFile(tokensPath, "utf8")).toBe("Builder customization\n");
		const status = await runCli(project, ["status"]);
		expect(status.stdout).toContain("Managed state: managed");
		expect(status.stdout).toContain("Pack Release: 1.0.0");
	});

	test("reports a damaged managed manifest while preserving status identity", async () => {
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
		expect(status.stdout).toContain("Managed state: managed");
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

	test("rolls back a resource modified inside the update commit window", async () => {
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

		const result = await modifyUpdateDuringCommit(project, environment);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("changed during update commit");
		expect(
			await readFile(
				path.join(project, ".agentkogei/foundation/tokens.css"),
				"utf8",
			),
		).toBe("Late Builder customization\n");
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
