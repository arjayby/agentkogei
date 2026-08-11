import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
	cp,
	lstat,
	mkdtemp,
	readdir,
	readFile,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { z } from "zod";

import {
	designSystemEvaluationFileName,
	designSystemEvaluationRecordSchema,
} from "./design-system-evaluation";
import { designSystemIdentitySchema } from "./design-system-identity";
import { discoverPublishedDesignSystems } from "./published-design-systems";
import { designSystemReleaseVersionSchema } from "./release-version";
import { validateDesignSystemRelease } from "./validator";

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const proposalFileSchema = z
	.object({ path: z.string().min(1), sha256: sha256Schema })
	.strict();
const passedEvidenceSchema = z
	.object({
		id: z.string().min(1),
		status: z.literal("passed"),
		evidence: z.array(z.string().min(1)).min(1),
		evidenceSha256: z.array(sha256Schema).min(1),
	})
	.strict();
const approvedReviewSchema = z
	.object({
		status: z.literal("approved"),
		evidence: z.array(z.string().min(1)).min(1),
		evidenceSha256: z.array(sha256Schema).min(1),
		reviewedAt: z.iso.datetime(),
		assertions: z.array(z.string().min(1)).min(1),
	})
	.strict();
const requiredReviewAssertions = {
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
} as const;
const publicationProposalReportSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		status: z.literal("passed"),
		candidate: z
			.object({
				id: designSystemIdentitySchema,
				designSystem: z.string().min(1),
				version: designSystemReleaseVersionSchema,
				designContractSha256: sha256Schema,
				candidateMetadataSha256: sha256Schema,
				authoringApprovedAt: z.iso.datetime(),
			})
			.strict(),
		standard: z.literal("WCAG 2.2 Level AA"),
		screens: z.array(z.string()).min(8),
		viewports: z.array(z.string()).min(2),
		colorSchemes: z.array(z.enum(["light", "dark"])).length(2),
		reducedMotion: z.literal(true),
		agentGenerationRuns: z.array(passedEvidenceSchema).min(2),
		automatedChecks: z.array(passedEvidenceSchema).min(1),
		humanReviews: z
			.object({
				visual: approvedReviewSchema,
				accessibility: approvedReviewSchema,
				rights: approvedReviewSchema,
			})
			.strict(),
		rawEvidence: z.array(z.string().min(1)).min(1),
		publicationApproval: z
			.object({ status: z.literal("pending"), recordedAt: z.null() })
			.strict(),
	})
	.strict();

export const contractRetrievalProtocol = "1.0" as const;
export const productionWebsiteUrl = "https://agentkogei.com/" as const;
const contractRetrievalProtocolSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		version: z.literal(contractRetrievalProtocol),
		sources: z.record(z.string().min(1), sha256Schema),
	})
	.strict();

export async function verifyContractRetrievalProtocol(repository: string) {
	let protocol: z.infer<typeof contractRetrievalProtocolSchema>;
	try {
		protocol = contractRetrievalProtocolSchema.parse(
			JSON.parse(
				await readFile(
					path.join(
						repository,
						"packages/design-systems/contract-retrieval-protocol.json",
					),
					"utf8",
				),
			),
		);
	} catch {
		return {
			ok: false as const,
			errors: [
				"contract retrieval protocol lock is missing or invalid; request a separate package release decision",
			],
		};
	}
	for (const [relativePath, expectedDigest] of Object.entries(
		protocol.sources,
	)) {
		try {
			const digest = createHash("sha256")
				.update(await readFile(path.join(repository, relativePath)))
				.digest("hex");
			if (digest !== expectedDigest) throw new Error();
		} catch {
			return {
				ok: false as const,
				errors: [
					`contract retrieval protocol changed at ${relativePath}; request a separate package release decision`,
				],
			};
		}
	}
	return { ok: true as const, version: protocol.version };
}

