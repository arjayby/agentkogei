import {
	packCredentialScope,
	verifyPackCredential,
} from "@agentkogei/auth/lib/pack-credentials";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const authorization = request.headers.get("authorization");
	const credential = authorization?.startsWith("Bearer ")
		? authorization.slice("Bearer ".length)
		: null;
	if (!credential || !(await verifyPackCredential(credential))) {
		return NextResponse.json({ authorized: false }, { status: 401 });
	}
	return NextResponse.json({
		authorized: true,
		scope: packCredentialScope,
	});
}
