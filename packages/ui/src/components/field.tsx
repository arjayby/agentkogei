"use client";

import { Label } from "@agentkogei/ui/components/label";
import { cn } from "@agentkogei/ui/lib/utils";
import type * as React from "react";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="field-set"
			className={cn("flex flex-col gap-4", className)}
			{...props}
		/>
	);
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
	return (
		<legend
			data-slot="field-legend"
			className={cn("mb-2.5 font-medium text-sm", className)}
			{...props}
		/>
	);
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="field-group"
			className={cn("flex w-full flex-col gap-5", className)}
			{...props}
		/>
	);
}

function Field({
	className,
	...props
}: React.ComponentProps<"div"> & { "data-invalid"?: boolean }) {
	return (
		<div
			data-slot="field"
			className={cn(
				"group/field flex w-full flex-col gap-2 data-[invalid=true]:text-destructive",
				className,
			)}
			{...props}
		/>
	);
}

function FieldLabel({
	className,
	...props
}: React.ComponentProps<typeof Label>) {
	return (
		<Label
			data-slot="field-label"
			className={cn("w-fit leading-snug", className)}
			{...props}
		/>
	);
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="field-description"
			className={cn(
				"text-left font-normal text-muted-foreground text-xs/relaxed",
				className,
			)}
			{...props}
		/>
	);
}

function FieldError({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="alert"
			data-slot="field-error"
			className={cn("font-normal text-destructive text-xs", className)}
			{...props}
		/>
	);
}

export {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
};
