import { auth, productionPaymentsEnabled } from "@agentkogei/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session?.user) return new NextResponse(null, { status: 401 });
	if (!productionPaymentsEnabled) {
		return NextResponse.json(
			{ error: "production_payments_disabled_pending_legal_review" },
			{ status: 503 },
		);
	}

	const result = await auth.api.checkout({
		headers: requestHeaders,
		body: { slug: "premium-access", redirect: false },
	});

	return NextResponse.redirect(result.url, 303);
}
