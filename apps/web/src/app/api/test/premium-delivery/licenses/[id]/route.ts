import {
	inspectTestProjectLicense,
	recordTestPremiumProjectLicense,
} from "@agentkogei/auth/lib/premium-delivery";
import { NextResponse } from "next/server";

export async function GET(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const license = await inspectTestProjectLicense((await context.params).id);
	if (!license) return new NextResponse(null, { status: 404 });
	return NextResponse.json(license, {
		headers: { "Cache-Control": "no-store" },
	});
}

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
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
		!("packId" in body) ||
		typeof body.packId !== "string" ||
		!("packRelease" in body) ||
		typeof body.packRelease !== "string" ||
		!(await recordTestPremiumProjectLicense({
			credential: body.credential,
			projectLicenseId: (await context.params).id,
			packId: body.packId,
			packRelease: body.packRelease,
		}))
	) {
		return new NextResponse(null, { status: 404 });
	}
	return new NextResponse(null, {
		status: 204,
		headers: { "Cache-Control": "no-store" },
	});
}
