import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { designContractFileName } from "./design-contract";
import {
	type PackEvaluationRecord,
	packEvaluationFileName,
	packEvaluationRecordSchema,
} from "./pack-evaluation";
import { hasHiddenDocumentControl } from "./text-safety";

export type PackValidationResult =
	| {
			ok: true;
			pack: string;
			version: string;
			designContractBytes: number;
			evidenceFilesValidated: number;
	  }
	| { ok: false; errors: string[] };

export type PackValidationOptions = {
	publishedReleaseDirectory?: string;
};

async function listFiles(directory: string, prefix = ""): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const relativePath = path.posix.join(prefix, entry.name);
			if (entry.isDirectory()) {
				return listFiles(path.join(directory, entry.name), relativePath);
			}
			return [relativePath];
		}),
	);
	return files.flat();
}

/**
 * The MVP stack every first-party Design Contract targets directly. A release
 * that widens or narrows it has not been evaluated for the stack the Official
 * Catalog promises.
 */
const evaluatedStack = {
	frameworks: ["react", "nextjs"],
	react: ">=18 <20",
	nextjs: ">=15 <17",
	tailwind: ">=4 <5",
	ui: "shadcn/ui",
} as const;

const requiredScreens = [
	"marketing",
	"authentication",
	"onboarding",
	"dashboard",
	"table",
	"form",
	"settings",
	"states",
];
const requiredChecks = [
	"structure",
	"accessibility",
	"responsive overflow",
	"color contrast",
];

function validateReleaseRules(record: PackEvaluationRecord) {
	const errors: string[] = [];
	const { compatibility } = record;

	if (
		!evaluatedStack.frameworks.every((framework) =>
			compatibility.frameworks.includes(framework),
		) ||
		compatibility.react !== evaluatedStack.react ||
		compatibility.nextjs !== evaluatedStack.nextjs ||
		compatibility.tailwind !== evaluatedStack.tailwind ||
		compatibility.ui !== evaluatedStack.ui
	) {
		errors.push(
			"MVP compatibility requires React / Next.js, Tailwind CSS v4, and shadcn/ui",
		);
	}

	if (record.changelog.breaking && !record.changelog.migrationNotes) {
		errors.push("major or breaking releases require migration notes");
	}

	if (
		!record.provenance.some((entry) => entry.license === record.license.spdx)
	) {
		errors.push(
			`provenance does not account for the Pack License: ${record.license.spdx}`,
		);
	}

	for (const screen of requiredScreens) {
		if (!record.evaluation.screens.includes(screen)) {
			errors.push(`evaluation is missing required screen: ${screen}`);
		}
	}
	if (new Set(record.evaluation.screens).size !== requiredScreens.length) {
		errors.push("evaluation screens must be unique and complete");
	}
	for (const viewport of ["1440x900", "390x844"]) {
		if (!record.evaluation.viewports.includes(viewport)) {
			errors.push(`evaluation is missing required viewport: ${viewport}`);
		}
	}
	if (
		!record.evaluation.colorSchemes.includes("light") ||
		!record.evaluation.colorSchemes.includes("dark") ||
		new Set(record.evaluation.colorSchemes).size !== 2
	) {
		errors.push("evaluation must cover both light and dark color schemes");
	}
	for (const check of requiredChecks) {
		if (!record.evaluation.automatedChecks.includes(check)) {
			errors.push(`evaluation is missing automated check: ${check}`);
		}
	}

	return errors;
}

/**
 * A Pack Release publishes one document and the evidence Pack Evaluation rests
 * on. Anything else in the directory would be a resource a Project never
 * receives, which is also how a script or hook would arrive.
 */
async function validateReleaseContents(
	rootDirectory: string,
	record: PackEvaluationRecord,
) {
	const errors: string[] = [];
	const published = new Set([
		designContractFileName,
		packEvaluationFileName,
		...record.evaluation.evidence,
	]);
	const present = await listFiles(rootDirectory);

	for (const file of present) {
		if (!published.has(file)) {
			errors.push(`unpublished file: ${file}`);
		}
	}
	for (const file of published) {
		if (!present.includes(file)) {
			errors.push(`published file is missing: ${file}`);
			continue;
		}
		if ((await lstat(path.join(rootDirectory, file))).isSymbolicLink()) {
			errors.push(`symbolic link is prohibited: ${file}`);
		}
	}
	return errors;
}

/**
 * What a Design Contract may present as a fenced block. Everything a Pack
 * Release declares is a definition an implementation reads — semantic tokens
 * and meaningful graphics — so a block in any other language would be something
 * the document is asking to have run.
 */
const inertFenceLanguages = new Set(["", "css", "svg"]);

function executableFenceLanguages(markdown: string) {
	const languages = new Set<string>();
	let open = false;
	for (const line of markdown.split("\n")) {
		if (!line.startsWith("```")) continue;
		// Only the fence that opens a block names its language; the one that
		// closes it is bare, and would otherwise read as an unlabelled block.
		open = !open;
		if (!open) continue;
		const language = line.slice(3).trim().toLowerCase();
		if (!inertFenceLanguages.has(language)) {
			languages.add(language);
		}
	}
	return [...languages];
}

