# Design Systems

Use to choose components, keep repeated design decisions consistent, or decide what shared structure a project needs. Tokens, component libraries, and a complete design system are optional.

## Reuse project conventions

Inspect the affected component family, nearby uses, guidance, and implemented controls. Identify:

- Existing labels, action placement, saving behavior, selection, feedback, and navigation.
- Available components, supported states, content limits, platform variants, and gaps.
- The version actually used. A design kit, documentation page, and implementation may differ.
- Deliberate adaptations versus defects, drift, and migration differences.

Preserve useful conventions and repair known barriers. A token names a shared design value; a component combines structure, behavior, and states; a pattern combines elements for a task. Check suitability and accessibility in use. These distinctions do not require a fixed project taxonomy.

## Choose components by task

Before choosing a component, identify the user's decision, affected items, when the action takes effect, comparison needs, required information, recovery, and input methods.

A visual match is insufficient if it changes single to multiple selection, commits unexpectedly, or cannot express a needed state. Inspect compositions too: a row containing a link and menu must distinguish their targets; making the entire card clickable does not resolve conflicting actions.

Names vary between systems. Menus, pickers, tabs, and segmented choices can look similar while having different purposes and keyboard expectations. Use [Interaction Design](interaction-design.md#make-controls-recognizable) for detailed control selection.

## Reuse, combine, extend, or create

| Situation | Starting response | Trade-off |
| --- | --- | --- |
| Existing component supports the task and states | Reuse its suitable configuration | Repair relevant defects instead of copying them |
| Several existing elements can express the relationship | Compose them | Check nested actions, focus, and duplicate feedback |
| Same role needs a bounded variation | Supported variant or scoped adaptation | Avoid options whose combinations obscure intent |
| Task needs different behavior or structure | Appropriate local solution using useful foundations | Specify access, states, content, and maintenance |
| Recurring gap has coherent needs across uses | Consider a shared component or pattern | Account for compatibility and affected consumers |
| Difference is temporary or migration-specific | Keep it explicit and bounded | Prevent accidental reuse as the new convention |

Do not stretch a component through complex exceptions merely to claim reuse. A valid one-off need does not require several future consumers; recurring shapes do not necessarily share behavior.

Share components when repeated needs, stable behavior, change cost, and maintenance justify it. Avoid fixed reuse counts, percentage-fit rules, or generalizing every duplicate.

## Define component structure and states

For a new or materially adapted component, clarify in existing annotations or documentation:

- Purpose, boundaries, required and optional content.
- Behavior, commitment, input, focus, and feedback.
- Relevant available, focused, selected, loading, error, empty, disabled, and read-only states.
- Meaningful variants with selection cues, such as emphasis, density, size, or orientation.
- Long, missing, translated, and growing content.
- Required capabilities and limits of the supplied artifact.

States may coexist: selected content can remain focused or visible while loading. Cover plausible combinations and consequential transitions, not every mathematical combination.

Smaller does not necessarily mean less important; disabled differs from read-only; loading is not merely a color. If a variant changes semantics or commitment, specify that difference. Removing a visible label affects discovery and accessible naming, even if an icon fits better.

## Maintain component consistency

Compare the same role across screens: identification, action scope, state, feedback, and recovery should remain predictable. Compare different roles that look alike too: selecting, saving, navigating, and making a destructive commitment may need distinguishable treatment.

Keep useful vocabulary and ordering. Consistency does not require identical coordinates or workflow steps. Adapt platform behavior where appropriate while retaining concepts and identity; a native-looking control should not contradict familiar native behavior.

Ask whether differences follow role, content, context, locale, platform, or intentional identity. Investigate unexplained differences before standardizing them.

## Coordinate themes and density

Reuse supported themes and settings. Check real text, surface, border, icon, and state combinations; palette replacement or inversion does not establish contrast or hierarchy.

Compact density can support comparison, but must preserve readable content and usable targets. Responsive and multilingual variants should retain operations and meaning while adapting presentation. Use [Visual Design](visual-design.md) and [Responsive Design](responsive-design.md) for those decisions.

Distinguish supported customization from unknown local overrides. A shared-role change may affect many screens; a local defect does not automatically justify changing the global default. Inspect relevant combinations of themes, states, content, and access settings rather than an exhaustive theoretical matrix.

## Decide when to use tokens

Tokens can coordinate recurring values, role-based themes, cross-tool exchange, and maintenance. Use existing tokens by intended role, not because today's color or size matches. Equal values can represent different roles and legitimately diverge later.

[Atlassian's token guidance](https://atlassian.design/tokens/design-tokens/) demonstrates role-based selection; its names and hierarchy are organizational conventions.

Without tokens, use consistent project values or variables as needed. Add shared names when they resolve ambiguity or repeated work. Do not introduce a large palette, several alias layers, or a pipeline without a concrete need.

For exchange between tools, consult the [Design Tokens Community Group (DTCG) reports](https://www.designtokens.org/technical-reports/) and verify actual tool support. The 2025.10 reports are Final Community Group Reports, not W3C Standards. An exchange format does not determine usability or a universal naming scheme. Matching names do not prove synchronized roles or values.

## Choose and adapt system guidance

Evaluate a system against tasks, platform, access needs, languages, identity, available implementation, and maintenance. A mature system offers defaults with potential adaptation and update costs.

When guidance is missing, first inspect suitable platform controls and available project components. Select mature knowledge per aspect, such as a documented spacing scale, appropriate typography styles, semantic color relationships, and relevant interaction patterns. One system need not govern every aspect. Compare purpose, platform, font, density, states, enlargement, and localization; popularity or an attractive screenshot does not establish fit.

Check related choices together: type with control height and padding; density with readability and target size; foreground colors with backgrounds; layout with input, reading direction, and platform behavior. Keep equivalent roles consistent within comparable contexts. Borrow principles and supported relationships without copying a source's whole identity, token names, or every house rule. Follow existing names and semantics when using an actual implementation rather than pretending renamed resources behave differently.

For a small project, establish only the needed spacing and type roles, semantic color pairs, control emphasis and states, and consistent borders, corner radii, and elevation. Use [Visual Design's spacing fallback](visual-design.md#choose-a-spacing-scale) only when no suitable convention exists. No token package, complete library, or named-system selection process is required. Inspect representative real content, a form/control, relevant failure or focus states, and a constrained layout before repeating the choices. Record consequential choices in existing project notes when useful.

Keep source scope beside consequential examples: a calibrated font pair, native target size, or system-specific variant is not a universal standard. Use knowledge already available; consult further sources when an unresolved decision or version question warrants it. A narrow repair does not require a survey of design systems. Make a justified adaptation when needed without claiming it was prescribed or validated by a source.

A small site may need consistent controls; a growing product may justify shared components; a multi-product organization may need broader stewardship. A design kit and a code library are separate adoption decisions.

Change established projects at a scope preserving usable consistency. Identify affected uses, incompatibilities, and transition needs when changing shared decisions. Do not silently mix incompatible versions or report planned migration as complete. A brief note can suffice; avoid governance and release machinery for a one-page task.

## Check consistency across uses

Check affected components with realistic content and relevant states:

- Does the component fit the task, scope, and commitment?
- Are similar roles predictable and intentional differences understandable?
- Do content, locale, theme, input, and access variations remain usable?
- Does the actual implementation support the designed variant and behavior?
- Does shared complexity solve a real need?

Static comparison can reveal visual drift, but cannot establish keyboard operation, semantics, recovery, or compatibility. Inspect rendered behavior when available. A reputable library does not guarantee that the resulting interface is usable or accessible.

For example, reconciling immediate-save versus explicit-Save behavior may matter more than matching colors. A design-kit variant unavailable in code needs a supported adaptation or scoped extension, not a claim that it has been delivered.

Coordinate content meaning with [Writing](../writing/index.md), and implementation structure and dependencies with Engineering. This reference specifies design decisions, not a component API, code architecture, or tool.
