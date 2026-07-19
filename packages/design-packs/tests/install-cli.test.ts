import { afterEach, describe, expect, test } from "bun:test";
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
import { pathToFileURL } from "node:url";

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
	await writeFile(path.join(itemDirectory, "1.0.0.json"), JSON.stringify(item));
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
