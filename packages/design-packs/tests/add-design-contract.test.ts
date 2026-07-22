import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	applyDesignContractInstallation,
	buildDesignContract,
	foundationReleaseDirectoryFor,
	planDesignContractInstallation,
} from "../src/index";

const cliCommand = new URL("../src/install-cli.ts", import.meta.url).pathname;
const temporaryDirectories: string[] = [];

type CatalogResponse = {
	status?: number;
	body?: string | Uint8Array;
	contentType?: string;
	designPack?: string;
	packRelease?: string;
	packLicense?: string;
};

const contracts = {
	"1.0.0": await buildDesignContract(foundationReleaseDirectoryFor("1.0.0")),
	"1.1.0": await buildDesignContract(foundationReleaseDirectoryFor("1.1.0")),
};

let overrides = new Map<string, CatalogResponse>();

const catalog = Bun.serve({
	port: 0,
	fetch(request) {
		const { pathname } = new URL(request.url);
		const override = overrides.get(pathname);
		if (override) {
			return new Response(override.body ?? "", {
				status: override.status ?? 200,
				headers: {
					"content-type":
						override.contentType ?? "text/markdown; charset=utf-8",
					...(override.designPack
						? { "x-agentkogei-design-pack": override.designPack }
						: {}),
					...(override.packRelease
						? { "x-agentkogei-pack-release": override.packRelease }
						: {}),
					...(override.packLicense
						? { "x-agentkogei-pack-license": override.packLicense }
						: {}),
				},
			});
		}
		const release =
			pathname === "/contracts/foundation"
				? contracts["1.1.0"]
				: pathname === "/contracts/foundation/1.1.0"
					? contracts["1.1.0"]
					: pathname === "/contracts/foundation/1.0.0"
						? contracts["1.0.0"]
						: null;
		if (!release) {
			return new Response("not a Pack Release in the Official Catalog\n", {
				status: 404,
				headers: { "content-type": "text/plain; charset=utf-8" },
			});
		}
		return new Response(release.markdown, {
			headers: {
				"content-type": "text/markdown; charset=utf-8",
				"x-agentkogei-design-pack": release.designPack,
				"x-agentkogei-pack-release": release.packRelease,
				"x-agentkogei-pack-license": release.packLicense,
			},
		});
	},
});

const catalogUrl = `http://localhost:${catalog.port}/contracts/`;

beforeAll(() => {
	overrides = new Map();
});

afterEach(() => {
	overrides.clear();
});

afterAll(async () => {
	await catalog.stop(true);
	await Promise.all(
		temporaryDirectories.map((directory) =>
			rm(directory, { recursive: true, force: true }),
		),
	);
});

async function temporaryProject() {
	const directory = await mkdtemp(path.join(tmpdir(), "agentkogei-add-"));
	temporaryDirectories.push(directory);
	return realpath(directory);
}

