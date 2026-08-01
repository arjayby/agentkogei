import openDesignContracts from "@/generated/open-design-contracts.json";
import { catalogSelector } from "@/lib/catalog-selector";

/**
 * The Official Catalog delivers a Pack Release as the exact raw Markdown bytes
 * a Project installs as `DESIGN.md`. Catalog facts a Builder must see before
 * consenting travel as response headers so the installed document stays free of
 * machine metadata.
 */
export type DeliveredDesignContract = {
	designSystem: string;
	designSystemRelease: string;
	/** @deprecated Remove in issue #73. */
	designPack: string;
	/** @deprecated Remove in issue #73. */
	packRelease: string;
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
			"x-agentkogei-design-system": contract.designSystem,
			"x-agentkogei-design-system-release": contract.designSystemRelease,
			// TODO(#73): remove legacy headers once issues #71 and #72 migrate.
			"x-agentkogei-design-pack": contract.designPack,
			"x-agentkogei-pack-release": contract.packRelease,
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

/**
 * Answers one public Official Catalog request for a Design Contract.
 */
export async function deliverDesignContract(
	_request: Request,
	selection: { identity: string; version?: string },
) {
	const { identity, version } = selection;
	const selector = catalogSelector(identity, version);
	const openContract = findOpenDesignContract(identity, version);
	if (openContract) {
		return designContractResponse(openContract, {
			immutable: version !== undefined,
		});
	}

	return unknownDesignContractResponse(selector);
}
