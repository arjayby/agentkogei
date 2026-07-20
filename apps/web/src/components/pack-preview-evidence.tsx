import type { DesignPack } from "@/lib/catalog";

const surfaces = [
	"Marketing",
	"Authentication",
	"Onboarding",
	"Dashboard",
	"Table",
	"Form",
	"Settings",
	"States",
] as const;
type PackSurface = (typeof surfaces)[number];

function FoundationSurface({
	surface,
}: {
	index: number;
	surface: PackSurface;
}) {
	const referenceScreen = (() => {
		switch (surface) {
			case "Marketing":
				return (
					<div className="flex flex-col gap-3">
						<p className="font-medium text-2xl leading-tight">
							A clear product outcome.
						</p>
						<p className="text-muted-foreground text-xs">
							Concise proof and one primary action.
						</p>
						<div className="h-8 w-28 bg-primary" />
					</div>
				);
			case "Authentication":
				return (
					<div className="flex flex-col gap-2">
						<div className="h-7 border bg-card" />
						<div className="h-7 border bg-card" />
						<div className="h-8 bg-primary" />
					</div>
				);
			case "Onboarding":
				return (
					<div className="flex flex-col gap-3">
						<p className="text-muted-foreground text-xs">Step 2 of 4</p>
						<div className="grid grid-cols-4 gap-1">
							<div className="h-1 bg-primary" />
							<div className="h-1 bg-primary" />
							<div className="h-1 bg-muted" />
							<div className="h-1 bg-muted" />
						</div>
						<p className="font-medium">Connect the supplied Project</p>
					</div>
				);
			case "Dashboard":
				return (
					<div className="grid grid-cols-2 gap-2">
						{["24 active", "98% healthy", "3 reviews", "7 releases"].map(
							(metric) => (
								<div key={metric} className="border bg-card p-2 text-xs">
									{metric}
								</div>
							),
						)}
					</div>
				);
			case "Table":
				return (
					<div className="flex flex-col gap-px bg-border text-xs">
						{[
							"Release · Status · Date",
							"1.0.0 · Published · Jul 18",
							"0.9.0 · Archived · Jun 10",
						].map((row) => (
							<div key={row} className="bg-card p-2">
								{row}
							</div>
						))}
					</div>
				);
			case "Form":
				return (
					<div className="flex flex-col gap-2">
						<p className="text-xs">Visible field label</p>
						<div className="h-8 border bg-card" />
						<p className="text-muted-foreground text-xs">
							Persistent help and error area
						</p>
					</div>
				);
			case "Settings":
				return (
					<div className="flex flex-col gap-2 text-xs">
						<div className="flex justify-between border-b pb-2">
							<span>Notifications</span>
							<span>On</span>
						</div>
						<div className="flex justify-between border-b pb-2">
							<span>Appearance</span>
							<span>System</span>
						</div>
						<div className="flex justify-between">
							<span>Delete Project</span>
							<span>Review</span>
						</div>
					</div>
				);
			case "States":
				return (
					<div className="grid grid-cols-2 gap-2 text-xs">
						{["Loading", "Empty", "Error", "Success"].map((state) => (
							<div key={state} className="border bg-card p-2">
								{state}
							</div>
						))}
					</div>
				);
		}
	})();

	return (
		<div className="flex min-h-64 flex-col justify-between bg-background p-5">
			<div className="flex items-center justify-between font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.16em]">
				<span>{surface}</span>
				<span>Foundation</span>
			</div>
			{referenceScreen}
		</div>
	);
}

