"use client";

import { Button } from "@agentkogei/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@agentkogei/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@agentkogei/ui/components/field";
import { Input } from "@agentkogei/ui/components/input";
import { Spinner } from "@agentkogei/ui/components/spinner";
import { Textarea } from "@agentkogei/ui/components/textarea";
import { Check, CircleAlert } from "lucide-react";
import { type FormEvent, type ReactNode, useId, useState } from "react";

import { DesignSystemSpecimenHeading } from "@/components/design-system-specimen-heading";
import type { PreviewShell } from "@/lib/catalog";

const interactionStates = [
	"default",
	"hover",
	"focus",
	"active",
	"disabled",
	"loading",
	"success",
	"error",
] as const;

function stateLabel(state: (typeof interactionStates)[number]) {
	return `${state.charAt(0).toUpperCase()}${state.slice(1)}`;
}

function ControlStateGroup({
	label,
	renderControl,
}: {
	label: string;
	renderControl: (state: (typeof interactionStates)[number]) => ReactNode;
}) {
	return (
		<FieldSet className="grid gap-3">
			<FieldLegend className="sr-only">{label}</FieldLegend>
			{interactionStates.map((state) => (
				<div key={state} className="preview-control-state-row">
					<span>{stateLabel(state)}</span>
					{renderControl(state)}
				</div>
			))}
		</FieldSet>
	);
}

