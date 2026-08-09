# Candidate format

Use this fixed candidate bundle. JSON files are UTF 8, strict, and contain no unlisted fields.

## `candidate.json`

```json
{
  "schemaVersion": "1.0",
  "status": "candidate",
  "id": "original-identity",
  "designSystem": "Original Name",
  "designSystemRelease": { "version": "1.0.0" },
  "creativeBrief": {
    "intendedFit": "The products this direction serves",
    "systemSignature": "One memorable original visual and behavioral idea",
    "referenceTransformation": "How general reference traits become distinct original direction",
    "inspiredTraits": ["general trait", "transformed trait", "general trait"],
    "excludedElements": [
      "copied assets",
      "product identity",
      "distinctive compositions",
      "recognizable product replication",
      "imitation of living designers"
    ]
  },
  "designReference": {
    "kind": "url",
    "locator": "https://example.com/path",
    "inspectedScope": "The exact visible portion inspected",
    "generalizedTraits": ["density observation", "hierarchy observation", "geometry observation"]
  },
  "authoringApproval": { "status": "pending", "recordedAt": null }
}
```

For an image, set `kind` to `image` and `locator` to `user-supplied-image`. Record only generalized observations. Never retain raw reference content.

## `evaluation/plan.json`

```json
{
  "schemaVersion": "1.0",
  "status": "pending",
  "standard": "WCAG 2.2 Level AA",
  "screens": ["marketing", "authentication", "onboarding", "dashboard", "table", "form", "settings", "states"],
  "viewports": ["1440x900", "390x844"],
  "colorSchemes": ["light", "dark"],
  "reducedMotion": true,
  "agentGenerationRuns": [
    { "id": "run-1", "status": "pending", "evidence": [] },
    { "id": "run-2", "status": "pending", "evidence": [] }
  ],
  "automatedChecks": [
    { "id": "structure", "status": "pending", "evidence": [] },
    { "id": "accessibility", "status": "pending", "evidence": [] },
    { "id": "responsive-overflow", "status": "pending", "evidence": [] },
    { "id": "color-contrast", "status": "pending", "evidence": [] }
  ],
  "humanReviews": {
    "visual": { "status": "pending", "evidence": [] },
    "accessibility": { "status": "pending", "evidence": [] },
    "rights": { "status": "pending", "evidence": [] }
  },
  "publicationApproval": { "status": "pending", "recordedAt": null }
}
```

Authoring Approval is the only field this workflow may later change. Evaluation and Publication Approval remain pending.
