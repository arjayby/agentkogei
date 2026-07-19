import SignInForm from "@/components/sign-in-form";

const DEFAULT_AUTHENTICATED_EXPERIENCE = "/dashboard";
const CALLBACK_BASE_URL = new URL("https://agentkogei.local");

function getSafeCallbackURL(callbackURL: string | string[] | undefined) {
	if (typeof callbackURL !== "string") return DEFAULT_AUTHENTICATED_EXPERIENCE;
	try {
		const resolvedURL = new URL(callbackURL, CALLBACK_BASE_URL);
		if (resolvedURL.origin === CALLBACK_BASE_URL.origin) {
			return `${resolvedURL.pathname}${resolvedURL.search}${resolvedURL.hash}`;
		}
	} catch {
		return DEFAULT_AUTHENTICATED_EXPERIENCE;
	}
	return DEFAULT_AUTHENTICATED_EXPERIENCE;
}

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{
		callbackURL?: string | string[];
		error?: string | string[];
	}>;
}) {
	const { callbackURL, error } = await searchParams;

	return (
		<main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[92rem] items-center justify-center px-4 py-12">
			<SignInForm
				callbackURL={getSafeCallbackURL(callbackURL)}
				hasOAuthError={typeof error === "string"}
			/>
		</main>
	);
}
