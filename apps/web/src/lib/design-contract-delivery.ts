import {
	authorizePremiumRetrieval,
	recordPremiumEntitlementEvent,
} from "@agentkogei/auth/lib/premium-delivery";
import { buildDesignContractFromResources } from "@agentkogei/design-packs/design-contract";
import { z } from "zod";

import openDesignContracts from "@/generated/open-design-contracts.json";
import { catalogSelector } from "@/lib/catalog-selector";
import {
	getProtectedPremiumRelease,
	isOfficialPremiumPackIdentity,
	officialPremiumPackReleases,
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

/**
 * A protected Pack Release travels as the resources of one release rather than
 * as a Design Contract, so the gated document is compiled from the same
 * declared manifest an Open Pack Release publishes from.
 */
const protectedReleaseSchema = z.object({
	files: z
		.array(z.object({ path: z.string().min(1), content: z.string() }))
		.min(1),
});

const compiledPremiumContracts = new Map<string, DeliveredDesignContract>();

async function findPremiumDesignContract(identity: string, version?: string) {
	if (!isOfficialPremiumPackIdentity(identity)) return null;
	const selected = version ?? officialPremiumPackReleases(identity).at(-1);
	if (!selected) return null;
	const cached = compiledPremiumContracts.get(`${identity}@${selected}`);
	if (cached) return cached;

	const release = protectedReleaseSchema.safeParse(
		getProtectedPremiumRelease(identity, selected),
	);
	if (!release.success) return null;
	const contract = await buildDesignContractFromResources(
		Object.fromEntries(
			release.data.files.map((file) => [file.path, file.content]),
		),
	);
	if (
		contract.identity !== identity ||
		contract.packRelease !== selected ||
		contract.access !== "premium"
	) {
		return null;
	}
	const delivered: DeliveredDesignContract = {
		designPack: contract.designPack,
		packRelease: contract.packRelease,
		packLicense: contract.packLicense,
		markdown: contract.markdown,
	};
	compiledPremiumContracts.set(`${identity}@${selected}`, delivered);
	return delivered;
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
			"x-content-type-options": "nosniff",
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

	const premiumContract = await findPremiumDesignContract(identity, version);
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
		action: "add",
	});
	return designContractResponse(premiumContract, {
		immutable: version !== undefined,
		gated: true,
	});
}