function EditorialSurface({
	index,
	surface,
}: {
	index: number;
	surface: PackSurface;
}) {
	const referenceScreen = (() => {
		switch (surface) {
			case "Marketing":
				return (
					<div className="grid grid-cols-[1fr_auto] items-end gap-4">
						<p className="max-w-56 text-3xl italic leading-tight">
							Space for the story to lead.
						</p>
						<span className="border-[var(--editorial-border)] border-b pb-1 font-[family-name:var(--editorial-font-interface)] text-xs">
							Read more
						</span>
					</div>
				);
			case "Authentication":
				return (
					<div className="max-w-56 space-y-3 font-[family-name:var(--editorial-font-interface)] text-xs">
						<p className="font-serif text-2xl italic">Welcome back.</p>
						<div className="h-8 border border-[var(--editorial-border)] bg-[var(--editorial-background)]" />
						<div className="h-8 bg-[var(--editorial-primary)]" />
					</div>
				);
			case "Onboarding":
				return (
					<div className="space-y-3">
						<p className="text-2xl italic">Chapter {index + 1}</p>
						<div className="grid grid-cols-4 gap-2">
							{[0, 1, 2, 3].map((step) => (
								<div
									key={step}
									className={`h-px ${step <= 2 ? "bg-[var(--editorial-foreground)]" : "bg-[var(--editorial-border)]"}`}
								/>
							))}
						</div>
					</div>
				);
			case "Dashboard":
				return (
					<div className="grid grid-cols-[1.4fr_0.6fr] gap-5">
						<p className="text-2xl italic">Recent work, with context.</p>
						<div className="space-y-2 font-[family-name:var(--editorial-font-interface)] text-[0.65rem]">
							<p>12 active</p>
							<p>3 reviews</p>
						</div>
					</div>
				);
			case "Table":
				return (
					<div className="space-y-px font-[family-name:var(--editorial-font-interface)] text-xs">
						{[
							"Title · Author",
							"Field notes · A. Lee",
							"Systems · M. Chen",
						].map((row) => (
							<div
								key={row}
								className="border-[var(--editorial-border)] border-t py-2"
							>
								{row}
							</div>
						))}
					</div>
				);
			case "Form":
				return (
					<div className="max-w-60 space-y-2 font-[family-name:var(--editorial-font-interface)] text-xs">
						<p>Visible field label</p>
						<div className="h-9 border border-[var(--editorial-border)] bg-[var(--editorial-background)]" />
						<p className="text-[var(--editorial-muted-foreground)]">
							Guidance remains beside the field.
						</p>
					</div>
				);
			case "Settings":
				return (
					<div className="space-y-2 font-[family-name:var(--editorial-font-interface)] text-xs">
						{[
							"Reading preferences · System",
							"Notifications · On",
							"Access · Review",
						].map((row) => (
							<p
								key={row}
								className="border-[var(--editorial-border)] border-t pt-2"
							>
								{row}
							</p>
						))}
					</div>
				);
			case "States":
				return (
					<div className="grid grid-cols-2 gap-x-5 gap-y-2 font-[family-name:var(--editorial-font-interface)] text-xs">
						{["Loading", "Empty", "Error", "Success"].map((state) => (
							<p
								key={state}
								className="border-[var(--editorial-border)] border-t pt-2"
							>
								{state}
							</p>
						))}
					</div>
				);
		}
	})();

	return (
		<div className="flex min-h-64 flex-col justify-between bg-[var(--editorial-muted)] p-7 font-[family-name:var(--editorial-font-display)] text-[var(--editorial-foreground)]">
			<div className="flex items-start justify-between text-xs uppercase tracking-[0.22em]">
				<span>{surface}</span>
				<span className="text-4xl italic">{index + 1}</span>
			</div>
			<div className="flex flex-col gap-5">
				<div className="h-px bg-[var(--editorial-border)]" />
				{referenceScreen}
			</div>
		</div>
	);
}

