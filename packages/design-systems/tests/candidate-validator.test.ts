import { afterEach, describe, expect, test } from "bun:test";
import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rename,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

type CandidateValidationResult =
	| {
			ok: true;
			designSystem: string;
			identity: string;
			version: "1.0";
			authoringApproval: "pending" | "approved";
			mechanicalValidation: true;
	  }
	| { ok: false; errors: string[] };

const validatorCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/author-design-system/scripts/validate-candidate.ts",
);
const creatorCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/author-design-system/scripts/create-candidate.ts",
);
const approvalCommand = path.resolve(
	import.meta.dirname,
	"../../../.agents/skills/author-design-system/scripts/record-authoring-approval.ts",
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

function candidateMetadata() {
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
				"Transforms compact hierarchy into an original planning grid with a warm decision accent",
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
			kind: "url",
			locator: "https://example.com/reference",
			inspectedScope: "Public landing page at desktop and mobile widths",
			generalizedTraits: [
				"compact density",
				"high tonal contrast",
				"rectilinear geometry",
			],
		},
		authoringApproval: { status: "pending", recordedAt: null },
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

async function createCandidateFixture() {
	const rootDirectory = await mkdtemp(
		path.join(tmpdir(), "agentkogei-candidate-"),
	);
	temporaryDirectories.push(rootDirectory);
	await Promise.all([
		writeFile(path.join(rootDirectory, "DESIGN.md"), completeDesignContract),
		writeFile(
			path.join(rootDirectory, "candidate.json"),
			`${JSON.stringify(candidateMetadata(), null, "\t")}\n`,
		),
		mkdir(path.join(rootDirectory, "evaluation"), { recursive: true }).then(
			() =>
				writeFile(
					path.join(rootDirectory, "evaluation/plan.json"),
					`${JSON.stringify(evaluationPlan(), null, "\t")}\n`,
				),
		),
	]);
	return rootDirectory;
}

async function mutateJson(
	rootDirectory: string,
	relativePath: string,
	mutate: (value: Record<string, unknown>) => void,
) {
	const file = path.join(rootDirectory, relativePath);
	const value = JSON.parse(await readFile(file, "utf8")) as Record<
		string,
		unknown
	>;
	mutate(value);
	await writeFile(file, `${JSON.stringify(value, null, "\t")}\n`);
}

async function runValidator(rootDirectory: string, ...options: string[]) {
	const process_ = Bun.spawn(
		[process.execPath, validatorCommand, rootDirectory, ...options],
		{
			stdout: "pipe",
			stderr: "pipe",
		},
	);
	const [stdout, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		process_.exited,
	]);
	return {
		exitCode,
		result: JSON.parse(stdout) as CandidateValidationResult,
	};
}

async function runCreator(
	stagedDirectory: string,
	candidatesDirectory: string,
	publishedDirectory: string,
) {
	const process_ = Bun.spawn(
		[
			process.execPath,
			creatorCommand,
			stagedDirectory,
			"--candidates",
			candidatesDirectory,
			"--published",
			publishedDirectory,
		],
		{ stdout: "pipe", stderr: "pipe" },
	);
	const [stdout, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		process_.exited,
	]);
	return { exitCode, result: JSON.parse(stdout) as Record<string, unknown> };
}