export const publicationVerificationSchema = z
	.object({
		ok: z.literal(true).optional(),
		schemaVersion: z.literal("1.0"),
		identity: designSystemIdentitySchema,
		version: designSystemReleaseVersionSchema,
		designContractSha256: sha256Schema,
		proposalFiles: z.array(proposalFileSchema).min(1),
		repositoryHead: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/),
		contractRetrievalProtocol: z.literal(contractRetrievalProtocol),
		launchVerify: z.literal("passed"),
		productionMutated: z.literal(false),
	})
	.strict();

const publicationAssertions = [
	"official-catalog-admission",
	"production-deployment",
] as const;

export const publicationApprovalSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		status: z.literal("approved"),
		approvedAt: z.iso.datetime(),
		approvedBy: z.string().min(1),
		assertions: z.array(z.enum(publicationAssertions)).length(2),
		proposal: publicationVerificationSchema.pick({
			identity: true,
			version: true,
			designContractSha256: true,
			proposalFiles: true,
		}),
		verification: publicationVerificationSchema.pick({
			repositoryHead: true,
			contractRetrievalProtocol: true,
			launchVerify: true,
			productionMutated: true,
		}),
	})
	.strict()
	.superRefine((approval, context) => {
		if (
			new Set(approval.assertions).size !== publicationAssertions.length ||
			!publicationAssertions.every((assertion) =>
				approval.assertions.includes(assertion),
			)
		) {
			context.addIssue({
				code: "custom",
				path: ["assertions"],
				message:
					"Publication Approval must authorize catalog admission and production deployment",
			});
		}
	});

type ProposalFile = z.infer<typeof proposalFileSchema>;

async function listProposalFiles(
	directory: string,
	prefix = "",
): Promise<ProposalFile[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const relativePath = path.posix.join(prefix, entry.name);
			const target = path.join(directory, entry.name);
			if (entry.isDirectory()) return listProposalFiles(target, relativePath);
			const statistics = await lstat(target);
			if (!statistics.isFile() || statistics.isSymbolicLink()) {
				throw new Error(
					`publication proposal contains a nonregular file: ${relativePath}`,
				);
			}
			return [
				{
					path: relativePath,
					sha256: createHash("sha256")
						.update(await readFile(target))
						.digest("hex"),
				},
			];
		}),
	);
	return nested
		.flat()
		.sort((left, right) => left.path.localeCompare(right.path));
}

function sameProposalFiles(left: ProposalFile[], right: ProposalFile[]) {
	return JSON.stringify(left) === JSON.stringify(right);
}

