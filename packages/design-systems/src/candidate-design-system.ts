import { lstat, readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { designSystemIdentitySchema } from "./design-system-identity";
import { hasHiddenDocumentControl } from "./text-safety";

export const candidateMetadataFileName = "candidate.json";
export const candidateEvaluationPlanFileName = "evaluation/plan.json";
export const candidateDesignContractFileName = "DESIGN.md";

const safeTextSchema = z
	.string()
	.trim()
	.min(1)
	.refine((value) => !hasHiddenDocumentControl(value), {
		message: "must not contain hidden control characters",
	});

const safeUrlSchema = z
	.url()
	.refine((value) => {
		const url = new URL(value);
		return url.protocol === "https:";
	}, "must use HTTPS")
	.refine((value) => {
		const url = new URL(value);
		return url.search === "" && url.hash === "";
	}, "must omit query parameters and fragments")
	.refine((value) => {
		const url = new URL(value);
		return url.username === "" && url.password === "";
	}, "must omit URL credentials");

const excludedElements = [
	"copied assets",
	"product identity",
	"distinctive compositions",
	"recognizable product replication",
	"imitation of living designers",
] as const;

const authoringApprovalSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("pending"), recordedAt: z.null() }).strict(),
	z
		.object({ status: z.literal("approved"), recordedAt: z.iso.datetime() })
		.strict(),
]);

export const candidateMetadataSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		status: z.literal("candidate"),
		id: designSystemIdentitySchema,
		designSystem: safeTextSchema,
		designSystemRelease: z.object({ version: z.literal("1.0") }).strict(),
		creativeBrief: z
			.object({
				intendedFit: safeTextSchema,
				systemSignature: safeTextSchema,
				referenceTransformation: safeTextSchema,
				inspiredTraits: z.array(safeTextSchema).min(3),
				excludedElements: z.array(z.enum(excludedElements)).length(5),
			})
			.strict(),
		designReference: z.discriminatedUnion("kind", [
			z
				.object({
					kind: z.literal("url"),
					locator: safeUrlSchema,
					inspectedScope: safeTextSchema,
					generalizedTraits: z.array(safeTextSchema).min(3),
				})
				.strict(),
			z
				.object({
					kind: z.literal("image"),
					locator: z.literal("user-supplied-image"),
					inspectedScope: safeTextSchema,
					generalizedTraits: z.array(safeTextSchema).min(3),
				})
				.strict(),
		]),
		authoringApproval: authoringApprovalSchema,
	})
	.strict();

const pendingResultSchema = z
	.object({
		status: z.literal("pending"),
		evidence: z.array(z.never()).length(0),
	})
	.strict();

const pendingApprovalSchema = z
	.object({ status: z.literal("pending"), recordedAt: z.null() })
	.strict();

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

const requiredChecks = [
	"structure",
	"accessibility",
	"responsive-overflow",
	"color-contrast",
] as const;

export const candidateEvaluationPlanSchema = z
	.object({
		schemaVersion: z.literal("1.0"),
		status: z.literal("pending"),
		standard: z.literal("WCAG 2.2 Level AA"),
		screens: z.array(z.enum(requiredScreens)).length(8),
		viewports: z.array(z.enum(["1440x900", "390x844"])).length(2),
		colorSchemes: z.array(z.enum(["light", "dark"])).length(2),
		reducedMotion: z.literal(true),
		agentGenerationRuns: z
			.array(
				z
					.object({
						id: z.string().regex(/^run-[1-9]\d*$/),
						...pendingResultSchema.shape,
					})
					.strict(),
			)
			.min(2),
		automatedChecks: z
			.array(
				z
					.object({ id: z.enum(requiredChecks), ...pendingResultSchema.shape })
					.strict(),
			)
			.length(4),
		humanReviews: z
			.object({
				visual: pendingResultSchema,
				accessibility: pendingResultSchema,
				rights: pendingResultSchema,
			})
			.strict(),
		publicationApproval: pendingApprovalSchema,
	})
	.strict();

export type CandidateValidationResult =
	| {
			ok: true;
			designSystem: string;
			identity: string;
			version: "1.0";
			authoringApproval: "pending" | "approved";
			mechanicalValidation: true;
	  }
	| { ok: false; errors: string[] };

