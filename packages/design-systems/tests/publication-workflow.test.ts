import { afterEach, describe, expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	verifyContractRetrievalProtocol,
	verifyPublicationAtUrl,
} from "../src/publication-release";

const startEvaluationCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/start-evaluation.ts",
);
const recordEvaluationResultCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/record-evaluation-result.ts",
);
const approveHumanReviewCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/approve-human-review.ts",
);
const preparePublicationCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/prepare-publication.ts",
);
const verifyPublicationCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/verify-publication.ts",
);
const approvePublicationCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/approve-publication.ts",
);
const promotePublicationCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system/scripts/promote-publication.ts",
);
const publicationSkillDirectory = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/publish-design-system",
);
const temporaryDirectories: string[] = [];

const completeDesignContract = `# Lattice Design System

## Identity and intended fit
Lattice is the Design System name. Its intended fit is dense collaborative planning products, while unsuitable uses include expressive consumer entertainment. It creates a calm, decisive working experience.

## Principles and system signature
Its system signature is a calm grid with crisp alignment and one warm action accent.

- Principle: prioritize legible hierarchy.
- Principle: make relationships spatially precise.
- Principle: reserve warmth for consequential action.

## Semantic color
Define light and dark semantic tokens for background, foreground, card, muted, muted foreground, border, primary, primary foreground, destructive, success, warning, info, and focus ring. Explain contrast, hierarchy, and usage.

## Typography
Use role based display, body, label, and code typography with weights, line heights, tracking, wrapping, and a responsive type scale.

## Spacing and density
Use a four pixel base spacing unit and scale with compact density, documented control heights, content rhythm, and grouping.

## Responsive layout
Define mobile, tablet, and desktop behavior with breakpoints or content driven transitions, content widths, grids, navigation changes, reflow, and overflow rules.

## Components and interaction states
Specify geometry and behavior for buttons, links, inputs, text areas, selects, checkboxes, navigation, cards, dialogs, menus, tables, feedback components, and complete default, hover, focus visible, active, selected, disabled, invalid, and destructive states.

## Product surfaces
Cover marketing, authentication, onboarding, dashboard, table, form, settings, and general state surfaces.

## Feedback states
Cover loading, empty, error, success, disabled, and destructive states with recovery actions and stable layouts.

## Motion
Define duration, easing, spatial movement, enter and exit behavior, continuity, and a reduced motion alternative.

## Accessibility
Target WCAG 2.2 Level AA with keyboard access, visible focus, semantics, accessible names, contrast, target size, zoom, reflow, error identification, assistive technology direction, and reduced motion.

## Supported stack
Target React or Next.js, Tailwind CSS v4, and shadcn/ui. Map semantic tokens and component variants without executable installation steps.

## Agent examples
Good request: Build a compact planning dashboard using this system for faithful direction. Bad request: Copy a referenced product screen exactly and introduce prohibited drift.

## Final validation
Confirm every required surface, state, viewport, color scheme, motion preference, component interaction, stack requirement, and accessibility obligation before completion.
`;

function candidateMetadata(approved: boolean) {
	return {
		schemaVersion: "1.0",
		status: "candidate",
		id: "lattice",
		designSystem: "Lattice",
		designSystemRelease: { version: "1.0" },
		creativeBrief: {
			intendedFit: "Dense collaborative planning products",
			systemSignature:
				"A calm grid with crisp alignment and one warm action accent",
			referenceTransformation:
				"Transforms compact hierarchy into an original planning grid",
			inspiredTraits: [
				"compact density",
				"clear hierarchy",
				"precise geometry",
			],
			excludedElements: [
				"copied assets",
				"product identity",
				"distinctive compositions",
				"recognizable product replication",
				"imitation of living designers",
			],
		},
		designReference: {
			kind: "image",
			locator: "user-supplied-image",
			inspectedScope: "The complete supplied image",
			generalizedTraits: [
				"compact density",
				"clear hierarchy",
				"precise geometry",
			],
		},
		authoringApproval: approved
			? { status: "approved", recordedAt: "2026-08-10T00:00:00.000Z" }
			: { status: "pending", recordedAt: null },
	};
}

