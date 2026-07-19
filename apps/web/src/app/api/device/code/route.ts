import {
	packCredentialClientId,
	packCredentialScope,
	startDeviceAuthorization,
} from "@agentkogei/auth/lib/pack-credentials";
import { env } from "@agentkogei/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_request" }, { status: 400 });
	}
	if (
		!body ||
		typeof body !== "object" ||
		!("client_id" in body) ||
		body.client_id !== packCredentialClientId ||
		!("scope" in body) ||
		body.scope !== packCredentialScope ||
		!("credential_name" in body) ||
		typeof body.credential_name !== "string" ||
		body.credential_name.trim().length < 1 ||
		body.credential_name.length > 120
	) {
		return NextResponse.json({ error: "invalid_request" }, { status: 400 });
	}

	const result = await startDeviceAuthorization({
		origin: env.BETTER_AUTH_URL,
		credentialName: body.credential_name.trim(),
	});
	return NextResponse.json(result, {
		headers: { "Cache-Control": "no-store" },
	});
}
