import { catalogSelector } from "@/lib/catalog-selector";
import {
	designContractResponse,
	findOpenDesignContract,
	unknownDesignContractResponse,
} from "@/lib/design-contract-delivery";

type CurrentDesignContractContext = {
	params: Promise<{ identity: string }>;
};

export async function GET(
	_request: Request,
	context: CurrentDesignContractContext,
) {
	const { identity } = await context.params;
	const contract = findOpenDesignContract(identity);
	return contract
		? designContractResponse(contract, { immutable: false })
		: unknownDesignContractResponse(catalogSelector(identity));
}
