import { afterEach, describe, expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
	designSystemEvaluationFileName,
	foundationReleaseDirectoryFor,
	generateOfficialCatalogArtifacts,
} from "../src/index";

const temporaryDirectories: string[] = [];

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Official Catalog generation", () => {
	test("generates public metadata and exact Design Contract delivery from releases", async () => {
		const releasesDirectory = await mkdtemp(
			path.join(tmpdir(), "agentkogei-catalog-generation-"),
		);
		temporaryDirectories.push(releasesDirectory);
		const releaseDirectory = path.join(
			releasesDirectory,
			"foundation",
			"1.0.0",
		);
		await mkdir(path.dirname(releaseDirectory), { recursive: true });
		await cp(foundationReleaseDirectoryFor("1.0.0"), releaseDirectory, {
			recursive: true,
		});

		const artifacts = await generateOfficialCatalogArtifacts(releasesDirectory);
		const metadata = JSON.parse(
			await readFile(
				path.join(releaseDirectory, designSystemEvaluationFileName),
				"utf8",
			),
		);
		const markdown = await readFile(
			path.join(releaseDirectory, "DESIGN.md"),
			"utf8",
		);

		expect(artifacts.catalog).toEqual({
			schemaVersion: "1.0",
			designSystems: [
				{
					id: "foundation",
					name: "Foundation",
					currentRelease: "1.0.0",
					preview: metadata.preview,
					compatibility: metadata.compatibility,
					evaluation: metadata.evaluation,
					releases: [
						{
							version: "1.0.0",
							publishedAt: "2026-07-18",
							changelog: metadata.changelog,
						},
					],
				},
			],
		});
		expect(artifacts.designContracts).toEqual({
			foundation: {
				currentRelease: "1.0.0",
				releases: {
					"1.0.0": {
						identity: "foundation",
						designSystem: "Foundation",
						designSystemRelease: "1.0.0",
						markdown,
					},
				},
			},
		});
	});
});
