import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@agentkogei/ui/components/alert";
import { buttonVariants } from "@agentkogei/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import { ArrowUpRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Documentation — AgentKogei",
	description: "Install and use AgentKogei Design Packs safely in a Project.",
};

const sections = [
	{ href: "#installation", label: "Installation" },
	{ href: "#one-pack", label: "One-pack constraint" },
	{ href: "#supported-stack", label: "Supported stack" },
	{ href: "#licensing", label: "Licensing" },
	{ href: "#safety", label: "Safety boundary" },
] as const;

export default function DocsPage() {
	return (
		<main>
			<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
						Documentation / Core concepts
					</p>
					<h1 className="max-w-4xl text-balance font-medium text-5xl tracking-[-0.05em] sm:text-7xl">
						From Pack Preview to durable local direction.
					</h1>
				</div>
			</header>

			<div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:px-12 lg:py-20">
				<aside>
					<nav
						aria-label="Documentation sections"
						className="flex flex-col gap-1 lg:sticky lg:top-24"
					>
						<p className="mb-3 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							On this page
						</p>
						{sections.map(({ href, label }) => (
							<a
								key={href}
								href={href}
								className="border-l px-3 py-2 text-muted-foreground text-sm hover:border-foreground hover:text-foreground"
							>
								{label}
							</a>
						))}
					</nav>
				</aside>

				<article className="min-w-0">
					<section
						id="installation"
						className="scroll-mt-24 border-b pb-12"
						aria-labelledby="installation-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							01 / Start here
						</p>
						<h2
							id="installation-heading"
							className="mb-6 font-medium text-3xl tracking-tight sm:text-5xl"
						>
							Installation
						</h2>
						<div className="flex max-w-3xl flex-col gap-5 text-base text-muted-foreground leading-8">
							<p>
								Installation applies an exact, versioned Design Pack snapshot
								inside your Project. The snapshot gives current and future
								coding agents a stable Design Contract to follow; it does not
								automatically redesign an existing interface.
							</p>
							<p>
								Choose a Pack Release, review every planned write and conflict,
								then explicitly confirm. Open packs require no AgentKogei
								account. Premium packs require an active Pack Credential at
								retrieval time.
							</p>
						</div>
						<pre className="mt-8 max-w-3xl overflow-x-auto border bg-foreground p-5 font-mono text-background text-sm">
							<code>
								{
									"$ agentkogei install foundation@1.0.0\n→ validate\n→ preview writes\n→ confirm"
								}
							</code>
						</pre>
					</section>

					<section
						id="one-pack"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="one-pack-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							02 / Coherence
						</p>
						<h2
							id="one-pack-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							One-pack constraint
						</h2>
						<p className="max-w-3xl text-base text-muted-foreground leading-8">
							A Project can have at most one Installed Pack. The CLI refuses
							silent merging or replacement because two competing Interface
							Systems would undermine the durable direction Installation exists
							to provide. Changing packs is always an explicit lifecycle
							decision.
						</p>
					</section>

					<section
						id="supported-stack"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="stack-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							03 / Compatibility
						</p>
						<h2
							id="stack-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							Supported stack
						</h2>
						<p className="max-w-3xl text-base text-muted-foreground leading-8">
							The MVP validates a React or Next.js Stack Adapter using Tailwind
							CSS v4 and shadcn/ui. Design Packs stay framework-neutral at their
							core, so future adapters can add integrations without redefining
							the Interface System.
						</p>
					</section>

					<section
						id="licensing"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="licensing-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							04 / Permission
						</p>
						<h2
							id="licensing-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							Licensing
						</h2>
						<div className="grid gap-5 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>AgentKogei software</CardTitle>
									<CardDescription>
										Open source under the MIT License.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="leading-7">
										The web application, CLI, Design Pack specification, and
										validators may be inspected, modified, distributed, and
										self-hosted under the MIT License.
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Open Design Packs</CardTitle>
									<CardDescription>Complete and account-free.</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="leading-7">
										AgentKogei-authored prose and original visual resources use
										CC BY 4.0, allowing reuse and adaptation when Builders
										retain required attribution from the Pack Release.
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Premium Design Packs</CardTitle>
									<CardDescription>
										Commercial Project Licenses.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-3 leading-7">
										<p>
											Premium resources are distributed under the commercial
											Pack License. An eligible installed snapshot may be used
											by Builders and collaborators in that Project, including a
											genuine public end-product Project, without opening the
											Pack License.
										</p>
										<p>
											The local snapshot remains usable offline without
											credentials, runtime checks, or DRM. The Project License
											does not permit extraction, resale, republishing,
											credential sharing, or cross-Project reuse.
										</p>
										<p>
											A refund or payment reversal terminates the affected
											Project License and future Premium Pack Source access, but
											AgentKogei never remotely modifies Project files.
										</p>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Self-hosting boundary</CardTitle>
									<CardDescription>
										Open software is not catalog access.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="leading-7">
										Self-hosting does not grant Premium Design Pack resources,
										Pack Credentials, Premium Access, or permission to reproduce
										the Official Catalog. Access and permission remain separate.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>

					<section
						id="safety"
						className="scroll-mt-24 pt-12"
						aria-labelledby="safety-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							05 / Trust boundary
						</p>
						<h2
							id="safety-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							Installation is declarative, not executable.
						</h2>
						<Alert role="note" className="max-w-3xl">
							<AlertTitle>
								The AgentKogei CLI never executes pack-supplied code, scripts,
								dependency installation, or package-manager commands.
							</AlertTitle>
							<AlertDescription>
								It validates declared files and safe relative targets, previews
								writes, rejects conflicts, and leaves dependency or setup
								guidance for the Builder to apply.
							</AlertDescription>
						</Alert>
						<div className="mt-10">
							<Link
								href={"/catalog" as Route}
								className={buttonVariants({ variant: "outline", size: "lg" })}
							>
								Browse the Official Catalog
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
					</section>
				</article>
			</div>
		</main>
	);
}