const expectedFiles = [
	candidateDesignContractFileName,
	candidateMetadataFileName,
	candidateEvaluationPlanFileName,
] as const;

type CandidateEntry = {
	path: string;
	kind: "directory" | "file";
};

async function listEntries(
	directory: string,
	prefix = "",
): Promise<CandidateEntry[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const listed: CandidateEntry[] = [];
	for (const entry of entries.sort((left, right) =>
		left.name.localeCompare(right.name),
	)) {
		const relativePath = path.posix.join(prefix, entry.name);
		if (entry.isDirectory()) {
			listed.push({ path: relativePath, kind: "directory" });
			listed.push(
				...(await listEntries(path.join(directory, entry.name), relativePath)),
			);
		} else {
			listed.push({ path: relativePath, kind: "file" });
		}
	}
	return listed;
}

async function validateContents(rootDirectory: string) {
	const errors: string[] = [];
	let entries: CandidateEntry[];
	try {
		const rootStatistics = await lstat(rootDirectory);
		if (rootStatistics.isSymbolicLink()) {
			return [
				"candidate directory must be a regular directory, not a symbolic link",
			];
		}
		if (!rootStatistics.isDirectory()) {
			return ["candidate directory must be a regular directory"];
		}
		entries = await listEntries(rootDirectory);
	} catch {
		return ["candidate directory is missing or unreadable"];
	}
	for (const entry of entries) {
		if (entry.kind === "directory") {
			if (entry.path !== "evaluation") {
				errors.push(`unexpected candidate directory: ${entry.path}`);
			}
		} else if (
			!expectedFiles.includes(entry.path as (typeof expectedFiles)[number])
		) {
			errors.push(`unexpected candidate file: ${entry.path}`);
		}
	}
	const files = entries
		.filter((entry) => entry.kind === "file")
		.map((entry) => entry.path);
	for (const file of expectedFiles) {
		if (!files.includes(file)) {
			errors.push(`candidate file is missing: ${file}`);
			continue;
		}
		const statistics = await lstat(path.join(rootDirectory, file));
		if (statistics.isSymbolicLink()) {
			errors.push(`symbolic link is prohibited: ${file}`);
		} else if (!statistics.isFile()) {
			errors.push(`candidate artifact must be a regular file: ${file}`);
		}
	}
	return errors;
}

async function readUtf8Json(file: string, label: string) {
	try {
		const bytes = await readFile(file);
		const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
		if (hasHiddenDocumentControl(text)) {
			return { errors: [`${label} contains hidden control characters`] };
		}
		return { value: JSON.parse(text) as unknown, errors: [] as string[] };
	} catch (error) {
		return {
			errors: [
				error instanceof TypeError
					? `${label} is not valid UTF-8 text`
					: `${label} is missing or invalid JSON`,
			],
		};
	}
}

