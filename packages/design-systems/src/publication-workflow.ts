import { createHash } from "node:crypto";
import {
	access,
	cp,
	lstat,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	realpath,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import {
	candidateDesignContractFileName,
	candidateEvaluationPlanFileName,
	candidateEvaluationPlanSchema,
	candidateMetadataFileName,
	candidateMetadataSchema,
	validateCandidateDesignSystemRelease,
} from "./candidate-design-system";
import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "./design-system-evaluation";
import { validateDesignSystemRelease } from "./validator";

export const publicationWorkflowDirectoryName = ".agentkogei";
export const publicationWorkflowFileName = `${publicationWorkflowDirectoryName}/evaluation.json`;

const pendingEvidenceResultSchema = z
	.object({
		status: z.literal("pending"),
		evidence: z.array(z.never()).length(0),
	})
	.strict();

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const evidenceResultWithIdSchema = z.discriminatedUnion("status", [
	z.object({ id: z.string(), ...pendingEvidenceResultSchema.shape }).strict(),
	z
		.object({
			id: z.string(),
			status: z.enum(["passed", "failed"]),
			evidence: z.array(z.string()).min(1),
			evidenceSha256: z.array(sha256Schema).min(1),
		})
		.strict(),
]);

const humanReviewResultSchema = z.discriminatedUnion("status", [
	pendingEvidenceResultSchema,
	z
		.object({
			status: z.literal("approved"),
			evidence: z.array(z.string()).min(1),
			evidenceSha256: z.array(sha256Schema).min(1),
			reviewedAt: z.iso.datetime(),
			assertions: z.array(z.string()).min(1),
		})
		.strict(),
]);

const requiredScreens = [
	"marketing",
	"authentication",
	"onboarding",
	"dashboard",
	"table",
	"form",
	"settings",
	"states",
] as const;
const requiredAutomatedChecks = [
	"structure",
	"accessibility",
	"responsive-overflow",
	"color-contrast",
] as const;

export const publicationEvaluationSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		status: z.enum(["evaluating", "failed"]),
		candidate: z
			.object({
				id: z.string(),
				designSystem: z.string(),
				version: z.literal("1.0.0"),
				designContractSha256: z.string().regex(/^[a-f0-9]{64}$/),
				candidateMetadataSha256: sha256Schema,
				authoringApprovedAt: z.iso.datetime(),
			})
			.strict(),
		standard: z.literal("WCAG 2.2 Level AA"),
		screens: z.array(z.enum(requiredScreens)).length(8),
		viewports: z.array(z.enum(["1440x900", "390x844"])).length(2),
		colorSchemes: z.array(z.enum(["light", "dark"])).length(2),
		reducedMotion: z.literal(true),
		agentGenerationRuns: z.array(evidenceResultWithIdSchema).min(2),
		automatedChecks: z.array(evidenceResultWithIdSchema).length(4),
		humanReviews: z
			.object({
				visual: humanReviewResultSchema,
				accessibility: humanReviewResultSchema,
				rights: humanReviewResultSchema,
			})
			.strict(),
		publicationApproval: z
			.object({ status: z.literal("pending"), recordedAt: z.null() })
			.strict(),
	})
	.strict()
	.superRefine((state, context) => {
		if (new Set(state.screens).size !== requiredScreens.length) {
			context.addIssue({
				code: "custom",
				path: ["screens"],
				message: "evaluation screens must be unique and complete",
			});
		}
		if (new Set(state.viewports).size !== 2) {
			context.addIssue({
				code: "custom",
				path: ["viewports"],
				message: "evaluation viewports must include desktop and mobile",
			});
		}
		if (new Set(state.colorSchemes).size !== 2) {
			context.addIssue({
				code: "custom",
				path: ["colorSchemes"],
				message: "evaluation color schemes must include light and dark",
			});
		}
		if (
			new Set(state.agentGenerationRuns.map(({ id }) => id)).size !==
			state.agentGenerationRuns.length
		) {
			context.addIssue({
				code: "custom",
				path: ["agentGenerationRuns"],
				message: "agent generation run ids must be unique",
			});
		}
		const automatedCheckIds = new Set(
			state.automatedChecks.map(({ id }) => id),
		);
		if (
			automatedCheckIds.size !== requiredAutomatedChecks.length ||
			!requiredAutomatedChecks.every((id) => automatedCheckIds.has(id))
		) {
			context.addIssue({
				code: "custom",
				path: ["automatedChecks"],
				message: "automated checks must be unique and complete",
			});
		}
	});

