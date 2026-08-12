import { hasHiddenDocumentControl } from "./text-safety";

const designContractFileName = "DESIGN.md";

const coverageRequirements = {
	"identity and intended fit": [
		"name",
		"intended fit",
		"unsuitable",
		"experience",
	],
	"principles and system signature": ["principle", "system signature"],
	"semantic color": [
		"light",
		"dark",
		"background",
		"foreground",
		"card",
		"muted",
		"muted foreground",
		"border",
		"primary",
		"primary foreground",
		"destructive",
		"success",
		"warning",
		"info",
		"focus ring",
		"contrast",
		"hierarchy",
		"usage",
	],
	typography: [
		"display",
		"body",
		"label",
		"code",
		"weight",
		"line height",
		"tracking",
		"wrapping",
		"responsive",
	],
	"spacing and density": [
		"base spacing unit",
		"scale",
		"density",
		"control",
		"content rhythm",
		"grouping",
	],
	"responsive layout": [
		"mobile",
		"tablet",
		"desktop",
		"content width",
		"grid",
		"navigation",
		"reflow",
		"overflow",
	],
	"components and interaction states": [
		"geometry",
		"behavior",
		"button",
		"link",
		"input",
		"text area",
		"select",
		"checkbox",
		"navigation",
		"card",
		"dialog",
		"menu",
		"table",
		"feedback",
		"default",
		"hover",
		"focus",
		"active",
		"selected",
		"disabled",
		"invalid",
		"destructive",
	],
	"product surfaces": [
		"marketing",
		"authentication",
		"onboarding",
		"dashboard",
		"table",
		"form",
		"settings",
		"state",
	],
	"feedback states": [
		"loading",
		"empty",
		"error",
		"success",
		"disabled",
		"destructive",
		"recovery action",
		"stable layout",
	],
	motion: [
		"duration",
		"easing",
		"spatial movement",
		"enter",
		"exit",
		"continuity",
		"reduced motion",
	],
	accessibility: [
		"wcag 2.2 level aa",
		"keyboard",
		"visible focus",
		"semantics",
		"accessible name",
		"contrast",
		"target size",
		"zoom",
		"reflow",
		"error identification",
		"assistive technology",
		"reduced motion",
	],
	"supported stack": [
		"tailwind css v4",
		"shadcn/ui",
		"semantic token",
		"component variant",
	],
	"agent examples": [
		"good request",
		"bad request",
		"faithful",
		"prohibited drift",
	],
	"final validation": [
		"surface",
		"state",
		"viewport",
		"color scheme",
		"motion",
		"component interaction",
		"stack",
		"accessibility",
	],
} as const;

const coverageAliases = new Map<string, string[]>([
	["intended fit", ["product fit", "suitable for"]],
	["unsuitable", ["not for", "avoid using", "inappropriate"]],
	["experience", ["product feel"]],
	["system signature", ["signature"]],
	["muted foreground", ["secondary text"]],
	["primary foreground", ["on primary"]],
	["focus ring", ["focus indicator"]],
	["line height", ["leading"]],
	["tracking", ["letter spacing"]],
	["wrapping", ["line breaking"]],
	["base spacing unit", ["base unit"]],
	["content rhythm", ["vertical rhythm"]],
	["content width", ["measure"]],
	["text area", ["multiline input"]],
	["checkbox", ["check box"]],
	["visible focus", ["focus indicator"]],
	["accessible name", ["accessible label"]],
	["assistive technology", ["screen reader"]],
	["semantic token", ["design token"]],
	["component variant", ["variant"]],
	["prohibited drift", ["visual drift"]],
]);

const normalize = (value: string) =>
	value
		.normalize("NFKC")
		.toLowerCase()
		.replaceAll(/[-_/]/g, " ")
		.replaceAll(/\s+/g, " ")
		.trim();

const retainedRawContentPattern =
	/(?:data\s*:\s*image|base64|<\s*(?:!doctype|html|head|body|img|script|style|link|meta)\b|!\[[^\]]*\]\s*\(|[a-z0-9+/]{80,}={0,2})/i;