function formatSchemaErrors(label: string, error: z.ZodError) {
	return error.issues.map(
		(issue) => `${label}.${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}

const coverageHeadings = [
	"identity and intended fit",
	"principles and system signature",
	"semantic color",
	"typography",
	"spacing and density",
	"responsive layout",
	"components and interaction states",
	"product surfaces",
	"feedback states",
	"motion",
	"accessibility",
	"supported stack",
	"agent examples",
	"final validation",
] as const;

const inertFenceLanguages = new Set(["css", "svg"]);

const requiredSectionTerms = new Map<string, string[]>([
	[
		"identity and intended fit",
		["name", "intended fit", "unsuitable", "experience"],
	],
	["principles and system signature", ["principle", "system signature"]],
	[
		"semantic color",
		[
			"light",
			"dark",
			"background",
			"foreground",
			"card",
			"muted",
			"muted foreground",
			"border",
			"primary",
			"primary foreground",
			"destructive",
			"success",
			"warning",
			"info",
			"focus ring",
			"contrast",
			"hierarchy",
			"usage",
		],
	],
	[
		"typography",
		[
			"display",
			"body",
			"label",
			"code",
			"weight",
			"line height",
			"tracking",
			"wrapping",
			"responsive",
		],
	],
	[
		"spacing and density",
		[
			"base spacing unit",
			"scale",
			"density",
			"control",
			"content rhythm",
			"grouping",
		],
	],
	[
		"responsive layout",
		[
			"mobile",
			"tablet",
			"desktop",
			"content width",
			"grid",
			"navigation",
			"reflow",
			"overflow",
		],
	],
	[
		"components and interaction states",
		[
			"geometry",
			"behavior",
			"button",
			"link",
			"input",
			"text area",
			"select",
			"checkbox",
			"navigation",
			"card",
			"dialog",
			"menu",
			"table",
			"feedback",
			"default",
			"hover",
			"focus",
			"active",
			"selected",
			"disabled",
			"invalid",
			"destructive",
		],
	],
	[
		"product surfaces",
		[
			"marketing",
			"authentication",
			"onboarding",
			"dashboard",
			"table",
			"form",
			"settings",
			"state",
		],
	],
	[
		"feedback states",
		[
			"loading",
			"empty",
			"error",
			"success",
			"disabled",
			"destructive",
			"recovery action",
			"stable layout",
		],
	],
	[
		"motion",
		[
			"duration",
			"easing",
			"spatial movement",
			"enter",
			"exit",
			"continuity",
			"reduced motion",
		],
	],
	[
		"accessibility",
		[
			"wcag 2.2 level aa",
			"keyboard",
			"visible focus",
			"semantics",
			"accessible name",
			"contrast",
			"target size",
			"zoom",
			"reflow",
			"error identification",
			"assistive technology",
			"reduced motion",
		],
	],
	[
		"supported stack",
		["tailwind css v4", "shadcn/ui", "semantic token", "component variant"],
	],
	[
		"agent examples",
		["good request", "bad request", "faithful", "prohibited drift"],
	],
	[
		"final validation",
		[
			"surface",
			"state",
			"viewport",
			"color scheme",
			"motion",
			"component interaction",
			"stack",
			"accessibility",
		],
	],
]);

const coverageAliases = new Map<string, string[]>([
	["intended fit", ["product fit", "suitable for"]],
	["unsuitable", ["not for", "avoid using", "inappropriate"]],
	["experience", ["product feel"]],
	["system signature", ["signature"]],
	["muted foreground", ["secondary text"]],
	["primary foreground", ["on primary"]],
	["focus ring", ["focus indicator"]],
	["line height", ["leading"]],
	["tracking", ["letter spacing"]],
	["wrapping", ["line breaking"]],
	["base spacing unit", ["base unit"]],
	["content rhythm", ["vertical rhythm"]],
	["content width", ["measure"]],
	["content driven", ["intrinsic"]],
	["text area", ["multiline input"]],
	["checkbox", ["check box"]],
	["visible focus", ["focus indicator"]],
	["accessible name", ["accessible label"]],
	["assistive technology", ["screen reader"]],
	["semantic token", ["design token"]],
	["component variant", ["variant"]],
	["prohibited drift", ["visual drift"]],
]);

const normalizeCoverageText = (value: string) =>
	value
		.normalize("NFKC")
		.toLowerCase()
		.replaceAll(/[-_/]/g, " ")
		.replaceAll(/\s+/g, " ")
		.trim();

const retainedRawContentPattern =
	/(?:data\s*:\s*image|base64|<\s*(?:!doctype|html|head|body|img|script|style|link|meta)\b|!\[[^\]]*\]\s*\(|[a-z0-9+/]{80,}={0,2})/i;

function containsRetainedRawContent(value: unknown): boolean {
	if (typeof value === "string") return retainedRawContentPattern.test(value);
	if (Array.isArray(value)) return value.some(containsRetainedRawContent);
	if (value && typeof value === "object") {
		return Object.values(value).some(containsRetainedRawContent);
	}
	return false;
}

function validateDesignContract(bytes: Buffer) {
	const errors: string[] = [];
	let markdown: string;
	try {
		markdown = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		return [`${candidateDesignContractFileName} is not valid UTF-8 text`];
	}
	if (hasHiddenDocumentControl(markdown)) {
		errors.push(
			`${candidateDesignContractFileName} contains hidden control characters`,
		);
	}
	if (containsRetainedRawContent(markdown)) {
		errors.push(
			`${candidateDesignContractFileName} contains retained raw reference content`,
		);
	}
	const headingCounts = new Map<string, number>();
	const sectionContents = new Map<string, string[]>();
	let currentSection: string | undefined;
	let coverageFence: { marker: string; length: number } | undefined;
	for (const line of markdown.split("\n")) {
		const fence = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
		if (fence) {
			const marker = fence[1] ?? "";
			const rest = (fence[2] ?? "").trim();
			if (
				coverageFence &&
				marker[0] === coverageFence.marker &&
				marker.length >= coverageFence.length &&
				rest === ""
			) {
				coverageFence = undefined;
			} else if (!coverageFence) {
				coverageFence = {
					marker: marker[0] ?? "",
					length: marker.length,
				};
			}
			continue;
		}
		if (coverageFence) continue;
		const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]?.toLowerCase();
		if (heading) {
			currentSection = coverageHeadings.includes(
				heading as (typeof coverageHeadings)[number],
			)
				? heading
				: undefined;
			if (currentSection) {
				headingCounts.set(
					currentSection,
					(headingCounts.get(currentSection) ?? 0) + 1,
				);
				if (!sectionContents.has(currentSection)) {
					sectionContents.set(currentSection, []);
				}
			}
			continue;
		}
		if (currentSection) sectionContents.get(currentSection)?.push(line);
	}
	for (const heading of coverageHeadings) {
		const count = headingCounts.get(heading) ?? 0;
		if (count === 0) {
			errors.push(
				`${candidateDesignContractFileName} is missing required section: ${heading}`,
			);
			continue;
		}
		if (count !== 1) {
			errors.push(
				`${candidateDesignContractFileName} must contain required section exactly once: ${heading}`,
			);
		}
		const rawContent = sectionContents.get(heading)?.join("\n") ?? "";
		const content = normalizeCoverageText(rawContent);
		if (content.trim().length < 20) {
			errors.push(
				`${candidateDesignContractFileName} required section carries insufficient direction: ${heading}`,
			);
		}
		for (const term of requiredSectionTerms.get(heading) ?? []) {
			const acceptedTerms = [term, ...(coverageAliases.get(term) ?? [])].map(
				normalizeCoverageText,
			);
			if (!acceptedTerms.some((accepted) => content.includes(accepted))) {
				errors.push(
					`${candidateDesignContractFileName} section ${heading} is missing required coverage: ${term}`,
				);
			}
		}
		if (heading === "principles and system signature") {
			const principleCount = rawContent
				.split("\n")
				.filter((line) =>
					/^\s*(?:[-*+]|\d+\.)\s+(?:\*\*)?principle\b/i.test(line),
				).length;
			if (principleCount < 3 || principleCount > 5) {
				errors.push(
					`${candidateDesignContractFileName} must define three to five principles`,
				);
			}
		}
		if (
			heading === "responsive layout" &&
			!content.includes("breakpoint") &&
			!content.includes("content driven") &&
			!content.includes("intrinsic")
		) {
			errors.push(
				`${candidateDesignContractFileName} section responsive layout requires breakpoints or content driven transitions`,
			);
		}
	}
	let openFence: { marker: string; length: number } | undefined;
	for (const line of markdown.split("\n")) {
		const fence = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
		if (!fence) continue;
		const marker = fence[1] ?? "";
		const rest = (fence[2] ?? "").trim();
		if (openFence) {
			if (
				marker[0] === openFence.marker &&
				marker.length >= openFence.length &&
				rest === ""
			) {
				openFence = undefined;
			}
			continue;
		}
		const language = rest.split(/\s+/)[0]?.toLowerCase() ?? "";
		openFence = { marker: marker[0] ?? "", length: marker.length };
		if (language === "") {
			errors.push(
				`${candidateDesignContractFileName} presents an unlabeled fenced block that cannot be proven inert`,
			);
		} else if (!inertFenceLanguages.has(language)) {
			errors.push(
				`${candidateDesignContractFileName} presents an executable ${language || "unknown"} block`,
			);
		}
	}
	for (const dependency of [
		"candidate.json",
		"candidate metadata",
		"evaluation/plan.json",
		"evaluation evidence",
		"design reference",
		"supporting resource",
	]) {
		if (markdown.toLowerCase().includes(dependency)) {
			errors.push(
				`${candidateDesignContractFileName} depends on ${dependency}`,
			);
		}
	}
	if (/https?:\/\//i.test(markdown) || /@import\s+/i.test(markdown)) {
		errors.push(
			`${candidateDesignContractFileName} contains a remote dependency`,
		);
	}
	if (
		/\b(?:(?:scripts?|hooks?)\/|postinstall|preinstall|package\.json)\b/i.test(
			markdown,
		)
	) {
		errors.push(
			`${candidateDesignContractFileName} depends on an executable or supporting resource`,
		);
	}
	if (/\[[^\]]+\]\((?!https?:|#)[^)]+\)/i.test(markdown)) {
		errors.push(
			`${candidateDesignContractFileName} depends on a local supporting resource`,
		);
	}
	if (
		/\bassets?\/[a-z0-9_./-]+/i.test(markdown) ||
		/\b(?:load|read|source|depend(?:s|ed|ing)?\s+on)\b[^\n]{0,80}\b[a-z0-9_.-]+\.(?:css|svg|png|jpe?g|gif|webp|json|md|tsx?|jsx?)\b/i.test(
			markdown,
		) ||
		/url\(\s*["']?(?!#|data:|https?:|var\()[^)]+\)/i.test(markdown)
	) {
		errors.push(
			`${candidateDesignContractFileName} depends on a bare local supporting resource`,
		);
	}
	const stackSection =
		sectionContents.get("supported stack")?.join("\n").toLowerCase() ?? "";
	if (!stackSection.includes("react") && !stackSection.includes("next.js")) {
		errors.push("MVP compatibility requires React or Next.js");
	}
	return errors;
}

const normalizedName = (value: string) =>
	value.normalize("NFKC").trim().toLocaleLowerCase("en-US");

type ExistingDesignSystems = {
	identities: Set<string>;
	names: Set<string>;
};

async function readIdentityAndName(file: string) {
	try {
		const metadata = JSON.parse(await readFile(file, "utf8")) as {
			id?: unknown;
			designSystem?: unknown;
		};
		return {
			identity: typeof metadata.id === "string" ? metadata.id : undefined,
			name:
				typeof metadata.designSystem === "string"
					? normalizedName(metadata.designSystem)
					: undefined,
		};
	} catch {
		return {};
	}
}

async function existingCandidates(
	directory: string,
	currentCandidateRoot: string,
): Promise<ExistingDesignSystems> {
	const identities = new Set<string>();
	const names = new Set<string>();
	for (const identityEntry of await readdir(directory, {
		withFileTypes: true,
	}).catch(() => [])) {
		if (!identityEntry.isDirectory()) continue;
		const identityDirectory = path.join(directory, identityEntry.name);
		let hasOtherRelease = false;
		for (const versionEntry of await readdir(identityDirectory, {
			withFileTypes: true,
		}).catch(() => [])) {
			if (!versionEntry.isDirectory()) continue;
			const releaseDirectory = path.join(identityDirectory, versionEntry.name);
			const releaseRoot = await realpath(releaseDirectory).catch(() =>
				path.resolve(releaseDirectory),
			);
			if (releaseRoot === currentCandidateRoot) continue;
			hasOtherRelease = true;
			const existing = await readIdentityAndName(
				path.join(releaseDirectory, candidateMetadataFileName),
			);
			if (existing.identity) identities.add(existing.identity);
			if (existing.name) names.add(existing.name);
		}
		if (
			hasOtherRelease ||
			!(await readdir(identityDirectory).catch(() => [])).length
		) {
			identities.add(identityEntry.name);
		}
	}
	return { identities, names };
}

async function existingPublishedDesignSystems(
	directory: string,
): Promise<ExistingDesignSystems> {
	const identities = new Set<string>();
	const names = new Set<string>();
	for (const identityEntry of await readdir(directory, {
		withFileTypes: true,
	}).catch(() => [])) {
		if (!identityEntry.isDirectory()) continue;
		identities.add(identityEntry.name);
		const identityDirectory = path.join(directory, identityEntry.name);
		for (const versionEntry of await readdir(identityDirectory, {
			withFileTypes: true,
		}).catch(() => [])) {
			if (!versionEntry.isDirectory()) continue;
			const existing = await readIdentityAndName(
				path.join(
					identityDirectory,
					versionEntry.name,
					"design-system-evaluation.json",
				),
			);
			if (existing.identity) identities.add(existing.identity);
			if (existing.name) names.add(existing.name);
		}
	}
	return { identities, names };
}

export type CandidateValidationOptions = {
	candidatesDirectory?: string;
	publishedReleasesDirectory?: string;
};

export async function validateCandidateDesignSystemRelease(
	rootDirectory: string,
	options: CandidateValidationOptions = {},
): Promise<CandidateValidationResult> {
	const errors = await validateContents(rootDirectory);
	if (errors.length > 0) return { ok: false, errors };

	const [metadataSource, planSource, contract] = await Promise.all([
		readUtf8Json(
			path.join(rootDirectory, candidateMetadataFileName),
			candidateMetadataFileName,
		),
		readUtf8Json(
			path.join(rootDirectory, candidateEvaluationPlanFileName),
			candidateEvaluationPlanFileName,
		),
		readFile(path.join(rootDirectory, candidateDesignContractFileName)),
	]);
	errors.push(...validateDesignContract(contract));
	if (metadataSource.errors.length > 0 || planSource.errors.length > 0) {
		return {
			ok: false,
			errors: [...metadataSource.errors, ...planSource.errors, ...errors],
		};
	}

	const parsedMetadata = candidateMetadataSchema.safeParse(
		metadataSource.value,
	);
	const parsedPlan = candidateEvaluationPlanSchema.safeParse(planSource.value);
	if (!parsedMetadata.success)
		errors.push(
			...formatSchemaErrors(candidateMetadataFileName, parsedMetadata.error),
		);
	if (!parsedPlan.success)
		errors.push(
			...formatSchemaErrors(candidateEvaluationPlanFileName, parsedPlan.error),
		);
	if (!parsedMetadata.success || !parsedPlan.success)
		return { ok: false, errors };

	const metadata = parsedMetadata.data;
	if (
		metadata.designReference.generalizedTraits.some((trait) =>
			retainedRawContentPattern.test(trait),
		)
	) {
		errors.push("Design Reference analysis contains retained raw content");
	}
	if (
		containsRetainedRawContent([
			metadata.designSystem,
			metadata.creativeBrief,
			metadata.designReference.inspectedScope,
		])
	) {
		errors.push("Candidate metadata contains retained raw reference content");
	}
	if (
		new Set(metadata.creativeBrief.excludedElements).size !==
		excludedElements.length
	) {
		errors.push(
			"creativeBrief.excludedElements must contain every required exclusion exactly once",
		);
	}
	if (new Set(parsedPlan.data.screens).size !== requiredScreens.length) {
		errors.push("evaluation screens must be unique and complete");
	}
	if (new Set(parsedPlan.data.viewports).size !== 2) {
		errors.push(
			"evaluation viewports must include desktop and mobile exactly once",
		);
	}
	if (new Set(parsedPlan.data.colorSchemes).size !== 2) {
		errors.push(
			"evaluation color schemes must include light and dark exactly once",
		);
	}
	if (
		new Set(parsedPlan.data.automatedChecks.map(({ id }) => id)).size !==
		requiredChecks.length
	) {
		errors.push("automated checks must be unique and complete");
	}

	if (options.candidatesDirectory) {
		const candidatesDirectory = options.candidatesDirectory;
		const candidateRoot = await realpath(rootDirectory).catch(() =>
			path.resolve(rootDirectory),
		);
		const existing = await existingCandidates(
			candidatesDirectory,
			candidateRoot,
		);
		if (existing.identities.has(metadata.id))
			errors.push(`duplicate candidate identity: ${metadata.id}`);
		if (existing.names.has(normalizedName(metadata.designSystem)))
			errors.push(`duplicate candidate name: ${metadata.designSystem}`);
	}
	if (options.publishedReleasesDirectory) {
		const existing = await existingPublishedDesignSystems(
			options.publishedReleasesDirectory,
		);
		if (existing.identities.has(metadata.id))
			errors.push(`identity is already published: ${metadata.id}`);
		if (existing.names.has(normalizedName(metadata.designSystem)))
			errors.push(
				`Design System name is already published: ${metadata.designSystem}`,
			);
	}

	if (errors.length > 0) return { ok: false, errors };
	return {
		ok: true,
		designSystem: metadata.designSystem,
		identity: metadata.id,
		version: "1.0",
		authoringApproval: metadata.authoringApproval.status,
		mechanicalValidation: true,
	};
}
