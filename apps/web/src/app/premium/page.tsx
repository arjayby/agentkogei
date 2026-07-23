import { auth } from "@agentkogei/auth";
import { Button, buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata, Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Premium Access | AgentKogei",
	description:
		"One annual plan for AgentKogei's complete Premium Design Pack catalog.",
};

const benefits = [
	"Every Premium Design Pack in the Official Catalog",
	"Installation across unlimited Projects with one add command",
	"At least one Material Release per quarter",
	"Installed packs keep working in your Projects after access ends",
] as const;

export default async function PremiumPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-end">
					<div className="flex flex-col gap-5">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Premium Access / Annual
						</p>
						<h1 className="max-w-4xl text-balance font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
							The complete premium catalog. One clear price.
						</h1>
					</div>
					<p className="max-w-xl text-lg text-muted-foreground leading-8">
						Open packs prove the complete workflow. Premium Access adds the most
						distinctive, production-deep Interface Systems and every release
						they publish.
					</p>
				</div>
			</header>

			<section
				className="px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
				aria-label="Premium Access offer"
			>
				<div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
					<Card className="[--card-spacing:--spacing(7)]">
						<CardHeader>
							<CardTitle>Premium Access</CardTitle>
							<CardDescription>
								Annual access for one named Builder.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-10">
							<div className="flex items-end gap-3">
								<span className="font-medium text-7xl tracking-[-0.07em]">
									$99
								</span>
								<span className="pb-2 text-muted-foreground">USD / year</span>
							</div>
							<ul className="grid gap-4">
								{benefits.map((benefit) => (
									<li
										key={benefit}
										className="flex items-start gap-3 text-base leading-7"
									>
										<Check aria-hidden="true" className="mt-1 shrink-0" />
										{benefit}
									</li>
								))}
							</ul>
						</CardContent>
						<CardFooter className="flex flex-wrap gap-3">
							{session?.user ? (
								<form action="/api/billing/checkout" method="post">
									<Button size="lg" type="submit">
										Continue to Polar at $99/year
										<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
									</Button>
								</form>
							) : (
								<Link
									href={"/login?callbackURL=%2Fpremium" as Route}
									className={buttonVariants({ size: "lg" })}
								>
									Sign in with GitHub to subscribe
									<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
								</Link>
							)}
							<Link
								href={"/catalog" as Route}
								className={buttonVariants({ size: "lg", variant: "outline" })}
							>
								Preview Premium Design Packs
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</CardFooter>
					</Card>

					<div className="grid gap-px border bg-border sm:grid-cols-2 lg:grid-cols-1">
						<div className="flex flex-col gap-3 bg-background p-6">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
								No trial
							</p>
							<p className="leading-7">
								Foundation and Editorial are complete Open Design Packs, so you
								can evaluate the real Installation workflow before subscribing.
							</p>
						</div>
						<div className="flex flex-col gap-3 bg-background p-6">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
								Billing and refunds
							</p>
							<p className="leading-7">
								Billing period, renewal, cancellation, and refund terms are set
								out on the{" "}
								<Link
									href={"/terms" as Route}
									className="underline underline-offset-4 hover:text-foreground"
								>
									Terms
								</Link>{" "}
								page. Review them before you subscribe.
							</p>
						</div>
						<div className="flex flex-col gap-3 bg-background p-6 sm:col-span-2 lg:col-span-1">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
								No runtime lock-in
							</p>
							<p className="leading-7">
								When Premium Access expires, retrieval, new Installation,
								reinstallation, and access to new Pack Releases stop. A Premium
								Design Pack already installed while access was active keeps
								working in that Project, offline, with no runtime checks or DRM.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="border-t bg-muted px-5 py-12 sm:px-8 lg:px-12">
				<div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-center">
					<h2 className="font-medium text-3xl tracking-tight">
						Open stays complete.
					</h2>
					<p className="max-w-2xl text-foreground leading-7">
						Open and Premium Published Packs meet the same completeness,
						accessibility, and Pack Evaluation bar. Premium value comes from
						creative distinctiveness, production depth, and breadth of
						direction, not withheld baseline quality.
					</p>
				</div>
			</section>
		</main>
	);
}
