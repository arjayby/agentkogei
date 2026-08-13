import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import {
	type InstallableDesignSystem,
	InstallationCommand,
} from "@/components/installation-command";
import { designSystems } from "@/lib/catalog";
import {
	agentKogeiOrganization,
	publicOrigin,
	StructuredData,
} from "@/lib/structured-data";

const guideTitle = "Design Contracts for AI coding agents";
const guideDescription =
	"Learn how Project instructions and a root Design Contract give AI coding agents durable visual direction that remains available offline.";
const guideUrl = `${publicOrigin}/guides/design-md`;
const installableDesignSystems: readonly InstallableDesignSystem[] =
	designSystems.map(({ slug, name }) => ({ slug, name }));

export const metadata: Metadata = {
	title: `${guideTitle} | AgentKogei`,
	description: guideDescription,
	alternates: {
		canonical: "/guides/design-md",
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@type": "TechArticle",
	"@id": `${guideUrl}#article`,
	headline: guideTitle,
	description: guideDescription,
	url: guideUrl,
	mainEntityOfPage: guideUrl,
	inLanguage: "en",
	datePublished: "2026-08-13",
	dateModified: "2026-08-13",
	author: agentKogeiOrganization,
	publisher: {
		"@id": agentKogeiOrganization["@id"],
	},
};

const relationshipSteps = [
	{
		label: "Project instructions",
		title: "Tell agents where direction lives",
		body: "AGENTS.md is the durable entry point for coding agents. AgentKogei adds a managed instruction that tells them to read the root Design Contract before interface work.",
		artifact: "AGENTS.md",
	},
	{
		label: "Root Design Contract",
		title: "Hold the complete visual direction",
		body: "DESIGN.md contains one complete Design System Release: principles, tokens, components, states, motion, accessibility direction, examples, and a validation checklist.",
		artifact: "DESIGN.md",
	},
	{
		label: "Future agent work",
		title: "Apply the same decisions again",
		body: "Every agent that follows the Project instructions reaches the same source of truth, so later screens and interactions begin from shared direction instead of reconstructing it.",
		artifact: "Every session",
	},
] as const;

export default function DesignContractGuidePage() {
	return (
		<main>
			<StructuredData identity="guide-design-contract" data={structuredData} />
			<article>
				<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<Link
							href={"/guides" as Route}
							className="w-fit font-mono text-muted-foreground text-xs uppercase tracking-[0.16em] transition-colors hover:text-foreground"
						>
							Guides / Design Contract
						</Link>
						<h1 className="max-w-4xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-8xl">
							Give every agent durable design direction.
						</h1>
						<p className="max-w-3xl text-pretty text-muted-foreground text-xl leading-9">
							An Installed Design System connects Project instructions to one
							root Design Contract. Agents can find the same complete direction
							now, offline, and throughout future work.
						</p>
					</div>
				</header>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="relationship-heading"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-10">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								One durable path
							</p>
							<h2
								id="relationship-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								From Project entry point to every interface decision.
							</h2>
						</div>
						<ol className="grid border-t border-l md:grid-cols-3">
							{relationshipSteps.map((step, index) => (
								<li
									key={step.label}
									className="relative flex flex-col gap-5 border-r border-b p-6 sm:p-8"
								>
									<div className="flex items-center justify-between gap-4">
										<span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
											{step.label}
										</span>
										{index < relationshipSteps.length - 1 ? (
											<ArrowRight
												className="hidden size-4 text-muted-foreground md:block"
												aria-hidden="true"
											/>
										) : null}
									</div>
									<p className="font-mono text-lg">{step.artifact}</p>
									<h3 className="font-medium text-xl tracking-tight">
										{step.title}
									</h3>
									<p className="text-muted-foreground leading-7">{step.body}</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="installed-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]">
						<div className="flex flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Installed Design System
							</p>
							<h2
								id="installed-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								A Project artifact, not a service dependency.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Installation writes the selected Design System Release to the
								Project root and adds its reference to the managed section of
								AGENTS.md. The Installed Design System then belongs to the
								Project.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Because the full release is local, it works offline after
								Installation. Future agent work does not depend on AgentKogei
								being available, and the direction remains inspectable in
								ordinary files.
							</p>
						</div>
						<div className="border bg-muted/30 p-6 sm:p-8">
							<h3 className="font-medium text-xl tracking-tight">
								What Installation does
							</h3>
							<ul className="mt-6 flex flex-col gap-4">
								{[
									"Selects one current Published Design System Release",
									"Shows the exact target and change before writing",
									"Writes the complete release to root DESIGN.md",
									"Adds a managed AGENTS.md reference without replacing other instructions",
									"Leaves existing interface code unchanged",
								].map((item) => (
									<li key={item} className="flex gap-3 leading-7">
										<Check
											className="mt-1 size-4 shrink-0"
											aria-hidden="true"
										/>
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="compatibility-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start">
						<div>
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Compatibility
							</p>
							<h2
								id="compatibility-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Know the fit before Installation.
							</h2>
						</div>
						<div className="flex flex-col gap-6 text-lg leading-8">
							<p>
								AgentKogei Design Systems give implementation direction for
								React 18 and 19, Next.js 15 and 16, Tailwind CSS v4, and
								shadcn/ui.
							</p>
							<p className="text-muted-foreground">
								Installation is declarative. It adds direction for agents but
								does not install application dependencies, execute generated
								code, or migrate an existing interface.
							</p>
						</div>
					</div>
				</section>

				<section
					className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="installation-heading"
				>
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<div className="flex flex-wrap items-end justify-between gap-6">
							<div className="max-w-3xl">
								<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
									Choose direction
								</p>
								<h2
									id="installation-heading"
									className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
								>
									Inspect first. Install when the fit is clear.
								</h2>
							</div>
							<Link
								href={"/design-systems" as Route}
								className={buttonVariants({ variant: "outline", size: "lg" })}
							>
								Explore Design Systems
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
						<p className="max-w-3xl text-lg text-muted-foreground leading-8">
							Open a Design System Preview to assess its direction, complete
							Design Contract, compatibility, and Design System Evaluation. Then
							use the command for the Design System you chose from the Project
							root.
						</p>
						<InstallationCommand designSystems={installableDesignSystems}>
							The CLI retrieves the selected public release anonymously and asks
							for normal file mutation approval before Installation.
						</InstallationCommand>
					</div>
				</section>
			</article>
		</main>
	);
}
