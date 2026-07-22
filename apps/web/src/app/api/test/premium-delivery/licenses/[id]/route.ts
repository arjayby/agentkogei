import {
	inspectTestProjectLicense,
	recordTestPremiumProjectLicense,
} from "@agentkogei/auth/lib/premium-delivery";
import { NextResponse } from "next/server";
import { z } from "zod";

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

const recordedLicenseSchema = z.object({
	credential: z.string().min(1),
	packId: z.string().min(1),
	packRelease: z.string().min(1),
});

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
	const recorded = recordedLicenseSchema.safeParse(body);
	if (
		!recorded.success ||
		!z.uuid().safeParse((await context.params).id).success ||
		!(await recordTestPremiumProjectLicense({
			...recorded.data,
			projectLicenseId: (await context.params).id,
		}))
	) {
		return new NextResponse(null, { status: 404 });
	}
	return new NextResponse(null, {
		status: 204,
		headers: { "Cache-Control": "no-store" },
	});
}