export type PublicationWorkflowResult =
	| {
			ok: true;
			identity: string;
			designSystem: string;
			version: "1.0.0";
			evaluationProject: string;
			status: "evaluating";
	  }
	| { ok: false; errors: string[] };

export type EvaluationResultKind = "agent-run" | "automated-check";
export type EvaluationResultStatus = "passed" | "failed";
export type HumanReviewKind = "visual" | "accessibility" | "rights";

const requiredHumanReviewAssertions: Record<
	HumanReviewKind,
	readonly string[]
> = {
	visual: ["faithful-expression"],
	accessibility: [
		"keyboard",
		"focus",
		"semantics",
		"zoom",
		"reflow",
		"reduced-motion",
		"assistive-technology",
	],
	rights: ["originality", "no-proprietary-material", "mit-permission"],
};

export const publicationProposalMetadataSchema =
	designSystemEvaluationRecordSchema
		.pick({ publisher: true, preview: true, changelog: true })
		.extend({ schemaVersion: z.literal("1.0"), publishedAt: z.iso.date() })
		.strict();

async function pathExists(target: string) {
	try {
		await access(target);
		return true;
	} catch {
		return false;
	}
}

function safeEvidencePath(relativePath: string) {
	return (
		!path.isAbsolute(relativePath) &&
		!relativePath.includes("\\") &&
		!relativePath.includes(":") &&
		relativePath
			.split("/")
			.every(
				(segment) => segment !== "" && segment !== "." && segment !== "..",
			) &&
		relativePath !== candidateDesignContractFileName &&
		relativePath !== designSystemEvaluationFileName &&
		relativePath !== "evaluation/report.json" &&
		!relativePath.startsWith(`${publicationWorkflowDirectoryName}/`)
	);
}

async function writeEvaluationState(
	evaluationProject: string,
	state: z.infer<typeof publicationEvaluationSchema>,
) {
	const stateFile = path.join(evaluationProject, publicationWorkflowFileName);
	const temporaryFile = `${stateFile}.${process.pid}.tmp`;
	await writeFile(temporaryFile, `${JSON.stringify(state, null, "\t")}\n`, {
		flag: "wx",
	});
	await rename(temporaryFile, stateFile);
}

async function validateEvidenceFile(
	evaluationProject: string,
	evidence: string,
) {
	if (!safeEvidencePath(evidence))
		return `unsafe evaluation evidence path: ${evidence}`;
	try {
		const evidenceFile = path.join(evaluationProject, evidence);
		const statistics = await lstat(evidenceFile);
		if (!statistics.isFile() || statistics.isSymbolicLink()) throw new Error();
		const [projectRoot, resolvedEvidence] = await Promise.all([
			realpath(evaluationProject),
			realpath(evidenceFile),
		]);
		if (!resolvedEvidence.startsWith(`${projectRoot}${path.sep}`))
			throw new Error();
		return undefined;
	} catch {
		return `evaluation evidence must be an existing regular file: ${evidence}`;
	}
}

async function evidenceDigest(evaluationProject: string, evidence: string) {
	return createHash("sha256")
		.update(await readFile(path.join(evaluationProject, evidence)))
		.digest("hex");
}

async function readEvaluationState(evaluationProject: string) {
	try {
		return {
			state: publicationEvaluationSchema.parse(
				JSON.parse(
					await readFile(
						path.join(evaluationProject, publicationWorkflowFileName),
						"utf8",
					),
				),
			),
		};
	} catch {
		return { error: "evaluation Project state is missing or invalid" };
	}
}

