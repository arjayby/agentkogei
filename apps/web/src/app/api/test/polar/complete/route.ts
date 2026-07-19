import { auth } from "@agentkogei/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { deliverTestPolarState, isTestPolarEnabled } from "@/lib/test-polar";

export async function POST(request: Request) {
	if (!isTestPolarEnabled()) return new NextResponse(null, { status: 404 });
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return new NextResponse(null, { status: 401 });

	const form = await request.formData();
	const successURL = form.get("success_url");
	if (typeof successURL !== "string") {
		return new NextResponse("Missing success URL", { status: 400 });
	}

	const checkoutId = "deterministic-checkout-1";
	const result = await deliverTestPolarState({
		builderId: session.user.id,
		eventId: "event-checkout-completed",
		state: "active",
	});
	if (!result.ok) return result;

	return NextResponse.redirect(
		successURL.replace("{CHECKOUT_ID}", checkoutId),
		303,
	);
}
