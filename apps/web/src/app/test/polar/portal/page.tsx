import { blackBoxTestBoundaryEnabled } from "@agentkogei/env/server";
import { buttonVariants } from "@agentkogei/ui/components/button";
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

export default function TestPolarPortalPage() {
	if (!blackBoxTestBoundaryEnabled) {
		notFound();
	}
	return (
		<main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-12">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>
						<h1>Polar billing portal</h1>
					</CardTitle>
					<CardDescription>
						Deterministic customer portal substitute
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p>
						Billing details, invoices, payment methods, and renewal cancellation
						are managed by Polar.
					</p>
				</CardContent>
				<CardFooter>
					<Link href="/dashboard" className={buttonVariants()}>
						Return to Builder account
					</Link>
				</CardFooter>
			</Card>
		</main>
	);
}
