import { expireTestDeviceAuthorization } from "@agentkogei/auth/lib/pack-credentials";
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
		!("device_code" in body) ||
		typeof body.device_code !== "string" ||
		!(await expireTestDeviceAuthorization(body.device_code))
	) {
		return new NextResponse(null, { status: 404 });
	}
	return new NextResponse(null, { status: 204 });
}
