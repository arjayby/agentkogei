import {
	conciseAgentReference,
	machineResourceResponse,
} from "@/lib/machine-discovery";

export function GET() {
	return machineResourceResponse(conciseAgentReference(), "text/plain");
}
