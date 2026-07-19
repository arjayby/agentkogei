import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	buildFoundationRegistryItem,
	foundationReleaseDirectoryFor,
	foundationReleaseVersions,
} from "@agentkogei/design-packs";

const outputDirectory = path.resolve(import.meta.dirname, "../public/r");
const foundationReleases = await Promise.all(
	foundationReleaseVersions.map(async (version) => ({
		version,
		item: await buildFoundationRegistryItem(
			foundationReleaseDirectoryFor(version),
		),
	})),
);
const foundation = foundationReleases.at(-1)?.item;
if (!foundation) {
	throw new Error("Foundation has no Pack Releases");
}
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
	...foundationReleases.map(({ version, item }) =>
		writeFile(
			path.join(outputDirectory, "foundation", `${version}.json`),
			`${JSON.stringify(item, null, "\t")}\n`,
		),
	),
	writeFile(
		path.join(outputDirectory, "registry.json"),
		`${JSON.stringify(registry, null, "\t")}\n`,
	),
]);
