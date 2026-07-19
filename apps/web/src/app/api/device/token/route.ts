import {
	deviceGrantType,
	exchangeDeviceAuthorization,
	packCredentialClientId,
} from "@agentkogei/auth/lib/pack-credentials";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
	}
	if (
		!body ||
		typeof body !== "object" ||
		!("grant_type" in body) ||
		body.grant_type !== deviceGrantType ||
		!("client_id" in body) ||
		body.client_id !== packCredentialClientId ||
		!("device_code" in body) ||
		typeof body.device_code !== "string" ||
		body.device_code.length < 1
	) {
		return NextResponse.json({ error: "invalid_grant" }, { status: 400 });
	}

	const result = await exchangeDeviceAuthorization(body.device_code);
	if (!result.ok) {
		return NextResponse.json(
			{ error: result.error },
			{ status: 400, headers: { "Cache-Control": "no-store" } },
		);
	}
	return NextResponse.json(
		{
			access_token: result.credential,
			token_type: "Bearer",
			scope: "premium:retrieve",
		},
		{ headers: { "Cache-Control": "no-store" } },
	);
}
