import { buttonVariants } from "@agentkogei/ui/components/button";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import {
	type InstallableDesignSystem,
	InstallationCommand,
} from "@/components/installation-command";
import { installationChoices } from "@/lib/catalog";
import {
	claudeCodeGuide,
	guideMetadata,
	guideStructuredData,
} from "@/lib/guides";
import { StructuredData } from "@/lib/structured-data";

const installableDesignSystems: readonly InstallableDesignSystem[] =
	installationChoices();

export const metadata: Metadata = guideMetadata(claudeCodeGuide);

const structuredData = guideStructuredData(claudeCodeGuide);

const instructionBridge = [
	{
		label: "Claude Code entry point",
		artifact: "CLAUDE.md",
		body: "Claude Code loads this Project instruction file when a session begins at the Project root.",
	},
	{
		label: "Shared Project instructions",
		artifact: "AGENTS.md",
		body: "One explicit import brings the shared instructions into the Claude Code session.",
	},
	{
		label: "Root Design Contract",
		artifact: "DESIGN.md",
		body: "The managed AgentKogei reference tells agents to follow the Installed Design System for interface work.",
	},
] as const;

export default function ClaudeCodeGuidePage() {
	return (
		<main>
			<StructuredData identity="guide-claude-code" data={structuredData} />
			<article>
				<header className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
					<div className="mx-auto flex max-w-5xl flex-col gap-8">
						<Link
							href={"/guides" as Route}
							className="w-fit font-mono text-muted-foreground text-xs uppercase tracking-[0.16em] transition-colors hover:text-foreground"
						>
							Guides / Claude Code
						</Link>
						<h1 className="max-w-4xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-8xl">
							Connect Claude Code to your Design Contract.
						</h1>
						<p className="max-w-3xl text-pretty text-muted-foreground text-xl leading-9">
							Claude Code needs one explicit Project instruction to reach the
							same shared direction as other coding agents. The result preserves
							one root Design Contract and one AgentKogei managed reference.
						</p>
					</div>
				</header>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="bridge-heading"
				>
					<div className="mx-auto flex max-w-7xl flex-col gap-10">
						<div className="max-w-3xl">
							<p className="mb-4 font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								One explicit bridge
							</p>
							<h2
								id="bridge-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Three ordinary files. One source of design direction.
							</h2>
						</div>
						<ol className="grid border-t border-l md:grid-cols-3">
							{instructionBridge.map((step, index) => (
								<li
									key={step.artifact}
									className="flex flex-col gap-5 border-r border-b p-6 sm:p-8"
								>
									<div className="flex items-center justify-between gap-4">
										<span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]">
											{step.label}
										</span>
										{index < instructionBridge.length - 1 ? (
											<ArrowRight
												className="hidden size-4 shrink-0 text-muted-foreground md:block"
												aria-hidden="true"
											/>
										) : null}
									</div>
									<p className="font-mono text-lg">{step.artifact}</p>
									<p className="text-muted-foreground leading-7">{step.body}</p>
								</li>
							))}
						</ol>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="instruction-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(20rem,1.15fr)]">
						<div className="flex min-w-0 flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Project setup
							</p>
							<h2
								id="instruction-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Make the handoff explicit.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								At the Project root, create or edit the Claude Code instruction
								file and add this import. Keep any Claude Code specific
								direction below it.
							</p>
							<p className="text-pretty text-lg leading-8">
								AgentKogei Installation does not create or manage CLAUDE.md.
							</p>
							<p className="text-pretty text-muted-foreground leading-7">
								That boundary keeps Claude Code configuration under Builder
								control and leaves the existing Installation convention
								unchanged.
							</p>
						</div>
						<div className="flex flex-col self-start border bg-[#0a0d12] font-mono text-[#e7ecf3]">
							<div className="border-[#1f2733] border-b px-4 py-3 text-[#8b98ab] text-xs uppercase tracking-[0.18em]">
								Project root instruction
							</div>
							<pre className="overflow-x-auto p-5 text-sm leading-7">
								<code>@AGENTS.md</code>
							</pre>
						</div>
					</div>
				</section>

				<section
					className="border-b px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
					aria-labelledby="verify-heading"
				>
					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
						<div className="flex min-w-0 flex-col gap-5">
							<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.2em]">
								Inspect before use
							</p>
							<h2
								id="verify-heading"
								className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
							>
								Verify every link in the chain.
							</h2>
							<p className="text-pretty text-lg text-muted-foreground leading-8">
								Inspect the three root files. Confirm that the import is
								present, that the marked AgentKogei block points to the root
								Design Contract, and that the complete Installed Design System
								is readable.
							</p>
							<section
								aria-label="Project file inspection"
								className="flex min-w-0 flex-col border bg-[#0a0d12] font-mono text-[#e7ecf3]"
							>
								<div className="border-[#1f2733] border-b px-4 py-3 text-[#8b98ab] text-xs uppercase tracking-[0.18em]">
									Inspect the bridge from the Project root
								</div>
								<pre className="whitespace-pre-wrap p-5 text-sm leading-7 [overflow-wrap:anywhere]">
									<code>{`sed -n '1,120p' CLAUDE.md
sed -n '/agentkogei:design-system:start/,/agentkogei:design-system:end/p' AGENTS.md
sed -n '1,160p' DESIGN.md`}</code>
								</pre>
							</section>
							<Link
								href={"/guides/design-md" as Route}
								className={buttonVariants({ variant: "outline", size: "lg" })}
							>
								Understand the Design Contract
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
						<div className="border bg-muted/30 p-6 sm:p-8">
							<h3 className="font-medium text-xl tracking-tight">
								Claude Code verification
							</h3>
							<ul className="mt-6 flex flex-col gap-4">
								{[
									"Start Claude Code from the Project root",
									"Run /context and confirm the Project instruction appears under Memory files",
									"Ask Claude Code to summarize the AgentKogei instruction and identify the root Design Contract",
									"Compare the summary with the files you inspected",
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
							<a
								href="https://code.claude.com/docs/en/memory#agents-md"
								className="mt-8 inline-flex items-center gap-2 font-medium underline underline-offset-4"
							>
								Read the official Claude Code instruction documentation
								<ArrowUpRight className="size-4" aria-hidden="true" />
							</a>
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
									Choose direction before applying it.
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
							Inspect a Design System Preview and its complete Design Contract
							first. When the direction and compatibility fit the Project, run
							the selected command from the Project root. Installation previews
							the file changes and asks for approval before writing.
						</p>
						<InstallationCommand
							designSystems={installableDesignSystems}
							guide="claude-code"
						>
							Installation writes the single root Design Contract and maintains
							the marked reference in shared Project instructions. It does not
							change Claude Code configuration or existing interface code.
						</InstallationCommand>
					</div>
				</section>
			</article>
		</main>
	);
}
