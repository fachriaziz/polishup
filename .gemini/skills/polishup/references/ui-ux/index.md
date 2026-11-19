# UI/UX References

Apply relevant [UI/UX rules](rules.md) and [Writing rules](../writing/rules.md). Choose references for unresolved design decisions; preserve unrelated work during narrow repairs.

| Reference | Use when |
| --- | --- |
| [UI/UX Foundations](foundations.md) | Resolving shared design priorities or domain responsibilities |
| [UX Research](ux-research.md) | Goals, users, tasks, constraints, assumptions, research, success criteria, or the direction of a new interface without a design system are unresolved |
| [Information Architecture](information-architecture.md) | Organizing destinations, navigation, search/filter scope, task sequence, findability, or return paths |
| [Interaction Design](interaction-design.md) | Choosing controls, commitment, feedback, states, validation, confirmation, retry, undo, or recovery |
| [Visual Design](visual-design.md) | Hierarchy, grouping, alignment, layout, spacing, typography, color, density, shape, depth, or craft |
| [Art Direction](art-direction.md) | Choosing a coherent direction, comparing visual approaches, researching references, or selecting assets, crops, representation, and reuse |
| [Responsive Design](responsive-design.md) | Adapting to space, content, language, text resizing, zoom, orientation, or input while preserving work |
| [Accessibility](accessibility.md) | Access barriers, inclusive participation, WCAG version/status, ARIA/native semantics, keyboard/focus patterns, cognitive/sensory support, or accessibility checks |
| [Motion Design](motion-design.md) | Animation purpose, timing, easing, sequences, continuity, interruption, scroll-driven effects, or reduced motion |
| [Performance](performance.md) | Loading, progress, partial content, slow or unreliable conditions, work preservation, or performance metrics |
| [Design Systems](design-systems.md) | Components, reusable patterns, guidance per design aspect, composition, variants, themes, tokens, or cross-screen consistency; a complete system is optional |
| [Design Ethics](design-ethics.md) | Consequential choices, permissions, pricing, exit, safeguards, manipulation risks, or trust claims |
| [Design Evaluation](design-evaluation.md) | Selecting evaluation methods, interpreting detector findings, separating defects from preferences, choosing changes, verifying repairs, or stopping |
| [Data Visualization](data-visualization.md) | Charts, tables, dashboards, dense record work, comparison, exploration, missing or stale data, uncertainty, or data access |
| [Audio & Video](audio-and-video.md) | Video/audio purpose, placement, autoplay, playback states and controls, media alternatives, or sound cues |

For overlapping topics, Interaction Design covers actions, states, and recovery; Performance covers waiting and delivery; Responsive Design covers changing space, content, or input.

When a new interface has no clear direction, use UX Research and, if needed, Art Direction. A missing design system alone does not require broad research or building a complete system.

For narrow work, go directly to [layout and spacing](visual-design.md#define-layout-and-spacing), [typography](visual-design.md#define-typography-styles), [form validation](interaction-design.md#prevent-errors-and-validate-input), [keyboard and focus](accessibility.md#support-input-and-focus), [reduced motion](motion-design.md#provide-reduced-motion-alternatives), or [playback controls](audio-and-video.md#provide-usable-playback-controls). Retain the relevant conditions and exceptions.

Use Data Visualization for representation or dense record work; add Visual Design or Information Architecture for unresolved presentation or navigation. Add Accessibility or Performance when playback work also needs access or delivery guidance.
