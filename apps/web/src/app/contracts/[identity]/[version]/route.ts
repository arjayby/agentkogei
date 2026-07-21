import { deliverDesignContract } from "@/lib/design-contract-delivery";

type ReleaseDesignContractContext = {
	params: Promise<{ identity: string; version: string }>;
};

export async function GET(
	request: Request,
	context: ReleaseDesignContractContext,
) {
	return deliverDesignContract(request, await context.params);
}
