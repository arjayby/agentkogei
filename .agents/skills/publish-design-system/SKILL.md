---
name: publish-design-system
description: "Evaluate and publish an approved Design System Release through explicit Publication Approval and verified production deployment."
---

# Publish a Design System

Evaluate one Authoring Approved Candidate Design System Release, prepare an immutable proposal, obtain explicit Publication Approval, admit the exact release to the Official Catalog, deploy the production website, and verify the live result. Never infer an approval or report an unverifiable deployment as live.

## 1. Start in an isolated Project

Require exactly one candidate directory under `packages/design-systems/candidates`. Read [evaluation-protocol.md](references/evaluation-protocol.md) completely. Create the evaluation Project outside the repository working tree unless the maintainer supplied another isolated location.

Run:

```text
bun .agents/skills/publish-design-system/scripts/start-evaluation.ts <candidate-directory> --project <isolated-project>
```

Stop on every error. An invalid candidate, missing Authoring Approval, duplicate published identity, existing evaluation Project, or pending or failed prerequisite must produce an actionable refusal. Do not repair approval or evaluation state implicitly.

## 2. Generate and check the reference implementation

Use the isolated Project and its copied `DESIGN.md`. Perform each independent agent generation run declared in `.agentkogei/evaluation.json` from a fresh generation context. Across the runs, create reference screens for marketing, authentication, onboarding, dashboard, table, form, settings, and general states. Exercise desktop and mobile viewports, light and dark color schemes, and reduced motion.

Save each raw generation transcript or structured result inside the evaluation Project. Record one result at a time:

```text
bun .agents/skills/publish-design-system/scripts/record-evaluation-result.ts <isolated-project> --kind agent-run --id <run-id> --status <passed-or-failed> --evidence <relative-path>
```

Run structure, accessibility, responsive overflow, and color contrast checks against the generated reference implementation. Preserve each command's unedited raw output inside the evaluation Project, then record it with the same command using `--kind automated-check`. Use the exact check ids from `.agentkogei/evaluation.json`.

Record every failure as failed and stop. Never omit, edit, summarize, rerun, or relabel failed raw evidence to create a passing result. Human review cannot begin while any generation run or automated check is pending or failed.

## 3. Obtain three separate human approvals

Read [human-review-gates.md](references/human-review-gates.md) completely. For each gate, present only its relevant generated screens, raw check output, and review checklist. Request and receive one explicit approval at a time. A blanket response cannot approve another gate.

After each explicit approval, save the review evidence in the isolated Project and run:

```text
bun .agents/skills/publish-design-system/scripts/approve-human-review.ts <isolated-project> --review <visual-or-accessibility-or-rights> --reviewed-at <ISO-8601-UTC> --evidence <relative-path> --assert <required-assertion>...
```

Do not infer approval from silence, a previous approval, automated results, or general praise.

## 4. Prepare and verify the proposal

Only after all gates pass, read [proposal-format.md](references/proposal-format.md) completely and create the proposal metadata file. Keep the proposal outside `packages/design-systems/releases`. Run:

```text
bun .agents/skills/publish-design-system/scripts/prepare-publication.ts <isolated-project> --candidate <candidate-directory> --proposal <proposal-directory> --metadata <proposal-metadata-file>
```

The command must validate the candidate again, pin the exact evaluated Design Contract digest, copy the raw evidence, create truthful passed records, restrict the proposal to allowed release artifacts, and validate the immutable release. Stop if any input changed after evaluation.

Create an empty temporary directory and present the complete output of:

```text
git diff --no-index -- <empty-directory> <proposal-directory>
```

Treat exit status 1 as the expected nonempty diff and any status above 1 as failure. Verify the complete production integration in a disposable Git worktree:

```text
bun .agents/skills/publish-design-system/scripts/verify-publication.ts <proposal-directory> --output <verification-file>
```

This command inserts the proposal at its production release path only inside the disposable worktree and runs `launch:verify` there. It must report `launchVerify` as `passed` and `productionMutated` as `false`. Resolve repository failures without changing the evaluated proposal or rewriting evidence. Run proposal preparation again if any permitted proposal input changes.

## 5. Request Publication Approval

Present the identity, version, pinned digest, all evaluation results, three separate approvals, allowed artifact list, complete proposed production diff, and successful `launch:verify` result. Request explicit Publication Approval for Official Catalog admission and production deployment.

Stop with Publication Approval pending unless the maintainer explicitly approves both actions. After explicit approval, read [publication-protocol.md](references/publication-protocol.md) completely and record the approval once:

```text
bun .agents/skills/publish-design-system/scripts/approve-publication.ts <proposal-directory> --verification <verification-file> --approval <approval-file> --approved-at <ISO-8601-UTC> --approved-by <maintainer-identifier> --assert official-catalog-admission --assert production-deployment
```

Do not edit or replace an existing approval record. Any changed proposal artifact, verification result, or repository commit requires verification and Publication Approval again.

## 6. Admit the approved release

Run:

```text
bun .agents/skills/publish-design-system/scripts/promote-publication.ts <proposal-directory> --approval <approval-file>
```

The command must validate the candidate record, evidence digests, automated results, three human reviews, Publication Approval, every approved proposal file, and the verified repository commit. It atomically admits the exact proposal, rebuilds generated catalog data, proves the identity is discovered, and reruns `launch:verify`. Continue only when it reports `readyToDeploy` as `true`, `launchVerify` as `passed`, and `live` as `false`.

If contract retrieval protocol `1.0` is not preserved, stop and request a separate package release decision. Publication Approval does not authorize npm publication.

## 7. Deploy the production website

Run the existing AgentKogei production path exactly:

```text
bun run deploy:prod
```

Capture the production website URL from the successful deployment. Do not run `npm publish`. A failed deployment, missing production URL, or ambiguous deployment status is not live and must be reported as such.

## 8. Verify production and report

Run:

```text
bun .agents/skills/publish-design-system/scripts/verify-production.ts <approval-file> --production-url <production-url>
```

This command must verify the new catalog entry and Design System Preview, every repository backed current and historical exact contract route, approved response identity and release headers, byte identical Markdown, the approved digest, and Installation by the packaged CLI into a temporary Project. A mismatch or unverifiable response fails with `live` as `false`.

Only a successful result may be reported as live. Report the catalog route, current contract route, exact contract route, Design System identity, semantic version, and verified digest. Also report that no npm CLI package was published.
