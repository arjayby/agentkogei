import { env } from "@agentkogei/env/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTHORIZATION_CODE = "deterministic-github-code";
const ACCESS_TOKEN = "deterministic-github-token";

function isEnabled() {
	return (
		env.NODE_ENV !== "production" && Boolean(env.GITHUB_OAUTH_TEST_BASE_URL)
	);
}

function unavailable() {
	return new NextResponse(null, { status: 404 });
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ operation: string }> },
) {
	if (!isEnabled()) return unavailable();

	const { operation } = await context.params;
	if (operation === "authorize") {
		const callbackURL = request.nextUrl.searchParams.get("redirect_uri");
		const state = request.nextUrl.searchParams.get("state");
		if (!callbackURL || !state) {
			return NextResponse.json({ error: "invalid_request" }, { status: 400 });
		}
		const redirectURL = new URL(callbackURL);
		const expectedCallbackURL = new URL(
			"/api/auth/oauth2/callback/github",
			env.BETTER_AUTH_URL,
		);
		if (
			redirectURL.origin !== expectedCallbackURL.origin ||
			redirectURL.pathname !== expectedCallbackURL.pathname
		) {
			return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
		}
		redirectURL.searchParams.set("code", AUTHORIZATION_CODE);
		redirectURL.searchParams.set("state", state);
		return NextResponse.redirect(redirectURL);
	}

	if (operation === "user") {
		if (request.headers.get("authorization") !== `Bearer ${ACCESS_TOKEN}`) {
			return NextResponse.json({ error: "bad_credentials" }, { status: 401 });
		}
		return NextResponse.json({
			id: "builder-1",
			name: "Octavia Builder",
			email: "octavia@example.com",
			emailVerified: true,
			image: null,
		});
	}

	return unavailable();
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ operation: string }> },
) {
	if (!isEnabled()) return unavailable();

	const { operation } = await context.params;
	if (operation !== "token") return unavailable();

	const body = await request.formData();
	if (
		body.get("code") !== AUTHORIZATION_CODE ||
		body.get("client_id") !== env.GITHUB_CLIENT_ID ||
		body.get("client_secret") !== env.GITHUB_CLIENT_SECRET
	) {
		return NextResponse.json(
			{ error: "bad_verification_code" },
			{ status: 400 },
		);
	}
	return NextResponse.json({
		access_token: ACCESS_TOKEN,
		token_type: "bearer",
	});
}