/**
 * A Project receives the Design Contract and nothing else, so the document must
 * carry its own provenance, must read as inert direction rather than as
 * something to run, and must not send an AI coding agent looking for a release
 * resource that was never installed.
 */
function validateDesignContract(
	record: PackEvaluationRecord,
	contract: Buffer,
) {
	const errors: string[] = [];
	const digest = createHash("sha256").update(contract).digest("hex");
	if (digest !== record.designContract.sha256) {
		errors.push(`hash mismatch for ${designContractFileName}`);
	}

	let markdown: string;
	try {
		markdown = new TextDecoder("utf-8", { fatal: true }).decode(contract);
	} catch {
		errors.push(`${designContractFileName} is not valid UTF-8 text`);
		return errors;
	}
	if (markdown.trim().length === 0) {
		errors.push(`${designContractFileName} carries no direction`);
	}
	if (hasHiddenDocumentControl(markdown)) {
		errors.push(`${designContractFileName} contains hidden control characters`);
	}
	for (const language of executableFenceLanguages(markdown)) {
		errors.push(
			`${designContractFileName} presents an executable ${language} block`,
		);
	}
	// ADR 0009: provenance reaches a Project as human-readable text in the
	// Design Contract, because a Project receives no other file to carry it.
	for (const [fact, value] of [
		["Design Pack", record.name],
		["Pack Release", record.release.version],
		["Pack License", record.license.name],
		["attribution", record.license.attribution],
	] as const) {
		if (!markdown.includes(value)) {
			errors.push(`${designContractFileName} does not state its ${fact}`);
		}
	}
	for (const withheld of [
		packEvaluationFileName,
		...record.evaluation.evidence,
	]) {
		if (markdown.includes(withheld)) {
			errors.push(`${designContractFileName} still depends on ${withheld}`);
		}
	}
	return errors;
}

/**
 * A Pack Release is immutable, so republishing the same version must reproduce
 * both the evaluated document and the record of what was evaluated.
 */
async function validateAgainstPublishedRelease(
	publishedReleaseDirectory: string,
	release: { record: PackEvaluationRecord; contents: string; contract: Buffer },
) {
	try {
		const publishedContents = await readFile(
			path.join(publishedReleaseDirectory, packEvaluationFileName),
			"utf8",
		);
		const published = packEvaluationRecordSchema.parse(
			JSON.parse(publishedContents),
		);
		if (
			published.id !== release.record.id ||
			published.release.version !== release.record.release.version
		) {
			return [];
		}
		const publishedContract = await readFile(
			path.join(publishedReleaseDirectory, designContractFileName),
		);
		return publishedContents === release.contents &&
			publishedContract.equals(release.contract)
			? []
			: [
					`immutable Pack Release ${release.record.id}@${release.record.release.version} differs from the published snapshot`,
				];
	} catch {
		return ["published release metadata is missing or invalid"];
	}
}

/**
 * Pack Evaluation as the Official Catalog runs it before a Pack Release becomes
 * a Published Pack. It is internal product tooling for first-party releases
 * rather than an author SDK, so it validates a release directory in this
 * repository rather than an arbitrary published artifact.
 */
export async function validatePackRelease(
	rootDirectory: string,
	options: PackValidationOptions = {},
): Promise<PackValidationResult> {
	const errors: string[] = [];
	let recordContents: string;
	let source: unknown;

	try {
		recordContents = await readFile(
			path.join(rootDirectory, packEvaluationFileName),
			"utf8",
		);
		source = JSON.parse(recordContents);
	} catch {
		return {
			ok: false,
			errors: ["Pack Evaluation record is missing or invalid JSON"],
		};
	}

	const parsed = packEvaluationRecordSchema.safeParse(source);
	if (!parsed.success) {
		return {
			ok: false,
			errors: parsed.error.issues.map(
				(issue) =>
					`${issue.path.join(".") || "pack evaluation"}: ${issue.message}`,
			),
		};
	}

	const record = parsed.data;
	errors.push(...validateReleaseRules(record));
	errors.push(...(await validateReleaseContents(rootDirectory, record)));

	let contract: Buffer;
	try {
		contract = await readFile(path.join(rootDirectory, designContractFileName));
	} catch {
		return { ok: false, errors: [...errors, "Design Contract is missing"] };
	}
	errors.push(...validateDesignContract(record, contract));

	if (options.publishedReleaseDirectory) {
		errors.push(
			...(await validateAgainstPublishedRelease(
				options.publishedReleaseDirectory,
				{ record, contents: recordContents, contract },
			)),
		);
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return {
		ok: true,
		pack: record.id,
		version: record.release.version,
		designContractBytes: contract.byteLength,
		evidenceFilesValidated: record.evaluation.evidence.length,
	};
}