export function DesignSystemControlsSpecimen({
	composition,
	controls,
	name,
	slug,
}: {
	composition: PreviewShell["composition"];
	controls: NonNullable<PreviewShell["controls"]>;
	name: string;
	slug: string;
}) {
	const fieldId = useId();
	const [actionComplete, setActionComplete] = useState(false);
	const [formState, setFormState] = useState<"idle" | "error" | "success">(
		"idle",
	);
	const [currentNavigationId, setCurrentNavigationId] = useState(
		controls.navigation.items[0]?.id,
	);

	function validateForm(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const email = String(new FormData(event.currentTarget).get("email") ?? "");
		setFormState(/^\S+@\S+\.\S+$/.test(email.trim()) ? "success" : "error");
	}

	return (
		<section
			aria-label={`${name} controls and content containers`}
			data-controls-composition={composition}
			data-specimen-composition={composition}
			className="preview-controls-grid"
		>
			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="07 / Controls"
					title="Buttons and links"
					description={`${controls.buttons.guidance} ${controls.links.guidance}`}
				/>

				<div className="grid gap-8 xl:grid-cols-2">
					<ControlStateGroup
						label="Button states"
						renderControl={(state) => (
							<Button
								type="button"
								disabled={state === "disabled" || state === "loading"}
								aria-busy={state === "loading" || undefined}
								data-preview-control="button"
								data-specimen-state={state}
							>
								{state === "loading" ? (
									<Spinner data-icon="inline-start" />
								) : null}
								{state === "success" ? (
									<Check data-icon="inline-start" aria-hidden="true" />
								) : null}
								{state === "error" ? (
									<CircleAlert data-icon="inline-start" aria-hidden="true" />
								) : null}
								{controls.buttons.primaryLabel}
							</Button>
						)}
					/>

					<ControlStateGroup
						label="Link states"
						renderControl={(state) =>
							state === "disabled" ? (
								<a
									href={`#${slug}-link-disabled`}
									onClick={(event) => event.preventDefault()}
									aria-disabled="true"
									tabIndex={-1}
									data-preview-control="link"
									data-specimen-state={state}
								>
									{controls.links.primaryLabel}
								</a>
							) : (
								<a
									href={`#${slug}-link-${state}`}
									onClick={(event) => event.preventDefault()}
									aria-busy={state === "loading" || undefined}
									data-preview-control="link"
									data-specimen-state={state}
								>
									{controls.links.primaryLabel}
								</a>
							)
						}
					/>
				</div>

				<div className="catalog-preview-panel border p-4">
					<FieldSet className="flex flex-wrap items-center gap-4">
						<FieldLegend className="sr-only">Interactive actions</FieldLegend>
						<Button
							type="button"
							data-preview-control="button"
							onClick={() => setActionComplete(true)}
						>
							{controls.buttons.secondaryLabel}
						</Button>
						<a
							href={`#${slug}-local-action`}
							onClick={(event) => {
								event.preventDefault();
								setActionComplete(true);
							}}
							data-preview-control="link"
						>
							{controls.links.secondaryLabel}
						</a>
						<p role="status" aria-label="Action result" className="text-sm">
							{actionComplete
								? `${controls.buttons.secondaryLabel} complete.`
								: "Ready for local interaction."}
						</p>
					</FieldSet>
				</div>
			</section>

			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="08 / Fields"
					title="Forms and inputs"
					description={`${controls.forms.guidance} ${controls.inputs.guidance}`}
				/>
				<form
					aria-label={controls.forms.legend}
					noValidate
					onSubmit={validateForm}
					className="catalog-preview-panel border p-[var(--preview-space)]"
				>
					<FieldSet>
						<FieldLegend>{controls.forms.legend}</FieldLegend>
						<FieldGroup>
							<Field data-invalid={formState === "error" || undefined}>
								<FieldLabel htmlFor={`${fieldId}-email`}>
									{controls.inputs.textLabel}
								</FieldLabel>
								<Input
									id={`${fieldId}-email`}
									name="email"
									type="email"
									placeholder={controls.inputs.textPlaceholder}
									aria-invalid={formState === "error" || undefined}
									data-preview-control="input"
								/>
								<FieldDescription>{controls.forms.help}</FieldDescription>
								{formState === "error" ? (
									<FieldError>{controls.forms.error}</FieldError>
								) : null}
							</Field>
							<Field>
								<FieldLabel htmlFor={`${fieldId}-context`}>
									{controls.inputs.textareaLabel}
								</FieldLabel>
								<Textarea
									id={`${fieldId}-context`}
									name="context"
									placeholder={controls.inputs.textareaPlaceholder}
									data-preview-control="input"
								/>
							</Field>
							<Field data-disabled>
								<FieldLabel htmlFor={`${fieldId}-disabled`}>
									{controls.inputs.disabledLabel}
								</FieldLabel>
								<Input
									id={`${fieldId}-disabled`}
									value="Assigned by policy"
									disabled
									data-preview-control="input"
								/>
							</Field>
						</FieldGroup>
						<div className="flex flex-wrap items-center gap-4">
							<Button type="submit" data-preview-control="button">
								{controls.forms.submitLabel}
							</Button>
							{formState === "success" ? (
								<p role="status" className="preview-control-success text-sm">
									<Check aria-hidden="true" />
									{controls.forms.success}
								</p>
							) : null}
						</div>
					</FieldSet>
				</form>
			</section>

			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="09 / Containers"
					title="Cards and panels"
					description={`${controls.cards.guidance} ${controls.panels.guidance}`}
				/>
				<div className="grid gap-6 lg:grid-cols-2">
					<Card data-preview-container="card">
						<CardHeader>
							<CardTitle>{controls.cards.title}</CardTitle>
							<CardDescription>{controls.cards.description}</CardDescription>
							<CardAction>{controls.cards.metadata}</CardAction>
						</CardHeader>
						<CardContent>
							<p className="text-sm leading-6">{controls.cards.guidance}</p>
						</CardContent>
						<CardFooter>
							<a
								href={`#${slug}-card`}
								onClick={(event) => event.preventDefault()}
								data-preview-control="link"
							>
								{controls.cards.actionLabel}
							</a>
						</CardFooter>
					</Card>

					<aside
						aria-label={controls.panels.title}
						data-preview-container="panel"
						className="catalog-preview-panel grid content-start gap-5 border p-[var(--preview-space)]"
					>
						<div className="grid gap-2">
							<h4 className="catalog-preview-display font-medium text-xl">
								{controls.panels.title}
							</h4>
							<p className="catalog-preview-muted text-sm leading-6">
								{controls.panels.description}
							</p>
						</div>
						<ul className="grid gap-px bg-[var(--preview-border)]">
							{controls.panels.items.map((item) => (
								<li key={item} className="bg-[var(--preview-card)] p-3 text-sm">
									{item}
								</li>
							))}
						</ul>
					</aside>
				</div>
			</section>

			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="10 / Wayfinding"
					title="Navigation"
					description={controls.navigation.guidance}
				/>
				<nav
					aria-label={controls.navigation.label}
					className="catalog-preview-panel border p-[var(--preview-space)]"
				>
					<ul className="preview-control-navigation-list">
						{controls.navigation.items.map((item) => (
							<li key={item.id}>
								<a
									href={`#${slug}-${item.id}`}
									onClick={(event) => {
										event.preventDefault();
										setCurrentNavigationId(item.id);
									}}
									aria-current={
										currentNavigationId === item.id ? "page" : undefined
									}
									data-preview-control="navigation"
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</section>
		</section>
	);
}