async function recordAuthoringApproval(
	candidateDirectory: string,
	approvedAt: string,
) {
	const process_ = Bun.spawn(
		[
			process.execPath,
			approvalCommand,
			candidateDirectory,
			"--approved-at",
			approvedAt,
		],
		{ stdout: "pipe", stderr: "pipe" },
	);
	const [stdout, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		process_.exited,
	]);
	return { exitCode, result: JSON.parse(stdout) as Record<string, unknown> };
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Candidate Design System Release validation", () => {
	test("accepts a complete candidate with every evaluation result pending", async () => {
		const rootDirectory = await createCandidateFixture();

		const validation = await runValidator(rootDirectory);

		expect(validation).toEqual({
			exitCode: 0,
			result: {
				ok: true,
				designSystem: "Lattice",
				identity: "lattice",
				version: "1.0",
				authoringApproval: "pending",
				mechanicalValidation: true,
			},
		});
	});

	test("rejects a missing or extra candidate artifact", async () => {
		const rootDirectory = await createCandidateFixture();
		await rm(path.join(rootDirectory, "DESIGN.md"));
		await writeFile(
			path.join(rootDirectory, "notes.txt"),
			"not part of a candidate\n",
		);

		const { result } = await runValidator(rootDirectory);

		expect(result).toEqual({
			ok: false,
			errors: [
				"unexpected candidate file: notes.txt",
				"candidate file is missing: DESIGN.md",
			],
		});
	});

	test("rejects an unexpected empty directory", async () => {
		const rootDirectory = await createCandidateFixture();
		await mkdir(path.join(rootDirectory, "assets"));

		const { result } = await runValidator(rootDirectory);

		expect(result).toEqual({
			ok: false,
			errors: ["unexpected candidate directory: assets"],
		});
	});

	test("rejects a symbolic link without following it", async () => {
		const rootDirectory = await createCandidateFixture();
		await rm(path.join(rootDirectory, "DESIGN.md"));
		await symlink("candidate.json", path.join(rootDirectory, "DESIGN.md"));

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain("symbolic link is prohibited: DESIGN.md");
		}
	});

	test("rejects a candidate directory that is itself a symbolic link", async () => {
		const realDirectory = await createCandidateFixture();
		const linkParent = await mkdtemp(
			path.join(tmpdir(), "agentkogei-candidate-link-"),
		);
		temporaryDirectories.push(linkParent);
		const linkedDirectory = path.join(linkParent, "linked-candidate");
		await symlink(realDirectory, linkedDirectory);

		const { result } = await runValidator(linkedDirectory);

		expect(result).toEqual({
			ok: false,
			errors: [
				"candidate directory must be a regular directory, not a symbolic link",
			],
		});
	});

	test("rejects unsafe Design Reference retention", async () => {
		const rootDirectory = await createCandidateFixture();
		await mutateJson(rootDirectory, "candidate.json", (metadata) => {
			(metadata.designReference as Record<string, unknown>).locator =
				"https://example.com/reference?token=secret#detail";
		});

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain(
				"must omit query parameters and fragments",
			);
		}
	});

	test("rejects credentials in a retained Design Reference URL", async () => {
		const rootDirectory = await createCandidateFixture();
		await mutateJson(rootDirectory, "candidate.json", (metadata) => {
			(metadata.designReference as Record<string, unknown>).locator =
				"https://maintainer:secret@example.com/reference";
		});

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors.join(" ")).toContain("must omit URL credentials");
		}
	});

	test("rejects a duplicate candidate or Published Design System identity", async () => {
		const rootDirectory = await createCandidateFixture();
		const stateRoot = await mkdtemp(
			path.join(tmpdir(), "agentkogei-identities-"),
		);
		temporaryDirectories.push(stateRoot);
		const candidatesDirectory = path.join(stateRoot, "candidates");
		const publishedDirectory = path.join(stateRoot, "releases");
		await mkdir(path.join(candidatesDirectory, "different-name", "1.0"), {
			recursive: true,
		});
		await writeFile(
			path.join(candidatesDirectory, "different-name", "1.0", "candidate.json"),
			JSON.stringify({ id: "lattice" }),
		);
		await mkdir(path.join(publishedDirectory, "lattice", "1.0"), {
			recursive: true,
		});

		const { result } = await runValidator(
			rootDirectory,
			"--candidates",
			candidatesDirectory,
			"--published",
			publishedDirectory,
		);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain("duplicate candidate identity: lattice");
			expect(result.errors).toContain("identity is already published: lattice");
		}
	});

	test("checks names for uniqueness and does not count the candidate itself", async () => {
		const stateRoot = await mkdtemp(
			path.join(tmpdir(), "agentkogei-candidate-names-"),
		);
		temporaryDirectories.push(stateRoot);
		const candidatesDirectory = path.join(stateRoot, "candidates");
		const publishedDirectory = path.join(stateRoot, "releases");
		const currentDirectory = path.join(candidatesDirectory, "lattice", "1.0");
		await mkdir(path.dirname(currentDirectory), { recursive: true });
		const stagedDirectory = await createCandidateFixture();
		await rename(stagedDirectory, currentDirectory);

		const selfValidation = await runValidator(
			currentDirectory,
			"--candidates",
			candidatesDirectory,
			"--published",
			publishedDirectory,
		);
		expect(selfValidation.result.ok).toBe(true);

		const duplicateNameDirectory = path.join(
			candidatesDirectory,
			"another-identity",
			"1.0",
		);
		await mkdir(duplicateNameDirectory, { recursive: true });
		await writeFile(
			path.join(duplicateNameDirectory, "candidate.json"),
			JSON.stringify({ id: "another-identity", designSystem: "Lattice" }),
		);

		const duplicateName = await runValidator(
			currentDirectory,
			"--candidates",
			candidatesDirectory,
			"--published",
			publishedDirectory,
		);
		expect(duplicateName.result.ok).toBe(false);
		if (!duplicateName.result.ok) {
			expect(duplicateName.result.errors).toContain(
				"duplicate candidate name: Lattice",
			);
		}
	});

	test("rejects invalid versions, fabricated results, and absent Authoring Approval", async () => {
		const rootDirectory = await createCandidateFixture();
		await mutateJson(rootDirectory, "candidate.json", (metadata) => {
			(metadata.designSystemRelease as Record<string, unknown>).version =
				"1.0.0";
			Reflect.deleteProperty(metadata, "authoringApproval");
		});
		await mutateJson(rootDirectory, "evaluation/plan.json", (plan) => {
			plan.status = "passed";
			const humanReviews = plan.humanReviews as Record<
				string,
				Record<string, unknown>
			>;
			humanReviews.visual.status = "passed";
		});

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			const errors = result.errors.join(" ");
			expect(errors).toContain("candidate.json.designSystemRelease.version");
			expect(errors).toContain("candidate.json.authoringApproval");
			expect(errors).toContain("evaluation/plan.json.status");
			expect(errors).toContain(
				"evaluation/plan.json.humanReviews.visual.status",
			);
		}
	});

	test("rejects invalid UTF-8, hidden controls, and executable fences", async () => {
		const rootDirectory = await createCandidateFixture();
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			Buffer.concat([Buffer.from(completeDesignContract), Buffer.from([0xff])]),
		);
		await writeFile(
			path.join(rootDirectory, "candidate.json"),
			`${JSON.stringify(candidateMetadata())}\u202e`,
		);

		const invalidText = await runValidator(rootDirectory);
		expect(invalidText.result.ok).toBe(false);
		if (!invalidText.result.ok) {
			expect(invalidText.result.errors).toContain(
				"candidate.json contains hidden control characters",
			);
			expect(invalidText.result.errors).toContain(
				"DESIGN.md is not valid UTF-8 text",
			);
		}

		await writeFile(
			path.join(rootDirectory, "candidate.json"),
			`${JSON.stringify(candidateMetadata())}\n`,
		);
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			`${completeDesignContract}\n\`\`\`bash\nnpm install\n\`\`\`\n`,
		);
		const executableFence = await runValidator(rootDirectory);
		expect(executableFence.result.ok).toBe(false);
		if (!executableFence.result.ok) {
			expect(executableFence.result.errors).toContain(
				"DESIGN.md presents an executable bash block",
			);
		}
	});

	test("rejects indented and tilde executable fences", async () => {
		for (const fence of [
			"   ```javascript\nalert('unsafe')\n   ```",
			"~~~sh\nnpm install\n~~~",
		]) {
			const rootDirectory = await createCandidateFixture();
			await writeFile(
				path.join(rootDirectory, "DESIGN.md"),
				`${completeDesignContract}\n${fence}\n`,
			);

			const { result } = await runValidator(rootDirectory);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.errors.join(" ")).toContain("presents an executable");
			}
		}
	});

	test("rejects executable content in an unlabeled fence", async () => {
		const rootDirectory = await createCandidateFixture();
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			`${completeDesignContract}\n\`\`\`\nbun run deploy\n\`\`\`\n`,
		);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md presents an unlabeled fenced block that cannot be proven inert",
			);
		}
	});

	test("rejects every unlabeled fence regardless of executable syntax", async () => {
		for (const body of [
			"await fetch('/api')",
			"document.querySelector('main')",
			"const action = () => true",
			"echo hello",
		]) {
			const rootDirectory = await createCandidateFixture();
			await writeFile(
				path.join(rootDirectory, "DESIGN.md"),
				`${completeDesignContract}\n\`\`\`\n${body}\n\`\`\`\n`,
			);

			const { result } = await runValidator(rootDirectory);

			expect(result.ok).toBe(false);
		}
	});

	test("rejects incomplete coverage, unsupported compatibility, and candidate dependencies", async () => {
		const rootDirectory = await createCandidateFixture();
		const incomplete = completeDesignContract
			.replace("## Semantic color", "## Palette")
			.replace("React or Next.js", "Remix")
			.concat(
				"\nSee candidate.json and https://example.com/tokens.css, then run scripts/install.ts.\n",
			);
		await writeFile(path.join(rootDirectory, "DESIGN.md"), incomplete);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md is missing required section: semantic color",
			);
			expect(result.errors).toContain(
				"MVP compatibility requires React or Next.js",
			);
			expect(result.errors).toContain("DESIGN.md depends on candidate.json");
			expect(result.errors).toContain("DESIGN.md contains a remote dependency");
			expect(result.errors).toContain(
				"DESIGN.md depends on an executable or supporting resource",
			);
		}
	});

	test("requires every Design Contract section exactly once", async () => {
		const rootDirectory = await createCandidateFixture();
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			`${completeDesignContract}\n## Semantic color\nA conflicting second definition.\n`,
		);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md must contain required section exactly once: semantic color",
			);
		}
	});

	test("rejects a present section with incomplete mandatory coverage", async () => {
		const rootDirectory = await createCandidateFixture();
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			completeDesignContract.replace("target size, ", ""),
		);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md section accessibility is missing required coverage: target size",
			);
		}
	});

	test("requires three to five explicit principles", async () => {
		const rootDirectory = await createCandidateFixture();
		await writeFile(
			path.join(rootDirectory, "DESIGN.md"),
			completeDesignContract.replace(
				"- Principle: make relationships spatially precise.\n- Principle: reserve warmth for consequential action.\n",
				"- A decorative bullet that is not a principle.\n",
			),
		);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md must define three to five principles",
			);
		}
	});

	test("does not count headings or coverage terms inside fenced examples", async () => {
		const rootDirectory = await createCandidateFixture();
		const concealedCoverage = completeDesignContract
			.replace("## Semantic color", "## Palette")
			.concat(
				"\n```css\n## Semantic color\nlight dark background foreground card muted muted foreground border primary primary foreground destructive success warning info focus ring contrast hierarchy usage\n```\n",
			);
		await writeFile(path.join(rootDirectory, "DESIGN.md"), concealedCoverage);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"DESIGN.md is missing required section: semantic color",
			);
		}
	});

	test("rejects every named external dependency type", async () => {
		for (const dependency of [
			"Read candidate metadata for the remaining values.",
			"Use evaluation evidence to select tokens.",
			"Run hooks/theme.ts before rendering.",
			"Load the supporting resource [tokens](tokens.css).",
			"Load tokens from tokens.css.",
			"Use assets/theme.svg for the signature.",
			"Set the texture with url(tokens.css).",
		]) {
			const rootDirectory = await createCandidateFixture();
			await writeFile(
				path.join(rootDirectory, "DESIGN.md"),
				`${completeDesignContract}\n${dependency}\n`,
			);

			const { result } = await runValidator(rootDirectory);

			expect(result.ok).toBe(false);
		}
	});

	test("allows idiomatic punctuation and equivalent design terminology", async () => {
		const rootDirectory = await createCandidateFixture();
		const idiomaticContract = completeDesignContract
			.replace("muted foreground", "muted-foreground")
			.replace("primary foreground", "primary-foreground")
			.replace("line heights", "line-heights")
			.replace("tracking", "letter spacing")
			.replace("wrapping", "line breaking")
			.replace("assistive technology", "screen reader");
		await writeFile(path.join(rootDirectory, "DESIGN.md"), idiomaticContract);

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(true);
	});

	test("rejects copied reference content indicators in retained analysis", async () => {
		const rootDirectory = await createCandidateFixture();
		await mutateJson(rootDirectory, "candidate.json", (metadata) => {
			const designReference = metadata.designReference as Record<
				string,
				unknown
			>;
			designReference.generalizedTraits = [
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
				"clear hierarchy",
				"precise geometry",
			];
		});

		const { result } = await runValidator(rootDirectory);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.errors).toContain(
				"Design Reference analysis contains retained raw content",
			);
		}
	});

	test("rejects raw reference content indicators in every retained text field", async () => {
		const metadataRoot = await createCandidateFixture();
		await mutateJson(metadataRoot, "candidate.json", (metadata) => {
			(metadata.creativeBrief as Record<string, unknown>).intendedFit =
				"<html><body>copied page</body></html>";
		});
		const metadataResult = await runValidator(metadataRoot);
		expect(metadataResult.result.ok).toBe(false);
		if (!metadataResult.result.ok) {
			expect(metadataResult.result.errors).toContain(
				"Candidate metadata contains retained raw reference content",
			);
		}

		const contractRoot = await createCandidateFixture();
		await writeFile(
			path.join(contractRoot, "DESIGN.md"),
			`${completeDesignContract}\n![copied image](asset.png)\n`,
		);
		const contractResult = await runValidator(contractRoot);
		expect(contractResult.result.ok).toBe(false);
		if (!contractResult.result.ok) {
			expect(contractResult.result.errors).toContain(
				"DESIGN.md contains retained raw reference content",
			);
		}
	});

	test("supports either React or Next.js with the required CSS and UI stack", async () => {
		for (const framework of ["React", "Next.js"]) {
			const rootDirectory = await createCandidateFixture();
			await writeFile(
				path.join(rootDirectory, "DESIGN.md"),
				completeDesignContract.replace("React or Next.js", framework),
			);

			const { result } = await runValidator(rootDirectory);

			expect(result.ok).toBe(true);
		}
	});

	test("supports either breakpoints or content driven responsive transitions", async () => {
		for (const strategy of ["breakpoints", "content driven transitions"]) {
			const rootDirectory = await createCandidateFixture();
			await writeFile(
				path.join(rootDirectory, "DESIGN.md"),
				completeDesignContract.replace(
					"breakpoints or content driven transitions",
					strategy,
				),
			);

			const { result } = await runValidator(rootDirectory);

			expect(result.ok).toBe(true);
		}
	});

	test("creates a candidate atomically and refuses an existing identity", async () => {
		const stateRoot = await mkdtemp(
			path.join(tmpdir(), "agentkogei-creation-"),
		);
		temporaryDirectories.push(stateRoot);
		const candidatesDirectory = path.join(stateRoot, "candidates");
		const publishedDirectory = path.join(stateRoot, "releases");
		const stagedDirectory = await createCandidateFixture();

		const created = await runCreator(
			stagedDirectory,
			candidatesDirectory,
			publishedDirectory,
		);

		expect(created).toEqual({
			exitCode: 0,
			result: {
				ok: true,
				candidateDirectory: path.join(candidatesDirectory, "lattice", "1.0"),
			},
		});
		expect(
			(
				await readdir(path.join(candidatesDirectory, "lattice", "1.0"), {
					recursive: true,
				})
			).sort(),
		).toEqual([
			"DESIGN.md",
			"candidate.json",
			"evaluation",
			"evaluation/plan.json",
		]);

		const secondStagedDirectory = await createCandidateFixture();
		const refused = await runCreator(
			secondStagedDirectory,
			candidatesDirectory,
			publishedDirectory,
		);
		expect(refused.exitCode).toBe(1);
		expect(refused.result).toEqual({
			ok: false,
			errors: [
				"duplicate candidate identity: lattice",
				"duplicate candidate name: Lattice",
			],
		});
		expect(
			await readFile(path.join(secondStagedDirectory, "DESIGN.md"), "utf8"),
		).toBe(completeDesignContract);
	});

	test("refuses to create a candidate whose Authoring Approval is already recorded", async () => {
		const stateRoot = await mkdtemp(
			path.join(tmpdir(), "agentkogei-preapproved-"),
		);
		temporaryDirectories.push(stateRoot);
		const stagedDirectory = await createCandidateFixture();
		await mutateJson(stagedDirectory, "candidate.json", (metadata) => {
			metadata.authoringApproval = {
				status: "approved",
				recordedAt: "2026-08-10T12:00:00Z",
			};
		});
		const candidatesDirectory = path.join(stateRoot, "candidates");

		const created = await runCreator(
			stagedDirectory,
			candidatesDirectory,
			path.join(stateRoot, "releases"),
		);

		expect(created).toEqual({
			exitCode: 1,
			result: {
				ok: false,
				errors: ["candidate creation requires pending Authoring Approval"],
			},
		});
		expect(await readdir(stateRoot)).not.toContain("candidates");
	});

	test("records Authoring Approval without changing pending evaluation gates", async () => {
		const candidateDirectory = await createCandidateFixture();
		const planBefore = await readFile(
			path.join(candidateDirectory, "evaluation/plan.json"),
			"utf8",
		);

		const approval = await recordAuthoringApproval(
			candidateDirectory,
			"2026-08-10T12:00:00Z",
		);

		expect(approval).toEqual({
			exitCode: 0,
			result: {
				ok: true,
				authoringApproval: "approved",
				recordedAt: "2026-08-10T12:00:00Z",
				evaluationStatus: "pending",
				publicationApproval: "pending",
			},
		});
		const metadata = JSON.parse(
			await readFile(path.join(candidateDirectory, "candidate.json"), "utf8"),
		) as Record<string, unknown>;
		expect(metadata.authoringApproval).toEqual({
			status: "approved",
			recordedAt: "2026-08-10T12:00:00Z",
		});
		expect(
			await readFile(
				path.join(candidateDirectory, "evaluation/plan.json"),
				"utf8",
			),
		).toBe(planBefore);
	});
});
