import { z } from "zod";

/**
 * A Design Pack identity as it appears in the Official Catalog and in an
 * `agentkogei add <pack>` selector: lowercase words joined by single hyphens,
 * so it is safe in a URL path and unambiguous in a command line.
 */
export const packIdentityPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const packIdentitySchema = z.string().regex(packIdentityPattern);
