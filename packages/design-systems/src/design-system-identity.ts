import { z } from "zod";

/**
 * A Design System identity as it appears in the Official Catalog and in an
 * `agentkogei add <design-system>` selector: lowercase words joined by single hyphens,
 * so it is safe in a URL path and unambiguous in a command line.
 */
export const designSystemIdentityPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const designSystemIdentitySchema = z
	.string()
	.regex(designSystemIdentityPattern)
	.brand<"DesignSystemIdentity">();

export type DesignSystemIdentity = z.infer<typeof designSystemIdentitySchema>;
