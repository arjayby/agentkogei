import type { DesignPack } from "@/lib/catalog";

export function PackArtwork({ pack }: { pack: DesignPack }) {
	if (pack.slug === "foundation") {
		return (
			<div
				className="grid h-64 grid-cols-4 grid-rows-4 gap-px bg-border p-px"
				aria-hidden="true"
			>
				<div className="col-span-3 row-span-2 bg-background p-5 text-5xl tracking-tighter">
					Aa
				</div>
				<div className="row-span-4 bg-muted" />
				<div className="col-span-2 row-span-2 bg-muted" />
				<div className="row-span-2 bg-foreground" />
			</div>
		);
	}

	if (pack.slug === "editorial") {
		return (
			<div
				className="flex h-64 flex-col justify-between bg-muted p-7 font-serif text-foreground"
				aria-hidden="true"
			>
				<p className="text-xs uppercase tracking-[0.32em]">Volume 01</p>
				<p className="max-w-64 text-5xl italic leading-[0.9] tracking-tight">
					Ideas need room.
				</p>
				<div className="h-px bg-foreground/30" />
			</div>
		);
	}

	if (pack.slug === "command") {
		return (
			<div
				className="flex h-64 flex-col justify-between bg-foreground p-6 font-mono text-background"
				aria-hidden="true"
			>
				<div className="flex justify-between text-[0.65rem] uppercase tracking-[0.2em] opacity-60">
					<span>node / 04</span>
					<span>online</span>
				</div>
				<div className="grid grid-cols-[auto_1fr] gap-3 text-xs">
					<span className="opacity-50">01</span>
					<span>deploy --production</span>
					<span className="opacity-50">02</span>
					<span>checks 24/24</span>
					<span className="opacity-50">03</span>
					<span>ready in 18.4s</span>
				</div>
				<div className="h-1 w-24 bg-background" />
			</div>
		);
	}

	return (
		<div
			className="relative h-64 overflow-hidden bg-primary text-primary-foreground"
			aria-hidden="true"
		>
			<div className="absolute -top-12 -right-12 size-48 rounded-full border-[2rem] border-primary-foreground" />
			<div className="absolute bottom-7 left-7 max-w-48 font-semibold text-5xl leading-[0.82] tracking-[-0.08em]">
				Make it felt.
			</div>
			<div className="absolute right-8 bottom-8 size-10 rotate-45 bg-primary-foreground" />
		</div>
	);
}
