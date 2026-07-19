import {
	POST as recordProtectedReleaseLicense,
	GET as retrieveProtectedRelease,
} from "@/app/api/premium-source/[identity]/[version]/route";

type UnversionedOfficialPackSourceContext = {
	params: Promise<{ identity: string }>;
};

function premiumSourceContext(context: UnversionedOfficialPackSourceContext) {
	return {
		params: context.params.then(({ identity }) => ({
			identity:
				(identity.endsWith(".json") ? identity.slice(0, -5) : identity) ===
				"command"
					? "command"
					: "not-in-official-premium-source",
			version: "1.0.0",
		})),
	};
}

export function GET(
	request: Request,
	context: UnversionedOfficialPackSourceContext,
) {
	return retrieveProtectedRelease(request, premiumSourceContext(context));
}

export function POST(
	request: Request,
	context: UnversionedOfficialPackSourceContext,
) {
	return recordProtectedReleaseLicense(request, premiumSourceContext(context));
}
