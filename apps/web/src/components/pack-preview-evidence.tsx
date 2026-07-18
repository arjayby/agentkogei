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

function FoundationSurface({ surface }: { index: number; surface: string }) {
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
			default:
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
	surface: string;
}) {
	return (
		<div className="flex min-h-64 flex-col justify-between bg-muted p-7 font-serif">
			<div className="flex items-start justify-between text-xs uppercase tracking-[0.22em]">
				<span>{surface}</span>
				<span className="text-4xl italic">{index + 1}</span>
			</div>
			<div className="flex flex-col gap-5">
				<div className="h-px bg-foreground/30" />
				<p className="max-w-56 text-3xl italic leading-tight">
					Space for the story to lead.
				</p>
			</div>
		</div>
	);
}

function CommandSurface({
	index,
	surface,
}: {
	index: number;
	surface: string;
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

function SignalSurface({ index, surface }: { index: number; surface: string }) {
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
