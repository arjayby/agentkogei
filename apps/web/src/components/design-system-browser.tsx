"use client";

import { buttonVariants } from "@agentkogei/ui/components/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@agentkogei/ui/components/tabs";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DesignSystemMark } from "@/components/design-system-mark";
import {
	DesignSystemPreviewTheme,
	DesignSystemPreviewThemeStyles,
} from "@/components/design-system-preview-theme";
import type { DesignSystemDiscovery } from "@/lib/catalog";

const desktopBrowserQuery = "(min-width: 768px)";

const paletteTokens = [
	["background", "Background"],
	["card", "Surface"],
	["muted", "Muted"],
	["primary", "Primary"],
	["foreground", "Foreground"],
] as const;

function selectedSlugFromHash(designSystems: readonly DesignSystemDiscovery[]) {
	const slug = window.location.hash.slice(1);
	return designSystems.some((designSystem) => designSystem.slug === slug)
		? slug
		: null;
}

function DesignSystemIdentityPanel({
	designSystem,
}: {
	designSystem: DesignSystemDiscovery;
}) {
	const { mark, typography } = designSystem.previewShell;
	const { intendedFit, route, signature, summary } = designSystem.preview;

	return (
		<DesignSystemPreviewTheme designSystem={designSystem} includeStyles={false}>
			<div className="flex min-h-full flex-col bg-background text-foreground">
				<div className="grid gap-8 border-b p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:p-12">
					<div className="flex min-w-0 flex-col gap-6">
						<p
							className="text-muted-foreground text-xs uppercase tracking-[0.2em]"
							style={{ fontFamily: "var(--preview-font-accent)" }}
						>
							{signature.label}
						</p>
						<div className="flex flex-col gap-4">
							<h2
								className="text-4xl tracking-[-0.04em] sm:text-6xl"
								style={{ fontFamily: "var(--preview-font-display)" }}
							>
								{designSystem.name}
							</h2>
							<p className="max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg">
								{summary}
							</p>
						</div>
						<p
							className="max-w-3xl text-3xl leading-tight tracking-[-0.03em] sm:text-5xl"
							style={{ fontFamily: "var(--preview-font-display)" }}
						>
							{signature.headline}
						</p>
					</div>
					<DesignSystemMark
						designSystem={designSystem}
						className="size-36 shrink-0 sm:size-44"
						data-mark-size="collection"
						aria-description={mark.label}
					/>
				</div>

				<div className="grid flex-1 gap-px bg-border lg:grid-cols-2">
					<div className="flex flex-col gap-8 bg-background p-6 sm:p-10 lg:p-12">
						<div className="flex flex-col gap-4">
							<h3 className="text-muted-foreground text-sm uppercase tracking-[0.16em]">
								Three principles
							</h3>
							<ol className="flex flex-col gap-3 text-lg">
								{signature.principles.map((principle, index) => (
									<li key={principle} className="flex items-baseline gap-3">
										<span className="text-muted-foreground text-xs">
											{String(index + 1).padStart(2, "0")}
										</span>
										{principle}
									</li>
								))}
							</ol>
						</div>

						<section
							className="flex flex-col gap-3"
							aria-label="Current theme palette"
						>
							<p className="text-muted-foreground text-sm uppercase tracking-[0.16em]">
								Current theme palette
							</p>
							<ul className="grid h-14 grid-cols-5 overflow-hidden border">
								{paletteTokens.map(([token, label]) => (
									<li
										key={token}
										style={{ background: `var(--preview-${token})` }}
									>
										<span className="sr-only">{label}</span>
									</li>
								))}
							</ul>
						</section>
					</div>

					<div className="flex flex-col justify-between gap-10 bg-card p-6 sm:p-10 lg:p-12">
						<section
							className="flex flex-col gap-4"
							aria-label="Typography sample"
						>
							<p className="text-muted-foreground text-sm uppercase tracking-[0.16em]">
								Typography sample
							</p>
							<p
								className="text-7xl leading-none sm:text-8xl"
								style={{ fontFamily: "var(--preview-font-display)" }}
							>
								Aa
							</p>
							<p
								className="max-w-md text-base leading-7"
								style={{ fontFamily: "var(--preview-font-body)" }}
							>
								Make hierarchy felt before it has to be explained.
							</p>
							<p className="text-muted-foreground text-xs">
								{typography.display} / {typography.body}
							</p>
						</section>

						<div className="flex flex-wrap items-end justify-between gap-6 border-t pt-6">
							<div className="flex max-w-sm flex-col gap-2">
								<p className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
									Intended fit
								</p>
								<p className="text-lg">{intendedFit}</p>
							</div>
							<Link
								href={route as Route}
								className={buttonVariants({ size: "lg" })}
							>
								Explore {designSystem.name}
								<ArrowUpRight data-icon="inline-end" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</DesignSystemPreviewTheme>
	);
}