export async function approvePublicationHumanReview(
	evaluationProject: string,
	review: HumanReviewKind,
	reviewedAt: string,
	evidence: string,
	assertions: string[],
): Promise<
	| { ok: true; review: HumanReviewKind; status: "approved" }
	| { ok: false; errors: string[] }
> {
	const loaded = await readEvaluationState(evaluationProject);
	if (!loaded.state) return { ok: false, errors: [loaded.error] };
	const state = loaded.state;
	if (state.status === "failed") {
		return {
			ok: false,
			errors: ["failed evaluation cannot enter human review"],
		};
	}
	if (
		state.agentGenerationRuns.some((result) => result.status !== "passed") ||
		state.automatedChecks.some((result) => result.status !== "passed")
	) {
		return {
			ok: false,
			errors: [
				"every generation run and automated check must pass before human review",
			],
		};
	}
	if (state.humanReviews[review].status !== "pending") {
		return { ok: false, errors: [`${review} review is already approved`] };
	}
	const assertionSet = new Set(assertions);
	const assertionErrors = requiredHumanReviewAssertions[review]
		.filter((assertion) => !assertionSet.has(assertion))
		.map(
			(assertion) =>
				`${review} review is missing required assertion: ${assertion}`,
		);
	if (assertionSet.size !== assertions.length) {
		assertionErrors.push(`${review} review assertions must be unique`);
	}
	for (const assertion of assertionSet) {
		if (!requiredHumanReviewAssertions[review].includes(assertion)) {
			assertionErrors.push(
				`${review} review contains an unsupported assertion: ${assertion}`,
			);
		}
	}
	if (!z.iso.datetime().safeParse(reviewedAt).success) {
		assertionErrors.push(`${review} review timestamp must be ISO 8601 UTC`);
	}
	const evidenceError = await validateEvidenceFile(evaluationProject, evidence);
	if (evidenceError) assertionErrors.push(evidenceError);
	if (assertionErrors.length > 0) return { ok: false, errors: assertionErrors };

	state.humanReviews[review] = {
		status: "approved",
		evidence: [evidence],
		evidenceSha256: [await evidenceDigest(evaluationProject, evidence)],
		reviewedAt,
		assertions: [...requiredHumanReviewAssertions[review]],
	};
	await writeEvaluationState(evaluationProject, state);
	return { ok: true, review, status: "approved" };
}

async function listRelativeFiles(
	directory: string,
	prefix = "",
): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const relativePath = path.posix.join(prefix, entry.name);
			return entry.isDirectory()
				? listRelativeFiles(path.join(directory, entry.name), relativePath)
				: [relativePath];
		}),
	);
	return nested.flat().sort();
}

export async function preparePublicationProposal(
	evaluationProject: string,
	candidateDirectory: string,
	proposalDirectory: string,
	metadataFile: string,
	publishedReleasesDirectory: string,
): Promise<
	| {
			ok: true;
			identity: string;
			version: "1.0.0";
			proposalDirectory: string;
			productionTarget: string;
			publicationApproval: "pending";
			live: false;
			releaseValidated: true;
			launchVerify: "pending";
			proposedFiles: string[];
	  }
	| { ok: false; errors: string[] }
