import { deliverDesignContract } from "@/lib/design-contract-delivery";

type CurrentDesignContractContext = {
	params: Promise<{ identity: string }>;
};

export async function GET(
	request: Request,
	context: CurrentDesignContractContext,
) {
	return deliverDesignContract(request, await context.params);
}
