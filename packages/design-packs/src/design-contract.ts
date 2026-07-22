import { readFile } from "node:fs/promises";
import path from "node:path";

import { type PackManifest, packManifestSchema } from "./manifest";

/**
 * One Pack Release compiled into the single self-contained Markdown document a
 * Project receives as its root `DESIGN.md`, together with the catalog facts a
 * Builder needs before consenting to Installation.
 */
export type DesignContract = {
	identity: string;
	designPack: string;
	packRelease: string;
	packLicense: string;
	access: PackManifest["access"];
	markdown: string;
};

/**
 * Pack Evaluation materials prove a release was fit to publish. They are
 * evidence about the Design Pack rather than direction for a Project, so they
 * stay in the Official Catalog instead of a Builder's Design Contract.
 */
const publicationEvidenceDirectory = "evaluation/";

/**
 * A meaningful graphic already carries its own accessible name, so that name is
 * what a Builder and an AI coding agent look for once the graphic lives inside
 * the document rather than beside it.
 */
function graphicName(contents: string) {
	return (
		/<title[^>]*>([^<]*)<\/title>/.exec(contents)?.[1]?.trim() || undefined
	);
}

/**
 * How a resource that is not Markdown becomes one titled section. A media type
 * a release declares once carries a fixed title; one it may declare many times
 * takes each title from the resource, so two sections never claim one name.
 */
const consolidatedCode: Record<
	string,
	{ language: string; title: (contents: string) => string | undefined }
> = {
	"text/css": { language: "css", title: () => "Token definitions" },
	"image/svg+xml": { language: "svg", title: graphicName },
};

