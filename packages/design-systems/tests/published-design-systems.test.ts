import { afterEach, describe, expect, test } from "bun:test";
import {
	cp,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	designSystemEvaluationFileName,
	designSystemReleaseVersionSchema,
	discoverPublishedDesignSystems,
	publishedDesignSystems,
} from "../src/index";
import { publishedReleaseDirectory } from "./support/published-release";

const temporaryDirectories: string[] = [];

async function temporaryReleaseRoot() {
	const rootDirectory = await mkdtemp(
		path.join(tmpdir(), "agentkogei-published-releases-"),
	);
	temporaryDirectories.push(rootDirectory);
	return rootDirectory;
}

async function copyRelease(
	rootDirectory: string,
	identity: string,
	version: string,
) {
	const releaseDirectory = path.join(rootDirectory, identity, version);
	await mkdir(path.dirname(releaseDirectory), { recursive: true });
	await cp(publishedReleaseDirectory("foundation", "1.0"), releaseDirectory, {
		recursive: true,
	});
	const metadataPath = path.join(
		releaseDirectory,
		designSystemEvaluationFileName,
	);
	const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
	metadata.id = identity;
	metadata.designSystem = identity.replace(
		/(^|-)([a-z])/g,
		(_match: string, separator: string, letter: string) =>
			`${separator ? " " : ""}${letter.toUpperCase()}`,
	);
	metadata.designSystemRelease.version = version;
	metadata.preview.route = `/design-systems/${identity}`;
	await writeFile(metadataPath, `${JSON.stringify(metadata, null, "\t")}\n`);
	return releaseDirectory;
}

