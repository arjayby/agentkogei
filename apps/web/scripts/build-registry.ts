import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildFoundationRegistryItem } from "@agentkogei/design-packs";

const outputDirectory = path.resolve(import.meta.dirname, "../public/r");
const foundation = await buildFoundationRegistryItem();
const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "agentkogei",
	homepage: "https://agentkogei.com/catalog",
	items: [
		{
			name: foundation.name,
			type: foundation.type,
			title: foundation.title,
			description: foundation.description,
		},
	],
};

await mkdir(outputDirectory, { recursive: true });
await mkdir(path.join(outputDirectory, "foundation"), { recursive: true });
const foundationJson = `${JSON.stringify(foundation, null, "\t")}\n`;
await Promise.all([
	writeFile(path.join(outputDirectory, "foundation.json"), foundationJson),
	writeFile(
		path.join(outputDirectory, "foundation", "1.0.0.json"),
		foundationJson,
	),
	writeFile(
		path.join(outputDirectory, "registry.json"),
		`${JSON.stringify(registry, null, "\t")}\n`,
	),
]);
