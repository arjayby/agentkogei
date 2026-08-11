"use client";

import { Button } from "@agentkogei/ui/components/button";
import { cn } from "@agentkogei/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import {
	type FocusEvent,
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

/**
 * Every package runner AgentKogei supports, in the order a Builder meets them.
 * npm leads because it is the mainstream default and its command is the
 * shortest path from a Design System Preview to an Installation; the rest are listed so
 * nobody has to translate npm syntax into their own runner.
 */
const packageManagers = [
	{ id: "npm", staticLabel: "npm (primary)", menuLabel: "npm", runner: "npx" },
	{ id: "pnpm", staticLabel: "pnpm", menuLabel: "pnpm", runner: "pnpm dlx" },
	{ id: "yarn", staticLabel: "Yarn", menuLabel: "yarn", runner: "yarn dlx" },
	{ id: "bun", staticLabel: "Bun", menuLabel: "bun", runner: "bunx" },
] as const;

type PackageManagerId = (typeof packageManagers)[number]["id"];

/** The catalog facts the interactive mode needs to offer a Design System. */
export type InstallableDesignSystem = {
	slug: string;
	name: string;
};

/**
 * The one-command Installation flow. `agentkogei@latest` selects the newest
 * CLI; the Design System identity selects the Design System Release, so the two versions
 * stay independent.
 */
function installationCommand(runner: string, identity: string) {
	return `${runner} agentkogei@latest add ${identity}`;
}

/* Fixed Design System previews keep the established dark terminal treatment.
 * The interactive hero command uses the page palette instead. */
const terminalFrame =
	"flex flex-col border bg-[#0a0d12] font-mono text-[#e7ecf3]";
const interactiveFrame =
	"flex w-full flex-col border bg-background font-mono text-foreground";
const terminalBar =
	"flex min-h-10 items-center justify-between gap-3 border-[#1f2733] border-b px-4";
const terminalMuted = "text-[#8b98ab]";

type InstallationCommandProps = { children?: ReactNode } & (
	| { identity: string; designSystems?: undefined }
	| { identity?: undefined; designSystems: readonly InstallableDesignSystem[] }
);

/**
 * Static mode lists every runner for one fixed Design System identity.
 * Interactive mode uses package manager tabs and rotates through the catalog's
 * Design System identities until the Builder copies a command.
 */
export function InstallationCommand(props: InstallationCommandProps) {
	return (
		<section
			aria-label="Installation command"
			className={props.designSystems ? interactiveFrame : terminalFrame}
		>
			{props.designSystems ? (
				<InteractiveCommand designSystems={props.designSystems} />
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
						"max-w-3xl border-t px-4 py-3 text-xs leading-6 sm:px-5",
						props.designSystems
							? "border-border text-muted-foreground"
							: cn("border-[#1f2733]", terminalMuted),
					)}
				>
					{props.children}
				</p>
			) : null}
		</section>
	);
}

