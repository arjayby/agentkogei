import {
	fullAgentReference,
	machineResourceResponse,
} from "@/lib/machine-discovery";

export function GET() {
	return machineResourceResponse(fullAgentReference(), "text/plain");
}
