import { auth } from "@agentkogei/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ checkout_id?: string }>;
}) {
	const { checkout_id: checkoutId } = await searchParams;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		const successURL = checkoutId
			? `/success?checkout_id=${encodeURIComponent(checkoutId)}`
			: "/success";
		redirect(`/login?callbackURL=${encodeURIComponent(successURL)}`);
	}

	return (
		<main className="mx-auto max-w-[92rem] px-4 py-8 sm:px-8">
			<h1>Payment successful</h1>
			{checkoutId ? <p>Checkout ID: {checkoutId}</p> : null}
		</main>
	);
}
