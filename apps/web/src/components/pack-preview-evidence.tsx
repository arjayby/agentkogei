import type { DesignPack } from "@/lib/catalog";

const surfaces = ["Marketing", "Authentication", "Product UI"] as const;

function FoundationSurface({
	index,
	surface,
}: {
	index: number;
	surface: string;
}) {
	return (
		<div className="flex min-h-64 flex-col justify-between bg-background p-5">
			<div className="flex items-center justify-between font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.16em]">
				<span>{surface}</span>
				<span>0{index + 1}</span>
			</div>
			<div className="flex flex-col gap-3">
				<div className="h-12 w-2/3 bg-foreground" />
				<div className="h-2 w-full bg-muted" />
				<div className="h-2 w-4/5 bg-muted" />
				<div className="mt-4 grid grid-cols-3 gap-2">
					<div className="h-16 bg-muted" />
					<div className="h-16 bg-muted" />
					<div className="h-16 bg-muted" />
				</div>
			</div>
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
