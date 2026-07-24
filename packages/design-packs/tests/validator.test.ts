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
	publishedPacks,
} from "../src/index";

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

async function readEvaluationRecord(rootDirectory: string) {
	return JSON.parse(
		await readFile(path.join(rootDirectory, "pack-evaluation.json"), "utf8"),
	) as Record<string, unknown>;
}

async function writeEvaluationRecord(
	rootDirectory: string,
	record: Record<string, unknown>,
) {
	await writeFile(
		path.join(rootDirectory, "pack-evaluation.json"),
		`${JSON.stringify(record, null, "\t")}\n`,
	);
}

/** Applies one mutation to a copied release and evaluates the result. */
async function evaluateMutatedRelease(
	mutate: (record: Record<string, unknown>) => void,
) {
	const rootDirectory = await copyFoundationFixture();
	const record = await readEvaluationRecord(rootDirectory);
	mutate(record);
	await writeEvaluationRecord(rootDirectory, record);
	const result = await runValidator(rootDirectory);
	return result.ok ? "" : result.errors.join(" ");
}

/**
 * Rewrites a copied release's Design Contract and re-pins its digest, so what
 * the evaluation catches is the change to the document rather than the
 * substitution that carried it.
 */
async function evaluateRewrittenDesignContract(
	rewrite: (markdown: string) => string,
) {
	const rootDirectory = await copyFoundationFixture();
	const contractPath = path.join(rootDirectory, "DESIGN.md");
	const markdown = rewrite(await readFile(contractPath, "utf8"));
	await writeFile(contractPath, markdown);
	const record = await readEvaluationRecord(rootDirectory);
	(record.designContract as Record<string, unknown>).sha256 =
		new Bun.CryptoHasher("sha256").update(markdown).digest("hex");
	await writeEvaluationRecord(rootDirectory, record);
	const result = await runValidator(rootDirectory);
	return result.ok ? "" : result.errors.join(" ");
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Pack Release publication validation", () => {
	// Every Pack Release stays independently installable through the same
	// compatibility and safety gate, so Pack Evaluation covers each published
	// release rather than only the current one.
	for (const pack of publishedPacks) {
		for (const version of pack.versions) {
			test(`accepts the published ${pack.id} Open Design Pack Release ${version}`, async () => {
				const releaseDirectory = pack.directoryFor(version);
				const record = (await readEvaluationRecord(
					releaseDirectory,
				)) as unknown as { evaluation: { evidence: string[] } };
				const contract = await readFile(
					path.join(releaseDirectory, "DESIGN.md"),
				);

				const result = await runValidator(releaseDirectory);

				expect(result).toEqual({
					ok: true,
					pack: pack.id,
					version,
					designContractBytes: contract.byteLength,
					evidenceFilesValidated: record.evaluation.evidence.length,
				});
			});
		}
	}

	const invalidRecordCases = [
		{
			name: "incomplete",
			mutate(record: Record<string, unknown>) {
				Reflect.deleteProperty(record, "evaluation");
			},
			error: "evaluation",
		},
		{
			name: "executable",
			mutate(record: Record<string, unknown>) {
				record.hooks = { postinstall: "node install.js" };
			},
			error: "hooks",
		},
	] as const;

	for (const fixture of invalidRecordCases) {
		test(`rejects a representative ${fixture.name} fixture`, async () => {
			expect(await evaluateMutatedRelease(fixture.mutate)).toContain(
				fixture.error,
			);
		});
	}

	test("rejects an evaluation evidence path that escapes the Pack Release", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			const evaluation = record.evaluation as Record<string, unknown>;
			evaluation.evidence = ["../report.json"];
		});

		expect(errors).toContain("safe relative path");
	});

	test("rejects an unpublished release resource", async () => {
		const rootDirectory = await copyFoundationFixture();
		await writeFile(
			path.join(rootDirectory, "components.md"),
			"a resource no Project receives\n",
		);

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain(
				"unpublished file: components.md",
			);
		}
	});

	test("rejects declared evaluation evidence that is not present", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			const evaluation = record.evaluation as Record<string, unknown>;
			evaluation.evidence = ["evaluation/missing.json"];
		});

		expect(errors).toContain(
			"published file is missing: evaluation/missing.json",
		);
	});

	test("rejects a substituted Design Contract", async () => {
		const rootDirectory = await copyFoundationFixture();
		await writeFile(path.join(rootDirectory, "DESIGN.md"), "substituted\n");

		const result = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("hash mismatch for DESIGN.md");
		}
	});

	test("rejects a Design Contract that hides direction in control characters", async () => {
		expect(
			await evaluateRewrittenDesignContract((markdown) => `${markdown}‮EXTRA\n`),
		).toContain("hidden control characters");
	});

	test("rejects a Design Contract that still points at publication evidence", async () => {
		expect(
			await evaluateRewrittenDesignContract(
				(markdown) => `${markdown}\nSee evaluation/report.json.\n`,
			),
		).toContain("DESIGN.md still depends on evaluation/report.json");
	});

	// A Project receives one inert document. Direction it can only follow by
	// running something is the shape the retired executable-hook schema and
	// dependency-setup guidance used to be screened for.
	for (const executable of [
		{
			language: "sh",
			block: "```sh\nnpm install @agentkogei/foundation\n```",
		},
		{ language: "bash", block: "```bash\n./setup.sh\n```" },
		{ language: "js", block: "```js\nrequire('node:child_process')\n```" },
	]) {
		test(`rejects a Design Contract presenting an executable ${executable.language} block`, async () => {
			expect(
				await evaluateRewrittenDesignContract(
					(markdown) => `${markdown}\n## Setup\n\n${executable.block}\n`,
				),
			).toContain(
				`DESIGN.md presents an executable ${executable.language} block`,
			);
		});
	}

	test("accepts the token and graphic blocks a Design Contract is made of", async () => {
		expect(
			await evaluateRewrittenDesignContract(
				(markdown) =>
					`${markdown}\n## Hero graphic\n\n\`\`\`svg\n<svg role="img"><title>Hero</title></svg>\n\`\`\`\n`,
			),
		).toBe("");
	});

	test("rejects a symlinked Design Contract", async () => {
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
		const errors = await evaluateMutatedRelease((record) => {
			(record.release as Record<string, unknown>).version = "01.0.0";
		});

		expect(errors).toContain("release.version");
	});

	test("rejects a compatibility range that also admits Tailwind CSS v3", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			(record.compatibility as Record<string, unknown>).tailwind = ">=3 <5";
		});

		expect(errors).toContain("MVP compatibility");
	});

	test("rejects incompatible React and Next.js ranges", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			const compatibility = record.compatibility as Record<string, unknown>;
			compatibility.react = ">=1";
			compatibility.nextjs = ">=1";
		});

		expect(errors).toContain("MVP compatibility");
	});

	test("rejects a user interface library outside the evaluated stack", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			(record.compatibility as Record<string, unknown>).ui = "radix";
		});

		expect(errors).toContain("compatibility.ui");
	});

	test("rejects a breaking release with no migration notes", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			const changelog = record.changelog as Record<string, unknown>;
			changelog.breaking = true;
			changelog.migrationNotes = null;
		});

		expect(errors).toContain("migration notes");
	});

	test("rejects fabricated or incomplete evaluation coverage", async () => {
		const errors = await evaluateMutatedRelease((record) => {
			const evaluation = record.evaluation as Record<string, unknown>;
			evaluation.screens = Array.from({ length: 8 }, () => "placeholder");
			evaluation.viewports = ["800x600", "1024x768"];
			evaluation.colorSchemes = ["light", "light"];
			evaluation.automatedChecks = ["passed"];
		});

		expect(errors).toContain("required screen");
		expect(errors).toContain("required viewport");
		expect(errors).toContain("both light and dark");
		expect(errors).toContain("automated check");
	});

	test("rejects changed bytes under an already-published Pack Release", async () => {
		const rootDirectory = await copyFoundationFixture();
		const record = await readEvaluationRecord(rootDirectory);
		const changelog = record.changelog as Record<string, unknown>;
		changelog.summary = "Quietly revised after publication.";
		await writeEvaluationRecord(rootDirectory, record);

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
