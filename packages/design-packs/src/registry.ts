import { readFile } from "node:fs/promises";
import path from "node:path";

import { type PackManifest, packManifestSchema } from "./manifest";

type RegistryFile = {
	path: string;
	type: "registry:file";
	target: string;
	content: string;
};

export type PackRegistryItem = {
	$schema: "https://ui.shadcn.com/schema/registry-item.json";
	name: string;
	type: "registry:item";
	title: string;
	description: string;
	files: RegistryFile[];
};

export async function buildPackRegistryItem(
	releaseDirectory: string,
	description: (manifest: PackManifest) => string,
): Promise<PackRegistryItem> {
	const manifestPath = path.join(releaseDirectory, "agentkogei.manifest.json");
	const manifestContent = await readFile(manifestPath, "utf8");
	const manifest = packManifestSchema.parse(JSON.parse(manifestContent));
	const files = await Promise.all(
		manifest.files.map(async (file) => ({
			path: file.path,
			type: "registry:file" as const,
			target: file.target,
			content: await readFile(path.join(releaseDirectory, file.path), "utf8"),
		})),
	);

	files.unshift({
		path: "agentkogei.manifest.json",
		type: "registry:file",
		target: `.agentkogei/${manifest.id}/agentkogei.manifest.json`,
		content: manifestContent,
	});

	return {
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: manifest.id,
		type: "registry:item",
		title: `${manifest.name} Open Design Pack`,
		description: description(manifest),
		files,
	};
}
