import { randomUUID } from "node:crypto";
import {
	lstat,
	readFile,
	realpath,
	rename,
	rm,
	writeFile,
} from "node:fs/promises";
import path from "node:path";

import { packReleaseVersionSchema } from "./release-version";
import { hasHiddenDocumentControl, hasTerminalControl } from "./text-safety";

const managedBlockStart = "<!-- agentkogei:design-pack:start -->";
const managedBlockEnd = "<!-- agentkogei:design-pack:end -->";
const managedReference = [
	managedBlockStart,
	"## AgentKogei Design Pack",
	"",
	"Follow the Interface System in `DESIGN.md` for all user interface work in this Project.",
	managedBlockEnd,
].join("\n");

/** What a Builder is consenting to before either Project file is written. */
export type DesignContractInstallationPlan = {
	identity: string;
	designPack: string;
	packRelease: string;
	packLicense: string;
	source: string;
	markdown: string;
	projectDirectory: string;
	designContractPath: string;
	agentsPath: string;
	currentContract: string | null;
	currentAgents: string | null;
	plannedAgents: string;
	designContractChange: "create" | "replace" | "unchanged";
	agentsChange: "create" | "reference" | "rereference" | "unchanged";
	conflicts: string[];
};

export type RetrievedDesignContract = {
	identity: string;
	designPack: string;
	packRelease: string;
	packLicense: string;
	markdown: string;
	source: string;
};

function packSelector(identity: string, version?: string) {
	return version ? `${identity}@${version}` : identity;
}

function catalogHeader(response: Response, name: string, selector: string) {
	const value = response.headers.get(`x-agentkogei-${name}`)?.trim();
	if (!value || hasTerminalControl(value)) {
		throw new Error(
			`Official Catalog response for ${selector} is missing its ${name.replaceAll("-", " ")}`,
		);
	}
	return value;
}

/**
 * Retrieves one Design Contract from the first-party Official Catalog as raw
 * UTF-8 Markdown. Every response is proven to be an installable Design Contract
 * before any part of it reaches the Project.
 */
export async function retrieveDesignContract(input: {
	identity: string;
	version?: string | undefined;
	officialCatalogUrl: string;
}): Promise<RetrievedDesignContract> {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.identity)) {
		throw new Error("invalid Design Pack identity");
	}
	if (
		input.version !== undefined &&
		!packReleaseVersionSchema.safeParse(input.version).success
	) {
		throw new Error("invalid Pack Release version");
	}
	const selector = packSelector(input.identity, input.version);
	const base = input.officialCatalogUrl.endsWith("/")
		? input.officialCatalogUrl
		: `${input.officialCatalogUrl}/`;
	let source: URL;
	try {
		source = new URL(
			input.version ? `${input.identity}/${input.version}` : input.identity,
			base,
		);
	} catch {
		throw new Error("Official Catalog must be an absolute URL");
	}
	if (!["http:", "https:"].includes(source.protocol)) {
		throw new Error(
			`unsupported Official Catalog protocol: ${source.protocol}`,
		);
	}

	const response = await fetch(source, {
		redirect: "manual",
		headers: { accept: "text/markdown" },
	});
	if (response.status >= 300 && response.status < 400) {
		throw new Error(`Official Catalog redirected the request for ${selector}`);
	}
	if (!response.ok) {
		throw new Error(
			`Official Catalog has no Design Contract for ${selector} (${response.status})`,
		);
	}
	if (
		!/^text\/markdown\s*(;|$)/i.test(response.headers.get("content-type") ?? "")
	) {
		throw new Error(
			`Official Catalog response for ${selector} is not Markdown (${response.headers.get("content-type") ?? "no content type"})`,
		);
	}
	let markdown: string;
	try {
		markdown = new TextDecoder("utf-8", {
			fatal: true,
			ignoreBOM: false,
		}).decode(await response.arrayBuffer());
	} catch {
		throw new Error(
			`Official Catalog response for ${selector} is not valid UTF-8 text`,
		);
	}
	if (markdown.trim().length === 0) {
		throw new Error(
			`Official Catalog returned an empty Design Contract for ${selector}`,
		);
	}
	if (hasHiddenDocumentControl(markdown)) {
		throw new Error(
			`Design Contract for ${selector} contains hidden control characters`,
		);
	}

	const packRelease = catalogHeader(response, "pack-release", selector);
	if (!packReleaseVersionSchema.safeParse(packRelease).success) {
		throw new Error(
			`Official Catalog reported an invalid Pack Release for ${selector}`,
		);
	}
	if (input.version && packRelease !== input.version) {
		throw new Error(
			`Official Catalog returned ${input.identity}@${packRelease}, expected ${selector}`,
		);
	}

	return {
		identity: input.identity,
		designPack: catalogHeader(response, "design-pack", selector),
		packRelease,
		packLicense: catalogHeader(response, "pack-license", selector),
		markdown,
		source: source.href,
	};
}