> {
	if (await pathExists(proposalDirectory)) {
		return {
			ok: false,
			errors: [`publication proposal already exists: ${proposalDirectory}`],
		};
	}
	const loaded = await readEvaluationState(evaluationProject);
	if (!loaded.state) return { ok: false, errors: [loaded.error] };
	const state = loaded.state;
	if (state.status === "failed") {
		return {
			ok: false,
			errors: ["failed evaluation cannot prepare a publication proposal"],
		};
	}
	const pending = [
		...state.agentGenerationRuns,
		...state.automatedChecks,
	].filter((result) => result.status !== "passed");
	const pendingReviews = Object.entries(state.humanReviews).filter(
		([, result]) => result.status !== "approved",
	);
	if (pending.length > 0 || pendingReviews.length > 0) {
		return {
			ok: false,
			errors: [
				...pending.map(
					(result) =>
						`evaluation prerequisite is pending or failed: ${result.id}`,
				),
				...pendingReviews.map(
					([review]) => `human review is pending: ${review}`,
				),
			],
		};
	}

	const candidateValidation = await validateCandidateDesignSystemRelease(
		candidateDirectory,
		{ publishedReleasesDirectory },
	);
	if (!candidateValidation.ok) return candidateValidation;
	if (candidateValidation.authoringApproval !== "approved") {
		return { ok: false, errors: ["Authoring Approval is no longer recorded"] };
	}
	const [candidateMetadataContents, contract, proposalMetadataSource] =
		await Promise.all([
			readFile(
				path.join(candidateDirectory, candidateMetadataFileName),
				"utf8",
			),
			readFile(path.join(candidateDirectory, candidateDesignContractFileName)),
			readFile(metadataFile, "utf8").then(
				(contents) => JSON.parse(contents) as unknown,
			),
		]);
	const candidate = candidateMetadataSchema.parse(
		JSON.parse(candidateMetadataContents),
	);
	const proposalMetadata = publicationProposalMetadataSchema.safeParse(
		proposalMetadataSource,
	);
	if (!proposalMetadata.success) {
		return {
			ok: false,
			errors: proposalMetadata.error.issues.map(
				(issue) =>
					`proposal metadata.${issue.path.join(".") || "root"}: ${issue.message}`,
			),
		};
	}
	const digest = createHash("sha256").update(contract).digest("hex");
	if (
		candidate.id !== state.candidate.id ||
		candidate.designSystem !== state.candidate.designSystem ||
		createHash("sha256").update(candidateMetadataContents).digest("hex") !==
			state.candidate.candidateMetadataSha256 ||
		digest !== state.candidate.designContractSha256
	) {
		return {
			ok: false,
			errors: [
				"Candidate Design System Release changed after evaluation began",
			],
		};
	}

	const completedResults = [
		...state.agentGenerationRuns,
		...state.automatedChecks,
		...Object.values(state.humanReviews),
	].filter((result) => result.status !== "pending");
	const evidence = completedResults.flatMap((result) => result.evidence);
	for (const result of completedResults) {
		if (result.evidence.length !== result.evidenceSha256.length) {
			return {
				ok: false,
				errors: ["evaluation evidence digest record is invalid"],
			};
		}
		for (const [index, file] of result.evidence.entries()) {
			const error = await validateEvidenceFile(evaluationProject, file);
			if (error) return { ok: false, errors: [error] };
			if (
				(await evidenceDigest(evaluationProject, file)) !==
				result.evidenceSha256[index]
			) {
				return {
					ok: false,
					errors: [
						`evaluation evidence changed after it was recorded: ${file}`,
					],
				};
			}
		}
	}
	const rawEvidence = [...new Set(evidence)].sort();
	const reportFile = "evaluation/report.json";
	const allEvidence = [reportFile, ...rawEvidence];
	const reviewedAt = Object.values(state.humanReviews)
		.flatMap((review) =>
			review.status === "approved" ? [review.reviewedAt] : [],
		)
		.sort()
		.at(-1);
	if (!reviewedAt) throw new Error("approved reviews have no timestamp");

	const record = designSystemEvaluationRecordSchema.parse({
		schemaVersion: "3.0",
		id: candidate.id,
		designSystem: candidate.designSystem,
		publisher: proposalMetadata.data.publisher,
		designSystemRelease: {
			version: candidate.designSystemRelease.version,
			publishedAt: proposalMetadata.data.publishedAt,
			immutable: true,
		},
		designContract: { sha256: digest },
		compatibility: {
			frameworks: ["react", "nextjs"],
			react: ">=18 <20",
			nextjs: ">=15 <17",
			tailwind: ">=4 <5",
			ui: "shadcn/ui",
		},
		evaluation: {
			status: "passed",
			standard: state.standard,
			screens: state.screens,
			viewports: state.viewports,
			colorSchemes: state.colorSchemes,
			reducedMotion: state.reducedMotion,
			agentGenerationRuns: state.agentGenerationRuns.length,
			automatedChecks: state.automatedChecks.map(({ id }) =>
				id.replaceAll("-", " "),
			),
			humanReview: {
				status: "passed",
				reviewedAt: reviewedAt.slice(0, 10),
				rightsReview: "passed",
			},
			evidence: allEvidence,
		},
		preview: proposalMetadata.data.preview,
		changelog: proposalMetadata.data.changelog,
	});
	const report = {
		schemaVersion: "1.0",
		status: "passed",
		standard: state.standard,
		candidate: state.candidate,
		screens: state.screens,
		viewports: state.viewports,
		colorSchemes: state.colorSchemes,
		reducedMotion: state.reducedMotion,
		agentGenerationRuns: state.agentGenerationRuns,
		automatedChecks: state.automatedChecks,
		humanReviews: state.humanReviews,
		rawEvidence,
		publicationApproval: { status: "pending", recordedAt: null },
	};

	const parentDirectory = path.dirname(proposalDirectory);
	await mkdir(parentDirectory, { recursive: true });
	const stagingDirectory = await mkdtemp(
		path.join(parentDirectory, ".agentkogei-proposal-"),
	);
	try {
		await cp(
			path.join(candidateDirectory, candidateDesignContractFileName),
			path.join(stagingDirectory, candidateDesignContractFileName),
		);
		for (const file of rawEvidence) {
			await mkdir(path.dirname(path.join(stagingDirectory, file)), {
				recursive: true,
			});
			await cp(
				path.join(evaluationProject, file),
				path.join(stagingDirectory, file),
			);
		}
		await mkdir(path.join(stagingDirectory, "evaluation"), { recursive: true });
		await Promise.all([
			writeFile(
				path.join(stagingDirectory, reportFile),
				`${JSON.stringify(report, null, "\t")}\n`,
			),
			writeFile(
				path.join(stagingDirectory, designSystemEvaluationFileName),
				`${JSON.stringify(record, null, "\t")}\n`,
			),
		]);
		const validation = await validateDesignSystemRelease(stagingDirectory);
		if (!validation.ok) {
			return { ok: false, errors: validation.errors };
		}
		await rename(stagingDirectory, proposalDirectory);
	} finally {
		await rm(stagingDirectory, { recursive: true, force: true });
	}

	return {
		ok: true,
		identity: candidate.id,
		version: candidate.designSystemRelease.version,
		proposalDirectory,
		productionTarget: path.join(
			publishedReleasesDirectory,
			candidate.id,
			candidate.designSystemRelease.version,
		),
		publicationApproval: "pending",
		live: false,
		releaseValidated: true,
		launchVerify: "pending",
		proposedFiles: await listRelativeFiles(proposalDirectory),
	};
}

