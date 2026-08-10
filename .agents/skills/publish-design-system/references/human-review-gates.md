# Human review gates

Request each review separately and preserve a short Markdown record of the reviewed evidence, explicit decision, reviewer supplied reasoning when present, and UTC timestamp.

## Visual review

Show all generated screens across the evaluated modes and the independent generation evidence. Approval must explicitly assert `faithful-expression`: the implementation faithfully and coherently expresses the approved Candidate Design System Release without unapproved visual drift.

## Accessibility review

Show the generated interaction states and raw accessibility, overflow, and contrast evidence. Approval must explicitly cover every assertion:

1. `keyboard`
2. `focus`
3. `semantics`
4. `zoom`
5. `reflow`
6. `reduced-motion`
7. `assistive-technology`

Automated checks support this review but cannot replace it.

## Rights review

Show the approved creative brief, reference transformation, exclusions, generated screens, and proposed release artifacts. Approval must explicitly assert:

1. `originality`: the result is original design direction.
2. `no-proprietary-material`: it includes no copied proprietary asset, product identity, distinctive composition, recognizable product replication, or imitation of a living designer.
3. `mit-permission`: every included material may be published by AgentKogei under the MIT License.

A response about visual quality or accessibility cannot satisfy rights review. A blanket approval cannot satisfy more than one gate.