function CommandSurface({
	index,
	surface,
}: {
	index: number;
	surface: PackSurface;
}) {
	const referenceScreen = (() => {
		switch (surface) {
			case "Marketing":
				return (
					<div className="grid gap-3">
						<p className="max-w-64 font-medium font-sans text-2xl leading-none tracking-[-0.04em]">
							Ship with operational confidence.
						</p>
						<div className="grid grid-cols-3 gap-px border border-[#aebdce] bg-[#aebdce] dark:border-[#283344] dark:bg-[#283344]">
							{["24 checks", "0 blocked", "18.4s"].map((metric) => (
								<span
									key={metric}
									className="bg-[#fff] p-2 text-[0.65rem] dark:bg-[#0d1118]"
								>
									{metric}
								</span>
							))}
						</div>
					</div>
				);
			case "Authentication":
				return (
					<div className="grid max-w-64 gap-2">
						<div className="grid gap-1 text-[0.65rem]">
							<span>WORK EMAIL</span>
							<span className="h-8 border border-[#aebdce] bg-white dark:border-[#283344] dark:bg-[#121823]" />
						</div>
						<div className="h-8 bg-[#006f95] p-2 text-center text-white dark:bg-[#55d6ff] dark:text-[#051015]">
							Continue securely
						</div>
					</div>
				);
			case "Onboarding":
				return (
					<div className="grid gap-3">
						<div className="flex justify-between text-[0.65rem]">
							<span>02 / CONNECT</span>
							<span>2 OF 4</span>
						</div>
						<div className="grid grid-cols-4 gap-1">
							{[0, 1, 2, 3].map((step) => (
								<span
									key={step}
									className={`h-1 ${step < 2 ? "bg-[#006f95] dark:bg-[#55d6ff]" : "bg-[#dce5ef] dark:bg-[#283344]"}`}
								/>
							))}
						</div>
						<p className="font-medium font-sans">
							Verify the runtime connection
						</p>
						<p className="text-[#526174] text-[0.65rem] dark:text-[#98a4b5]">
							Pending · credentials remain in this Project
						</p>
					</div>
				);
			case "Dashboard":
				return (
					<div className="grid gap-px border border-[#aebdce] bg-[#aebdce] dark:border-[#283344] dark:bg-[#283344]">
						<div className="grid grid-cols-[1fr_auto] bg-white p-2 dark:bg-[#0d1118]">
							<span>SYSTEM HEALTH</span>
							<span className="text-[#087a45] dark:text-[#6ee7a8]">
								● OPERATIONAL
							</span>
						</div>
						{[
							"API gateway · 18s ago",
							"Worker fleet · 24s ago",
							"Database · 31s ago",
						].map((row) => (
							<div key={row} className="bg-white p-2 dark:bg-[#121823]">
								{row}
							</div>
						))}
					</div>
				);
			case "Table":
				return (
					<div className="overflow-hidden border border-[#aebdce] dark:border-[#283344]">
						{[
							"RELEASE     STATUS        AGE",
							"v1.8.4      OPERATIONAL   18s",
							"v1.8.3      SUPERSEDED    2d",
						].map((row, rowIndex) => (
							<div
								key={row}
								className={`p-2 ${rowIndex === 0 ? "bg-[#e9eef5] text-[#526174] dark:bg-[#192231] dark:text-[#98a4b5]" : "border-[#aebdce] border-t bg-white dark:border-[#283344] dark:bg-[#0d1118]"}`}
							>
								{row}
							</div>
						))}
					</div>
				);
			case "Form":
				return (
					<div className="grid gap-2">
						<p>RUNTIME / PRODUCTION</p>
						<div className="grid grid-cols-[1fr_auto] border border-[#aebdce] bg-white dark:border-[#283344] dark:bg-[#121823]">
							<span className="p-2 text-[#526174] dark:text-[#98a4b5]">
								region
							</span>
							<span className="border-[#aebdce] border-l p-2 dark:border-[#283344]">
								ap-southeast-1
							</span>
						</div>
						<p className="text-[#087a45] text-[0.65rem] dark:text-[#6ee7a8]">
							✓ Configuration verified
						</p>
					</div>
				);
			case "Settings":
				return (
					<div className="grid gap-px bg-[#aebdce] dark:bg-[#283344]">
						{[
							["Runtime", "Production"],
							["Notifications", "3 routes"],
							["Access", "12 members"],
							["Danger zone", "Review"],
						].map(([label, value]) => (
							<div
								key={label}
								className="flex justify-between bg-white p-2 dark:bg-[#0d1118]"
							>
								<span>{label}</span>
								<span className="text-[#526174] dark:text-[#98a4b5]">
									{value}
								</span>
							</div>
						))}
					</div>
				);
			case "States":
				return (
					<div className="grid grid-cols-2 gap-2">
						{[
							["◌", "Loading"],
							["□", "Empty"],
							["!", "Failed"],
							["✓", "Verified"],
						].map(([icon, label]) => (
							<div
								key={label}
								className="border border-[#aebdce] bg-white p-2 dark:border-[#283344] dark:bg-[#121823]"
							>
								<span className="mr-2 text-[#006f95] dark:text-[#55d6ff]">
									{icon}
								</span>
								{label}
							</div>
						))}
					</div>
				);
		}
	})();

	return (
		<div className="flex min-h-64 flex-col justify-between bg-[#f3f6fa] p-5 font-mono text-[#111827] dark:bg-[#080b10] dark:text-[#e8edf5]">
			<div className="flex justify-between text-[#526174] text-[0.65rem] uppercase tracking-[0.18em] dark:text-[#98a4b5]">
				<span>{surface}</span>
				<span>node.0{index + 1}</span>
			</div>
			<div className="py-5 text-xs">{referenceScreen}</div>
			<div className="flex items-center gap-2 text-[#526174] text-[0.6rem] dark:text-[#98a4b5]">
				<span className="size-1.5 bg-[#087a45] dark:bg-[#6ee7a8]" />
				<span>COMMAND / EVALUATION BUILD</span>
			</div>
		</div>
	);
}

