import { afterEach, describe, expect, test } from "bun:test";
import {
	cp,
	mkdtemp,
	readFile,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	foundationReleaseDirectory,
	type PackValidationResult,
} from "@agentkogei/design-packs";

const validatorCommand = new URL("../src/cli.ts", import.meta.url).pathname;

async function runValidator(
	rootDirectory: string,
	publishedReleaseDirectory?: string,
): Promise<PackValidationResult> {
	const command = [process.execPath, validatorCommand, rootDirectory];
	if (publishedReleaseDirectory) {
		command.push("--published", publishedReleaseDirectory);
	}
	const process_ = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
	const output = await new Response(process_.stdout).text();
	await process_.exited;
	return JSON.parse(output) as PackValidationResult;
}

const temporaryDirectories: string[] = [];

async function copyFoundationFixture() {
	const rootDirectory = await mkdtemp(path.join(tmpdir(), "agentkogei-pack-"));
	temporaryDirectories.push(rootDirectory);
	await cp(foundationReleaseDirectory, rootDirectory, { recursive: true });
	return rootDirectory;
}

async function readManifest(rootDirectory: string) {
	return JSON.parse(
		await readFile(
			path.join(rootDirectory, "agentkogei.manifest.json"),
			"utf8",
		),
	) as Record<string, unknown>;
}

