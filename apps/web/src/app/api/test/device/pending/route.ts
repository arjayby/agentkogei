import { inspectTestDeviceAuthorization } from "@agentkogei/auth/lib/pack-credentials";
import { NextResponse } from "next/server";

export function GET(request: Request) {
	const credentialName = new URL(request.url).searchParams.get(
		"credential_name",
	);
	const authorization = credentialName
		? inspectTestDeviceAuthorization(credentialName)
		: null;
	if (!authorization) {
		return NextResponse.json(
			{ error: "device_authorization_not_found" },
			{ status: 404 },
		);
	}
	return NextResponse.json(authorization);
}
