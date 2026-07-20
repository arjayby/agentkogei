import { inspectTestProjectLicense } from "@agentkogei/auth/lib/premium-delivery";
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
