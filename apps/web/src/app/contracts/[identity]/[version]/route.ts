import { catalogSelector } from "@/lib/catalog-selector";
import {
	designContractResponse,
	findOpenDesignContract,
	unknownDesignContractResponse,
} from "@/lib/design-contract-delivery";

type ReleaseDesignContractContext = {
	params: Promise<{ identity: string; version: string }>;
};

export async function GET(
	_request: Request,
	context: ReleaseDesignContractContext,
) {
	const { identity, version } = await context.params;
	const contract = findOpenDesignContract(identity, version);
	return contract
		? designContractResponse(contract, { immutable: true })
		: unknownDesignContractResponse(catalogSelector(identity, version));
}
