import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { publishedPacks, readDesignContract } from "agentkogei/src/index";

const outputFile = path.resolve(
	import.meta.dirname,
	"../src/generated/open-design-contracts.json",
);

const catalog = Object.fromEntries(
	await Promise.all(
		publishedPacks.map(async (pack) => {
			const releases = await Promise.all(
				pack.versions.map(async (version) => {
					const contract = await readDesignContract(pack.directoryFor(version));
					if (contract.designSystemRelease !== version) {
						throw new Error(
							`${pack.id} ${version} declares Design System Release ${contract.designSystemRelease}`,
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
			const currentRelease = pack.versions.at(-1);
			if (!currentRelease) {
				throw new Error(`${pack.id} has no Design System Releases`);
			}
			return [
				pack.id,
				{ currentRelease, releases: Object.fromEntries(releases) },
			] as const;
		}),
	),
);

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(catalog, null, "\t")}\n`);
