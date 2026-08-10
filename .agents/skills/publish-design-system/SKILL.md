---
name: publish-design-system
description: "Evaluate an Authoring Approved Candidate Design System Release and prepare a verified immutable publication proposal."
---

# Prepare a Design System publication

Evaluate one Authoring Approved Candidate Design System Release. Prepare and verify an immutable publication proposal, then request Publication Approval. Never promote a proposal, modify `packages/design-systems/releases`, deploy, or report the Design System as live.

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
bun .agents/skills/publish-design-system/scripts/verify-publication.ts <proposal-directory>
```

This command inserts the proposal at its production release path only inside the disposable worktree and runs `launch:verify` there. It must report `launchVerify` as `passed` and `productionMutated` as `false`. Resolve repository failures without changing the evaluated proposal or rewriting evidence. Run proposal preparation again if any permitted proposal input changes.

## 5. Request Publication Approval and stop

Present the identity, version, pinned digest, all evaluation results, three separate approvals, allowed artifact list, complete proposed production diff, and successful `launch:verify` result. Request explicit Publication Approval for Official Catalog admission and production deployment.

Stop with Publication Approval pending. This workflow contains no promotion or deployment action and never reports the Design System as published or live.
