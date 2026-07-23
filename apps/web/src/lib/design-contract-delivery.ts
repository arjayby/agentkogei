import {
	authorizePremiumRetrieval,
	recordPremiumEntitlementEvent,
} from "@agentkogei/auth/lib/premium-delivery";
import { designContractSchema } from "agentkogei/src/design-contract";

import openDesignContracts from "@/generated/open-design-contracts.json";
import { catalogSelector } from "@/lib/catalog-selector";
import {
	currentOfficialPremiumRelease,
	getProtectedPremiumRelease,
	isOfficialPremiumPackIdentity,
} from "@/lib/protected-premium-releases";
import { observeTestPremiumRetrieval } from "@/lib/test-premium-delivery";

/**
 * The Official Catalog delivers a Pack Release as the exact raw Markdown bytes
 * a Project installs as `DESIGN.md`. Catalog facts a Builder must see before
 * consenting travel as response headers so the installed document stays free of
 * machine metadata.
 */
export type DeliveredDesignContract = {
	designPack: string;
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

/**
 * Resolves a Premium selector to the Design Contract the Official Catalog can
 * deliver for it. A protected Pack Release is provisioned as the same raw
 * Design Contract an Open Pack Release publishes, so a payload that is not one
 * reads as absent rather than failing the request.
 */
function findPremiumDesignContract(identity: string, version?: string) {
	if (!isOfficialPremiumPackIdentity(identity)) return null;
	const selected = version ?? currentOfficialPremiumRelease(identity);
	if (!selected) return null;

	const release = designContractSchema.safeParse(
		getProtectedPremiumRelease(identity, selected),
	);
	if (!release.success) return null;
	const contract = release.data;
	if (
		contract.identity !== identity ||
		contract.packRelease !== selected ||
		contract.access !== "premium"
	) {
		return null;
	}
	return {
		designPack: contract.designPack,
		packRelease: contract.packRelease,
		markdown: contract.markdown,
	} satisfies DeliveredDesignContract;
}

export function designContractResponse(
	contract: DeliveredDesignContract,
	{ immutable, gated = false }: { immutable: boolean; gated?: boolean },
) {
	return new Response(contract.markdown, {
		status: 200,
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": gated
				? "private, no-store"
				: immutable
					? "public, max-age=31536000, immutable"
					: "public, max-age=300",
			...(gated ? { "x-content-type-options": "nosniff" } : {}),
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

function deniedDesignContractResponse(
	status: 401 | 403,
	selector: string,
	explanation: string,
) {
	return new Response(`${selector} ${explanation}\n`, {
		status,
		headers: {
			"content-type": "text/plain; charset=utf-8",
			"cache-control": "private, no-store",
			...(status === 401
				? {
						"www-authenticate":
							'Bearer realm="AgentKogei Official Catalog", scope="premium:retrieve"',
					}
				: {}),
		},
	});
}

function packCredential(request: Request) {
	const authorization = request.headers.get("authorization");
	return authorization?.startsWith("Bearer ")
		? authorization.slice("Bearer ".length).trim() || null
		: null;
}

/**
 * Answers one Official Catalog request for a Design Contract. An Open Pack
 * Release is public; a Premium Pack Release reaches only a Builder holding a
 * valid Pack Credential with active Premium Access, and the two denials stay
 * distinguishable so the CLI knows whether browser authorization would help.
 */
export async function deliverDesignContract(
	request: Request,
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

	const premiumContract = findPremiumDesignContract(identity, version);
	if (!premiumContract) return unknownDesignContractResponse(selector);

	observeTestPremiumRetrieval(request);
	const authorization = await authorizePremiumRetrieval(
		packCredential(request),
	);
	if (authorization.outcome === "unauthenticated") {
		return deniedDesignContractResponse(
			401,
			selector,
			"is a Premium Design Pack and needs an authorized Pack Credential.",
		);
	}
	if (authorization.outcome === "inactive") {
		return deniedDesignContractResponse(
			403,
			selector,
			"needs active Premium Access.",
		);
	}

	await recordPremiumEntitlementEvent({
		builderId: authorization.builderId,
		packId: identity,
		packRelease: premiumContract.packRelease,
		action: "retrieval",
	});
	return designContractResponse(premiumContract, {
		immutable: version !== undefined,
		gated: true,
	});
}
