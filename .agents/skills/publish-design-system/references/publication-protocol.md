# Publication protocol

Publication Approval authorizes two exact actions together: admitting the verified Design System Release to the Official Catalog and deploying the production website. It does not authorize an npm package release.

Record approval outside the proposal. The approval record pins every proposal file, the evaluated Design Contract digest, the repository commit that passed verification, and contract retrieval protocol `1.0`. Never edit the proposal, its evidence, or the approval record after approval. Any difference requires proposal verification and Publication Approval again.

Promotion stages the approved proposal in a disposable Git worktree, rebuilds generated Official Catalog artifacts, proves discovery, and reruns `launch:verify`. Only after every check passes does it apply the complete verified catalog patch to the working tree. A failed promotion leaves Official Catalog source unchanged. A successful promotion is ready to deploy but is not live.

Use the existing production deployment command `bun run deploy:prod`. Capture its production URL. A failed command, missing URL, or unverifiable response means the release is not live.

Post deployment verification checks the catalog and Design System Preview, every current and historical exact Design Contract route represented by the repository, response identity and release headers, byte identical Markdown, the approved digest, and Installation by the packaged CLI produced by `launch:verify` into a temporary Project.

Protocol `1.0` uses public Markdown routes at `/contracts/<identity>` and `/contracts/<identity>/<version>` with `x-agentkogei-design-system` and `x-agentkogei-design-system-release` headers. The tracked protocol lock pins the packaged CLI and website sources that implement this contract. Check it before approval and promotion. If it differs or the packaged CLI cannot use these routes, stop and request a separate package release decision. Do not publish npm from this workflow.

Post deployment verification uses only the canonical `https://agentkogei.com/` origin. A preview URL, local server, alternate host, or redirect cannot prove publication live.