export async function inspectPublicationProposal(proposalDirectory: string) {
	const validation = await validateDesignSystemRelease(proposalDirectory);
	if (!validation.ok) return validation;
	try {
		const record = designSystemEvaluationRecordSchema.parse(
			JSON.parse(
				await readFile(
					path.join(proposalDirectory, designSystemEvaluationFileName),
					"utf8",
				),
			),
		);
		if (record.schemaVersion !== "4.0") {
			return {
				ok: false as const,
				errors: ["publication proposal requires Version 4 Preview metadata"],
			};
		}
		const report = publicationProposalReportSchema.parse(
			JSON.parse(
				await readFile(
					path.join(proposalDirectory, "evaluation/report.json"),
					"utf8",
				),
			),
		);
		if (
			report.candidate.id !== record.id ||
			report.candidate.designSystem !== record.designSystem ||
			report.candidate.version !== record.designSystemRelease.version ||
			report.candidate.designContractSha256 !== record.designContract.sha256
		) {
			return {
				ok: false as const,
				errors: [
					"publication proposal candidate does not match its evaluated release",
				],
			};
		}
		const reportChecks = report.automatedChecks
			.map(({ id }) => id.replaceAll("-", " "))
			.sort();
		if (
			report.standard !== record.evaluation.standard ||
			JSON.stringify(report.screens) !==
				JSON.stringify(record.evaluation.screens) ||
			JSON.stringify(report.viewports) !==
				JSON.stringify(record.evaluation.viewports) ||
			JSON.stringify(report.colorSchemes) !==
				JSON.stringify(record.evaluation.colorSchemes) ||
			report.reducedMotion !== record.evaluation.reducedMotion ||
			report.agentGenerationRuns.length !==
				record.evaluation.agentGenerationRuns ||
			JSON.stringify(reportChecks) !==
				JSON.stringify([...record.evaluation.automatedChecks].sort())
		) {
			return {
				ok: false as const,
				errors: [
					"publication proposal passed results do not match the evaluated release",
				],
			};
		}
		for (const [review, required] of Object.entries(requiredReviewAssertions)) {
			const assertions =
				report.humanReviews[review as keyof typeof report.humanReviews]
					.assertions;
			if (
				assertions.length !== required.length ||
				!required.every((assertion) => assertions.includes(assertion))
			) {
				return {
					ok: false as const,
					errors: [
						`publication proposal ${review} review assertions are incomplete`,
					],
				};
			}
		}
		const results = [
			...report.agentGenerationRuns,
			...report.automatedChecks,
			...Object.values(report.humanReviews),
		];
		const evidence = results.flatMap((result) => result.evidence);
		const rawEvidence = [...new Set(evidence)].sort();
		if (
			JSON.stringify(rawEvidence) !==
				JSON.stringify([...report.rawEvidence].sort()) ||
			JSON.stringify(["evaluation/report.json", ...rawEvidence]) !==
				JSON.stringify(record.evaluation.evidence)
		) {
			return {
				ok: false as const,
				errors: [
					"publication proposal evidence list differs from its passed results and reviews",
				],
			};
		}
		for (const result of results) {
			if (result.evidence.length !== result.evidenceSha256.length) {
				return {
					ok: false as const,
					errors: ["publication proposal evidence digest record is invalid"],
				};
			}
			for (const [index, evidencePath] of result.evidence.entries()) {
				const digest = createHash("sha256")
					.update(await readFile(path.join(proposalDirectory, evidencePath)))
					.digest("hex");
				if (digest !== result.evidenceSha256[index]) {
					return {
						ok: false as const,
						errors: [
							`publication proposal evidence digest differs: ${evidencePath}`,
						],
					};
				}
			}
		}
		return {
			ok: true as const,
			record,
			files: await listProposalFiles(proposalDirectory),
		};
	} catch {
		return {
			ok: false as const,
			errors: ["publication proposal metadata is missing or invalid"],
		};
	}
}

export async function recordPublicationApproval(input: {
	proposalDirectory: string;
	verificationFile: string;
	approvalFile: string;
	approvedAt: string;
	approvedBy: string;
	assertions: string[];
}) {
	const proposal = await inspectPublicationProposal(input.proposalDirectory);
	if (!proposal.ok) return proposal;
	let verification: z.infer<typeof publicationVerificationSchema>;
	try {
		verification = publicationVerificationSchema.parse(
			JSON.parse(await readFile(input.verificationFile, "utf8")),
		);
	} catch {
		return {
			ok: false as const,
			errors: ["publication verification is missing or invalid"],
		};
	}
	if (
		verification.identity !== proposal.record.id ||
		verification.version !== proposal.record.designSystemRelease.version ||
		verification.designContractSha256 !==
			proposal.record.designContract.sha256 ||
		!sameProposalFiles(verification.proposalFiles, proposal.files)
	) {
		return {
			ok: false as const,
			errors: [
				"publication verification does not match the immutable proposal",
			],
		};
	}
	const approval = publicationApprovalSchema.safeParse({
		schemaVersion: "1.0",
		status: "approved",
		approvedAt: input.approvedAt,
		approvedBy: input.approvedBy,
		assertions: input.assertions,
		proposal: {
			identity: verification.identity,
			version: verification.version,
			designContractSha256: verification.designContractSha256,
			proposalFiles: verification.proposalFiles,
		},
		verification: {
			repositoryHead: verification.repositoryHead,
			contractRetrievalProtocol: verification.contractRetrievalProtocol,
			launchVerify: verification.launchVerify,
			productionMutated: verification.productionMutated,
		},
	});
	if (!approval.success) {
		return {
			ok: false as const,
			errors: approval.error.issues.map(
				(issue) =>
					`Publication Approval.${issue.path.join(".") || "root"}: ${issue.message}`,
			),
		};
	}
	try {
		await writeFile(
			input.approvalFile,
			`${JSON.stringify(approval.data, null, "\t")}\n`,
			{ flag: "wx" },
		);
	} catch {
		return {
			ok: false as const,
			errors: [
				`Publication Approval already exists or cannot be written: ${input.approvalFile}`,
			],
		};
	}
	return {
		ok: true as const,
		identity: proposal.record.id,
		version: proposal.record.designSystemRelease.version,
		publicationApproval: "approved" as const,
		approvalFile: input.approvalFile,
	};
}