async function runAdd(project: string, arguments_: string[]) {
	const process_ = Bun.spawn([process.execPath, cliCommand, ...arguments_], {
		cwd: project,
		env: {
			...process.env,
			AGENTKOGEI_CONTRACT_CATALOG_URL: catalogUrl,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return { exitCode, stdout, stderr };
}

async function projectFile(project: string, name: string) {
	try {
		return await readFile(path.join(project, name), "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

async function projectEntries(project: string) {
	return (
		await Array.fromAsync(new Bun.Glob("**").scan({ cwd: project, dot: true }))
	).sort();
}

describe("agentkogei add", () => {
	test("previews the Installation and writes nothing without consent", async () => {
		const project = await temporaryProject();

		const result = await runAdd(project, ["add", "foundation"]);

		expect(result.exitCode).toBe(2);
		expect(result.stdout).toContain("Foundation 1.1.0 (foundation)");
		expect(result.stdout).toContain(
			"Pack License: Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		);
		expect(result.stdout).toContain(
			`Create ${path.join(project, "DESIGN.md")}`,
		);
		expect(result.stdout).toContain(
			`Create ${path.join(project, "AGENTS.md")}`,
		);
		expect(result.stderr).toContain("not confirmed");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("installs the current Pack Release as one root Design Contract", async () => {
		const project = await temporaryProject();

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode, result.stderr).toBe(0);
		expect(result.stdout).toContain("Added Foundation 1.1.0");
		expect(await projectFile(project, "DESIGN.md")).toBe(
			contracts["1.1.0"].markdown,
		);
		expect(await projectFile(project, "DESIGN.md")).toContain("## Provenance");
		expect(await projectEntries(project)).toEqual(["AGENTS.md", "DESIGN.md"]);
	});

	test("installs an explicitly selected immutable Pack Release", async () => {
		const project = await temporaryProject();

		const result = await runAdd(project, ["add", "foundation@1.0.0", "--yes"]);

		expect(result.exitCode, result.stderr).toBe(0);
		expect(result.stdout).toContain("Added Foundation 1.0.0");
		expect(await projectFile(project, "DESIGN.md")).toBe(
			contracts["1.0.0"].markdown,
		);
	});

	test("points agents at the Design Contract without disturbing their instructions", async () => {
		const project = await temporaryProject();
		const existing =
			"# Project agents\n\nRun `bun test` before every commit.\n";
		await writeFile(path.join(project, "AGENTS.md"), existing);

		const first = await runAdd(project, ["add", "foundation", "--yes"]);
		const afterFirst = await projectFile(project, "AGENTS.md");
		const second = await runAdd(project, [
			"add",
			"foundation@1.0.0",
			"--yes",
			"--force",
		]);
		const afterSecond = await projectFile(project, "AGENTS.md");

		expect(first.exitCode, first.stderr).toBe(0);
		expect(second.exitCode, second.stderr).toBe(0);
		expect(afterFirst).toStartWith(existing);
		expect(afterFirst).toContain("<!-- agentkogei:design-pack:start -->");
		expect(afterFirst).toContain("`DESIGN.md`");
		expect(afterSecond).toBe(afterFirst);
		expect(afterSecond?.match(/agentkogei:design-pack:start/g)).toHaveLength(1);
	});

	test("refuses to replace an existing Design Contract without --force", async () => {
		const project = await temporaryProject();
		const handWritten = "# Our own interface direction\n";
		await writeFile(path.join(project, "DESIGN.md"), handWritten);

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("--force");
		expect(await projectFile(project, "DESIGN.md")).toBe(handWritten);
		expect(await projectFile(project, "AGENTS.md")).toBeNull();
	});

	test("shows the replacement diff and replaces with --yes --force", async () => {
		const project = await temporaryProject();
		await writeFile(
			path.join(project, "DESIGN.md"),
			"# Our own interface direction\n\nKeep every button square.\n",
		);

		const result = await runAdd(project, [
			"add",
			"foundation",
			"--yes",
			"--force",
		]);

		expect(result.exitCode, result.stderr).toBe(0);
		expect(result.stdout).toContain("Replace");
		expect(result.stdout).toContain("-Keep every button square.");
		expect(result.stdout).toContain("+# Foundation Interface System");
		expect(await projectFile(project, "DESIGN.md")).toBe(
			contracts["1.1.0"].markdown,
		);
	});

	test("rejects an unknown Official Catalog identity without touching the Project", async () => {
		const project = await temporaryProject();

		const result = await runAdd(project, ["add", "fondation", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("fondation");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("never installs a non-successful catalog response", async () => {
		const project = await temporaryProject();
		overrides.set("/contracts/foundation", {
			status: 503,
			body: "# Service unavailable\n",
			contentType: "text/markdown; charset=utf-8",
		});

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("503");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("rejects a response that is not valid UTF-8 Markdown", async () => {
		const project = await temporaryProject();
		overrides.set("/contracts/foundation", {
			body: new Uint8Array([0x23, 0x20, 0xff, 0xfe, 0x0a]),
			designPack: "Foundation",
			packRelease: "1.1.0",
			packLicense: "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		});

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("UTF-8");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("rejects a response that is not a Design Contract", async () => {
		const project = await temporaryProject();
		overrides.set("/contracts/foundation", {
			body: '{"name":"foundation","type":"registry:item"}',
			contentType: "application/json",
			designPack: "Foundation",
			packRelease: "1.1.0",
			packLicense: "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		});

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("Markdown");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("rejects a Pack Release that does not match the selected version", async () => {
		const project = await temporaryProject();
		overrides.set("/contracts/foundation/1.0.0", {
			body: contracts["1.1.0"].markdown,
			designPack: "Foundation",
			packRelease: "1.1.0",
			packLicense: "Creative Commons Attribution 4.0 International (CC-BY-4.0)",
		});

		const result = await runAdd(project, ["add", "foundation@1.0.0", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("1.0.0");
		expect(await projectEntries(project)).toEqual([]);
	});

	test("refuses a Project whose agent instructions are already malformed", async () => {
		const project = await temporaryProject();
		const malformed = `# Agents\n\n${"<!-- agentkogei:design-pack:end -->"}\n`;
		await writeFile(path.join(project, "AGENTS.md"), malformed);

		const result = await runAdd(project, ["add", "foundation", "--yes"]);

		expect(result.exitCode).toBe(1);
		expect(result.stdout).toContain("malformed AgentKogei reference");
		expect(await projectFile(project, "AGENTS.md")).toBe(malformed);
		expect(await projectFile(project, "DESIGN.md")).toBeNull();
	});

	test("rejects options that do not belong to the Installation path", async () => {
		const project = await temporaryProject();

		const projectOption = await runAdd(project, [
			"add",
			"foundation",
			"--project",
			project,
			"--yes",
		]);
		const sourceOption = await runAdd(project, [
			"add",
			"foundation",
			"--source",
			"https://example.com/",
			"--yes",
		]);

		expect(projectOption.exitCode).toBe(2);
		expect(sourceOption.exitCode).toBe(2);
		expect(await projectEntries(project)).toEqual([]);
	});
});

describe("Design Contract Installation atomicity", () => {
	async function unwritableAgentsPlan(project: string) {
		const plan = await planDesignContractInstallation({
			identity: "foundation",
			projectDirectory: project,
			officialCatalogUrl: catalogUrl,
		});
		return { ...plan, agentsPath: path.join(project, "absent", "AGENTS.md") };
	}

	test("leaves a Project untouched when the agent reference cannot be written", async () => {
		const project = await temporaryProject();

		await expect(
			applyDesignContractInstallation(await unwritableAgentsPlan(project)),
		).rejects.toThrow();

		expect(await projectEntries(project)).toEqual([]);
	});

	test("restores an existing Design Contract when the Installation fails", async () => {
		const project = await temporaryProject();
		const handWritten = "# Our own interface direction\n";
		await writeFile(path.join(project, "DESIGN.md"), handWritten);

		await expect(
			applyDesignContractInstallation(await unwritableAgentsPlan(project)),
		).rejects.toThrow();

		expect(await projectFile(project, "DESIGN.md")).toBe(handWritten);
		expect(await projectEntries(project)).toEqual(["DESIGN.md"]);
	});

	test("refuses to write when the Project changed after the preview", async () => {
		const project = await temporaryProject();
		const plan = await planDesignContractInstallation({
			identity: "foundation",
			projectDirectory: project,
			officialCatalogUrl: catalogUrl,
		});
		await writeFile(path.join(project, "DESIGN.md"), "# Written meanwhile\n");

		await expect(applyDesignContractInstallation(plan)).rejects.toThrow(
			"Project changed after preview",
		);

		expect(await projectFile(project, "DESIGN.md")).toBe(
			"# Written meanwhile\n",
		);
		expect(await projectEntries(project)).toEqual(["DESIGN.md"]);
	});
});
