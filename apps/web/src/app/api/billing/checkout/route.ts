import { auth } from "@agentkogei/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session?.user) return new NextResponse(null, { status: 401 });

	const result = await auth.api.checkout({
		headers: requestHeaders,
		body: { slug: "premium-access", redirect: false },
	});

	return NextResponse.redirect(result.url, 303);
}
