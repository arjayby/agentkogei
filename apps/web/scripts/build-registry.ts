import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { publishedPacks } from "@agentkogei/design-packs";

const outputDirectory = path.resolve(import.meta.dirname, "../public/r");
const emittedPacks = await Promise.all(
	publishedPacks.map(async (pack) => {
		const releases = await Promise.all(
			pack.versions.map(async (version) => ({
				version,
				item: await pack.buildRegistryItem(pack.directoryFor(version)),
			})),
		);
		const latest = releases.at(-1)?.item;
		if (!latest) {
			throw new Error(`${pack.id} has no Pack Releases`);
		}
		return { id: pack.id, releases, latest };
	}),
);
const registry = {
	$schema: "https://ui.shadcn.com/schema/registry.json",
	name: "agentkogei",
	homepage: "https://agentkogei.com/catalog",
	items: emittedPacks.map(({ latest }) => ({
		name: latest.name,
		type: latest.type,
		title: latest.title,
		description: latest.description,
	})),
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all(
	emittedPacks.map(({ id }) =>
		mkdir(path.join(outputDirectory, id), { recursive: true }),
	),
);
await Promise.all([
	...emittedPacks.flatMap(({ id, latest, releases }) => [
		writeFile(
			path.join(outputDirectory, `${id}.json`),
			`${JSON.stringify(latest, null, "\t")}\n`,
		),
		...releases.map(({ version, item }) =>
			writeFile(
				path.join(outputDirectory, id, `${version}.json`),
				`${JSON.stringify(item, null, "\t")}\n`,
			),
		),
	]),
	writeFile(
		path.join(outputDirectory, "registry.json"),
		`${JSON.stringify(registry, null, "\t")}\n`,
	),
]);
