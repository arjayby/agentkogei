"use client";

import { Button } from "@agentkogei/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@agentkogei/ui/components/select";
import { cn } from "@agentkogei/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Every package runner AgentKogei supports, in the order a Builder meets them.
 * npm leads because it is the mainstream default and its command is the
 * shortest path from a Pack Preview to an Installation; the rest are listed so
 * nobody has to translate npm syntax into their own runner.
 */
const packageManagers = [
	{ id: "npm", staticLabel: "npm (primary)", menuLabel: "npm", runner: "npx" },
	{ id: "pnpm", staticLabel: "pnpm", menuLabel: "pnpm", runner: "pnpm dlx" },
	{ id: "yarn", staticLabel: "Yarn", menuLabel: "yarn", runner: "yarn dlx" },
	{ id: "bun", staticLabel: "Bun", menuLabel: "bun", runner: "bunx" },
] as const;

type PackageManagerId = (typeof packageManagers)[number]["id"];

/** The catalog facts the interactive mode needs to offer a Design Pack. */
export type InstallablePack = {
	slug: string;
	name: string;
	access: "Open" | "Premium";
};

/**
 * The one-command Installation flow. `agentkogei@latest` selects the newest
 * CLI; the Design Pack identity selects the Pack Release, so the two versions
 * stay independent.
 */
function installationCommand(runner: string, identity: string) {
	return `${runner} agentkogei@latest add ${identity}`;
}

/* The terminal chrome keeps one dark palette in both themes, like a real
 * terminal window, so the command reads identically everywhere. */
const terminalFrame =
	"flex flex-col border bg-[#0a0d12] font-mono text-[#e7ecf3]";
const terminalBar =
	"flex min-h-10 items-center justify-between gap-3 border-[#1f2733] border-b px-4";
const terminalMuted = "text-[#8b98ab]";

type InstallationCommandProps = { children?: ReactNode } & (
	| { identity: string; packs?: undefined }
	| { identity?: undefined; packs: readonly InstallablePack[] }
);

/**
 * The Installation flow shown identically wherever a Builder is asked to run
 * it, presented as a terminal. Static mode lists every runner for one fixed
 * Design Pack identity; interactive mode (when `packs` is given) embeds the
 * package runner and the Design Pack as selectable tokens inside the command
 * line itself.
 */
export function InstallationCommand(props: InstallationCommandProps) {
	return (
		<section
			aria-label="Installation command"
			className={cn(terminalFrame, props.packs && "w-fit max-w-full")}
		>
			{props.packs ? (
				<InteractiveCommand packs={props.packs} />
			) : (
				<>
					<div className={terminalBar}>
						<p
							className={cn(
								"text-xs uppercase tracking-[0.18em]",
								terminalMuted,
							)}
						>
							One command / from the Project root
						</p>
					</div>
					<dl className="flex flex-col gap-3 px-4 py-4 sm:px-5">
						{packageManagers.map(({ staticLabel, runner }) => (
							<div
								key={staticLabel}
								className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
							>
								<dt
									className={cn(
										"text-xs uppercase tracking-[0.14em]",
										terminalMuted,
									)}
								>
									{staticLabel}
								</dt>
								<dd className="text-sm [overflow-wrap:anywhere] before:select-none before:text-[#8b98ab] before:content-['$_']">
									{installationCommand(runner, props.identity)}
								</dd>
							</div>
						))}
					</dl>
				</>
			)}
			{props.children ? (
				<p
					className={cn(
						"max-w-3xl border-[#1f2733] border-t px-4 py-3 text-xs leading-6 sm:px-5",
						terminalMuted,
					)}
				>
					{props.children}
				</p>
			) : null}
		</section>
	);
}

/* Select tokens restyled to sit inside the terminal's dark surface. */
const tokenTrigger =
	"h-8 gap-1 border-[#3d4b61] bg-transparent px-2 font-mono text-[#e7ecf3] text-sm hover:bg-white/5 focus-visible:border-[#55d6ff] focus-visible:ring-[#55d6ff]/40 dark:bg-transparent dark:hover:bg-white/5 [&_svg]:text-[#8b98ab]";

function InteractiveCommand({ packs }: { packs: readonly InstallablePack[] }) {
	const [managerId, setManagerId] = useState<PackageManagerId>("npm");
	const [packSlug, setPackSlug] = useState(packs[0]?.slug ?? "");
	const [copied, setCopied] = useState(false);
	const resetCopied = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (resetCopied.current) {
				clearTimeout(resetCopied.current);
			}
		};
	}, []);

	const manager =
		packageManagers.find(({ id }) => id === managerId) ?? packageManagers[0];
	const command = installationCommand(manager.runner, packSlug);

	async function copyCommand() {
		await navigator.clipboard.writeText(command);
		setCopied(true);
		if (resetCopied.current) {
			clearTimeout(resetCopied.current);
		}
		resetCopied.current = setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex items-center gap-2 px-4 py-3 text-sm">
			<div className="flex min-w-0 flex-1 items-center gap-x-2 overflow-x-auto">
				<span
					aria-hidden="true"
					className={cn("shrink-0 select-none", terminalMuted)}
				>
					$
				</span>
				<Select
					items={packageManagers.map(({ id, runner }) => ({
						value: id,
						label: runner,
					}))}
					value={managerId}
					onValueChange={(value) => setManagerId(value as PackageManagerId)}
				>
					<SelectTrigger
						aria-label="Package manager"
						className={cn(tokenTrigger, "shrink-0")}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{packageManagers.map(({ id, menuLabel, runner }) => (
							<SelectItem key={id} value={id}>
								<span className="flex w-full items-baseline justify-between gap-4 font-mono">
									{runner}
									<span className="text-muted-foreground text-xs">
										{menuLabel}
									</span>
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className="shrink-0 whitespace-nowrap">
					agentkogei@latest add
				</span>
				<Select
					items={packs.map(({ slug }) => ({ value: slug, label: slug }))}
					value={packSlug}
					onValueChange={(value) => setPackSlug(value as string)}
				>
					<SelectTrigger
						aria-label="Design Pack"
						className={cn(tokenTrigger, "shrink-0")}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{packs.map(({ slug, access }) => (
							<SelectItem key={slug} value={slug}>
								<span className="flex w-full items-baseline justify-between gap-4 font-mono">
									{slug}
									<span className="text-muted-foreground text-xs">
										{access}
									</span>
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<output aria-label="Generated command" className="sr-only">
					{command}
				</output>
			</div>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={copyCommand}
				aria-label={copied ? "Copied" : "Copy command"}
				className={cn(
					"shrink-0 hover:bg-white/5 hover:text-[#e7ecf3]",
					terminalMuted,
				)}
			>
				{copied ? (
					<CheckIcon aria-hidden="true" />
				) : (
					<CopyIcon aria-hidden="true" />
				)}
			</Button>
		</div>
	);
}
