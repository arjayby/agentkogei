import { blackBoxTestBoundaryEnabled } from "@agentkogei/env/server";
import { Button, buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TestPolarCheckoutPage({
	searchParams,
}: {
	searchParams: Promise<{ success_url?: string }>;
}) {
	if (!blackBoxTestBoundaryEnabled) {
		notFound();
	}
	const { success_url: successURL } = await searchParams;

	return (
		<main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-12">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>
						<h1>Premium Access — annual</h1>
					</CardTitle>
					<CardDescription>
						Deterministic Polar checkout substitute
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<p className="font-medium text-4xl tracking-tight">$99 USD / year</p>
					<p>One named Builder · Unlimited Projects</p>
					<p className="text-muted-foreground">
						No trial. Renewal can be canceled while preserving the paid term.
					</p>
				</CardContent>
				<CardFooter className="flex gap-3">
					<form action="/api/test/polar/complete" method="post">
						<input type="hidden" name="success_url" value={successURL ?? ""} />
						<Button type="submit">Start $99 annual subscription</Button>
					</form>
					<Link
						href="/success?outcome=canceled"
						className={buttonVariants({ variant: "outline" })}
					>
						Return without subscribing
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
