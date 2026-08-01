import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
	publishedDesignSystems,
	readDesignContract,
} from "agentkogei/src/index";

const outputFile = path.resolve(
	import.meta.dirname,
	"../src/generated/design-contracts.json",
);

const catalog = Object.fromEntries(
	await Promise.all(
		publishedDesignSystems.map(async (designSystem) => {
			const releases = await Promise.all(
				designSystem.versions.map(async (version) => {
					const contract = await readDesignContract(
						designSystem.directoryFor(version),
					);
					if (contract.designSystemRelease !== version) {
						throw new Error(
							`${designSystem.id} ${version} declares Design System Release ${contract.designSystemRelease}`,
						);
					}
					return [
						version,
						{
							identity: contract.identity,
							designSystem: contract.designSystem,
							designSystemRelease: contract.designSystemRelease,
							markdown: contract.markdown,
						},
					] as const;
				}),
			);
			const currentRelease = designSystem.versions.at(-1);
			if (!currentRelease) {
				throw new Error(`${designSystem.id} has no Design System Releases`);
			}
			return [
				designSystem.id,
				{ currentRelease, releases: Object.fromEntries(releases) },
			] as const;
		}),
	),
);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(catalog, null, "\t")}\n`);
