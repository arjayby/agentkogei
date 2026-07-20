import { setTestPackCredentialScope } from "@agentkogei/auth/lib/pack-credentials";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new NextResponse(null, { status: 404 });
	}
	if (
		!body ||
		typeof body !== "object" ||
		!("credential" in body) ||
		typeof body.credential !== "string" ||
		!("scope" in body) ||
		typeof body.scope !== "string" ||
		!(await setTestPackCredentialScope(body.credential, body.scope))
	) {
		return new NextResponse(null, { status: 404 });
	}
	return new NextResponse(null, { status: 204 });
}