function evaluationPlan() {
	return {
		schemaVersion: "1.0",
		status: "pending",
		standard: "WCAG 2.2 Level AA",
		screens: [
			"marketing",
			"authentication",
			"onboarding",
			"dashboard",
			"table",
			"form",
			"settings",
			"states",
		],
		viewports: ["1440x900", "390x844"],
		colorSchemes: ["light", "dark"],
		reducedMotion: true,
		agentGenerationRuns: [
			{ id: "run-1", status: "pending", evidence: [] },
			{ id: "run-2", status: "pending", evidence: [] },
		],
		automatedChecks: [
			{ id: "structure", status: "pending", evidence: [] },
			{ id: "accessibility", status: "pending", evidence: [] },
			{ id: "responsive-overflow", status: "pending", evidence: [] },
			{ id: "color-contrast", status: "pending", evidence: [] },
		],
		humanReviews: {
			visual: { status: "pending", evidence: [] },
			accessibility: { status: "pending", evidence: [] },
			rights: { status: "pending", evidence: [] },
		},
		publicationApproval: { status: "pending", recordedAt: null },
	};
}

async function createCandidate(approved: boolean) {
	const directory = await mkdtemp(
		path.join(tmpdir(), "agentkogei-publication-"),
	);
	temporaryDirectories.push(directory);
	await mkdir(path.join(directory, "evaluation"));
	await Promise.all([
		writeFile(path.join(directory, "DESIGN.md"), completeDesignContract),
		writeFile(
			path.join(directory, "candidate.json"),
			`${JSON.stringify(candidateMetadata(approved), null, "\t")}\n`,
		),
		writeFile(
			path.join(directory, "evaluation/plan.json"),
			`${JSON.stringify(evaluationPlan(), null, "\t")}\n`,
		),
	]);
	return directory;
}

async function runJsonCommand(arguments_: string[]) {
	const process_ = Bun.spawn(arguments_);
	const [stdout, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		process_.exited,
	]);
	return { exitCode, result: JSON.parse(stdout) as Record<string, unknown> };
}

async function runStartEvaluation(
	candidateDirectory: string,
	evaluationDirectory: string,
	publishedDirectory: string,
) {
	return runJsonCommand([
		process.execPath,
		startEvaluationCommand,
		candidateDirectory,
		"--project",
		evaluationDirectory,
		"--published",
		publishedDirectory,
	]);
}

async function runRecordResult(
	evaluationDirectory: string,
	kind: "agent-run" | "automated-check",
	id: string,
	status: "passed" | "failed",
	evidence: string,
) {
	return runJsonCommand([
		process.execPath,
		recordEvaluationResultCommand,
		evaluationDirectory,
		"--kind",
		kind,
		"--id",
		id,
		"--status",
		status,
		"--evidence",
		evidence,
	]);
}

async function startApprovedEvaluation() {
	const candidateDirectory = await createCandidate(true);
	const parentDirectory = await mkdtemp(
		path.join(tmpdir(), "agentkogei-evaluation-parent-"),
	);
	temporaryDirectories.push(parentDirectory);
	const evaluationDirectory = path.join(parentDirectory, "evaluation-project");
	const publishedDirectory = path.join(parentDirectory, "published");
	await mkdir(publishedDirectory);
	const started = await runStartEvaluation(
		candidateDirectory,
		evaluationDirectory,
		publishedDirectory,
	);
	expect(started.exitCode).toBe(0);
	return { candidateDirectory, evaluationDirectory, publishedDirectory };
}

async function completeAutomatedEvaluation(evaluationDirectory: string) {
	await mkdir(path.join(evaluationDirectory, "evidence"), { recursive: true });
	for (const [kind, ids] of [
		["agent-run", ["run-1", "run-2"]],
		[
			"automated-check",
			["structure", "accessibility", "responsive-overflow", "color-contrast"],
		],
	] as const) {
		for (const id of ids) {
			const evidence = `evidence/${id}.json`;
			await writeFile(path.join(evaluationDirectory, evidence), "{}\n");
			const result = await runRecordResult(
				evaluationDirectory,
				kind,
				id,
				"passed",
				evidence,
			);
			expect(result.exitCode).toBe(0);
		}
	}
}