async function runCommand(
	command: string[],
	cwd: string,
	environment?: Record<string, string>,
) {
	return new Promise<{ exitCode: number; stdout: string; stderr: string }>(
		(resolve, reject) => {
			const process_ = spawn(command[0] as string, command.slice(1), {
				cwd,
				env: environment ? { ...process.env, ...environment } : process.env,
				stdio: ["ignore", "pipe", "pipe"],
			});
			let stdout = "";
			let stderr = "";
			process_.stdout.setEncoding("utf8").on("data", (chunk: string) => {
				stdout += chunk;
			});
			process_.stderr.setEncoding("utf8").on("data", (chunk: string) => {
				stderr += chunk;
			});
			process_.on("error", reject);
			process_.on("exit", (code) =>
				resolve({ exitCode: code ?? 1, stdout, stderr }),
			);
		},
	);
}

export async function promoteApprovedPublication(input: {
	proposalDirectory: string;
	approvalFile: string;
	repository: string;
}) {
	const failure = (errors: string[]) => ({
		ok: false as const,
		errors,
		live: false as const,
	});
	let approval: z.infer<typeof publicationApprovalSchema>;
	try {
		approval = publicationApprovalSchema.parse(
			JSON.parse(await readFile(input.approvalFile, "utf8")),
		);
	} catch {
		return failure(["Publication Approval is missing or invalid"]);
	}
	let proposedFiles: ProposalFile[];
	try {
		proposedFiles = await listProposalFiles(input.proposalDirectory);
	} catch {
		return failure(["publication proposal is missing or invalid"]);
	}
	if (!sameProposalFiles(approval.proposal.proposalFiles, proposedFiles)) {
		return failure([
			"publication proposal differs from the explicitly approved artifacts",
		]);
	}
	const proposal = await inspectPublicationProposal(input.proposalDirectory);
	if (!proposal.ok) return failure(proposal.errors);
	if (
		approval.proposal.identity !== proposal.record.id ||
		approval.proposal.version !== proposal.record.designSystemRelease.version ||
		approval.proposal.designContractSha256 !==
			proposal.record.designContract.sha256 ||
		!sameProposalFiles(approval.proposal.proposalFiles, proposal.files)
	) {
		return failure([
			"publication proposal differs from the explicitly approved artifacts",
		]);
	}
	const head = await runCommand(["git", "rev-parse", "HEAD"], input.repository);
	if (
		head.exitCode !== 0 ||
		head.stdout.trim() !== approval.verification.repositoryHead
	) {
		return failure([
			"repository changed after publication verification; verify again and obtain fresh Publication Approval",
		]);
	}
	const status = await runCommand(
		["git", "status", "--porcelain", "--untracked-files=all"],
		input.repository,
	);
	if (status.exitCode !== 0 || status.stdout.trim().length > 0) {
		return failure([
			"repository must be clean before admitting an approved Design System Release",
		]);
	}
	const protocol = await verifyContractRetrievalProtocol(input.repository);
	if (!protocol.ok) return failure(protocol.errors);

	const productionRelativePath = path.join(
		"packages/design-systems/releases",
		proposal.record.id,
		proposal.record.designSystemRelease.version,
	);
	const target = path.join(input.repository, productionRelativePath);
	try {
		await lstat(target);
		return failure([`production target already exists: ${target}`]);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			return failure([`production target cannot be inspected: ${target}`]);
		}
	}

	const worktree = await mkdtemp(
		path.join(tmpdir(), "agentkogei-promotion-worktree-"),
	);
	let addedWorktree = false;
	try {
		const added = await runCommand(
			["git", "worktree", "add", "--detach", worktree, "HEAD"],
			input.repository,
		);
		if (added.exitCode !== 0) {
			return failure([
				`could not create promotion worktree: ${added.stderr.trim()}`,
			]);
		}
		addedWorktree = true;
		const installed = await runCommand(
			["bun", "install", "--frozen-lockfile"],
			worktree,
		);
		if (installed.exitCode !== 0) {
			return failure([
				`could not install promotion dependencies: ${installed.stderr.trim()}`,
			]);
		}
		const worktreeTarget = path.join(worktree, productionRelativePath);
		await cp(input.proposalDirectory, worktreeTarget, {
			recursive: true,
			errorOnExist: true,
		});
		const worktreeReleases = path.join(
			worktree,
			"packages/design-systems/releases",
		);
		const discovered = await discoverPublishedDesignSystems(worktreeReleases);
		if (!discovered.some(({ id }) => id === proposal.record.id)) {
			return failure([
				"promoted identity was not discovered in the Official Catalog",
			]);
		}
		const generated = await runCommand(
			["bun", "run", "--cwd", "apps/web", "contracts:build"],
			worktree,
		);
		if (generated.exitCode !== 0) {
			return failure([
				`Official Catalog generation failed: ${(generated.stderr || generated.stdout).trim()}`,
			]);
		}
		const verified = await runCommand(
			["bun", "run", "launch:verify"],
			worktree,
		);
		if (verified.exitCode !== 0) {
			return failure([
				`launch:verify failed after promotion: ${(verified.stderr || verified.stdout).trim()}`,
			]);
		}
		const intent = await runCommand(
			["git", "add", "-N", "--", productionRelativePath],
			worktree,
		);
		if (intent.exitCode !== 0) {
			return failure([
				`could not prepare promotion patch: ${intent.stderr.trim()}`,
			]);
		}
		const generatedPaths = [
			"apps/web/src/generated/official-catalog.json",
			"apps/web/src/generated/design-contracts.json",
		];
		const diff = await runCommand(
			[
				"git",
				"diff",
				"--binary",
				"--no-ext-diff",
				"HEAD",
				"--",
				productionRelativePath,
				...generatedPaths,
			],
			worktree,
		);
		if (diff.exitCode !== 0 || diff.stdout.length === 0) {
			return failure([
				"verified promotion produced no applicable catalog patch",
			]);
		}
		const patchFile = path.join(worktree, ".agentkogei-publication.patch");
		await writeFile(patchFile, diff.stdout);
		const checked = await runCommand(
			["git", "apply", "--check", patchFile],
			input.repository,
		);
		if (checked.exitCode !== 0) {
			return failure([
				`verified promotion patch cannot be applied: ${checked.stderr.trim()}`,
			]);
		}
		const applied = await runCommand(
			["git", "apply", patchFile],
			input.repository,
		);
		if (applied.exitCode !== 0) {
			return failure([
				`verified promotion patch failed to apply: ${applied.stderr.trim()}`,
			]);
		}
	} catch (error) {
		return failure([
			error instanceof Error
				? error.message
				: "approved publication promotion failed",
		]);
	} finally {
		if (addedWorktree) {
			await runCommand(
				["git", "worktree", "remove", "--force", worktree],
				input.repository,
			);
		}
	}
	return {
		ok: true as const,
		identity: proposal.record.id,
		version: proposal.record.designSystemRelease.version,
		designContractSha256: proposal.record.designContract.sha256,
		publicationApproval: "approved" as const,
		catalogGeneration: "passed" as const,
		launchVerify: "passed" as const,
		readyToDeploy: true as const,
		deployCommand: "bun run deploy:prod",
		live: false as const,
		npmCliPublished: false as const,
	};
}