export function DesignSystemBrowser({
	designSystems,
}: {
	designSystems: readonly DesignSystemDiscovery[];
}) {
	const foundation =
		designSystems.find((designSystem) => designSystem.slug === "foundation") ??
		designSystems[0];
	const [selectedSlug, setSelectedSlug] = useState(foundation?.slug ?? "");
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(desktopBrowserQuery);
		const updateOrientation = () => setIsDesktop(media.matches);
		updateOrientation();
		media.addEventListener("change", updateOrientation);
		return () => media.removeEventListener("change", updateOrientation);
	}, []);

	useEffect(() => {
		const restoreSelection = () => {
			const restoredSlug = selectedSlugFromHash(designSystems);
			if (restoredSlug) setSelectedSlug(restoredSlug);
		};
		restoreSelection();
		window.addEventListener("hashchange", restoreSelection);
		return () => window.removeEventListener("hashchange", restoreSelection);
	}, [designSystems]);

	function selectDesignSystem(value: string | number) {
		if (typeof value !== "string") return;
		if (!designSystems.some((designSystem) => designSystem.slug === value))
			return;
		setSelectedSlug(value);
		window.history.replaceState(null, "", `#${value}`);
	}

	return (
		<>
			{designSystems.map((designSystem) => (
				<DesignSystemPreviewThemeStyles
					key={designSystem.slug}
					designSystem={designSystem}
				/>
			))}
			<Tabs
				key={isDesktop ? "vertical" : "horizontal"}
				value={selectedSlug}
				onValueChange={selectDesignSystem}
				orientation={isDesktop ? "vertical" : "horizontal"}
				className="design-system-browser gap-5 md:grid md:grid-cols-[15rem_minmax(0,1fr)]"
			>
				<div className="design-system-browser-rail min-w-0 overflow-x-auto md:overflow-visible">
					<TabsList
						variant="line"
						activateOnFocus={false}
						aria-label="Design System selection"
						className="min-w-max items-stretch justify-start gap-2 p-0 md:w-full md:min-w-0"
					>
						{designSystems.map((designSystem) => (
							<TabsTrigger
								key={designSystem.slug}
								value={designSystem.slug}
								data-design-system-route={designSystem.preview.route}
								className="h-auto min-w-36 justify-start gap-3 px-3 py-3 md:w-full md:min-w-0"
							>
								<span
									data-design-system-preview={designSystem.slug}
									className="flex items-center gap-3 text-foreground"
								>
									<DesignSystemMark
										designSystem={designSystem}
										className="size-8 shrink-0"
										data-mark-size="compact"
										aria-hidden="true"
									/>
									<span>{designSystem.name}</span>
								</span>
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				<div className="min-w-0 border">
					{designSystems.map((designSystem) => (
						<TabsContent
							key={designSystem.slug}
							value={designSystem.slug}
							className="h-full text-base leading-normal"
						>
							<DesignSystemIdentityPanel designSystem={designSystem} />
						</TabsContent>
					))}
				</div>
			</Tabs>
		</>
	);
}
