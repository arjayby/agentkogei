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

const consolidatedCode: Record<string, { title: string; language: string }> = {
	"text/css": { title: "Token definitions", language: "css" },
};

function headingLevel(line: string) {
	const heading = /^(#{1,6})\s/.exec(line);
	return heading ? (heading[1] as string).length : 0;
}

/**
 * Rewrites a supporting Markdown resource as one section of the Design
 * Contract: its own title becomes the section heading and everything below it
 * moves one level deeper so the document keeps a single outline.
 */
function consolidatedSection(resourcePath: string, contents: string) {
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
	return `## ${title} (\`${resourcePath}\`)\n\n${body.join("\n").trim()}`;
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
 * Compiles a published Pack Release directory into its Design Contract. Every
 * resource that carries design direction is consolidated into one document, so
 * an Installed Pack never depends on a separate file.
 */
export async function buildDesignContract(
	releaseDirectory: string,
): Promise<DesignContract> {
	const manifest = packManifestSchema.parse(
		JSON.parse(
			await readFile(
				path.join(releaseDirectory, "agentkogei.manifest.json"),
				"utf8",
			),
		),
	);
	const read = (resourcePath: string) =>
		readFile(path.join(releaseDirectory, resourcePath), "utf8");
	const contractResource = manifest.files.find(
		(file) => file.path === manifest.designContract,
	);
	if (!contractResource) {
		throw new Error(`${manifest.id} does not declare its Design Contract`);
	}

	const sections = [(await read(manifest.designContract)).trimEnd()];
	for (const file of manifest.files) {
		if (
			file.path === manifest.designContract ||
			file.path === manifest.evaluation.evidence ||
			file.path.startsWith(publicationEvidenceDirectory)
		) {
			continue;
		}
		const contents = await read(file.path);
		if (file.mediaType === "text/markdown") {
			sections.push(consolidatedSection(file.path, contents));
			continue;
		}
		const code = consolidatedCode[file.mediaType];
		if (!code) {
			throw new Error(
				`${manifest.id} declares ${file.path} as unconsolidatable ${file.mediaType}`,
			);
		}
		sections.push(
			`## ${code.title} (\`${file.path}\`)\n\n\`\`\`${code.language}\n${contents.trimEnd()}\n\`\`\``,
		);
	}
	sections.push(provenanceSection(manifest));

	return {
		identity: manifest.id,
		designPack: manifest.name,
		packRelease: manifest.release.version,
		packLicense: `${manifest.license.name} (${manifest.license.spdx})`,
		access: manifest.access,
		markdown: `${sections.join("\n\n")}\n`,
	};
}