function headingLevel(line: string) {
	const heading = /^(#{1,6})\s/.exec(line);
	return heading ? (heading[1] as string).length : 0;
}

/** One consolidated resource, ready to be placed in the single document. */
type ConsolidatedSection = { title: string; body: string };

/**
 * Rewrites a supporting Markdown resource as one section of the Design
 * Contract: its own title becomes the section heading and everything below it
 * moves one level deeper so the document keeps a single outline.
 */
function consolidatedSection(
	resourcePath: string,
	contents: string,
): ConsolidatedSection {
	const lines = contents.trimEnd().split("\n");
	let title = resourcePath;
	let fenced = false;
	const body: string[] = [];
	for (const line of lines) {
		if (line.startsWith("```")) {
			fenced = !fenced;
			body.push(line);
			continue;
		}
		const level = fenced ? 0 : headingLevel(line);
		if (level === 1 && body.length === 0 && title === resourcePath) {
			title = line.slice(2).trim();
			continue;
		}
		body.push(level > 0 && level < 6 ? `#${line}` : line);
	}
	return { title, body: body.join("\n").trim() };
}

/**
 * Rewrites a non-Markdown resource as one fenced section, so direction a
 * Builder used to receive as a separate file still arrives verbatim. Returns
 * nothing for a media type consolidation cannot represent as text, or for a
 * resource that supplies no name to title its section with.
 */
function consolidatedCodeSection(
	mediaType: string,
	contents: string,
): ConsolidatedSection | undefined {
	const code = consolidatedCode[mediaType];
	const title = code?.title(contents);
	if (!code || !title) return undefined;
	return {
		title,
		body: `\`\`\`${code.language}\n${contents.trimEnd()}\n\`\`\``,
	};
}

/**
 * A Project receives the Design Contract and nothing else, so a cross-reference
 * written as a release resource path would send an AI coding agent looking for
 * a file that was never installed. Each such reference becomes the section that
 * now holds that resource's direction.
 */
function resolveResourceReferences(
	markdown: string,
	sectionTitles: ReadonlyMap<string, string>,
) {
	let resolved = markdown;
	for (const [resourcePath, title] of sectionTitles) {
		resolved = resolved.replaceAll(
			`\`${resourcePath}\``,
			`the ${title} section`,
		);
	}
	return resolved;
}

function provenanceSection(manifest: PackManifest) {
	const { license, release } = manifest;
	return [
		"---",
		"",
		"## Provenance",
		"",
		`- Design Pack: ${manifest.name} (\`${manifest.id}\`)`,
		`- Pack Release: ${release.version}, published ${release.publishedAt} by ${manifest.publisher}`,
		`- Pack License: ${license.name} (${license.spdx}), ${license.url}`,
		`- Attribution: ${license.attribution}`,
		"- Delivered by the AgentKogei Official Catalog as a single Design Contract.",
	].join("\n");
}

/**
 * Reads one resource of a Pack Release by its manifest path. A Published Pack
 * reads them from its catalog directory and a protected Premium Pack Release
 * from the payload the Official Catalog holds, so both compile into the same
 * Design Contract.
 */
type ReadPackReleaseResource = (resourcePath: string) => Promise<string>;

/**
 * Consolidates every resource that carries design direction into one document,
 * so an Installed Pack never depends on a separate file.
 */
async function compileDesignContract(
	read: ReadPackReleaseResource,
): Promise<DesignContract> {
	const manifest = packManifestSchema.parse(
		JSON.parse(await read("agentkogei.manifest.json")),
	);
	const contractResource = manifest.files.find(
		(file) => file.path === manifest.designContract,
	);
	if (!contractResource) {
		throw new Error(`${manifest.id} does not declare its Design Contract`);
	}

	const sections = [(await read(manifest.designContract)).trimEnd()];
	const sectionTitles = new Map<string, string>();
	const claimedTitles = new Set<string>();
	const withheldResources: string[] = [];
	for (const file of manifest.files) {
		if (file.path === manifest.designContract) continue;
		if (
			file.path === manifest.evaluation.evidence ||
			file.path.startsWith(publicationEvidenceDirectory)
		) {
			withheldResources.push(file.path);
			continue;
		}
		const contents = await read(file.path);
		const section =
			file.mediaType === "text/markdown"
				? consolidatedSection(file.path, contents)
				: consolidatedCodeSection(file.mediaType, contents);
		if (!section) {
			throw new Error(
				`${manifest.id} cannot consolidate ${file.path} as ${file.mediaType}`,
			);
		}
		// One title must name one section, or a resolved cross-reference would
		// point at two places at once.
		if (claimedTitles.has(section.title)) {
			throw new Error(
				`${manifest.id} consolidates two resources as "${section.title}"`,
			);
		}
		claimedTitles.add(section.title);
		sectionTitles.set(file.path, section.title);
		sections.push(`## ${section.title}\n\n${section.body}`);
	}
	sections.push(provenanceSection(manifest));

	const markdown = `${resolveResourceReferences(
		sections.join("\n\n"),
		sectionTitles,
	)}\n`;
	const dangling = [...sectionTitles.keys(), ...withheldResources].filter(
		(resourcePath) => markdown.includes(resourcePath),
	);
	if (dangling.length > 0) {
		throw new Error(
			`${manifest.id} ${manifest.release.version} still depends on ${dangling.join(", ")}`,
		);
	}

	return {
		identity: manifest.id,
		designPack: manifest.name,
		packRelease: manifest.release.version,
		packLicense: `${manifest.license.name} (${manifest.license.spdx})`,
		access: manifest.access,
		markdown,
	};
}

/** Compiles a published Pack Release directory into its Design Contract. */
export async function buildDesignContract(releaseDirectory: string) {
	return compileDesignContract((resourcePath) =>
		readFile(path.join(releaseDirectory, resourcePath), "utf8"),
	);
}

/**
 * Compiles a Pack Release whose resources are already in memory, so a protected
 * Premium Pack Release never has to be unpacked to disk to be delivered.
 */
export async function buildDesignContractFromResources(
	resources: Readonly<Record<string, string>>,
) {
	return compileDesignContract(async (resourcePath) => {
		if (!Object.hasOwn(resources, resourcePath)) {
			throw new Error(`Pack Release is missing ${resourcePath}`);
		}
		return resources[resourcePath] as string;
	});
}
