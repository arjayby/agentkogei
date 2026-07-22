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

import { InstallationCommand } from "@/components/installation-command";

export const metadata: Metadata = {
	title: "Documentation — AgentKogei",
	description: "Install and use AgentKogei Design Packs safely in a Project.",
};

const sections = [
	{ href: "#installation", label: "Installation" },
	{ href: "#retrieval", label: "Design Contract retrieval" },
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
								Run one command from your Project root. Installation writes one
								root DESIGN.md containing the complete Pack Release, and creates
								or updates one marked AGENTS.md block so your coding agents
								discover it. It gives agents a stable Design Contract to follow;
								it does not automatically redesign an existing interface.
							</p>
							<p>
								A bare Design Pack identity selects the current Pack Release
								through the Official Catalog, and{" "}
								<code className="font-mono">foundation@1.1.0</code> selects that
								immutable release. Before writing, the CLI shows the Design
								Pack, Pack Release, Pack License, absolute target, and the exact
								change, then waits for your confirmation.
							</p>
						</div>
						<div className="mt-8 max-w-3xl">
							<InstallationCommand identity="foundation">
								agentkogei@latest selects the newest CLI, not the newest Design
								Pack. Open Design Packs add without an AgentKogei account;
								Premium Design Packs use the same command and start browser
								authorization when the CLI holds no Pack Credential.
							</InstallationCommand>
						</div>
						<div className="mt-8 flex max-w-3xl flex-col gap-5 text-base text-muted-foreground leading-8">
							<p>
								Re-running add is the only way to move to another Pack Release.
								Replacing an existing DESIGN.md shows the diff and asks
								directly; unattended replacement requires both --yes and
								--force. Removing a Design Pack is an ordinary Project edit:
								delete DESIGN.md and the marked AGENTS.md block.
							</p>
						</div>
					</section>

					<section
						id="retrieval"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="retrieval-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							02 / Inspection
						</p>
						<h2
							id="retrieval-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							Design Contract retrieval
						</h2>
						<div className="flex max-w-3xl flex-col gap-5 text-base text-muted-foreground leading-8">
							<p>
								The Official Catalog delivers a Pack Release as the exact raw
								Markdown bytes a Project installs, so what you read is what you
								add. Every Open Design Contract is publicly retrievable without
								an account.
							</p>
							<p>
								A Premium Design Contract uses the same raw endpoint behind a
								Pack Credential and active Premium Access, so gated direction
								never reaches an unauthorized caller.
							</p>
						</div>
						<div className="mt-8">
							<Link
								href={"/contracts/foundation" as Route}
								className={buttonVariants({ variant: "outline" })}
							>
								Read the Foundation Design Contract
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
					</section>

					<section
						id="one-pack"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="one-pack-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							03 / Coherence
						</p>
						<h2
							id="one-pack-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							One-pack constraint
						</h2>
						<p className="max-w-3xl text-base text-muted-foreground leading-8">
							A Project can have at most one Installed Pack, because two
							competing Interface Systems would undermine the durable direction
							Installation exists to provide. There is nothing to merge: one
							DESIGN.md either stands or is replaced, and replacing it is always
							a visible, confirmed decision.
						</p>
					</section>

					<section
						id="supported-stack"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="stack-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							04 / Compatibility
						</p>
						<h2
							id="stack-heading"
							className="mb-6 font-medium text-3xl tracking-tight"
						>
							Supported stack
						</h2>
						<p className="max-w-3xl text-base text-muted-foreground leading-8">
							Every Design Contract targets React or Next.js with Tailwind CSS
							v4 and shadcn/ui directly, and carries that implementation
							direction inside the document. Supporting another application
							stack is a future product decision, not a slot to fill.
						</p>
					</section>

					<section
						id="licensing"
						className="scroll-mt-24 border-b py-12"
						aria-labelledby="licensing-heading"
					>
						<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
							05 / Permission
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
										AgentKogei-authored Design Contract prose uses CC BY 4.0,
										allowing reuse and adaptation when Builders retain required
										attribution from the Pack Release.
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
											A Premium Design Contract is distributed under the
											commercial Pack License. An eligible installed snapshot
											may be used by Builders and collaborators in that Project,
											including a genuine public end-product Project, without
											opening the Pack License.
										</p>
										<p>
											The local snapshot remains usable offline without
											credentials, runtime checks, or DRM. The Project License
											does not permit extraction, resale, republishing,
											credential sharing, or cross-Project reuse.
										</p>
										<p>
											A refund or payment reversal terminates the affected
											Project License and future Official Catalog access, but
											AgentKogei never remotely modifies Project files.
										</p>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Open software, first-party catalog</CardTitle>
									<CardDescription>
										Open software is not catalog access.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-col gap-3 leading-7">
										<p>
											Self-hosting does not grant Premium Design Pack content,
											Pack Credentials, Premium Access, or permission to
											reproduce the Official Catalog. Access and permission
											remain separate.
										</p>
										<p>
											The Official Catalog contains only first-party Design
											Packs, and AgentKogei does not support installing a Design
											Pack from a third-party source. Opening the repository,
											the CLI, and the Design Contract format is a software
											decision, not a commitment to distribute anyone else's
											packs.
										</p>
									</div>
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
							06 / Trust boundary
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
								A Design Contract is inert Markdown. The CLI rejects any catalog
								response that is not successful, valid UTF-8 Markdown; it writes
								only DESIGN.md and its marked AGENTS.md block inside the current
								directory, and leaves any setup guidance for the Builder to
								apply.
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
