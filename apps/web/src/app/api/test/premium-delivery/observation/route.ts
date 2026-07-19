import { NextResponse } from "next/server";

import { getTestPremiumRetrievalObservation } from "@/lib/test-premium-delivery";

export async function GET() {
	const observation = getTestPremiumRetrievalObservation();
	if (!observation) return new NextResponse(null, { status: 404 });
	return NextResponse.json(observation, {
		headers: { "Cache-Control": "no-store" },
	});
}
