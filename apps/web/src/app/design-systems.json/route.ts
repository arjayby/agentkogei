import {
	designSystemsMachineIndex,
	machineResourceResponse,
} from "@/lib/machine-discovery";

export function GET() {
	return machineResourceResponse(
		`${JSON.stringify(designSystemsMachineIndex, null, 2)}\n`,
		"application/json",
	);
}