export async function recordPublicationEvaluationResult(
	evaluationProject: string,
	kind: EvaluationResultKind,
	id: string,
	status: EvaluationResultStatus,
	evidence: string,
): Promise<
	| { ok: true; kind: EvaluationResultKind; id: string; status: "passed" }
	| { ok: false; errors: string[] }
> {
	const loaded = await readEvaluationState(evaluationProject);
	if (!loaded.state) return { ok: false, errors: [loaded.error] };
	const state = loaded.state;
	if (state.status === "failed") {
		return {
			ok: false,
			errors: [
				"Design System Evaluation is failed and cannot be rewritten as passed",
			],
		};
	}
	const evidenceError = await validateEvidenceFile(evaluationProject, evidence);
	if (evidenceError) return { ok: false, errors: [evidenceError] };

	if (
		kind === "automated-check" &&
		state.agentGenerationRuns.some((run) => run.status !== "passed")
	) {
		return {
			ok: false,
			errors: [
				"every independent agent generation run must pass before automated checks",
			],
		};
	}
	const results =
		kind === "agent-run" ? state.agentGenerationRuns : state.automatedChecks;
	const index = results.findIndex((result) => result.id === id);
	if (index === -1) {
		return { ok: false, errors: [`unknown ${kind} result: ${id}`] };
	}
	if (results[index]?.status !== "pending") {
		return { ok: false, errors: [`${kind} ${id} is already recorded`] };
	}
	results[index] = {
		id,
		status,
		evidence: [evidence],
		evidenceSha256: [await evidenceDigest(evaluationProject, evidence)],
	};
	if (status === "failed") state.status = "failed";
	await writeEvaluationState(evaluationProject, state);

	if (status === "failed") {
		const label =
			kind === "agent-run" ? "agent generation run" : "automated check";
		return {
			ok: false,
			errors: [`${label} ${id} failed; Design System Evaluation is blocked`],
		};
	}
	return { ok: true, kind, id, status };
}