function InteractiveCommand({
	designSystems,
}: {
	designSystems: readonly InstallableDesignSystem[];
}) {
	const [managerId, setManagerId] = useState<PackageManagerId>("npm");
	const [designSystemIndex, setDesignSystemIndex] = useState(0);
	const [previousDesignSystemIndex, setPreviousDesignSystemIndex] = useState<
		number | null
	>(null);
	const [animationKey, setAnimationKey] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [hasFocusWithin, setHasFocusWithin] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isPinned, setIsPinned] = useState(false);
	const resetCopied = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const isRotationPaused = isHovered || hasFocusWithin || isPinned;
	const designSystemSlug = designSystems[designSystemIndex]?.slug ?? "";
	const previousDesignSystemSlug =
		previousDesignSystemIndex === null
			? null
			: (designSystems[previousDesignSystemIndex]?.slug ?? null);
	const longestDesignSystemSlug = designSystems.reduce(
		(longest, { slug }) => (slug.length > longest.length ? slug : longest),
		"",
	);

	useEffect(() => {
		return () => {
			if (resetCopied.current) {
				clearTimeout(resetCopied.current);
			}
		};
	}, []);

	useEffect(() => {
		if (isRotationPaused || designSystems.length < 2) {
			return;
		}

		const rotate = setTimeout(() => {
			setPreviousDesignSystemIndex(designSystemIndex);
			setDesignSystemIndex((designSystemIndex + 1) % designSystems.length);
			setAnimationKey((key) => key + 1);
		}, 2000);

		return () => clearTimeout(rotate);
	}, [designSystemIndex, designSystems.length, isRotationPaused]);

	const manager =
		packageManagers.find(({ id }) => id === managerId) ?? packageManagers[0];
	const command = installationCommand(manager.runner, designSystemSlug);

	async function copyCommand() {
		await navigator.clipboard.writeText(command);
		setCopied(true);
		setIsPinned(true);
		if (resetCopied.current) {
			clearTimeout(resetCopied.current);
		}
		resetCopied.current = setTimeout(() => setCopied(false), 2000);
	}

	function handleBlur(event: FocusEvent<HTMLFieldSetElement>) {
		if (!event.currentTarget.contains(event.relatedTarget)) {
			setHasFocusWithin(false);
		}
	}

	function handleTabKeyDown(
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) {
		let nextIndex: number | null = null;
		if (event.key === "ArrowRight") {
			nextIndex = (index + 1) % packageManagers.length;
		} else if (event.key === "ArrowLeft") {
			nextIndex = (index - 1 + packageManagers.length) % packageManagers.length;
		} else if (event.key === "Home") {
			nextIndex = 0;
		} else if (event.key === "End") {
			nextIndex = packageManagers.length - 1;
		}

		if (nextIndex === null) {
			return;
		}

		event.preventDefault();
		setManagerId(packageManagers[nextIndex].id);
		tabRefs.current[nextIndex]?.focus();
	}

	return (
		<fieldset
			className="min-w-0 border-0 p-0"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onFocusCapture={() => setHasFocusWithin(true)}
			onBlurCapture={handleBlur}
		>
			<legend className="sr-only">Installation command controls</legend>
			<div
				role="tablist"
				aria-label="Package manager"
				className="flex items-stretch gap-1 border-b px-3 sm:px-4"
			>
				{packageManagers.map(({ id, menuLabel }, index) => {
					const isActive = managerId === id;
					return (
						<button
							key={id}
							ref={(element) => {
								tabRefs.current[index] = element;
							}}
							type="button"
							role="tab"
							id={`package-manager-tab-${id}`}
							aria-selected={isActive}
							aria-controls="hero-installation-command"
							tabIndex={isActive ? 0 : -1}
							onClick={() => setManagerId(id)}
							onKeyDown={(event) => handleTabKeyDown(event, index)}
							className={cn(
								"border-transparent border-b-2 px-3 py-3 text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4",
								isActive && "border-foreground font-medium text-foreground",
							)}
						>
							{menuLabel}
						</button>
					);
				})}
			</div>
			<div
				id="hero-installation-command"
				role="tabpanel"
				aria-labelledby={`package-manager-tab-${managerId}`}
				className="flex min-w-0 items-center gap-3 px-4 py-4 text-sm sm:px-5"
			>
				<div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
					<span>{manager.runner} agentkogei@latest add</span>
					<span className="relative inline-grid h-[1.5em] shrink-0 overflow-hidden align-bottom">
						<span
							aria-hidden="true"
							className="invisible col-start-1 row-start-1"
						>
							{longestDesignSystemSlug}
						</span>
						{previousDesignSystemSlug ? (
							<span
								key={`${animationKey}-exit`}
								aria-hidden="true"
								className="installation-command-name-exit absolute inset-x-0 top-0"
							>
								{previousDesignSystemSlug}
							</span>
						) : null}
						<span
							key={`${animationKey}-enter`}
							aria-hidden="true"
							className={cn(
								"absolute inset-x-0 top-0",
								previousDesignSystemSlug && "installation-command-name-enter",
							)}
						>
							{designSystemSlug}
						</span>
					</span>
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
					className="shrink-0 text-muted-foreground hover:text-foreground"
				>
					{copied ? (
						<CheckIcon aria-hidden="true" />
					) : (
						<CopyIcon aria-hidden="true" />
					)}
				</Button>
			</div>
		</fieldset>
	);
}
