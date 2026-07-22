import { z } from "zod";

export const diagnosticCommands = [
	"login",
	"logout",
	"install",
	"status",
	"update",
	"detach",
] as const;

export const diagnosticPayloadSchema = z
	.object({
		schema_version: z.literal("1.0"),
		command: z.enum(diagnosticCommands),
		outcome: z.enum(["success", "error"]),
		platform: z.string().min(1).max(32),
		runtime: z.literal("node"),
	})
	.strict();

export type DiagnosticPayload = z.infer<typeof diagnosticPayloadSchema>;
const diagnosticFieldDescriptions = {
	schema_version: '"1.0"',
	command: "CLI command name",
	outcome: "success or error",
	platform: "operating-system family",
	runtime: '"node"',
} satisfies Record<keyof DiagnosticPayload, string>;

export const diagnosticFieldDisclosure = Object.entries(
	diagnosticFieldDescriptions,
).map(([field, description]) => `${field}: ${description}`);

export type DiagnosticCommand = (typeof diagnosticCommands)[number];
export type DiagnosticOutcome = DiagnosticPayload["outcome"];