async function readIfPresent(target: string) {
	try {
		return await readFile(target, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw error;
	}
}

async function findFileConflict(target: string, name: string) {
	try {
		const stats = await lstat(target);
		if (stats.isSymbolicLink()) return `${name} is a symbolic link`;
		if (!stats.isFile()) return `${name} is not a regular file`;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
	}
	return null;
}

/**
 * Applies the managed reference to an `AGENTS.md`, preserving every existing
 * instruction outside the marked block so rerunning `add` never duplicates or
 * disturbs a Builder's own agent guidance.
 */
function planAgentsReference(currentAgents: string | null) {
	if (currentAgents === null || currentAgents.trim().length === 0) {
		return `${managedReference}\n`;
	}
	const start = currentAgents.indexOf(managedBlockStart);
	if (start === -1) {
		return `${currentAgents}${currentAgents.endsWith("\n") ? "" : "\n"}\n${managedReference}\n`;
	}
	const end = currentAgents.indexOf(managedBlockEnd, start);
	return `${currentAgents.slice(0, start)}${managedReference}${currentAgents.slice(end + managedBlockEnd.length)}`;
}

function findAgentsConflict(currentAgents: string | null) {
	if (currentAgents === null) return null;
	const starts = currentAgents.split(managedBlockStart).length - 1;
	const ends = currentAgents.split(managedBlockEnd).length - 1;
	if (starts === 0 && ends === 0) return null;
	if (
		starts !== 1 ||
		ends !== 1 ||
		currentAgents.indexOf(managedBlockEnd) <
			currentAgents.indexOf(managedBlockStart)
	) {
		return "AGENTS.md contains a malformed AgentKogei reference";
	}
	return null;
}

export async function planDesignContractInstallation(input: {
	identity: string;
	version?: string | undefined;
	projectDirectory: string;
	officialCatalogUrl: string;
}): Promise<DesignContractInstallationPlan> {
	const projectDirectory = await realpath(input.projectDirectory);
	const designContractPath = path.join(projectDirectory, "DESIGN.md");
	const agentsPath = path.join(projectDirectory, "AGENTS.md");
	const retrieved = await retrieveDesignContract(input);

	const conflicts = (
		await Promise.all([
			findFileConflict(designContractPath, "DESIGN.md"),
			findFileConflict(agentsPath, "AGENTS.md"),
		])
	).filter((conflict) => conflict !== null);
	const currentContract =
		conflicts.length > 0 ? null : await readIfPresent(designContractPath);
	const currentAgents =
		conflicts.length > 0 ? null : await readIfPresent(agentsPath);
	const agentsConflict = findAgentsConflict(currentAgents);
	if (agentsConflict) conflicts.push(agentsConflict);
	const plannedAgents = planAgentsReference(currentAgents);

	return {
		...retrieved,
		projectDirectory,
		designContractPath,
		agentsPath,
		currentContract,
		currentAgents,
		plannedAgents,
		designContractChange:
			currentContract === null
				? "create"
				: currentContract === retrieved.markdown
					? "unchanged"
					: "replace",
		agentsChange:
			currentAgents === null
				? "create"
				: currentAgents === plannedAgents
					? "unchanged"
					: currentAgents.includes(managedBlockStart)
						? "rereference"
						: "reference",
		conflicts,
	};
}

function diffLines(before: string[], after: string[]) {
	const common: number[][] = Array.from({ length: before.length + 1 }, () =>
		new Array<number>(after.length + 1).fill(0),
	);
	for (let index = before.length - 1; index >= 0; index -= 1) {
		const row = common[index] as number[];
		const next = common[index + 1] as number[];
		for (let other = after.length - 1; other >= 0; other -= 1) {
			row[other] =
				before[index] === after[other]
					? (next[other + 1] as number) + 1
					: Math.max(next[other] as number, row[other + 1] as number);
		}
	}
	const changes: string[] = [];
	let index = 0;
	let other = 0;
	while (index < before.length && other < after.length) {
		if (before[index] === after[other]) {
			changes.push(` ${before[index]}`);
			index += 1;
			other += 1;
		} else if (
			((common[index + 1] as number[])[other] as number) >=
			((common[index] as number[])[other + 1] as number)
		) {
			changes.push(`-${before[index]}`);
			index += 1;
		} else {
			changes.push(`+${after[other]}`);
			other += 1;
		}
	}
	for (; index < before.length; index += 1) changes.push(`-${before[index]}`);
	for (; other < after.length; other += 1) changes.push(`+${after[other]}`);
	return changes;
}

/**
 * Shows exactly which direction a replacement loses and gains, with enough
 * surrounding context to judge it and a bounded length so the decision stays
 * readable in a terminal.
 */
export function formatDesignContractDiff(
	before: string,
	after: string,
	{ context = 3, limit = 200 } = {},
) {
	const changes = diffLines(before.split("\n"), after.split("\n"));
	const relevant = changes.map((_change, index) =>
		changes
			.slice(Math.max(0, index - context), index + context + 1)
			.some((near) => !near.startsWith(" ")),
	);
	const shown: string[] = [];
	let skipped = 0;
	for (const [index, change] of changes.entries()) {
		if (!relevant[index]) {
			skipped += 1;
			continue;
		}
		if (skipped > 0) {
			shown.push(`  … ${skipped} unchanged line${skipped === 1 ? "" : "s"}`);
			skipped = 0;
		}
		shown.push(change);
	}
	const remaining = shown.length - limit;
	return remaining > 0
		? [...shown.slice(0, limit), `  … ${remaining} more diff lines`].join("\n")
		: shown.join("\n");
}

export function formatDesignContractPreview(
	plan: DesignContractInstallationPlan,
) {
	const contractChange = {
		create: `Create ${plan.designContractPath}`,
		replace: `Replace ${plan.designContractPath}`,
		unchanged: `Keep ${plan.designContractPath} (already this exact Design Contract)`,
	}[plan.designContractChange];
	const agentsChange = {
		create: `Create ${plan.agentsPath} with the AgentKogei Design Pack reference`,
		reference: `Update ${plan.agentsPath} to add the AgentKogei Design Pack reference (existing instructions preserved)`,
		rereference: `Update the AgentKogei Design Pack reference in ${plan.agentsPath} (existing instructions preserved)`,
		unchanged: `Keep ${plan.agentsPath} (already references DESIGN.md)`,
	}[plan.agentsChange];

	const catalogFacts = [
		`${plan.designPack} ${plan.packRelease} (${plan.identity})`,
		[
			`Official Catalog: ${plan.source}`,
			`Pack License: ${plan.packLicense}`,
			`Project: ${plan.projectDirectory}`,
		].join("\n"),
	];
	if (plan.conflicts.length > 0) {
		return [
			...catalogFacts,
			`Conflicts:\n${plan.conflicts.map((line) => `  ${line}`).join("\n")}`,
		].join("\n\n");
	}

	return [
		...catalogFacts,
		`Planned changes:\n  ${contractChange}\n  ${agentsChange}`,
		...(plan.designContractChange === "replace"
			? [
					`Replacing the existing DESIGN.md:\n${formatDesignContractDiff(
						plan.currentContract ?? "",
						plan.markdown,
					)}`,
				]
			: []),
	].join("\n\n");
}

async function writeProjectFile(
	plan: DesignContractInstallationPlan,
	target: string,
	contents: string,
	original: string | null,
) {
	const temporary = path.join(
		plan.projectDirectory,
		`.agentkogei-write-${randomUUID()}`,
	);
	await writeFile(temporary, contents, { mode: 0o644, flag: "wx" });
	try {
		await rename(temporary, target);
	} catch (error) {
		await rm(temporary, { force: true });
		throw error;
	}
	return async () => {
		if (original === null) {
			await rm(target, { force: true });
			return;
		}
		await writeFile(target, original, { mode: 0o644 });
	};
}

/**
 * Writes the Design Contract and its agent reference, or leaves both Project
 * files exactly as the Builder had them.
 */
export async function applyDesignContractInstallation(
	plan: DesignContractInstallationPlan,
) {
	if (plan.conflicts.length > 0) {
		throw new Error("Installation has conflicts");
	}
	const [currentContract, currentAgents] = await Promise.all([
		readIfPresent(plan.designContractPath),
		readIfPresent(plan.agentsPath),
	]);
	if (
		currentContract !== plan.currentContract ||
		currentAgents !== plan.currentAgents
	) {
		throw new Error("Project changed after preview; Installation refused");
	}
	const restoreContract = await writeProjectFile(
		plan,
		plan.designContractPath,
		plan.markdown,
		plan.currentContract,
	);
	try {
		await writeProjectFile(
			plan,
			plan.agentsPath,
			plan.plannedAgents,
			plan.currentAgents,
		);
	} catch (error) {
		await restoreContract();
		throw error;
	}
}
