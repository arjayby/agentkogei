// biome-ignore-all lint/a11y/noNoninteractiveTabindex: Labelled overflow regions must be keyboard scrollable.

"use client";

import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@agentkogei/ui/components/alert";
import { Badge } from "@agentkogei/ui/components/badge";
import { Button } from "@agentkogei/ui/components/button";
import { Spinner } from "@agentkogei/ui/components/spinner";
import {
	Check,
	CircleAlert,
	Info,
	SearchX,
	Trash2,
	TriangleAlert,
} from "lucide-react";
import {
	type ComponentProps,
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	useId,
	useRef,
	useState,
} from "react";

import { DesignSystemSpecimenHeading } from "@/components/design-system-specimen-heading";
import type { PreviewShell } from "@/lib/catalog";

type Interactions = NonNullable<PreviewShell["interactions"]>;
type FeedbackTone = Interactions["feedback"]["badges"][number]["tone"];

const badgeVariants = {
	neutral: "outline",
	info: "secondary",
	success: "outline",
	warning: "outline",
	destructive: "destructive",
} as const satisfies Record<
	FeedbackTone,
	ComponentProps<typeof Badge>["variant"]
>;

function ToneIcon({ tone }: { tone: FeedbackTone }) {
	if (tone === "success") return <Check aria-hidden="true" />;
	if (tone === "warning") return <TriangleAlert aria-hidden="true" />;
	if (tone === "destructive") return <CircleAlert aria-hidden="true" />;
	return <Info aria-hidden="true" />;
}

function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
	if (event.key !== "Tab") return;
	const controls = Array.from(
		event.currentTarget.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
		),
	);
	const first = controls[0];
	const last = controls.at(-1);
	if (!first || !last) return;

	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

function PreviewDialog({
	children,
	description,
	dialogRef,
	openerRef,
	title,
}: {
	children: ReactNode;
	description: ReactNode;
	dialogRef: RefObject<HTMLDialogElement | null>;
	openerRef: RefObject<HTMLButtonElement | null>;
	title: string;
}) {
	const titleId = useId();
	const descriptionId = useId();

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			className="preview-dialog"
			onClose={() => requestAnimationFrame(() => openerRef.current?.focus())}
			onKeyDown={containDialogFocus}
		>
			<div className="grid gap-5">
				<div className="grid gap-2">
					<h4 id={titleId}>{title}</h4>
					<div id={descriptionId} className="grid gap-2 text-sm">
						{description}
					</div>
				</div>
				{children}
			</div>
		</dialog>
	);
}

