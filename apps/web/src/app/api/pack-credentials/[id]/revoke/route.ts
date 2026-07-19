import { auth } from "@agentkogei/auth";
import { revokePackCredential } from "@agentkogei/auth/lib/pack-credentials";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		return NextResponse.json(
			{ error: "authentication_required" },
			{ status: 401 },
		);
	}
	const { id } = await context.params;
	if (!(await revokePackCredential(id, session.user.id))) {
		return NextResponse.json(
			{ error: "credential_not_found" },
			{ status: 404 },
		);
	}
	return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
