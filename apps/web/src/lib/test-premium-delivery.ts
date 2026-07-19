import "server-only";

import { env } from "@agentkogei/env/server";

type RetrievalObservation = {
	method: string;
	pathname: string;
	search: string;
	headers: Record<string, string>;
	hasBody: boolean;
};

const observationKey = Symbol.for(
	"agentkogei.test-premium-delivery-observation",
);
type ObservationGlobals = typeof globalThis & {
	[observationKey]?: RetrievalObservation;
};

function observationGlobals() {
	return globalThis as ObservationGlobals;
}

export function observeTestPremiumRetrieval(request: Request) {
	if (env.NODE_ENV === "production" || !env.GITHUB_OAUTH_TEST_BASE_URL) return;
	const url = new URL(request.url);
	const headers = Object.fromEntries(request.headers);
	if (headers.authorization) headers.authorization = "[Pack Credential]";
	observationGlobals()[observationKey] = {
		method: request.method,
		pathname: url.pathname,
		search: url.search,
		headers,
		hasBody: request.body !== null,
	};
}

export function getTestPremiumRetrievalObservation() {
	if (env.NODE_ENV === "production" || !env.GITHUB_OAUTH_TEST_BASE_URL) {
		return null;
	}
	return observationGlobals()[observationKey] ?? null;
}
