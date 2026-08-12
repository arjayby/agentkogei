import { afterEach, describe, expect, test } from "bun:test";
import {
	access,
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

import { discoverPublishedDesignSystems } from "../src/published-design-systems";
import { publishedReleaseDirectory } from "./support/published-release";

const repository = path.resolve(import.meta.dirname, "../../..");
const skillDirectory = path.join(
	repository,
	".agents/skills/add-design-system",
);
const finalizer = path.join(skillDirectory, "scripts/finalize-release.ts");
const temporaryDirectories: string[] = [];

const completeDesignContract = `# Lattice Design System

## Identity and intended fit
Lattice is the Design System name. Its intended fit is dense collaborative planning products, while unsuitable uses include expressive consumer entertainment. It creates a calm and decisive working experience.

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

function additionReport() {
	return {
		schemaVersion: "2.0",
		status: "passed",
		designSystem: "Lattice",
		designReference: {
			kind: "url",
			locator: "https://example.com/product",
			inspectedPages: [
				{
					path: "/product",
					scope: "Header through the complete footer",
					reachedBottom: true,
				},
				{
					path: "/sign-in",
					scope: "Authentication form through the page footer",
					reachedBottom: true,
				},
				{
					path: "/pricing",
					scope: "Plans, comparison content, questions, and footer",
					reachedBottom: true,
				},
			],
			additionalPages: { inspected: 2, limitation: null },
			generalizedTraits: [
				"Compact information density",
				"Clear typographic hierarchy",
				"Precise rectangular geometry",
			],
			transformation:
				"Transforms general density and hierarchy into an original planning grid with a warm decision accent.",
			excludedElements: [
				"copied assets",
				"product identity",
				"distinctive compositions",
				"recognizable product replication",
				"imitation of living designers",
			],
		},
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
		coverage: {
			viewports: ["1440x900", "390x844"],
			colorSchemes: ["light", "dark"],
			reducedMotion: true,
		},
		automatedChecks: {
			structure: "passed",
			accessibility: "passed",
			responsiveOverflow: "passed",
			colorContrast: "passed",
		},
		originalityReview: {
			status: "passed",
			notes:
				"The release uses original tokens, prose, specimens, and composition and contains no retained reference assets.",
		},
	};
}

async function createFixture() {
	const root = await mkdtemp(path.join(tmpdir(), "agentkogei-add-system-"));
	temporaryDirectories.push(root);
	const releases = path.join(root, "releases");
	const foundation = path.join(releases, "foundation", "1.0");
	await mkdir(path.dirname(foundation), { recursive: true });
	await cp(publishedReleaseDirectory("foundation", "1.0"), foundation, {
		recursive: true,
	});

	const staging = path.join(root, "staging");
	await mkdir(path.join(staging, "evaluation"), { recursive: true });
	const metadata = JSON.parse(
		await readFile(
			path.join(foundation, "design-system-evaluation.json"),
			"utf8",
		),
	);
	metadata.schemaVersion = "5.0";
	metadata.id = "lattice";
	metadata.designSystem = "Lattice";
	metadata.designSystemRelease.publishedAt = "2026-08-13";
	metadata.designContract.sha256 = new Bun.CryptoHasher("sha256")
		.update(completeDesignContract)
		.digest("hex");
	metadata.evaluation.agentGenerationRuns = 1;
	Reflect.deleteProperty(metadata.evaluation, "humanReview");
	metadata.preview.order = 5;
	metadata.preview.route = "/design-systems/lattice";
	await Promise.all([
		writeFile(path.join(staging, "DESIGN.md"), completeDesignContract),
		writeFile(
			path.join(staging, "design-system-evaluation.json"),
			`${JSON.stringify(metadata, null, "\t")}\n`,
		),
		writeFile(
			path.join(staging, "evaluation/report.json"),
			`${JSON.stringify(additionReport(), null, "\t")}\n`,
		),
	]);
	return { releases, staging };
}

async function runFinalizer(staging: string, releases: string) {
	const process_ = Bun.spawn(
		[process.execPath, finalizer, staging, "--releases", releases],
		{ stdout: "pipe", stderr: "pipe" },
	);
	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(process_.stdout).text(),
		new Response(process_.stderr).text(),
		process_.exited,
	]);
	return {
		exitCode,
		stderr,
		result: JSON.parse(stdout) as Record<string, unknown>,
	};
}

afterEach(async () => {
	await Promise.all(
		temporaryDirectories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("Add Design System workflow", () => {
	test("exposes one explicit skill with complete URL inspection and pull request publication", async () => {
		const [skill, interfaceMetadata] = await Promise.all([
			readFile(path.join(skillDirectory, "SKILL.md"), "utf8"),
			readFile(path.join(skillDirectory, "agents/openai.yaml"), "utf8"),
		]);

		expect(skill).toMatch(/^---\nname: add-design-system\n/);
		expect(skill).toContain("Scroll incrementally until the true page footer");
		expect(skill).toContain(
			"two or three additional publicly accessible pages",
		);
		expect(skill).toContain("sign in or authentication");
		expect(skill).toContain("Do not run `bun run deploy:prod`");
		expect(skill).toContain("open a ready pull request targeting `main`");
		expect(interfaceMetadata).toContain("$add-design-system");
		await expect(
			access(path.join(repository, ".agents/skills/author-design-system")),
		).rejects.toThrow();
		await expect(
			access(path.join(repository, ".agents/skills/publish-design-system")),
		).rejects.toThrow();
	});

	test("atomically adds one validated final release without approval metadata", async () => {
		const { releases, staging } = await createFixture();

		const result = await runFinalizer(staging, releases);

		expect(result.stderr).toBe("");
		expect(result.exitCode).toBe(0);
		expect(result.result).toMatchObject({
			ok: true,
			identity: "lattice",
			designSystem: "Lattice",
			version: "1.0",
		});
		const discovered = await discoverPublishedDesignSystems(releases);
		expect(discovered.map(({ id }) => id)).toEqual(["foundation", "lattice"]);
		const addedMetadata = JSON.parse(
			await readFile(
				path.join(releases, "lattice/1.0/design-system-evaluation.json"),
				"utf8",
			),
		);
		expect(addedMetadata.schemaVersion).toBe("5.0");
		expect(addedMetadata.evaluation).not.toHaveProperty("humanReview");
		expect(await readdir(staging)).toContain("DESIGN.md");
	});

	test("refuses a duplicate final identity without changing staging", async () => {
		const { releases, staging } = await createFixture();
		expect((await runFinalizer(staging, releases)).exitCode).toBe(0);

		const duplicate = await runFinalizer(staging, releases);

		expect(duplicate.exitCode).toBe(1);
		expect(duplicate.result.ok).toBe(false);
		expect(duplicate.result.errors).toContain(
			"identity is already published: lattice",
		);
		expect(duplicate.result.errors).toContain(
			"Design System name is already published: Lattice",
		);
		expect(await readdir(staging)).toContain("DESIGN.md");
	});

	test("requires a reason when fewer than two additional URL pages are available", async () => {
		const { releases, staging } = await createFixture();
		const reportPath = path.join(staging, "evaluation/report.json");
		const report = additionReport();
		report.designReference.inspectedPages = [
			report.designReference.inspectedPages[0],
		];
		report.designReference.additionalPages = {
			inspected: 0,
			limitation: null,
		};
		await writeFile(reportPath, `${JSON.stringify(report, null, "\t")}\n`);

		const result = await runFinalizer(staging, releases);

		expect(result.exitCode).toBe(1);
		expect(result.result.errors).toContain(
			"evaluation/report.json.designReference.additionalPages.limitation: must explain why fewer than two useful additional pages were available",
		);
	});
});