function sections(markdown: string) {
	const counts = new Map<string, number>();
	const contents = new Map<string, string[]>();
	const headings = new Set(Object.keys(coverageRequirements));
	let current: string | undefined;
	let fence: { marker: string; length: number } | undefined;

	for (const line of markdown.split("\n")) {
		const fenced = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
		if (fenced) {
			const marker = fenced[1] ?? "";
			const rest = (fenced[2] ?? "").trim();
			if (
				fence &&
				marker[0] === fence.marker &&
				marker.length >= fence.length &&
				rest === ""
			) {
				fence = undefined;
			} else if (!fence) {
				fence = { marker: marker[0] ?? "", length: marker.length };
			}
			continue;
		}
		if (fence) continue;
		const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)?.[1]?.toLowerCase();
		if (heading) {
			current = headings.has(heading) ? heading : undefined;
			if (current) {
				counts.set(current, (counts.get(current) ?? 0) + 1);
				if (!contents.has(current)) contents.set(current, []);
			}
			continue;
		}
		if (current) contents.get(current)?.push(line);
	}

	return { counts, contents };
}

function validateFences(markdown: string) {
	const errors: string[] = [];
	let fence: { marker: string; length: number } | undefined;
	for (const line of markdown.split("\n")) {
		const fenced = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
		if (!fenced) continue;
		const marker = fenced[1] ?? "";
		const rest = (fenced[2] ?? "").trim();
		if (fence) {
			if (
				marker[0] === fence.marker &&
				marker.length >= fence.length &&
				rest === ""
			) {
				fence = undefined;
			}
			continue;
		}
		const language = rest.split(/\s+/)[0]?.toLowerCase() ?? "";
		fence = { marker: marker[0] ?? "", length: marker.length };
		if (!language) {
			errors.push(
				`${designContractFileName} presents an unlabeled fenced block that cannot be proven inert`,
			);
		} else if (language !== "css" && language !== "svg") {
			errors.push(
				`${designContractFileName} presents an executable ${language} block`,
			);
		}
	}
	return errors;
}

export function validateDesignContractStandard(bytes: Buffer) {
	let markdown: string;
	try {
		markdown = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		return [`${designContractFileName} is not valid UTF-8 text`];
	}

	const errors = validateFences(markdown);
	if (hasHiddenDocumentControl(markdown)) {
		errors.push(`${designContractFileName} contains hidden control characters`);
	}
	if (retainedRawContentPattern.test(markdown)) {
		errors.push(
			`${designContractFileName} contains retained raw reference content`,
		);
	}

	const { counts, contents } = sections(markdown);
	for (const [heading, terms] of Object.entries(coverageRequirements)) {
		const count = counts.get(heading) ?? 0;
		if (count === 0) {
			errors.push(
				`${designContractFileName} is missing required section: ${heading}`,
			);
			continue;
		}
		if (count !== 1) {
			errors.push(
				`${designContractFileName} must contain required section exactly once: ${heading}`,
			);
		}
		const rawContent = contents.get(heading)?.join("\n") ?? "";
		const content = normalize(rawContent);
		if (content.length < 20) {
			errors.push(
				`${designContractFileName} required section carries insufficient direction: ${heading}`,
			);
		}
		for (const term of terms) {
			const accepted = [term, ...(coverageAliases.get(term) ?? [])].map(
				normalize,
			);
			if (!accepted.some((value) => content.includes(value))) {
				errors.push(
					`${designContractFileName} section ${heading} is missing required coverage: ${term}`,
				);
			}
		}
		if (heading === "principles and system signature") {
			const principleCount = rawContent
				.split("\n")
				.filter((line) =>
					/^\s*(?:[-*+]|\d+\.)\s+(?:\*\*)?principle\b/i.test(line),
				).length;
			if (principleCount < 3 || principleCount > 5) {
				errors.push(
					`${designContractFileName} must define three to five principles`,
				);
			}
		}
		if (
			heading === "responsive layout" &&
			!content.includes("breakpoint") &&
			!content.includes("content driven") &&
			!content.includes("intrinsic")
		) {
			errors.push(
				`${designContractFileName} section responsive layout requires breakpoints or content driven transitions`,
			);
		}
	}

	for (const dependency of [
		"design-system-evaluation.json",
		"evaluation evidence",
		"design reference",
		"supporting resource",
	]) {
		if (markdown.toLowerCase().includes(dependency)) {
			errors.push(`${designContractFileName} depends on ${dependency}`);
		}
	}
	if (/https?:\/\//i.test(markdown) || /@import\s+/i.test(markdown)) {
		errors.push(`${designContractFileName} contains a remote dependency`);
	}
	if (
		/\b(?:(?:scripts?|hooks?)\/|postinstall|preinstall|package\.json)\b/i.test(
			markdown,
		)
	) {
		errors.push(
			`${designContractFileName} depends on an executable or supporting resource`,
		);
	}
	if (/\[[^\]]+\]\((?!https?:|#)[^)]+\)/i.test(markdown)) {
		errors.push(
			`${designContractFileName} depends on a local supporting resource`,
		);
	}
	return errors;
}
