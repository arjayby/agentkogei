---
name: author-design-system
description: "Create an original, validated Candidate Design System Release from one inspectable Design Reference."
---

# Author a Design System

Create one new Candidate Design System Release from one maintainer supplied image or URL. Stop after recording Authoring Approval. Never evaluate, publish, edit the Official Catalog, create pass evidence, or deploy.

## 1. Inspect the Design Reference

Require exactly one image or URL. Inspect the actual reference with available image or browser tooling. State the portion inspected. Stop and request an accessible image or screenshot when the reference is inaccessible or the inspectable portion does not provide enough visual evidence.

Extract only general characteristics such as density, contrast, geometry, hierarchy, typography roles, spatial rhythm, and motion character. Treat them as inspiration for new direction. Exclude copied assets, product identity, distinctive compositions, recognizable product replication, and imitation of living designers.

Retain no image, screenshot, downloaded page, raw page content, or page asset. For a URL, retain only its HTTPS origin and path with query parameters and fragments removed. For an image, use the locator `user-supplied-image`.

## 2. Approve the creative brief

Inspect `packages/design-systems/candidates` and `packages/design-systems/releases`. Choose a new name and lowercase hyphenated identity that appears in neither location. Authoring creates only a new identity at `1.0.0`.

Propose an original creative brief containing:

1. Name and identity
2. Intended product fit
3. System signature
4. Inspired general traits and how each is transformed
5. The five excluded elements above

Request explicit creative brief approval or revisions. Write no files until the maintainer approves the brief.

## 3. Create the candidate

After approval, read [candidate-format.md](references/candidate-format.md) and [design-contract-standard.md](references/design-contract-standard.md) completely. Create a staging directory on the same filesystem as `packages/design-systems`. Write exactly `DESIGN.md`, `candidate.json`, and `evaluation/plan.json`. Keep every evaluation result and Publication Approval pending. Keep Authoring Approval pending.

Run:

```text
bun .agents/skills/author-design-system/scripts/validate-candidate.ts <staging-directory>
```

Resolve every validation error. Validation is mechanical and does not prove originality, visual quality, accessibility, or rights.

Create the candidate atomically with:

```text
bun .agents/skills/author-design-system/scripts/create-candidate.ts <staging-directory> --candidates packages/design-systems/candidates --published packages/design-systems/releases
```

Stop if the target exists. Never overwrite, merge, or create a later release for an existing identity.

## 4. Record Authoring Approval

Present a concise review of the system signature, intended fit, reference transformation, exclusions, Design Contract coverage, and mechanical validation result. Request explicit Authoring Approval that the candidate expresses the approved creative brief and is ready for Design System Evaluation.

After approval, record it with a current ISO 8601 UTC timestamp:

```text
bun .agents/skills/author-design-system/scripts/record-authoring-approval.ts <candidate-directory> --approved-at <timestamp>
```

Run the candidate validator once more. Report the candidate path, Authoring Approval, pending evaluation state, and pending Publication Approval, then stop.
