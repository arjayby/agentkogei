import { inspectTestPremiumEntitlementEvents } from "@agentkogei/auth/lib/premium-delivery";
import { NextResponse } from "next/server";

export async function GET() {
	const events = await inspectTestPremiumEntitlementEvents();
	if (!events) return new NextResponse(null, { status: 404 });
	return NextResponse.json(events, {
		headers: { "Cache-Control": "no-store" },
	});
}