export async function startPublicationEvaluation(
	candidateDirectory: string,
	evaluationProject: string,
	publishedReleasesDirectory: string,
): Promise<PublicationWorkflowResult> {
	if (await pathExists(evaluationProject)) {
		return {
			ok: false,
			errors: [`evaluation Project already exists: ${evaluationProject}`],
		};
	}

	const validation = await validateCandidateDesignSystemRelease(
		candidateDirectory,
		{ publishedReleasesDirectory },
	);
	if (!validation.ok) return validation;
	if (validation.authoringApproval !== "approved") {
		return {
			ok: false,
			errors: [
				"Authoring Approval is required before Design System Evaluation",
			],
		};
	}

	const [metadataContents, plan, designContract] = await Promise.all([
		readFile(path.join(candidateDirectory, candidateMetadataFileName), "utf8"),
		readFile(
			path.join(candidateDirectory, candidateEvaluationPlanFileName),
			"utf8",
		).then((contents) =>
			candidateEvaluationPlanSchema.parse(JSON.parse(contents)),
		),
		readFile(path.join(candidateDirectory, candidateDesignContractFileName)),
	]);
	const metadata = candidateMetadataSchema.parse(JSON.parse(metadataContents));
	if (metadata.authoringApproval.status !== "approved") {
		throw new Error(
			"validated approval state changed while starting evaluation",
		);
	}

	const parentDirectory = path.dirname(evaluationProject);
	await mkdir(parentDirectory, { recursive: true });
	const stagingDirectory = await mkdtemp(
		path.join(parentDirectory, ".agentkogei-evaluation-"),
	);
	try {
		await mkdir(path.join(stagingDirectory, publicationWorkflowDirectoryName));
		await cp(
			path.join(candidateDirectory, candidateDesignContractFileName),
			path.join(stagingDirectory, candidateDesignContractFileName),
		);
		const evaluation = publicationEvaluationSchema.parse({
			schemaVersion: "1.0",
			status: "evaluating",
			candidate: {
				id: metadata.id,
				designSystem: metadata.designSystem,
				version: metadata.designSystemRelease.version,
				designContractSha256: createHash("sha256")
					.update(designContract)
					.digest("hex"),
				candidateMetadataSha256: createHash("sha256")
					.update(metadataContents)
					.digest("hex"),
				authoringApprovedAt: metadata.authoringApproval.recordedAt,
			},
			standard: plan.standard,
			screens: plan.screens,
			viewports: plan.viewports,
			colorSchemes: plan.colorSchemes,
			reducedMotion: plan.reducedMotion,
			agentGenerationRuns: plan.agentGenerationRuns,
			automatedChecks: plan.automatedChecks,
			humanReviews: plan.humanReviews,
			publicationApproval: plan.publicationApproval,
		});
		await writeFile(
			path.join(stagingDirectory, publicationWorkflowFileName),
			`${JSON.stringify(evaluation, null, "\t")}\n`,
		);
		await rename(stagingDirectory, evaluationProject);
	} catch (error) {
		await rm(stagingDirectory, { recursive: true, force: true });
		throw error;
	}

	return {
		ok: true,
		identity: metadata.id,
		designSystem: metadata.designSystem,
		version: metadata.designSystemRelease.version,
		evaluationProject,
		status: "evaluating",
	};
}
