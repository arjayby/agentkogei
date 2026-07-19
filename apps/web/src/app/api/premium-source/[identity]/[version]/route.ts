import {
	authorizePremiumDelivery,
	recordPremiumProjectLicense,
} from "@agentkogei/auth/lib/premium-delivery";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProtectedPremiumRelease } from "@/lib/protected-premium-releases";
import { observeTestPremiumRetrieval } from "@/lib/test-premium-delivery";

const denial = () =>
	NextResponse.json(
		{ error: "premium_release_unavailable" },
		{ status: 404, headers: { "Cache-Control": "private, no-store" } },
	);

async function releaseIdentity(context: {
	params: Promise<{ identity: string; version: string }>;
}) {
	const release = await context.params;
	return getProtectedPremiumRelease(release.identity, release.version)
		? release
		: null;
}

function retrievalAuthority(request: Request) {
	const authorization = request.headers.get("authorization");
	const credential = authorization?.startsWith("Bearer ")
		? authorization.slice("Bearer ".length)
		: null;
	const projectLicenseId = request.headers.get("x-agentkogei-project-license");
	return credential &&
		projectLicenseId &&
		z.uuid().safeParse(projectLicenseId).success &&
		request.headers.get("x-agentkogei-action") === "install"
		? { credential, projectLicenseId }
		: null;
}

export async function GET(
	request: Request,
	context: { params: Promise<{ identity: string; version: string }> },
) {
	observeTestPremiumRetrieval(request);
	const release = await releaseIdentity(context);
	const authority = retrievalAuthority(request);
	if (
		!release ||
		!authority ||
		!(await authorizePremiumDelivery({ credential: authority.credential }))
	) {
		return denial();
	}

	const protectedRelease = getProtectedPremiumRelease(
		release.identity,
		release.version,
	);
	if (!protectedRelease) return denial();
	return NextResponse.json(protectedRelease, {
		headers: {
			"Cache-Control": "private, no-store",
			"X-AgentKogei-Project-License": authority.projectLicenseId,
			"X-Content-Type-Options": "nosniff",
		},
	});
}

export async function POST(
	request: Request,
	context: { params: Promise<{ identity: string; version: string }> },
) {
	const release = await releaseIdentity(context);
	const authority = retrievalAuthority(request);
	if (
		!release ||
		!authority ||
		!(await recordPremiumProjectLicense({
			...authority,
			packId: release.identity,
			packRelease: release.version,
		}))
	) {
		return denial();
	}
	return new NextResponse(null, {
		status: 204,
		headers: { "Cache-Control": "private, no-store" },
	});
}