async function runApproveReview(
	evaluationDirectory: string,
	review: "visual" | "accessibility" | "rights",
	assertions: string[],
) {
	const evidence = `evidence/${review}-review.md`;
	await writeFile(
		path.join(evaluationDirectory, evidence),
		`${review} review\n`,
	);
	return runJsonCommand([
		process.execPath,
		approveHumanReviewCommand,
		evaluationDirectory,
		"--review",
		review,
		"--reviewed-at",
		"2026-08-10T01:00:00.000Z",
		"--evidence",
		evidence,
		...assertions.flatMap((assertion) => ["--assert", assertion]),
	]);
}

const accessibilityAssertions = [
	"keyboard",
	"focus",
	"semantics",
	"zoom",
	"reflow",
	"reduced-motion",
	"assistive-technology",
];
const rightsAssertions = [
	"originality",
	"no-proprietary-material",
	"mit-permission",
];

function proposalMetadata() {
	const palette = {
		background: "#ffffff",
		foreground: "#111111",
		card: "#ffffff",
		muted: "#eeeeee",
		mutedForeground: "#555555",
		border: "#cccccc",
		primary: "#2233aa",
		primaryForeground: "#ffffff",
		destructive: "#aa2222",
		success: "#227744",
		warning: "#886611",
		info: "#225588",
		ring: "#3344bb",
	};
	return {
		schemaVersion: "1.0",
		publisher: "AgentKogei",
		publishedAt: "2026-08-10",
		preview: {
			order: 5,
			summary: "Calm, precise planning interfaces.",
			intendedFit: "Dense collaborative planning products",
			surfaces: evaluationPlan().screens,
			route: "/design-systems/lattice",
			signature: {
				label: "Lattice 01",
				headline: "Make the work visible.",
				principles: ["Precise hierarchy", "Calm density", "Warm action"],
			},
			tokens: { light: palette, dark: palette },
			typography: {
				display: "sans",
				body: "sans",
				accent: "mono",
				scale: "compact",
			},
			geometry: {
				density: "compact",
				radius: "soft",
				border: "defined",
				elevation: "flat",
			},
		},
		changelog: {
			summary: "Initial Lattice Design System Release.",
			breaking: false,
			migrationNotes: null,
		},
	};
}

async function runPreparePublication(
	candidateDirectory: string,
	evaluationDirectory: string,
	proposalDirectory: string,
	publishedDirectory: string,
	metadataFile: string,
) {
	return runJsonCommand([
		process.execPath,
		preparePublicationCommand,
		evaluationDirectory,
		"--candidate",
		candidateDirectory,
		"--proposal",
		proposalDirectory,
		"--metadata",
		metadataFile,
		"--published",
		publishedDirectory,
	]);
}

async function prepareApprovedProposal() {
	const { candidateDirectory, evaluationDirectory, publishedDirectory } =
		await startApprovedEvaluation();
	await completeAutomatedEvaluation(evaluationDirectory);
	for (const [review, assertions] of [
		["visual", ["faithful-expression"]],
		["accessibility", accessibilityAssertions],
		["rights", rightsAssertions],
	] as const) {
		const approval = await runApproveReview(evaluationDirectory, review, [
			...assertions,
		]);
		expect(approval.exitCode).toBe(0);
	}
	const parentDirectory = path.dirname(evaluationDirectory);
	const proposalDirectory = path.join(parentDirectory, "proposal");
	const metadataFile = path.join(parentDirectory, "proposal-metadata.json");
	await writeFile(
		metadataFile,
		`${JSON.stringify(proposalMetadata(), null, "\t")}\n`,
	);
	const prepared = await runPreparePublication(
		candidateDirectory,
		evaluationDirectory,
		proposalDirectory,
		publishedDirectory,
		metadataFile,
	);
	expect(prepared.exitCode).toBe(0);
	return { proposalDirectory, parentDirectory };
}

async function runProcess(arguments_: string[], cwd?: string) {
	const process_ = Bun.spawn(arguments_, {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		process_.exited,
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
	]);
	return { exitCode, stdout, stderr };
}

