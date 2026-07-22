import type { ReactNode } from "react";

/**
 * Every package runner AgentKogei supports, in the order a Builder meets them.
 * `npx` leads because npm is the mainstream default and its command is the
 * shortest path from a Pack Preview to an Installation; the rest are listed so
 * nobody has to translate npm syntax into their own runner.
 */
const packageRunners = [
	{ label: "npm (primary)", runner: "npx" },
	{ label: "pnpm", runner: "pnpm dlx" },
	{ label: "Yarn", runner: "yarn dlx" },
	{ label: "Bun", runner: "bunx" },
] as const;

/**
 * The one-command Installation flow, shown identically wherever a Builder is
 * asked to run it. `agentkogei@latest` selects the newest CLI; the Design Pack
 * identity selects the Pack Release, so the two versions stay independent.
 */
export function InstallationCommand({
	identity,
	children,
}: {
	identity: string;
	children?: ReactNode;
}) {
	return (
		<section
			aria-label="Installation command"
			className="flex flex-col gap-5 border p-5 sm:p-6"
		>
			<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.18em]">
				One command / from the Project root
			</p>
			<dl className="flex flex-col gap-3">
				{packageRunners.map(({ label, runner }) => (
					<div
						key={label}
						className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-4"
					>
						<dt className="font-mono text-muted-foreground text-xs uppercase tracking-[0.14em]">
							{label}
						</dt>
						<dd className="font-mono text-sm [overflow-wrap:anywhere]">
							{`${runner} agentkogei@latest add ${identity}`}
						</dd>
					</div>
				))}
			</dl>
			{children ? (
				<p className="max-w-3xl text-muted-foreground text-sm leading-6">
					{children}
				</p>
			) : null}
		</section>
	);
}
