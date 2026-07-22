import { diagnosticPayloadSchema } from "agentkogei/src/diagnostic-contract";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid_diagnostic" }, { status: 400 });
	}
	const diagnostic = diagnosticPayloadSchema.safeParse(body);
	if (!diagnostic.success) {
		return NextResponse.json({ error: "invalid_diagnostic" }, { status: 400 });
	}

	console.info("AgentKogei CLI diagnostic", diagnostic.data);
	return new NextResponse(null, { status: 204 });
}
