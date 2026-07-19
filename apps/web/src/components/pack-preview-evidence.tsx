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
	return (
		<div className="flex min-h-64 flex-col justify-between bg-foreground p-5 font-mono text-background">
			<div className="flex justify-between text-[0.65rem] uppercase tracking-[0.18em] opacity-60">
				<span>{surface}</span>
				<span>node.0{index + 1}</span>
			</div>
			<div className="grid grid-cols-[3rem_1fr] gap-x-3 gap-y-2 text-xs">
				<span className="opacity-50">SYS</span>
				<span>operational</span>
				<span className="opacity-50">LOAD</span>
				<span>{72 + index * 9}%</span>
				<span className="opacity-50">STATE</span>
				<span>verified</span>
			</div>
			<div className="grid grid-cols-8 gap-1">
				{Array.from({ length: 8 }, (_, cell) => (
					<div key={cell} className="h-1 bg-background opacity-70" />
				))}
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
	return (
		<div className="relative min-h-64 overflow-hidden bg-primary p-6 text-primary-foreground">
			<div className="absolute -top-10 -right-10 size-36 rounded-full border-[1.5rem] border-primary-foreground" />
			<p className="font-mono text-xs uppercase tracking-[0.18em]">{surface}</p>
			<p className="absolute bottom-6 left-6 max-w-48 font-semibold text-4xl leading-[0.86] tracking-[-0.07em]">
				Signal 0{index + 1}
			</p>
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
