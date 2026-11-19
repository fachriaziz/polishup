# Tools and Verification

Use when a task needs artifact inspection, executable checks, or an unavailable capability. Select tools by the question they can answer. This reference adds no required provider, setup document, or full-audit workflow. Use [Task Research](research.md) for research decisions and the relevant domain reference for quality criteria.

## Reuse project context

Inspect the target and relevant instructions, components, styles, terminology, contracts, and check commands. Distinguish documented decisions, observed conventions, and assumptions. An undocumented project still has work worth preserving. Resolve consequential conflicts; do not turn a local repair into a redesign.

Reuse existing project documents. Record missing durable decisions only when requested or within an authorized setup task, in an existing suitable location. Session summaries and inferred preferences are fallible context. Do not require new configuration or copy the whole repository into context.

## Select available capabilities

| Need | Useful capability | Limit |
| --- | --- | --- |
| Current methods or API behavior | Documentation, search, or source retrieval | Read the source; a search snippet is not verification |
| Intended design | Design-file inspection | Does not establish delivered behavior |
| Rendered appearance | Relevant screenshot plus geometry and computed styles | Capture alone is not visual inspection |
| Interaction and states | Browser or equivalent interactive tools | Verify the actual route, not just a visible control |
| Accessibility | Suitable automated checks plus relevant manual routes | A clean scan does not establish full conformance |
| Code behavior | Project lint, type checks, and focused tests | A passing check covers only its assertions |
| Writing conventions | Project terminology/style checks and contextual review | Rules do not establish facts or authorship |
| Other artifacts | Appropriate native or specialist tools | Do not force a browser or bundled domain onto unrelated work |

Use an adequate existing tool before adding an equivalent. A CLI cannot universally discover a harness's private tools. Do not install software, register MCP servers, or change configuration merely because an optional check is unavailable. Report the gap and continue supported work. Run a helper only when its actual location, runtime, inputs, and side effects are known; bundled resources still need a supported execution capability.

## Inspect a focused UI target

Identify the page/component, state, viewport and relevant content. Collect only what answers the question: screenshot region, bounds, padding/gap, typography, effective color pairs, overflow, or interaction observations. Reuse an available style/evaluation capability for repeated measurements; do not build a browser or inject source overlays for an ordinary review.

Compare equivalent roles against project conventions. Different values may reflect intentional variants. A computed font stack does not identify every fallback glyph; source declarations do not prove rendering. Inspect screenshots when visual judgment is needed and supported. Keep unviewed captures and untested behavior explicitly unverified.

Preserve the original state. Use an owned session or an authorized preview when changes to viewport, content or media settings are needed. Restore temporary settings and close only owned resources. Do not silently hide overlays or edit source to improve a review result.

## Choose checks for the task

Select conditions that could change the result; avoid every theoretical combination:

- Layout/content: narrow space, longer realistic text, missing or dense data, relevant locale and direction, text enlargement, or spacing overrides. Check loss of information and actions. Intentional scrolling or accessible truncation is not automatically a defect.
- Interaction: relevant keyboard/pointer routes, focus transitions, menus/dialogs, validation, loading, empty/error states, and recovery. Exercise hidden states before scanning them. An ARIA snapshot alone does not establish keyboard or screen-reader usability.
- Motion/media: relevant playback, interruption, reduced-motion and available controls. A static screenshot cannot verify motion.
- Performance: investigate observed loading, response or stability problems with available measurements. Distinguish controlled local results from real-user data.

Use [Responsive Design](ui-ux/responsive-design.md) and [Accessibility](ui-ux/accessibility.md) for applicability and exceptions. Device pixel ratio, viewport emulation, browser zoom and actual-device testing are different checks. WCAG text-spacing values describe user-override resilience, not mandatory authored typography. Keep synthetic fixtures temporary and labeled; retain genuine delivered content.

## Verify changes and report evidence

Compare the affected before/after work or use a suitable native diff. The whole worktree diff need not belong to this task. Preserve identity and useful interactions, Writing meaning/facts/protected text, and Code contracts within the requested scope. Investigate differences before normalizing them. Use [Design Evaluation](ui-ux/design-evaluation.md), [Writing Review](writing/review-and-revision.md), or project checks for deeper decisions.

Report location, conditions, observation, applicable criterion, consequence and a useful next action. Separate confirmed defects, potential problems, trade-offs and preferences. For executable checks distinguish pass, fail, incomplete, not-applicable and execution errors; report what was not checked. Never convert missing evidence into a pass or a guessed quality score.

Recheck the changed target and affected shared behavior proportionately. Stop when the requested outcome is met. Avoid repeating unchanged checks or starting benchmarks and additional model reviews without an agreed need.

## Optional color helpers

The skill carries a prepared Node helper for provided color pairs, palette candidates and an optional preview. Read [Color Tools](colors.md) for invocation, inputs and limits. No global CLI or npm dependencies are needed to execute it. These calculations do not inspect a rendered page or decode images. If the harness cannot run the helper, use an adequate available checker or report the missing check.

Operational references: [Playwright emulation](https://playwright.dev/docs/emulation), [axe API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md), and [W3C text-spacing explanation](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html). Verify actual tool/version support before relying on a particular operation.
