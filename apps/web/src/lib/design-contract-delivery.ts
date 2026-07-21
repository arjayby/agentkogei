import openDesignContracts from "@/generated/open-design-contracts.json";

/**
 * The Official Catalog delivers a Pack Release as the exact raw Markdown bytes
 * a Project installs as `DESIGN.md`. Catalog facts a Builder must see before
 * consenting travel as response headers so the installed document stays free of
 * machine metadata.
 */
export type DeliveredDesignContract = {
	designPack: string;
	packRelease: string;
	packLicense: string;
	markdown: string;
};

type OpenDesignPackCatalog = Record<
	string,
	{ currentRelease: string; releases: Record<string, DeliveredDesignContract> }
>;

const catalog: OpenDesignPackCatalog = openDesignContracts;

/**
 * Resolves an Official Catalog identity to its Design Contract. Omitting the
 * version selects the current Pack Release; an explicit version selects that
 * immutable release only.
 */
export function findOpenDesignContract(identity: string, version?: string) {
	const pack = Object.hasOwn(catalog, identity) ? catalog[identity] : undefined;
	if (!pack) return null;
	return pack.releases[version ?? pack.currentRelease] ?? null;
}

export function designContractResponse(
	contract: DeliveredDesignContract,
	{ immutable }: { immutable: boolean },
) {
	return new Response(contract.markdown, {
		status: 200,
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": immutable
				? "public, max-age=31536000, immutable"
				: "public, max-age=300",
			"x-agentkogei-design-pack": contract.designPack,
			"x-agentkogei-pack-release": contract.packRelease,
			"x-agentkogei-pack-license": contract.packLicense,
		},
	});
}

export function unknownDesignContractResponse(selector: string) {
	return new Response(
		`${selector} is not a Pack Release in the AgentKogei Official Catalog.\n`,
		{
			status: 404,
			headers: {
				"content-type": "text/plain; charset=utf-8",
				"cache-control": "no-store",
			},
		},
	);
}
