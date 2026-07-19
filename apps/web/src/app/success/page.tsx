import { auth } from "@agentkogei/auth";
import { getPremiumAccess } from "@agentkogei/auth/lib/entitlements";
import { buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { headers } from "next/headers";
import Link from "next/link";
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
	const premiumAccess = await getPremiumAccess(session.user.id);
	const isConfirmed =
		Boolean(checkoutId) &&
		(premiumAccess?.status === "active" ||
			premiumAccess?.status === "canceling");

	return (
		<main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-12">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>
						<h1>
							{isConfirmed
								? "Premium Access confirmed"
								: checkoutId
									? "Checkout received"
									: "Checkout not completed"}
						</h1>
					</CardTitle>
					<CardDescription>
						{isConfirmed
							? "A verified Polar billing event activated Premium Access for your Builder account."
							: checkoutId
								? "Polar is still processing the billing event for your Builder account."
								: "No payment was recorded. You can return when you are ready."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p>
						{isConfirmed
							? "Your account now reflects the verified entitlement."
							: checkoutId
								? "Premium Access will appear only after a verified Polar event is received."
								: "Your Open Design Pack access is unchanged."}
					</p>
				</CardContent>
				<CardFooter>
					<Link href="/dashboard" className={buttonVariants()}>
						View Builder account
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
