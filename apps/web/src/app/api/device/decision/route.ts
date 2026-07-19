import { auth } from "@agentkogei/auth";
import { decideDeviceAuthorization } from "@agentkogei/auth/lib/pack-credentials";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return NextResponse.json(
			{ error: "authentication_required" },
			{ status: 401 },
		);
	}
	const form = await request.formData();
	const userCode = form.get("user_code");
	const decision = form.get("decision");
	if (
		typeof userCode !== "string" ||
		(decision !== "approved" && decision !== "denied")
	) {
		return NextResponse.json({ error: "invalid_request" }, { status: 400 });
	}
	const resolved = await decideDeviceAuthorization({
		userCode,
		builderId: session.user.id,
		decision,
	});
	if (!resolved) {
		return NextResponse.redirect(
			new URL("/device?error=invalid", request.url),
			303,
		);
	}
	return NextResponse.redirect(
		new URL(`/device/result?decision=${decision}`, request.url),
		303,
	);
}