async function fetchContract(
	url: URL,
	expected: {
		identity: string;
		designSystem: string;
		version: string;
		bytes: Buffer;
	},
) {
	const response = await fetch(url, {
		redirect: "manual",
		headers: { accept: "text/markdown" },
	});
	if (!response.ok) {
		throw new Error(
			`production Design Contract route failed (${response.status}): ${url.href}`,
		);
	}
	if (
		!/^text\/markdown\s*(;|$)/i.test(response.headers.get("content-type") ?? "")
	) {
		throw new Error(`production Design Contract is not Markdown: ${url.href}`);
	}
	if (
		response.headers.get("x-agentkogei-design-system") !==
			expected.designSystem ||
		response.headers.get("x-agentkogei-design-system-release") !==
			expected.version
	) {
		throw new Error(
			`production Design Contract identity or release headers differ: ${expected.identity}@${expected.version}`,
		);
	}
	const bytes = Buffer.from(await response.arrayBuffer());
	if (!bytes.equals(expected.bytes)) {
		throw new Error(
			`production Design Contract bytes differ from the promoted release: ${expected.identity}@${expected.version}`,
		);
	}
	return bytes;
}

export async function verifyPublicationAtUrl(input: {
	approvalFile: string;
	repository: string;
	productionUrl: string;
	cliPackage: string;
}) {
	const failure = (errors: string[]) => ({
		ok: false as const,
		errors,
		live: false as const,
	});
	let approval: z.infer<typeof publicationApprovalSchema>;
	try {
		approval = publicationApprovalSchema.parse(
			JSON.parse(await readFile(input.approvalFile, "utf8")),
		);
	} catch {
		return failure(["Publication Approval is missing or invalid"]);
	}
	let production: URL;
	try {
		production = new URL(input.productionUrl);
		if (!production.pathname.endsWith("/")) production.pathname += "/";
		if (!["http:", "https:"].includes(production.protocol)) throw new Error();
	} catch {
		return failure([
			"production website URL must be an absolute HTTP or HTTPS URL",
		]);
	}
	const releasesDirectory = path.join(
		input.repository,
		"packages/design-systems/releases",
	);
	const target = path.join(
		releasesDirectory,
		approval.proposal.identity,
		approval.proposal.version,
	);
	try {
		if (
			!sameProposalFiles(
				await listProposalFiles(target),
				approval.proposal.proposalFiles,
			)
		) {
			return failure(["promoted release differs from Publication Approval"]);
		}
	} catch {
		return failure(["promoted release is missing or invalid"]);
	}

	try {
		const systems = await discoverPublishedDesignSystems(releasesDirectory);
		const promoted = systems.find(
			({ id }) => id === approval.proposal.identity,
		);
		if (!promoted)
			throw new Error(
				"approved identity is absent from local catalog discovery",
			);
		const catalogRoute = new URL("design-systems", production);
		const catalog = await fetch(catalogRoute, { redirect: "manual" });
		const catalogHtml = await catalog.text();
		if (
			!catalog.ok ||
			!catalogHtml.includes(`/design-systems/${promoted.id}`)
		) {
			throw new Error(
				"new Design System is absent from production catalog discovery",
			);
		}
		const previewRoute = new URL(`design-systems/${promoted.id}`, production);
		const preview = await fetch(previewRoute, { redirect: "manual" });
		const previewHtml = await preview.text();
		const currentMetadata = promoted.releases.at(-1)?.metadata;
		if (
			!preview.ok ||
			!currentMetadata ||
			!previewHtml.includes(currentMetadata.designSystem) ||
			!previewHtml.includes("Design System Preview")
		) {
			throw new Error(
				"new Design System Preview is absent or incomplete in production",
			);
		}

		let approvedBytes: Buffer | undefined;
		for (const system of systems) {
			const current = system.releases.at(-1);
			if (!current) throw new Error(`${system.id} has no current release`);
			const currentBytes = await readFile(
				path.join(current.directory, "DESIGN.md"),
			);
			const deliveredCurrent = await fetchContract(
				new URL(`contracts/${system.id}`, production),
				{
					identity: system.id,
					designSystem: current.metadata.designSystem,
					version: current.version,
					bytes: currentBytes,
				},
			);
			if (
				system.id === approval.proposal.identity &&
				current.version === approval.proposal.version
			) {
				approvedBytes = deliveredCurrent;
			}
			for (const release of system.releases) {
				const bytes = await readFile(path.join(release.directory, "DESIGN.md"));
				const delivered = await fetchContract(
					new URL(`contracts/${system.id}/${release.version}`, production),
					{
						identity: system.id,
						designSystem: release.metadata.designSystem,
						version: release.version,
						bytes,
					},
				);
				if (
					system.id === approval.proposal.identity &&
					release.version === approval.proposal.version
				) {
					approvedBytes = delivered;
				}
			}
		}
		if (!approvedBytes)
			throw new Error("approved production Design Contract was not verified");
		const productionDigest = createHash("sha256")
			.update(approvedBytes)
			.digest("hex");
		if (productionDigest !== approval.proposal.designContractSha256) {
			return failure([
				`production Design Contract digest differs from Publication Approval: ${approval.proposal.identity}@${approval.proposal.version}`,
			]);
		}

		const project = await mkdtemp(
			path.join(tmpdir(), "agentkogei-production-cli-"),
		);
		try {
			const installed = await runCommand(
				[
					"npm",
					"exec",
					"--yes",
					`--package=${path.resolve(input.cliPackage)}`,
					"--",
					"agentkogei",
					"add",
					`${approval.proposal.identity}@${approval.proposal.version}`,
					"--yes",
				],
				project,
				{
					AGENTKOGEI_CONTRACT_CATALOG_URL: new URL("contracts/", production)
						.href,
					AGENTKOGEI_CONFIG_DIR: path.join(project, ".agentkogei-config"),
				},
			);
			if (installed.exitCode !== 0) {
				throw new Error(
					`packaged CLI could not install from production; stop and request a separate package release decision: ${(installed.stderr || installed.stdout).trim()}`,
				);
			}
			const installedContract = await readFile(path.join(project, "DESIGN.md"));
			if (!installedContract.equals(approvedBytes)) {
				throw new Error(
					"packaged CLI Installation differs from the approved Design Contract",
				);
			}
		} finally {
			await rm(project, { recursive: true, force: true });
		}

		return {
			ok: true as const,
			identity: approval.proposal.identity,
			version: approval.proposal.version,
			designContractSha256: approval.proposal.designContractSha256,
			catalogRoute: new URL(
				`design-systems/${approval.proposal.identity}`,
				production,
			).href,
			currentContractRoute: new URL(
				`contracts/${approval.proposal.identity}`,
				production,
			).href,
			exactContractRoute: new URL(
				`contracts/${approval.proposal.identity}/${approval.proposal.version}`,
				production,
			).href,
			catalogDiscovery: "passed" as const,
			preview: "passed" as const,
			currentAndHistoricalContracts: "passed" as const,
			packagedCliInstallation: "passed" as const,
			live: true as const,
			npmCliPublished: false as const,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "production verification failed";
		if (
			message.startsWith("production Design Contract bytes differ") &&
			message.endsWith(
				`${approval.proposal.identity}@${approval.proposal.version}`,
			)
		) {
			return failure([
				`production Design Contract digest differs from Publication Approval: ${approval.proposal.identity}@${approval.proposal.version}`,
			]);
		}
		return failure([message]);
	}
}

export function verifyProductionPublication(
	input: Omit<Parameters<typeof verifyPublicationAtUrl>[0], "productionUrl">,
) {
	return verifyPublicationAtUrl({
		...input,
		productionUrl: productionWebsiteUrl,
	});
}