function SignalSurface({
	index,
	surface,
}: {
	index: number;
	surface: PackSurface;
}) {
	const referenceScreen = (() => {
		switch (surface) {
			case "Marketing":
				return (
					<div className="grid gap-3">
						<p className="max-w-64 font-black text-3xl leading-[0.88] tracking-[-0.06em]">
							Turn ideas into momentum.
						</p>
						<div className="flex items-center gap-2 font-bold text-[0.65rem] uppercase tracking-[0.12em]">
							<span className="bg-[#17112d] px-3 py-2 text-white dark:bg-[#fff7ef] dark:text-[#17112d]">
								Start creating
							</span>
							<span>See what moves →</span>
						</div>
					</div>
				);
			case "Authentication":
				return (
					<div className="grid max-w-64 gap-2">
						<p className="font-black text-2xl leading-none">Enter the studio</p>
						<div className="h-9 border-2 border-[#17112d] bg-[#fff7ef] dark:border-[#fff7ef] dark:bg-[#17112d]" />
						<div className="bg-[#17112d] p-2 text-center font-bold text-white text-xs dark:bg-[#fff7ef] dark:text-[#17112d]">
							Continue
						</div>
					</div>
				);
			case "Onboarding":
				return (
					<div className="grid gap-3">
						<div className="flex items-center gap-2 font-bold text-[0.65rem] uppercase">
							<span className="grid size-7 place-items-center rounded-full bg-[#17112d] text-white dark:bg-[#fff7ef] dark:text-[#17112d]">
								02
							</span>
							<span>Build your direction</span>
						</div>
						<p className="max-w-64 font-black text-2xl leading-none">
							Shape your first signal
						</p>
						<div className="grid grid-cols-4 gap-1">
							{[0, 1, 2, 3].map((step) => (
								<span
									key={step}
									className={`h-2 ${step < 2 ? "bg-[#17112d] dark:bg-[#fff7ef]" : "border-2 border-[#17112d] dark:border-[#fff7ef]"}`}
								/>
							))}
						</div>
					</div>
				);
			case "Dashboard":
				return (
					<div className="grid grid-cols-[1fr_auto] gap-3">
						<div>
							<p className="font-bold text-[0.65rem] tracking-[0.16em]">
								LIVE MOMENTUM
							</p>
							<p className="font-black text-5xl tracking-[-0.08em]">84%</p>
						</div>
						<div className="flex items-end gap-1" aria-hidden="true">
							{[10, 18, 28, 22, 38].map((height) => (
								<span
									key={height}
									className="w-3 bg-[#17112d] dark:bg-[#fff7ef]"
									style={{ height }}
								/>
							))}
						</div>
					</div>
				);
			case "Table":
				return (
					<div className="grid gap-1 font-bold text-xs">
						{[
							["Aurora launch", "READY"],
							["Color system", "LIVE"],
							["Motion study", "REVIEW"],
						].map(([name, status], row) => (
							<div
								key={name}
								className={`flex items-center justify-between border-2 border-[#17112d] p-2 dark:border-[#fff7ef] ${row === 1 ? "translate-x-2 bg-[#17112d] text-white dark:bg-[#fff7ef] dark:text-[#17112d]" : "bg-[#fff7ef] text-[#17112d] dark:bg-[#17112d] dark:text-[#fff7ef]"}`}
							>
								<span>{name}</span>
								<span>{status}</span>
							</div>
						))}
					</div>
				);
			case "Form":
				return (
					<div className="grid gap-2 font-bold text-xs">
						<p>PROJECT ACCENT</p>
						<div className="grid grid-cols-[2.5rem_1fr] border-2 border-[#17112d] bg-[#fff7ef] dark:border-[#fff7ef] dark:bg-[#17112d]">
							<span className="bg-[#ff4f87]" aria-hidden="true" />
							<span className="p-2">Color system ready</span>
						</div>
						<p className="flex items-center gap-2">
							<span aria-hidden="true">●</span> Contrast verified
						</p>
					</div>
				);
			case "Settings":
				return (
					<div className="grid gap-2 font-bold text-xs">
						<p className="font-black text-2xl">Motion preference</p>
						{[
							["Expressive", "ON"],
							["Reduced motion", "RESPECTED"],
							["Sound", "OFF"],
						].map(([label, value]) => (
							<div
								key={label}
								className="flex justify-between border-[#17112d] border-b-2 pb-2 dark:border-[#fff7ef]"
							>
								<span>{label}</span>
								<span>{value}</span>
							</div>
						))}
					</div>
				);
			case "States":
				return (
					<div className="grid grid-cols-2 gap-2 font-bold text-xs">
						{[
							"Finding a rhythm",
							"Nothing here yet",
							"Needs attention",
							"Ready to launch",
						].map((state, stateIndex) => (
							<div
								key={state}
								className={`${stateIndex === 3 ? "bg-[#17112d] text-white dark:bg-[#fff7ef] dark:text-[#17112d]" : "border-2 border-[#17112d] dark:border-[#fff7ef]"} p-2`}
							>
								{state}
							</div>
						))}
					</div>
				);
		}
	})();

	return (
		<div className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#ffd84d] p-5 text-[#17112d] dark:bg-[#6328e0] dark:text-[#fff7ef]">
			<div
				className="pointer-events-none absolute top-2 right-2 size-16 rounded-full border-[#ff4f87] border-[0.8rem] motion-safe:animate-[spin_9s_linear_infinite]"
				aria-hidden="true"
			/>
			<div className="relative flex items-center justify-between font-black text-[0.65rem] uppercase tracking-[0.18em]">
				<span>{surface}</span>
				<span>S/0{index + 1}</span>
			</div>
			<div className="relative py-5">{referenceScreen}</div>
			<div className="relative flex items-center gap-2 font-bold text-[0.6rem] uppercase tracking-[0.12em]">
				<span className="size-2 rotate-45 bg-[#ff4f87]" aria-hidden="true" />
				<span>Signal / evaluation build</span>
			</div>
		</div>
	);
}

export function PackPreviewEvidence({ pack }: { pack: DesignPack }) {
	return (
		<section
			className="grid gap-px border bg-border md:grid-cols-3"
			aria-label={`${pack.name} rendered Pack Preview`}
		>
			{surfaces.map((surface, index) => {
				if (pack.slug === "editorial") {
					return (
						<EditorialSurface key={surface} index={index} surface={surface} />
					);
				}

				if (pack.slug === "command") {
					return (
						<CommandSurface key={surface} index={index} surface={surface} />
					);
				}

				if (pack.slug === "signal") {
					return (
						<SignalSurface key={surface} index={index} surface={surface} />
					);
				}

				return (
					<FoundationSurface key={surface} index={index} surface={surface} />
				);
			})}
		</section>
	);
}
