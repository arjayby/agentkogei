import {
	POST as recordProtectedReleaseLicense,
	GET as retrieveProtectedRelease,
} from "@/app/api/premium-source/[identity]/[version]/route";
import { isOfficialPremiumPackIdentity } from "@/lib/protected-premium-releases";

type VersionedOfficialPackSourceContext = {
	params: Promise<{ identity: string; version: string }>;
};

function premiumSourceContext(context: VersionedOfficialPackSourceContext) {
	return {
		params: context.params.then(({ identity, version }) => {
			const releaseVersion = version.endsWith(".json")
				? version.slice(0, -5)
				: version;
			return {
				identity: isOfficialPremiumPackIdentity(identity)
					? identity
					: "not-in-official-premium-source",
				version: releaseVersion,
			};
		}),
	};
}

export function GET(
	request: Request,
	context: VersionedOfficialPackSourceContext,
) {
	return retrieveProtectedRelease(request, premiumSourceContext(context));
}

export function POST(
	request: Request,
	context: VersionedOfficialPackSourceContext,
) {
	return recordProtectedReleaseLicense(request, premiumSourceContext(context));
}
