export default function Home() {
	return (
		<main>
			<section className="border-b px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
				<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
					<div className="flex flex-col gap-8">
						<p className="font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							Design direction for agent-built products
						</p>
						<h1 className="max-w-5xl text-balance font-medium text-5xl tracking-[-0.055em] sm:text-7xl lg:text-[6.5rem] lg:leading-[0.92]">
							One interface system. Every agent. Every screen.
						</h1>
					</div>
					<p className="max-w-xl text-pretty text-lg text-muted-foreground leading-8 lg:text-xl">
						Without durable direction, each coding agent makes its own calls on
						type, color, layout, components, and states—creating design drift
						across the Project. AgentKogei gives them one visual and behavioral
						foundation.
					</p>
				</div>
			</section>

			<section
				className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
				aria-labelledby="design-pack-heading"
			>
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-24">
					<div>
						<p className="mb-5 font-mono text-muted-foreground text-xs uppercase tracking-[0.24em]">
							01 / The object
						</p>
						<h2
							id="design-pack-heading"
							className="text-balance font-medium text-3xl tracking-tight sm:text-5xl"
						>
							A Design Pack is durable direction, not a theme or application
							template.
						</h2>
					</div>
					<div className="grid gap-px border bg-border sm:grid-cols-2">
						<div className="flex min-h-56 flex-col justify-between bg-background p-6">
							<span className="font-mono text-foreground text-xs">
								DESIGN PACK
							</span>
							<p className="text-lg leading-7">
								A versioned Interface System with layout, components, states,
								motion, and accessibility guidance for agents.
							</p>
						</div>
						<div className="flex min-h-56 flex-col justify-between bg-muted p-6">
							<span className="font-mono text-foreground text-xs">
								NOT A TEMPLATE
							</span>
							<p className="text-lg leading-7">
								It does not prescribe your workflows, product copy, business
								logic, or information architecture.
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
