import { auth } from "@agentkogei/auth";
import {
	premiumAccessStates,
	resetTestBillingState,
} from "@agentkogei/auth/lib/entitlements";
import { blackBoxTestBoundaryEnabled } from "@agentkogei/env/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { deliverTestPolarState } from "@/lib/test-polar";

const testEventSchema = z.object({
	eventId: z.string().min(1),
	state: z.enum(premiumAccessStates),
	periodStart: z.iso.datetime().optional(),
	periodEnd: z.iso.datetime().optional(),
	productId: z.string().min(1).optional(),
});

function unavailable() {
	return new NextResponse(null, { status: 404 });
}

function isEnabled() {
	return blackBoxTestBoundaryEnabled;
}

export async function POST(request: Request) {
	if (!isEnabled()) return unavailable();
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return new NextResponse(null, { status: 401 });

	const parsed = testEventSchema.safeParse(await request.json());
	if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

	return deliverTestPolarState({
		builderId: session.user.id,
		eventId: parsed.data.eventId,
		state: parsed.data.state,
		...(parsed.data.periodStart
			? { periodStart: parsed.data.periodStart }
			: {}),
		...(parsed.data.periodEnd ? { periodEnd: parsed.data.periodEnd } : {}),
		...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
	});
}

export async function DELETE() {
	if (!isEnabled()) return unavailable();
	await resetTestBillingState();
	return NextResponse.json({ reset: true });
}
