# Retire licensing as a product concept

AgentKogei will stop treating licensing as a product concept. No "Pack License" or "Project License" appears in Design Contracts, delivery metadata, the CLI, the catalog, or the docs. An installed `DESIGN.md` is bare design direction: the license, attribution, and provenance prose is removed so an AI coding agent reads only the interface system, not legal text it pays tokens to parse.

Open Design Pack content carries no formal content license. The freedom to install and use it in any Project is stated once in the website Terms rather than inside every delivered file. Premium Design Packs stay private and access-gated; the redistribution limits — no resale, sublicensing, or republishing a Premium Design Pack as a standalone product — also live in the website Terms, not in per-pack metadata. A premium pack installed while Premium Access is active keeps working in that Project afterward as plain ownership of a file the Builder retrieved, with no runtime checks or DRM.

The AgentKogei source code keeps its MIT license: the repository `LICENSE` and the `package.json` license fields are unchanged. Only the product/pack licensing concept is removed. Legal and privacy content is consolidated onto the `/terms` and `/privacy` pages.

Retired vocabulary: "Pack License", "Project License", "commercial Pack License". Surviving vocabulary: "Premium Access", "Design Pack", "Design Contract", "Pack Release", the Open/Premium "access" tier, and "Pack Credential".

Rationale: the license and provenance prose cost agent tokens in every installed Design Contract and added conceptual weight without protecting the business. The moat is the trusted Official Catalog, evaluated premium direction, and release cadence — not license text stamped into files. This supersedes the previous "permissive software and open-content licenses" decision (removed) and amends [0001](0001-open-software-with-commercial-design-packs.md), [0003](0003-subscription-gates-catalog-not-installed-use.md), and [0009](0009-design-pack-content-must-be-original.md).

Consequence for immutability: Pack Releases are immutable from launch onward. This pre-launch change edited the already-published Design Contracts in place to strip their license prose and recomputed their digests, rather than cutting new releases no Builder asked for.