async function createPromotionRepository() {
	const repository = await mkdtemp(
		path.join(tmpdir(), "agentkogei-promotion-repository-"),
	);
	temporaryDirectories.push(repository);
	const failureMarker = `${repository}-fail-promotion`;
	temporaryDirectories.push(failureMarker);
	await mkdir(path.join(repository, "apps/web"), { recursive: true });
	await mkdir(path.join(repository, "packages/design-systems/releases"), {
		recursive: true,
	});
	await writeFile(
		path.join(repository, "package.json"),
		`${JSON.stringify({ scripts: { "launch:verify": `test ! -e '${failureMarker}'` } })}\n`,
	);
	await writeFile(
		path.join(repository, "apps/web/package.json"),
		'{"scripts":{"contracts:build":"true"}}\n',
	);
	for (const relativePath of [
		"packages/design-systems/contract-retrieval-protocol.json",
		"packages/design-systems/src/add-design-contract.ts",
		"packages/design-systems/src/design-contract-installation.ts",
		"packages/design-systems/src/install-cli.ts",
		"apps/web/src/lib/design-contract-delivery.ts",
		"apps/web/src/app/contracts/[identity]/route.ts",
		"apps/web/src/app/contracts/[identity]/[version]/route.ts",
	]) {
		const target = path.join(repository, relativePath);
		await mkdir(path.dirname(target), { recursive: true });
		await cp(
			path.resolve(import.meta.dirname, "../../..", relativePath),
			target,
		);
	}
	const installed = await runProcess(["bun", "install"], repository);
	expect(installed.exitCode, installed.stderr).toBe(0);
	for (const arguments_ of [
		["git", "init", "-q"],
		["git", "add", "."],
		[
			"git",
			"-c",
			"user.name=AgentKogei Tests",
			"-c",
			"user.email=tests@agentkogei.com",
			"commit",
			"-qm",
			"test repository",
		],
	] as const) {
		const result = await runProcess([...arguments_], repository);
		expect(result.exitCode, result.stderr).toBe(0);
	}
	return { repository, failureMarker };
}

