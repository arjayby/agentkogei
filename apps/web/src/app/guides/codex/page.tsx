import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import {
	type InstallableDesignSystem,
	InstallationCommand,
} from "@/components/installation-command";
import { installationChoices } from "@/lib/catalog";
import { codexGuide, codexGuideUrl } from "@/lib/guides";
import { agentKogeiOrganization, StructuredData } from "@/lib/structured-data";

const installableDesignSystems: readonly InstallableDesignSystem[] =
	installationChoices();

export const metadata: Metadata = {
	title: `${codexGuide.title} | AgentKogei`,
	description: codexGuide.description,
	alternates: {
		canonical: codexGuide.route,
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@type": "TechArticle",
	"@id": `${codexGuideUrl}#article`,
	headline: codexGuide.title,
	description: codexGuide.description,
	url: codexGuideUrl,
	mainEntityOfPage: codexGuideUrl,
	inLanguage: "en",
	datePublished: codexGuide.publishedAt,
	dateModified: codexGuide.publishedAt,
	author: agentKogeiOrganization,
	publisher: {
		"@id": agentKogeiOrganization["@id"],
	},
};

const installationSteps = [
	{
		label: "Inspect",
		title: "Choose a compatible Design System",
		body: "Read its Design System Preview, complete Design Contract, compatibility, and evaluation evidence before applying it to a Project.",
	},
	{
		label: "Install",
		title: "Run add from the Project root",
		body: "The CLI retrieves the selected release, previews the files it will create or replace, and asks for approval before writing.",
	},
	{
		label: "Verify",
		title: "Inspect both durable files",
		body: "Check for a root override, confirm that DESIGN.md holds the complete release, and inspect the managed AGENTS.md block without replacing other Project instructions.",
	},
] as const;

const managedReference = [
	"<!-- agentkogei:design-system:start -->",
	"## AgentKogei Design System",
	"",
	"Follow the Design System in `DESIGN.md` for all user interface work in this Project.",
	"<!-- agentkogei:design-system:end -->",
] as const;

export default function CodexGuidePage() {
	return (
		<main>
			<StructuredData identity="guide-codex" data={structuredData} />
			<article>
				<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<Link
							href={"/guides" as Route}
							className="w-fit font-mono text-muted-foreground text-xs uppercase tracking-[0.16em] transition-colors hover:text-foreground"
						>
							Guides / Codex
						</Link>
						<h1 className="max-w-5xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-8xl">
							Give Codex the same design direction in every task.
						</h1>
						<p className="max-w-3xl text-pretty text-muted-foreground text-xl leading-9">
							AgentKogei Installation places one Design Contract at the Project
							root and adds a managed Project instruction. When Codex loads that
							AGENTS.md, the instruction directs it to the complete visual
							direction in DESIGN.md.
						</p>
					</div>
				</header>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="discovery-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]">
						<div className="flex flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Why Codex finds it
							</p>
							<h2
								id="discovery-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Project instructions form the discovery path.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Codex builds its Project instruction chain before doing work. It
								starts at the Project root, typically the Git root, and walks
								toward the current working directory.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								At the Project root, Codex checks AGENTS.override.md before
								AGENTS.md and uses at most one instruction file there.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Codex stops adding instruction files when their combined size
								reaches project_doc_max_bytes, which defaults to 32 KiB.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								When there is no root override and the combined instruction
								chain is within that limit, the managed AGENTS.md is part of the
								instruction chain for work beneath it.
							</p>
							<a
								href="https://developers.openai.com/codex/guides/agents-md"
								className="w-fit font-medium underline underline-offset-4"
							>
								Codex AGENTS.md documentation
							</a>
						</div>
						<div className="flex flex-col gap-5 border bg-muted/30 p-6 sm:p-8">
							<h3 className="font-medium text-xl tracking-tight">
								The exact handoff
							</h3>
							<div className="grid gap-3 sm:grid-cols-[auto_1fr_auto_1fr_auto] sm:items-center">
								<code className="border bg-background px-3 py-2">
									AGENTS.md
								</code>
								<ArrowRight
									className="hidden size-4 justify-self-center text-muted-foreground sm:block"
									aria-hidden="true"
								/>
								<code className="border bg-background px-3 py-2">
									DESIGN.md
								</code>
								<ArrowRight
									className="hidden size-4 justify-self-center text-muted-foreground sm:block"
									aria-hidden="true"
								/>
								<span className="font-medium">Interface work</span>
							</div>
							<p className="text-muted-foreground leading-7">
								DESIGN.md is not a special Codex instruction filename. When the
								managed AGENTS.md is active, its sentence explicitly tells Codex
								to follow the Design Contract for user interface work.
							</p>
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="workflow-heading"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-10">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Installation workflow
							</p>
							<h2
								id="workflow-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Inspect, install, then verify.
							</h2>
						</div>
						<ol className="grid border-t border-l md:grid-cols-3">
							{installationSteps.map((step) => (
								<li
									key={step.label}
									className="flex flex-col gap-5 border-r border-b p-6 sm:p-8"
								>
									<span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
										{step.label}
									</span>
									<h3 className="font-medium text-xl tracking-tight">
										{step.title}
									</h3>
									<p className="text-muted-foreground leading-7">{step.body}</p>
								</li>
							))}
						</ol>
						<div className="grid gap-6 lg:grid-cols-3">
							<div className="border bg-[#0a0d12] p-5 font-mono text-[#e7ecf3] lg:col-span-1">
								<p className="mb-4 text-[#8b98ab] text-xs uppercase tracking-[0.16em]">
									From the Project root
								</p>
								<code className="text-sm [overflow-wrap:anywhere]">
									npx agentkogei@latest add foundation
								</code>
							</div>
							<div className="border bg-[#0a0d12] p-5 font-mono text-[#e7ecf3] lg:col-span-2">
								<p className="mb-4 text-[#8b98ab] text-xs uppercase tracking-[0.16em]">
									Inspect the result
								</p>
								<div className="flex flex-col gap-3 text-sm">
									<code>ls AGENTS.override.md AGENTS.md DESIGN.md</code>
									<code>wc -c AGENTS.md</code>
									<code>cat AGENTS.md</code>
									<code>cat DESIGN.md</code>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="reference-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
						<div className="flex flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Managed reference
							</p>
							<h2
								id="reference-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								One explicit instruction connects the files.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								AgentKogei creates AGENTS.md when it is absent. When the file
								already exists, it preserves the other instructions and adds or
								updates only its marked block.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								AgentKogei does not create or change AGENTS.override.md. If a
								root override exists, Codex uses it instead of the managed root
								AGENTS.md, so resolve that Project instruction manually before
								relying on this handoff.
							</p>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								If verification omits the managed reference, also inspect the
								active instruction files and project_doc_max_bytes. Shorten or
								split oversized Project guidance, or raise the limit
								intentionally.
							</p>
						</div>
						<pre className="whitespace-pre-wrap border bg-[#0a0d12] p-5 text-[#e7ecf3] text-sm leading-7 [overflow-wrap:anywhere]">
							<code>
								{managedReference.map((line, index) => (
									<span key={`${index}-${line}`} className="block min-h-7">
										{line}
									</span>
								))}
							</code>
						</pre>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="verify-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]">
						<div className="flex flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Fresh Codex task
							</p>
							<h2
								id="verify-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Verify the direction before interface work.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Start a new Codex task from the Project root after Installation.
								Codex builds its instruction chain once per run, so a fresh task
								ensures it evaluates the current root instruction files.
							</p>
						</div>
						<div className="border bg-muted/30 p-6 sm:p-8">
							<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
								Verification request
							</p>
							<blockquote className="text-pretty font-medium text-xl leading-8">
								Summarize the Project instructions and the Design Contract you
								will follow before changing the interface.
							</blockquote>
							<p className="mt-6 text-muted-foreground leading-7">
								Check the response against both files. This verifies what Codex
								received without asking it to mutate the Project.
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
									Qualified Installation
								</p>
								<h2
									id="installation-heading"
									className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
								>
									Choose the direction before applying it.
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
						<ul className="grid gap-4 text-muted-foreground md:grid-cols-3">
							{[
								"Installation writes DESIGN.md and the managed AGENTS.md reference.",
								"It does not install dependencies, execute code, or migrate an existing interface.",
								"Replacing an existing Design Contract requires explicit approval.",
							].map((boundary) => (
								<li key={boundary} className="flex gap-3 leading-7">
									<Check
										className="mt-1 size-4 shrink-0 text-foreground"
										aria-hidden="true"
									/>
									{boundary}
								</li>
							))}
						</ul>
						<InstallationCommand designSystems={installableDesignSystems}>
							Run the command from the Project root. Review the CLI preview and
							approve the file changes only when the selected Design System
							fits.
						</InstallationCommand>
					</div>
				</section>
			</article>
		</main>
	);
}