async function writeManifest(
	rootDirectory: string,
	manifest: Record<string, unknown>,
) {
	await writeFile(
		path.join(rootDirectory, "agentkogei.manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
	);
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Pack Release publication validation", () => {
	test("accepts the complete Foundation Open Design Pack", async () => {
		const result = await runValidator(foundationReleaseDirectory);

		expect(result).toEqual({
			ok: true,
			pack: "foundation",
			version: "1.1.0",
			filesValidated: 9,
		});
	});

	const invalidManifestCases = [
		{
			name: "incomplete",
			mutate(manifest: Record<string, unknown>) {
				Reflect.deleteProperty(manifest, "evaluation");
			},
			error: "evaluation",
		},
		{
			name: "incompatible",
			mutate(manifest: Record<string, unknown>) {
				const compatibility = manifest.compatibility as {
					adapters: Array<Record<string, unknown>>;
				};
				compatibility.adapters[0] = {
					...compatibility.adapters[0],
					tailwind: "^3.0.0",
				};
			},
			error: "Tailwind CSS v4",
		},
		{
			name: "unlicensed",
			mutate(manifest: Record<string, unknown>) {
				Reflect.deleteProperty(manifest, "license");
			},
			error: "license",
		},
		{
			name: "unprovenanced",
			mutate(manifest: Record<string, unknown>) {
				manifest.provenance = [];
			},
			error: "provenance",
		},
		{
			name: "executable",
			mutate(manifest: Record<string, unknown>) {
				manifest.hooks = { postinstall: "node install.js" };
			},
			error: "executable",
		},
	] as const;

	for (const fixture of invalidManifestCases) {
		test(`rejects a representative ${fixture.name} fixture`, async () => {
			const rootDirectory = await copyFoundationFixture();
			const manifest = await readManifest(rootDirectory);
			fixture.mutate(manifest);
			await writeManifest(rootDirectory, manifest);

			const result = await runValidator(rootDirectory);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.errors.join(" ")).toContain(fixture.error);
			}
		});
	}

	test("rejects an unsafe traversal target", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const files = manifest.files as Array<Record<string, unknown>>;
		files[0] = { ...files[0], target: "../DESIGN.md" };
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("safe relative target");
		}
	});

	test("rejects an absolute Windows target", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const files = manifest.files as Array<Record<string, unknown>>;
		files[0] = { ...files[0], target: "C:/outside/DESIGN.md" };
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("safe relative target");
		}
	});

	test("rejects duplicate destinations", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const files = manifest.files as Array<Record<string, unknown>>;
		files[1] = { ...files[1], target: files[0]?.target };
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("duplicate target");
		}
	});

	test("rejects undeclared release resources", async () => {
		const rootDirectory = await copyFoundationFixture();
		await writeFile(
			path.join(rootDirectory, "undeclared.md"),
			"not declared\n",
		);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("undeclared file");
		}
	});

	test("rejects a hash-invalid fixture", async () => {
		const rootDirectory = await copyFoundationFixture();
		await writeFile(path.join(rootDirectory, "DESIGN.md"), "substituted\n");

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("hash mismatch");
		}
	});

	test("rejects a symlinked release resource", async () => {
		const rootDirectory = await copyFoundationFixture();
		const outsideFile = `${rootDirectory}-outside-design.md`;
		await writeFile(outsideFile, "outside the Pack Release\n");
		await rm(path.join(rootDirectory, "DESIGN.md"));
		await symlink(outsideFile, path.join(rootDirectory, "DESIGN.md"));

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("symbolic link");
		}
		await rm(outsideFile, { force: true });
	});

	test("rejects invalid semantic release metadata", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const release = manifest.release as Record<string, unknown>;
		release.version = "01.0.0";
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("release.version");
		}
	});

	test("rejects an adapter range that also admits Tailwind CSS v3", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const compatibility = manifest.compatibility as {
			adapters: Array<Record<string, unknown>>;
		};
		compatibility.adapters[0] = {
			...compatibility.adapters[0],
			tailwind: ">=3 <5",
		};
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("Tailwind CSS v4");
		}
	});

	test("rejects incompatible React and Next.js adapter ranges", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const compatibility = manifest.compatibility as {
			adapters: Array<Record<string, unknown>>;
		};
		compatibility.adapters[0] = {
			...compatibility.adapters[0],
			react: ">=1",
			nextjs: ">=1",
		};
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("MVP compatibility");
		}
	});

	test("rejects required metadata that points to an undeclared resource", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const evaluation = manifest.evaluation as Record<string, unknown>;
		evaluation.evidence = "evaluation/missing.json";
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain(
				"required resource is not declared",
			);
		}
	});

	test("rejects dependency guidance that asks to execute a package manager", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const dependencies = manifest.dependencies as Record<string, unknown>;
		dependencies.setup = ["Run npm install example-package"];
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("non-executable");
		}
	});

	for (const command of [
		"Run npm ci",
		"Run npm exec setup-tool",
		"Run pnpm update",
		"Run yarn set version stable",
		"Run bun build",
		"Run ./setup.sh",
		"Run the setup script",
		"Run pip install package",
		"Run corepack pnpm install",
		"Run make setup",
		"Run powershell setup.ps1",
		"./setup.sh",
		"/bin/sh setup.sh",
		"chmod +x setup.sh && ./setup.sh",
	]) {
		test(`rejects package-manager guidance: ${command}`, async () => {
			const rootDirectory = await copyFoundationFixture();
			const manifest = await readManifest(rootDirectory);
			const dependencies = manifest.dependencies as Record<string, unknown>;
			dependencies.setup = [command];
			await writeManifest(rootDirectory, manifest);

			const result = await runValidator(rootDirectory);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.errors.join(" ")).toContain("non-executable");
			}
		});
	}

	test("rejects fabricated or incomplete evaluation coverage", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const evaluation = manifest.evaluation as Record<string, unknown>;
		evaluation.screens = Array.from({ length: 8 }, () => "placeholder");
		evaluation.viewports = ["800x600", "1024x768"];
		evaluation.colorSchemes = ["light", "light"];
		evaluation.automatedChecks = ["passed"];
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			const errors = result.errors.join(" ");
			expect(errors).toContain("required screen");
			expect(errors).toContain("required viewport");
			expect(errors).toContain("both light and dark");
			expect(errors).toContain("automated check");
		}
	});

	test("rejects changed bytes under an already-published Pack Release", async () => {
		const rootDirectory = await copyFoundationFixture();
		const manifest = await readManifest(rootDirectory);
		const files = manifest.files as Array<Record<string, unknown>>;
		files[0] = { ...files[0], sha256: "a".repeat(64) };
		await writeManifest(rootDirectory, manifest);

		const result = await runValidator(
			rootDirectory,
			foundationReleaseDirectory,
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("immutable Pack Release");
		}
	});

	test("accepts an unchanged published Pack Release", async () => {
		const result = await runValidator(
			foundationReleaseDirectory,
			foundationReleaseDirectory,
		);

		expect(result.ok).toBe(true);
	});
});