async function runVerifyPublication(
	proposalDirectory: string,
	repository: string,
	verificationFile: string,
) {
	const processResult = await runProcess([
		process.execPath,
		verifyPublicationCommand,
		proposalDirectory,
		"--repository",
		repository,
		"--output",
		verificationFile,
	]);
	const result = JSON.parse(
		processResult.stdout.trim().split("\n").at(-1) ?? "",
	) as Record<string, unknown>;
	return { exitCode: processResult.exitCode, result };
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Design System publication workflow", () => {
	test("is discoverable only by explicit $publish-design-system invocation", async () => {
		const [skill, interfaceMetadata] = await Promise.all([
			readFile(path.join(publicationSkillDirectory, "SKILL.md"), "utf8"),
			readFile(
				path.join(publicationSkillDirectory, "agents/openai.yaml"),
				"utf8",
			),
		]);

		expect(skill).toMatch(/^---\nname: publish-design-system\n/);
		expect(interfaceMetadata).toContain("$publish-design-system");
		expect(interfaceMetadata).toContain("allow_implicit_invocation: false");
	});

	test("stops before Publication Approval when the packaged CLI protocol changed", async () => {
		const { repository } = await createPromotionRepository();
		expect(await verifyContractRetrievalProtocol(repository)).toEqual({
			ok: true,
			version: "1.0",
		});
		const protocolSource = path.join(
			repository,
			"packages/design-systems/src/add-design-contract.ts",
		);
		await writeFile(protocolSource, "changed protocol\n");

		expect(await verifyContractRetrievalProtocol(repository)).toEqual({
			ok: false,
			errors: [
				"contract retrieval protocol changed at packages/design-systems/src/add-design-contract.ts; request a separate package release decision",
			],
		});
	});

	test("refuses evaluation without Authoring Approval and creates no Project", async () => {
		const candidateDirectory = await createCandidate(false);
		const parentDirectory = await mkdtemp(
			path.join(tmpdir(), "agentkogei-evaluation-parent-"),
		);
		temporaryDirectories.push(parentDirectory);
		const evaluationDirectory = path.join(
			parentDirectory,
			"evaluation-project",
		);
		const publishedDirectory = path.join(parentDirectory, "published");
		await mkdir(publishedDirectory);

		const result = await runStartEvaluation(
			candidateDirectory,
			evaluationDirectory,
			publishedDirectory,
		);

		expect(result).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"Authoring Approval is required before Design System Evaluation",
				],
			},
		});
		expect(await Bun.file(evaluationDirectory).exists()).toBe(false);
		expect(
			await readFile(path.join(candidateDirectory, "candidate.json"), "utf8"),
		).toContain('"status": "pending"');
	});

	test("preserves a failed automated check and blocks rewriting it as passed", async () => {
		const { evaluationDirectory } = await startApprovedEvaluation();
		await mkdir(path.join(evaluationDirectory, "evidence"));
		for (const runId of ["run-1", "run-2"]) {
			const evidence = `evidence/${runId}.json`;
			await writeFile(
				path.join(evaluationDirectory, evidence),
				JSON.stringify({ runId, generatedScreens: 8 }),
			);
			const result = await runRecordResult(
				evaluationDirectory,
				"agent-run",
				runId,
				"passed",
				evidence,
			);
			expect(result.exitCode).toBe(0);
		}
		await writeFile(
			path.join(evaluationDirectory, "evidence/structure.json"),
			JSON.stringify({ violations: ["missing main landmark"] }),
		);

		const failed = await runRecordResult(
			evaluationDirectory,
			"automated-check",
			"structure",
			"failed",
			"evidence/structure.json",
		);
		const rewrite = await runRecordResult(
			evaluationDirectory,
			"automated-check",
			"structure",
			"passed",
			"evidence/structure.json",
		);

		expect(failed).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"automated check structure failed; Design System Evaluation is blocked",
				],
			},
		});
		expect(rewrite).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"Design System Evaluation is failed and cannot be rewritten as passed",
				],
			},
		});
		const state = JSON.parse(
			await readFile(
				path.join(evaluationDirectory, ".agentkogei/evaluation.json"),
				"utf8",
			),
		) as { status: string; automatedChecks: Array<Record<string, unknown>> };
		expect(state.status).toBe("failed");
		expect(state.automatedChecks[0]).toMatchObject({
			id: "structure",
			status: "failed",
			evidence: ["evidence/structure.json"],
		});
	});

	test("requires separate visual, accessibility, and rights approvals", async () => {
		const { evaluationDirectory } = await startApprovedEvaluation();
		await completeAutomatedEvaluation(evaluationDirectory);

		const visual = await runApproveReview(evaluationDirectory, "visual", [
			"faithful-expression",
		]);
		const incompleteAccessibility = await runApproveReview(
			evaluationDirectory,
			"accessibility",
			["keyboard", "focus", "semantics"],
		);

		expect(visual.exitCode).toBe(0);
		expect(incompleteAccessibility).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"accessibility review is missing required assertion: zoom",
					"accessibility review is missing required assertion: reflow",
					"accessibility review is missing required assertion: reduced-motion",
					"accessibility review is missing required assertion: assistive-technology",
				],
			},
		});
		const state = JSON.parse(
			await readFile(
				path.join(evaluationDirectory, ".agentkogei/evaluation.json"),
				"utf8",
			),
		) as { humanReviews: Record<string, { status: string }> };
		expect(state.humanReviews.visual.status).toBe("approved");
		expect(state.humanReviews.accessibility.status).toBe("pending");
		expect(state.humanReviews.rights.status).toBe("pending");
	});

	test("prepares a verified immutable proposal without publishing it", async () => {
		const { candidateDirectory, evaluationDirectory, publishedDirectory } =
			await startApprovedEvaluation();
		await completeAutomatedEvaluation(evaluationDirectory);
		for (const [review, assertions] of [
			["visual", ["faithful-expression"]],
			["accessibility", accessibilityAssertions],
			["rights", rightsAssertions],
		] as const) {
			const approval = await runApproveReview(evaluationDirectory, review, [
				...assertions,
			]);
			expect(approval.exitCode).toBe(0);
		}
		const parentDirectory = path.dirname(evaluationDirectory);
		const proposalDirectory = path.join(parentDirectory, "proposal");
		const metadataFile = path.join(parentDirectory, "proposal-metadata.json");
		await writeFile(
			metadataFile,
			`${JSON.stringify(proposalMetadata(), null, "\t")}\n`,
		);
		const candidateBefore = await readFile(
			path.join(candidateDirectory, "candidate.json"),
			"utf8",
		);

		await writeFile(
			path.join(evaluationDirectory, "evidence/run-1.json"),
			'{"rewritten":true}\n',
		);
		const tampered = await runPreparePublication(
			candidateDirectory,
			evaluationDirectory,
			proposalDirectory,
			publishedDirectory,
			metadataFile,
		);
		expect(tampered).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"evaluation evidence changed after it was recorded: evidence/run-1.json",
				],
			},
		});
		await writeFile(
			path.join(evaluationDirectory, "evidence/run-1.json"),
			"{}\n",
		);
		await writeFile(
			path.join(candidateDirectory, "candidate.json"),
			candidateBefore.replace(
				"Dense collaborative planning products",
				"Unreviewed product direction",
			),
		);
		const changedCandidate = await runPreparePublication(
			candidateDirectory,
			evaluationDirectory,
			proposalDirectory,
			publishedDirectory,
			metadataFile,
		);
		expect(changedCandidate).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"Candidate Design System Release changed after evaluation began",
				],
			},
		});
		await writeFile(
			path.join(candidateDirectory, "candidate.json"),
			candidateBefore,
		);
		const prepared = await runPreparePublication(
			candidateDirectory,
			evaluationDirectory,
			proposalDirectory,
			publishedDirectory,
			metadataFile,
		);

		expect(prepared.exitCode).toBe(0);
		expect(prepared.result).toMatchObject({
			ok: true,
			identity: "lattice",
			version: "1.0",
			publicationApproval: "pending",
			live: false,
			releaseValidated: true,
			launchVerify: "pending",
		});
		const releaseRecord = JSON.parse(
			await readFile(
				path.join(proposalDirectory, "design-system-evaluation.json"),
				"utf8",
			),
		) as {
			designContract: { sha256: string };
			evaluation: { evidence: string[] };
		};
		expect(releaseRecord.designContract.sha256).toMatch(/^[a-f0-9]{64}$/);
		expect(releaseRecord.evaluation.evidence).toContain(
			"evaluation/report.json",
		);
		expect(releaseRecord.evaluation.evidence).toContain("evidence/run-1.json");
		expect(
			await readFile(path.join(candidateDirectory, "candidate.json"), "utf8"),
		).toBe(candidateBefore);
		expect(
			await Bun.file(path.join(publishedDirectory, "lattice")).exists(),
		).toBe(false);
	});

	test("promotes only the exact verified proposal after explicit Publication Approval", async () => {
		const { proposalDirectory, parentDirectory } =
			await prepareApprovedProposal();
		const { repository, failureMarker } = await createPromotionRepository();
		const verificationFile = path.join(parentDirectory, "verification.json");
		const approvalFile = path.join(
			parentDirectory,
			"publication-approval.json",
		);
		const verifiedProposal = await runVerifyPublication(
			proposalDirectory,
			repository,
			verificationFile,
		);
		expect(verifiedProposal.exitCode).toBe(0);

		const approved = await runJsonCommand([
			process.execPath,
			approvePublicationCommand,
			proposalDirectory,
			"--verification",
			verificationFile,
			"--approval",
			approvalFile,
			"--approved-at",
			"2026-08-10T02:00:00.000Z",
			"--approved-by",
			"maintainer@example.com",
			"--assert",
			"official-catalog-admission",
			"--assert",
			"production-deployment",
		]);
		expect(approved.exitCode, JSON.stringify(approved.result)).toBe(0);

		await writeFile(path.join(proposalDirectory, "DESIGN.md"), "tampered\n");
		const refused = await runJsonCommand([
			process.execPath,
			promotePublicationCommand,
			proposalDirectory,
			"--approval",
			approvalFile,
			"--repository",
			repository,
		]);
		expect(refused).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: [
					"publication proposal differs from the explicitly approved artifacts",
				],
				live: false,
			},
		});
		await writeFile(
			path.join(proposalDirectory, "DESIGN.md"),
			completeDesignContract,
		);
		await writeFile(failureMarker, "fail\n");
		const failedVerification = await runJsonCommand([
			process.execPath,
			promotePublicationCommand,
			proposalDirectory,
			"--approval",
			approvalFile,
			"--repository",
			repository,
		]);
		expect(failedVerification.result).toMatchObject({
			ok: false,
			live: false,
		});
		expect(failedVerification.result.errors).toEqual([
			expect.stringContaining("launch:verify failed after promotion"),
		]);
		expect(
			await Bun.file(
				path.join(
					repository,
					"packages/design-systems/releases/lattice/1.0/DESIGN.md",
				),
			).exists(),
		).toBe(false);
		await rm(failureMarker, { force: true });

		const promoted = await runJsonCommand([
			process.execPath,
			promotePublicationCommand,
			proposalDirectory,
			"--approval",
			approvalFile,
			"--repository",
			repository,
		]);
		expect(promoted.exitCode).toBe(0);
		expect(promoted.result).toMatchObject({
			ok: true,
			identity: "lattice",
			version: "1.0",
			publicationApproval: "approved",
			catalogGeneration: "passed",
			launchVerify: "passed",
			readyToDeploy: true,
			live: false,
			npmCliPublished: false,
		});
		expect(
			await readFile(
				path.join(
					repository,
					"packages/design-systems/releases/lattice/1.0/DESIGN.md",
				),
				"utf8",
			),
		).toBe(completeDesignContract);
	});

	test("reports a release live only after production routes and packaged CLI Installation match approval", async () => {
		const { proposalDirectory, parentDirectory } =
			await prepareApprovedProposal();
		const { repository } = await createPromotionRepository();
		const verificationFile = path.join(parentDirectory, "verification.json");
		const approvalFile = path.join(
			parentDirectory,
			"publication-approval.json",
		);
		const metadata = JSON.parse(
			await readFile(
				path.join(proposalDirectory, "design-system-evaluation.json"),
				"utf8",
			),
		) as { designContract: { sha256: string } };
		const verifiedProposal = await runVerifyPublication(
			proposalDirectory,
			repository,
			verificationFile,
		);
		expect(verifiedProposal.exitCode).toBe(0);
		const approved = await runJsonCommand([
			process.execPath,
			approvePublicationCommand,
			proposalDirectory,
			"--verification",
			verificationFile,
			"--approval",
			approvalFile,
			"--approved-at",
			"2026-08-10T02:00:00.000Z",
			"--approved-by",
			"maintainer@example.com",
			"--assert",
			"official-catalog-admission",
			"--assert",
			"production-deployment",
		]);
		expect(approved.exitCode, JSON.stringify(approved.result)).toBe(0);
		const promoted = await runJsonCommand([
			process.execPath,
			promotePublicationCommand,
			proposalDirectory,
			"--approval",
			approvalFile,
			"--repository",
			repository,
		]);
		expect(promoted.exitCode).toBe(0);

		let tampered = true;
		const server = Bun.serve({
			port: 0,
			fetch(request) {
				const pathname = new URL(request.url).pathname;
				if (pathname === "/design-systems") {
					return new Response(
						'<main><a href="/design-systems/lattice">Lattice</a></main>',
						{ headers: { "content-type": "text/html" } },
					);
				}
				if (pathname === "/design-systems/lattice") {
					return new Response(
						"<main><h1>Lattice</h1><h2>Design System Preview</h2></main>",
						{ headers: { "content-type": "text/html" } },
					);
				}
				if (
					pathname === "/contracts/lattice" ||
					pathname === "/contracts/lattice/1.0"
				) {
					return new Response(
						tampered
							? `${completeDesignContract}\nchanged`
							: completeDesignContract,
						{
							headers: {
								"content-type": "text/markdown; charset=utf-8",
								"x-agentkogei-design-system": "Lattice",
								"x-agentkogei-design-system-release": "1.0",
							},
						},
					);
				}
				return new Response("not found", { status: 404 });
			},
		});
		try {
			const verificationInput = {
				approvalFile,
				repository,
				productionUrl: server.url.href,
				cliPackage: path.resolve(
					import.meta.dirname,
					"../.distribution/agentkogei.tgz",
				),
			};
			const mismatch = await verifyPublicationAtUrl(verificationInput);
			expect(mismatch).toEqual({
				ok: false,
				errors: [
					"production Design Contract digest differs from Publication Approval: lattice@1.0",
				],
				live: false,
			});

			tampered = false;
			const verified = await verifyPublicationAtUrl(verificationInput);
			expect(verified).toMatchObject({
				ok: true,
				identity: "lattice",
				version: "1.0",
				designContractSha256: metadata.designContract.sha256,
				catalogRoute: `${server.url.href}design-systems/lattice`,
				currentContractRoute: `${server.url.href}contracts/lattice`,
				exactContractRoute: `${server.url.href}contracts/lattice/1.0`,
				catalogDiscovery: "passed",
				preview: "passed",
				currentAndHistoricalContracts: "passed",
				packagedCliInstallation: "passed",
				live: true,
				npmCliPublished: false,
			});
		} finally {
			server.stop(true);
		}
	});
});
