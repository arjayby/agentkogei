import designContracts from "@/generated/design-contracts.json";
import { catalogSelector } from "@/lib/catalog-selector";

/**
 * The Official Catalog delivers a Design System Release as the exact raw Markdown bytes
 * a Project installs as `DESIGN.md`. Catalog facts a Builder must see before
 * consenting travel as response headers so the installed document stays free of
 * machine metadata.
 */
export type DeliveredDesignContract = {
	designSystem: string;
	designSystemRelease: string;
	markdown: string;
};

type DesignContractCatalog = Record<
	string,
	{ currentRelease: string; releases: Record<string, DeliveredDesignContract> }
>;

const catalog: DesignContractCatalog = designContracts;

/**
 * Resolves an Official Catalog identity to its Design Contract. Omitting the
 * version selects the current Design System Release; an explicit version selects that
 * immutable release only.
 */
export function findDesignContract(identity: string, version?: string) {
	const designSystem = Object.hasOwn(catalog, identity)
		? catalog[identity]
		: undefined;
	if (!designSystem) return null;
	return designSystem.releases[version ?? designSystem.currentRelease] ?? null;
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
		},
	});
}

export function unknownDesignContractResponse(selector: string) {
	return new Response(
		`${selector} is not a Design System Release in the AgentKogei Official Catalog.\n`,
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
	const contract = findDesignContract(identity, version);
	if (contract) {
		return designContractResponse(contract, {
			immutable: version !== undefined,
		});
	}

	return unknownDesignContractResponse(selector);
}
