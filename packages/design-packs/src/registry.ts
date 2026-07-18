import { readFile } from "node:fs/promises";
import path from "node:path";

import { packManifestSchema } from "./manifest";

type RegistryFile = {
	path: string;
	type: "registry:file";
	target: string;
	content: string;
};

export type FoundationRegistryItem = {
	$schema: "https://ui.shadcn.com/schema/registry-item.json";
	name: "foundation";
	type: "registry:item";
	title: "Foundation Open Design Pack";
	description: string;
	files: RegistryFile[];
};

export async function buildFoundationRegistryItem(
	releaseDirectory: string,
): Promise<FoundationRegistryItem> {
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
		target: ".agentkogei/foundation/agentkogei.manifest.json",
		content: manifestContent,
	});

	return {
		$schema: "https://ui.shadcn.com/schema/registry-item.json",
		name: "foundation",
		type: "registry:item",
		title: "Foundation Open Design Pack",
		description:
			"Foundation 1.0.0: a complete, neutral, crisp, highly legible B2B Interface System.",
		files,
	};
}