export function DesignSystemInteractionsSpecimen({
	composition,
	interactions,
	name,
}: {
	composition: PreviewShell["composition"];
	interactions: Interactions;
	name: string;
}) {
	const feedbackStatesId = useId();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const dialogOpenerRef = useRef<HTMLButtonElement>(null);
	const destructiveDialogRef = useRef<HTMLDialogElement>(null);
	const destructiveOpenerRef = useRef<HTMLButtonElement>(null);
	const [objectRemoved, setObjectRemoved] = useState(false);
	const { dataDisplay, feedback, dialogs, destructiveActions } = interactions;
	const feedbackStates = [
		{
			key: "loading",
			label: "Loading",
			message: feedback.states.loading,
			icon: <Spinner aria-hidden="true" />,
		},
		{
			key: "empty",
			label: "Empty",
			message: feedback.states.empty,
			icon: <Info aria-hidden="true" />,
		},
		{
			key: "filtered-empty",
			label: "Filtered empty",
			message: feedback.states.filteredEmpty,
			icon: <SearchX aria-hidden="true" />,
		},
		{
			key: "error",
			label: "Error",
			message: feedback.states.error,
			icon: <CircleAlert aria-hidden="true" />,
		},
		{
			key: "success",
			label: "Success",
			message: feedback.states.success,
			icon: <Check aria-hidden="true" />,
		},
		{
			key: "disabled",
			label: "Disabled",
			message: feedback.states.disabled,
			icon: <Info aria-hidden="true" />,
		},
		{
			key: "destructive",
			label: "Destructive",
			message: feedback.states.destructive,
			icon: <Trash2 aria-hidden="true" />,
		},
	] as const;

	return (
		<section
			aria-label={`${name} data, feedback, and consequential interactions`}
			data-interactions-composition={composition}
			data-controls-composition={composition}
			data-specimen-composition={composition}
			className="preview-controls-grid"
		>
			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="11 / Data"
					title="Tables, lists, and data display"
					description={`${dataDisplay.guidance} ${dataDisplay.overflowGuidance}`}
				/>

				<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
					<section
						aria-label={`${dataDisplay.tableCaption} scroll region`}
						tabIndex={0}
						className="preview-data-table-region catalog-preview-panel border"
					>
						<table>
							<caption>{dataDisplay.tableCaption}</caption>
							<thead>
								<tr>
									{dataDisplay.columns.map((column) => (
										<th key={column.id} scope="col">
											{column.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{dataDisplay.rows.map((row) => (
									<tr key={row.id}>
										<th scope="row">{row.label}</th>
										{row.cells.map((cell, index) => (
											<td key={dataDisplay.columns[index + 1]?.id}>{cell}</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</section>

					<div className="catalog-preview-panel border p-[var(--preview-space)]">
						<h4 className="catalog-preview-display mb-4 font-medium text-xl">
							{dataDisplay.listLabel}
						</h4>
						<ul
							aria-label={dataDisplay.listLabel}
							className="preview-data-list"
						>
							{dataDisplay.listItems.map((item) => (
								<li key={item.title}>
									<div>
										<strong>{item.title}</strong>
										<p>{item.description}</p>
									</div>
									<span>{item.status}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="12 / Feedback"
					title="Badges, alerts, and feedback states"
					description={`${feedback.guidance} ${feedback.nonColorGuidance}`}
				/>

				<ul aria-label="Status badges" className="preview-badge-list">
					{feedback.badges.map((badge) => (
						<li key={badge.label}>
							<Badge
								variant={badgeVariants[badge.tone]}
								data-feedback-tone={badge.tone}
							>
								<ToneIcon tone={badge.tone} />
								{badge.label}
							</Badge>
							<span>{badge.meaning}</span>
						</li>
					))}
				</ul>

				<div className="grid gap-4 lg:grid-cols-2">
					{feedback.alerts.map((alert) => (
						<Alert
							key={alert.title}
							variant={alert.tone === "destructive" ? "destructive" : "default"}
							data-feedback-tone={alert.tone}
						>
							<ToneIcon tone={alert.tone} />
							<AlertTitle>{alert.title}</AlertTitle>
							<AlertDescription>{alert.description}</AlertDescription>
						</Alert>
					))}
				</div>

				<fieldset aria-labelledby={feedbackStatesId}>
					<legend id={feedbackStatesId} className="sr-only">
						Feedback states
					</legend>
					<div className="preview-feedback-state-grid">
						{feedbackStates.map((state) => (
							<article key={state.key} data-feedback-state={state.key}>
								<div className="preview-feedback-state-title">
									{state.icon}
									<h5>{state.label}</h5>
								</div>
								<p>{state.message}</p>
							</article>
						))}
					</div>
				</fieldset>
			</section>

			<section className="preview-control-section">
				<DesignSystemSpecimenHeading
					number="13 / Consequence"
					title="Dialogs and destructive actions"
					description={`${dialogs.guidance} ${destructiveActions.guidance}`}
				/>

				<div className="grid gap-6 lg:grid-cols-2">
					<div className="catalog-preview-panel grid content-start gap-4 border p-[var(--preview-space)]">
						<h4 className="catalog-preview-display font-medium text-xl">
							{dialogs.title}
						</h4>
						<p className="catalog-preview-muted text-sm leading-6">
							{dialogs.description}
						</p>
						<ul className="grid gap-2 text-sm">
							<li>{dialogs.escapeBehavior}</li>
							<li>{dialogs.focusRestoration}</li>
						</ul>
						<Button
							ref={dialogOpenerRef}
							type="button"
							variant="outline"
							data-preview-control="button"
							onClick={() => dialogRef.current?.showModal()}
						>
							{dialogs.openLabel}
						</Button>
					</div>

					<div className="preview-destructive-card grid content-start gap-4 border p-[var(--preview-space)]">
						<div className="preview-feedback-state-title">
							<Trash2 aria-hidden="true" />
							<h4 className="catalog-preview-display font-medium text-xl">
								{destructiveActions.objectLabel}
							</h4>
						</div>
						<p>{destructiveActions.consequence}</p>
						<p className="catalog-preview-muted text-sm">
							{destructiveActions.recoverability}
						</p>
						{objectRemoved ? (
							<Button
								ref={destructiveOpenerRef}
								type="button"
								variant="outline"
								onClick={() => setObjectRemoved(false)}
							>
								Restore {destructiveActions.objectLabel}
							</Button>
						) : (
							<Button
								ref={destructiveOpenerRef}
								type="button"
								variant="destructive"
								data-preview-control="button"
								onClick={() => destructiveDialogRef.current?.showModal()}
							>
								{destructiveActions.openLabel}
							</Button>
						)}
						<p
							role="status"
							aria-label="Destructive action result"
							className="text-sm"
						>
							{objectRemoved
								? `${destructiveActions.objectLabel} removed locally.`
								: `${destructiveActions.objectLabel} remains available.`}
						</p>
					</div>
				</div>

				<PreviewDialog
					dialogRef={dialogRef}
					openerRef={dialogOpenerRef}
					title={dialogs.title}
					description={<p>{dialogs.description}</p>}
				>
					<form method="dialog" className="flex flex-wrap gap-3">
						<Button type="submit" value="inspect" autoFocus>
							{dialogs.initialFocusLabel}
						</Button>
						<Button type="submit" value="confirm" variant="secondary">
							{dialogs.confirmLabel}
						</Button>
						<Button type="submit" value="close" variant="outline">
							{dialogs.closeLabel}
						</Button>
					</form>
				</PreviewDialog>

				<PreviewDialog
					dialogRef={destructiveDialogRef}
					openerRef={destructiveOpenerRef}
					title={`Remove ${destructiveActions.objectLabel}?`}
					description={
						<>
							<p>{destructiveActions.consequence}</p>
							<p>{destructiveActions.recoverability}</p>
						</>
					}
				>
					<form method="dialog" className="flex flex-wrap gap-3">
						<Button type="submit" value="cancel" variant="outline" autoFocus>
							{destructiveActions.cancelLabel}
						</Button>
						<Button
							type="submit"
							value="confirm"
							variant="destructive"
							onClick={() => setObjectRemoved(true)}
						>
							{destructiveActions.confirmLabel}
						</Button>
					</form>
				</PreviewDialog>
			</section>
		</section>
	);
}