async function mutateMetadata(
	releaseDirectory: string,
	mutate: (metadata: Record<string, unknown>) => void,
) {
	const metadataPath = path.join(
		releaseDirectory,
		designSystemEvaluationFileName,
	);
	const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
	mutate(metadata);
	await writeFile(metadataPath, `${JSON.stringify(metadata, null, "\t")}\n`);
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Published Design System discovery", () => {
	test("discovers every bundled identity directory without fixed membership", async () => {
		const entries = await readdir(
			path.resolve(import.meta.dirname, "../releases"),
			{ withFileTypes: true },
		);
		const identityDirectories = entries
			.filter((entry) => entry.isDirectory())
			.map((entry) => entry.name)
			.sort();

		expect(publishedDesignSystems.map(({ id }) => id).sort()).toEqual(
			identityDirectories,
		);
	});

	test("discovers identities and selects the current Design System Release", async () => {
		const rootDirectory = await temporaryReleaseRoot();
		await copyRelease(rootDirectory, "tracer", "1.9");
		await copyRelease(rootDirectory, "tracer", "1.10");
		await copyRelease(rootDirectory, "second-system", "2.0");

		const discovered = await discoverPublishedDesignSystems(rootDirectory);

		expect(discovered.map(({ id }) => id)).toEqual(["second-system", "tracer"]);
		expect(discovered[1]?.versions).toEqual(["1.9", "1.10"]);
		expect(discovered[1]?.currentRelease).toBe("1.10");
		expect(discovered[1]?.directoryFor("1.9")).toBe(
			path.join(rootDirectory, "tracer", "1.9"),
		);
	});

	test("selects the current Design System Release without losing version precision", async () => {
		const rootDirectory = await temporaryReleaseRoot();
		const lowerVersion = "999999999999999999999999999999.0";
		const higherVersion = "1000000000000000000000000000000.0";
		await copyRelease(rootDirectory, "tracer", lowerVersion);
		await copyRelease(rootDirectory, "tracer", higherVersion);

		const [designSystem] = await discoverPublishedDesignSystems(rootDirectory);

		expect(designSystem?.versions).toEqual([lowerVersion, higherVersion]);
		expect(designSystem?.currentRelease).toBe(higherVersion);
	});

	test("accepts only canonical two part Design System Release identities", () => {
		expect(designSystemReleaseVersionSchema.safeParse("1.0").success).toBe(
			true,
		);
		for (const version of ["1", "1.0.0", "01.0", "1.01", "v1.0"]) {
			expect(
				designSystemReleaseVersionSchema.safeParse(version).success,
				version,
			).toBe(false);
		}
	});

	test("rejects a public route that does not match the discovered identity", async () => {
		const rootDirectory = await temporaryReleaseRoot();
		const releaseDirectory = await copyRelease(rootDirectory, "tracer", "1.0");
		await mutateMetadata(releaseDirectory, (metadata) => {
			(metadata.preview as Record<string, unknown>).route =
				"/design-systems/someone-else";
		});

		expect(discoverPublishedDesignSystems(rootDirectory)).rejects.toThrow(
			"preview route /design-systems/someone-else does not match /design-systems/tracer",
		);
	});

	test("rejects duplicate identities from different identity directories", async () => {
		const rootDirectory = await temporaryReleaseRoot();
		await copyRelease(rootDirectory, "first", "1.0");
		const duplicateDirectory = await copyRelease(
			rootDirectory,
			"second",
			"1.0",
		);
		await mutateMetadata(duplicateDirectory, (metadata) => {
			metadata.id = "first";
		});

		expect(discoverPublishedDesignSystems(rootDirectory)).rejects.toThrow(
			"duplicate published identity in first and second",
		);
	});

	const invalidReleaseCases = [
		{
			name: "missing evidence",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					(metadata.evaluation as Record<string, unknown>).evidence = [
						"evaluation/missing.json",
					];
				});
			},
			error: "published file is missing: evaluation/missing.json",
		},
		{
			name: "failed evaluation",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					(metadata.evaluation as Record<string, unknown>).status = "failed";
				});
			},
			error: "evaluation.status: Invalid input",
		},
		{
			name: "failed review",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const evaluation = metadata.evaluation as Record<string, unknown>;
					(evaluation.humanReview as Record<string, unknown>).status = "failed";
				});
			},
			error: "evaluation.humanReview.status: Invalid input",
		},
		{
			name: "digest mismatch",
			mutate: async (releaseDirectory: string) => {
				await writeFile(
					path.join(releaseDirectory, "DESIGN.md"),
					"changed after evaluation\n",
				);
			},
			error: "hash mismatch for DESIGN.md",
		},
		{
			name: "unsupported preview geometry",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const preview = metadata.preview as Record<string, unknown>;
					(preview.geometry as Record<string, unknown>).radius = "blob";
				});
			},
			error: "preview.geometry.radius",
		},
		{
			name: "unsupported Design System Mark recipe",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const previewShell = metadata.previewShell as Record<string, unknown>;
					(previewShell.mark as Record<string, unknown>).recipe =
						"borrowed-logo";
				});
			},
			error: "previewShell.mark.recipe",
		},
		{
			name: "unsupported Preview typography choice",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const previewShell = metadata.previewShell as Record<string, unknown>;
					(previewShell.typography as Record<string, unknown>).display =
						"runtime-vendor-font";
				});
			},
			error: "previewShell.typography.display",
		},
		{
			name: "unsupported Preview composition",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const previewShell = metadata.previewShell as Record<string, unknown>;
					previewShell.composition = "identity-specific-page";
				});
			},
			error: "previewShell.composition",
		},
		{
			name: "unsupported Preview shell theme",
			mutate: async (releaseDirectory: string) => {
				await mutateMetadata(releaseDirectory, (metadata) => {
					const previewShell = metadata.previewShell as Record<string, unknown>;
					const theme = previewShell.theme as Record<string, unknown>;
					(theme.geometry as Record<string, unknown>).radius = "blob";
				});
			},
			error: "previewShell.theme.geometry.radius",
		},
		{
			name: "unexpected release file",
			mutate: async (releaseDirectory: string) => {
				await writeFile(path.join(releaseDirectory, "extra.txt"), "surprise\n");
			},
			error: "unpublished file: extra.txt",
		},
	] as const;

	for (const invalidCase of invalidReleaseCases) {
		test(`rejects ${invalidCase.name}`, async () => {
			const rootDirectory = await temporaryReleaseRoot();
			const releaseDirectory = await copyRelease(
				rootDirectory,
				"tracer",
				"1.0",
			);
			await invalidCase.mutate(releaseDirectory);

			expect(discoverPublishedDesignSystems(rootDirectory)).rejects.toThrow(
				invalidCase.error,
			);
		});
	}

	test("rejects identities with an invalid version and no valid release", async () => {
		const rootDirectory = await temporaryReleaseRoot();
		await copyRelease(rootDirectory, "tracer", "not-semver");

		const discovery = discoverPublishedDesignSystems(rootDirectory);
		await expect(discovery).rejects.toThrow(
			"tracer/not-semver: invalid Design System Release directory name",
		);
		await expect(discovery).rejects.toThrow(
			"tracer: no valid Design System Release",
		);
	});
});
