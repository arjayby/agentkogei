#!/usr/bin/env bun

import {
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readFile,
	rename,
	rm,
} from "node:fs/promises";
import path from "node:path";
import {
	type DesignSystemAdditionReport,
	designSystemAdditionReportSchema,
} from "../../../../packages/design-systems/src/design-system-addition";
import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "../../../../packages/design-systems/src/design-system-evaluation";
import { discoverPublishedDesignSystems } from "../../../../packages/design-systems/src/published-design-systems";
import { validateDesignSystemRelease } from "../../../../packages/design-systems/src/validator";

function option(arguments_: string[], name: string) {
	const index = arguments_.indexOf(name);
	return index === -1 ? undefined : arguments_[index + 1];
}

function fail(errors: string[]): never {
	console.log(JSON.stringify({ ok: false, errors }));
	process.exit(1);
}

const arguments_ = process.argv.slice(2);
const stagingArgument = arguments_[0];
const releasesArgument = option(arguments_, "--releases");
if (!stagingArgument || !releasesArgument) {
	console.error(
		"Usage: bun finalize-release.ts <staging-release> --releases <releases-directory>",
	);
	process.exit(2);
}

const stagingDirectory = path.resolve(stagingArgument);
const releasesDirectory = path.resolve(releasesArgument);

try {
	const stagingStatistics = await lstat(stagingDirectory);
	if (!stagingStatistics.isDirectory() || stagingStatistics.isSymbolicLink()) {
		fail(["staging release must be a regular directory"]);
	}
} catch {
	fail(["staging release is missing or unreadable"]);
}

const validation = await validateDesignSystemRelease(stagingDirectory);
if (!validation.ok) fail(validation.errors);

let record: unknown;
try {
	record = JSON.parse(
		await readFile(
			path.join(stagingDirectory, designSystemEvaluationFileName),
			"utf8",
		),
	);
} catch {
	fail(["Design System Evaluation record is missing or invalid JSON"]);
}
const parsed = designSystemEvaluationRecordSchema.safeParse(record);
if (!parsed.success) {
	fail(
		parsed.error.issues.map(
			(issue) =>
				`${issue.path.join(".") || "design system evaluation"}: ${issue.message}`,
		),
	);
}
const release = parsed.data;
if (release.schemaVersion !== "5.0") {
	fail(["new Design System Releases must use schemaVersion 5.0"]);
}
if (release.designSystemRelease.version !== "1.0") {
	fail(["a new Design System identity must begin at release 1.0"]);
}

let additionReport: DesignSystemAdditionReport;
try {
	additionReport = designSystemAdditionReportSchema.parse(
		JSON.parse(
			await readFile(
				path.join(stagingDirectory, "evaluation/report.json"),
				"utf8",
			),
		),
	);
} catch (error) {
	if (error && typeof error === "object" && "issues" in error) {
		fail(
			(
				error as {
					issues: Array<{ path: PropertyKey[]; message: string }>;
				}
			).issues.map(
				(issue) =>
					`evaluation/report.json.${issue.path.join(".") || "root"}: ${issue.message}`,
			),
		);
	}
	fail(["evaluation/report.json is missing or invalid"]);
}
if (additionReport.designSystem !== release.designSystem) {
	fail(["evaluation report Design System does not match release metadata"]);
}
if (
	JSON.stringify(additionReport.screens) !==
	JSON.stringify(release.evaluation.screens)
) {
	fail(["evaluation report screens do not match release metadata"]);
}

await mkdir(releasesDirectory, { recursive: true });
const published = await discoverPublishedDesignSystems(releasesDirectory);
const normalizedName = release.designSystem
	.normalize("NFKC")
	.trim()
	.toLocaleLowerCase("en-US");
const duplicateErrors: string[] = [];
if (published.some(({ id }) => id === release.id)) {
	duplicateErrors.push(`identity is already published: ${release.id}`);
}
if (
	published.some(({ releases }) =>
		releases.some(
			({ metadata }) =>
				metadata.designSystem
					.normalize("NFKC")
					.trim()
					.toLocaleLowerCase("en-US") === normalizedName,
		),
	)
) {
	duplicateErrors.push(
		`Design System name is already published: ${release.designSystem}`,
	);
}
if (duplicateErrors.length > 0) fail(duplicateErrors);

const targetDirectory = path.join(
	releasesDirectory,
	release.id,
	release.designSystemRelease.version,
);
try {
	await lstat(targetDirectory);
	fail([`release target already exists: ${targetDirectory}`]);
} catch (error) {
	if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
		fail([`release target cannot be inspected: ${targetDirectory}`]);
	}
}

const temporaryRoot = await mkdtemp(
	path.join(releasesDirectory, ".add-design-system-"),
);
const temporaryRelease = path.join(
	temporaryRoot,
	release.id,
	release.designSystemRelease.version,
);
try {
	await mkdir(path.dirname(temporaryRelease), { recursive: true });
	await cp(stagingDirectory, temporaryRelease, {
		recursive: true,
		errorOnExist: true,
	});
	const copiedValidation = await validateDesignSystemRelease(temporaryRelease);
	if (!copiedValidation.ok) fail(copiedValidation.errors);
	await mkdir(path.dirname(targetDirectory), { recursive: true });
	await rename(temporaryRelease, targetDirectory);
} finally {
	await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(
	JSON.stringify({
		ok: true,
		identity: release.id,
		designSystem: release.designSystem,
		version: release.designSystemRelease.version,
		releaseDirectory: targetDirectory,
	}),
);
