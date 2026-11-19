# Accessibility

Use to identify access barriers, support assistive technologies, apply relevant standards, or check accessibility. Read the needed sections; a local repair does not require a full conformance audit.

## Contents

- [Access barriers](#identify-access-barriers) and [applicable standards](#choose-the-applicable-standard)
- [Visual information](#make-visual-information-accessible)
- [Structure and labels](#specify-accessible-structure-and-labels), [control semantics](#choose-control-semantics)
- [Input and focus](#support-input-and-focus), [cognitive barriers](#reduce-cognitive-barriers)
- [Motion and media alternatives](#plan-motion-and-media-alternatives)
- [Checks](#choose-accessibility-checks), [user participation](#include-users-with-varied-needs), and [findings](#prioritize-and-report-barriers)

## Identify access barriers

Identify what people must perceive, understand, operate, and complete, including sign-in, help, and correction. Look for unnecessary dependence on sight, hearing, fine movement, memory, speed, or one input method.

| Barrier | Design response to investigate |
| --- | --- |
| Meaning depends on color, position, image, or animation | Equivalent meaning through text, structure, semantics, or another usable presentation |
| Fine movement, dragging, holding, or rapid actions | Operable controls, alternatives, suitable targets, and manageable effort |
| Memory, unfamiliar instructions, or disappearing information | Persistent context, clear next actions, assistance, timing, and recovery |
| Essential audio | Suitable visible/textual access and playback control |
| Motion, flashes, or competing sensory feedback | Reduced interference, appropriate control, and separate standards checks |

Use project requirements and relevant user evidence. Ask about a functional need rather than a diagnosis. Do not infer ability or preferred assistance from identity. Preserve technical depth, dignity, and expression; inclusion does not require one sparse layout or infantilizing language.

## Choose the applicable standard

Identify product, platform, version, conformance level, and scope when a standard affects the task. For web design without a declared target, use [WCAG 2.2 A and AA](https://www.w3.org/TR/WCAG22/) as a practical baseline, then check applicable project requirements and user needs. A different declared target needs its own assessment. Recheck publication status and relevant errata when version changes matter; a draft is not an adopted requirement.

| Authority | Use and limit |
| --- | --- |
| WCAG 2.2 | Published Recommendation with normative web-content criteria. AA includes A and AA; AAA is not automatically required for AA |
| [WCAG 3](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/) | Work in progress, not the production conformance baseline. At the 2026-11-13 check, the latest published version was the 2026-09-10 Working Draft. Do not replace WCAG 2 requirements or mix draft tests into a WCAG 2 claim |
| [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/) and [ARIA in HTML](https://www.w3.org/TR/html-aria/) | Define accessibility semantics and their permitted use with HTML. ARIA 1.2 is a Recommendation; 1.3 remained a Working Draft at the same check. These are not substitutes for WCAG, keyboard behavior, or tested support |
| Understanding, techniques, and ARIA APG | Informative explanations and approaches, not extra criteria or proof of implementation |
| [WCAG2ICT](https://www.w3.org/TR/wcag2ict-22/) | Informative application guidance for non-web documents/software, not a separate native-app conformance standard |
| [Making Content Usable](https://www.w3.org/TR/coga-usable/) | Supplemental cognitive-access guidance, not additional mandatory WCAG criteria |
| Platform guidelines | Platform behavior and recommendations; units and rules cannot be substituted into web criteria indiscriminately |

A contract, procurement requirement, or jurisdiction may identify another target. Verify it when material; a style guide does not establish legal compliance.

Draft guidance can inform clearly labeled exploration; assess conformance against the applicable published target.

Conformance covers defined full pages and complete processes, relevant responsive variants, and relied-on technology. One component, color check, or successful step cannot establish it. Mark a criterion applicable, inapplicable with a reason, or untested as supported.

## Make visual information accessible

Distinguish text, essential controls/states, meaningful graphics, and decoration. Use [Visual Design's contrast and reading-flexibility requirements](visual-design.md#standards-and-reading-flexibility) and [Responsive Design](responsive-design.md) for enlargement and changing space.

Do not communicate an important distinction only through hue, position, or visual change. Pair it with usable labels, shapes, patterns, or semantic relationships. Two differently colored badges with the same spoken name still leave a nonvisual gap.

Inspect relevant states, themes, images behind text, and user settings. A dark palette, screenshot estimate, or color-vision simulation does not establish every contrast requirement. Preserve identity while repairing the failing relationship.

## Specify accessible structure and labels

Specify what each important element is, its name, state/value, relationships, and changes. Headings, regions, groups, lists, tables, field instructions, and errors need meaningful delivered structure. Bold text is not automatically a heading; aligned numbers do not automatically form an accessible table.

Prefer suitable native controls and HTML semantics for web work. Add ARIA where needed to express missing meaning, rather than putting roles and labels on everything. A custom control needs its expected name, role, state, relationships, keyboard behavior, and compatibility checks. [ARIA APG](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/) explains that a role alone does not add behavior and overrides can remove useful meaning. Its examples require testing with the relevant browsers, assistive technologies, and touch/mobile conditions before production use.

Coordinate reading order, focus order, and visual emphasis. They need not have identical pixel order. Static content need not all be keyboard-focusable for screen-reader reading. WCAG 2.4.3 Focus Order, A, preserves meaning and operability where order matters; more than one sequence can work.

### Choose control semantics

Follow [APG keyboard conventions](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) and the relevant component pattern when designing a custom composite control. Tab usually moves between components; the appropriate pattern defines movement within a menu, tab set, listbox, or grid. Do not make every cell or decorative element a separate tab stop by default.

- Ordinary site navigation can use links and disclosure controls; a visual dropdown does not automatically require application-menu semantics.
- A readable data table and an interactive grid have different behavior. Choose grid semantics only when the task needs that interaction and its keyboard support can be supplied.
- Keep exposed states synchronized with actual expansion, selection, checking, or operation. An annotation or ARIA attribute does not implement the behavior.
- Give controls a usable name and associate needed help or errors. Avoid overriding visible wording with an unrelated or unnecessarily verbose name, or hiding a usable control from assistive technology while leaving it keyboard-focusable.

For updates, distinguish routine status from an urgent alert. Preserve a way to inspect important messages, avoid announcing every increment, and do not move focus merely to announce progress. Use [Interaction Design](interaction-design.md#give-accurate-feedback) for feedback and deliberate focus changes. Check actual accessibility information and behavior; annotations describe intended support.

These semantics apply to the web. Native interfaces need equivalent platform support. UI/UX specifies meaning, operation, and focus behavior; Engineering implements them. A mockup can describe requirements but cannot prove they work.

## Support input and focus

Provide required functions through supported keyboard and alternative input paths. A hidden gesture, hover, precision, or rapid sequence should not be the sole route. Reuse [Interaction's criteria](interaction-design.md#accessibility-requirements-and-pattern-guidance) and [Input methods](responsive-design.md#support-different-input-methods).

Keep focus perceivable and logically managed when elements open, close, disappear, or change presentation. Focus is not selection or activation. Do not trigger an unexpected consequential context change merely on focus.

Distinguish 2.4.7 Focus Visible, AA; 2.4.11 Focus Not Obscured (Minimum), AA; and 2.4.13 Focus Appearance, AAA. A preferred ring style is not the only valid pattern, and AAA geometry must not be presented as an AA requirement.

For labeled controls, 2.5.3 Label in Name, A, requires the accessible name to contain the visible label text, including images of text. An unrelated hidden label can obstruct speech input.

Consider effort, not just theoretical reachability. Support bypassing repeated regions and reaching important structure. A keyboard route alone does not satisfy the single-pointer dragging alternative. A screen-reader user need not use a desktop keyboard.

## Reduce cognitive barriers

Make the task, required information, next action, consequences, and recovery clear. Use [Accessibility & Inclusive Writing](../writing/accessibility-and-inclusion.md) for language and equivalent meaning and [Information Architecture](information-architecture.md) for orientation.

Keep instructions available rather than relying on placeholders or recall. Preserve valid entries after errors. Place repeated help predictably where relevant. Give appropriate warning, time, extension, or recovery under the applicable timing criterion and actual constraints.

Offer useful optional assistance without making a separate accessibility mode the only operable route. Cognitive guidance does not require pictures everywhere, one-screen steps, or removing technical depth.

Inspect authentication and recovery for memory, transcription, puzzle, and device dependencies. Under WCAG 3.3.8 Accessible Authentication (Minimum), AA, a step must not require a cognitive-function test unless it supplies a permitted alternative or assistance, or meets the object-recognition or personal-content exception. Support password managers and copy/paste where appropriate; the criterion does not ban passwords or require one technology. Multi-factor and recovery authentication steps also need attention. An allowed exception may still leave unmet needs. Do not weaken security or promise unsupported recovery.

## Plan motion and media alternatives

Keep essential meaning available without one sensory channel or effect. Sound or haptics can supplement a visible message, but neither is a universal substitute.

| Concern | WCAG boundary |
| --- | --- |
| Interaction-triggered motion | 2.3.3, AAA: motion animation can be disabled unless essential |
| Automatic movement or updating | 2.2.2, A: moving/blinking/scrolling information that starts automatically, lasts over five seconds, and accompanies other content needs pause/stop/hide unless essential. Automatic updates alongside other content need pause/stop/hide or update-frequency control unless essential, without the five-second condition |
| Flashes | 2.3.1, A: no more than three flashes in any one-second period, or below the defined general/red-flash thresholds |
| Automatic audio | 1.4.2, A: audio playing for more than three seconds needs pause/stop or volume control independent of system volume |

Inspect the full criterion, exceptions, and actual presentation when compliance matters. Reduced motion, short duration, or a pause control does not establish flash safety. A still image cannot verify a flashing sequence.

Use [Motion Design](motion-design.md) to specify a complete reduced alternative that preserves task, status, and context. Use [Audio & Video](audio-and-video.md#plan-media-accessibility) for live/prerecorded and audio/video distinctions, captions, transcripts, and audio description. Writing supplies faithful alternatives; Engineering verifies timing, semantics, and delivery. Do not invent descriptions of unavailable media.

## Choose accessibility checks

Use [Design Evaluation](design-evaluation.md#match-checks-to-available-evidence) for general artifact limits. For access questions, inspect the specific route: contrast, keyboard, zoom, accessibility information, screen-reader operation, media alternatives, or task completion.

Use automated findings to guide inspection. No reported errors means only that the tool detected none in that run. A score is neither the percentage of people served nor proof of WCAG conformance. Widgets and automated fixes do not replace checking the actual experience.

Test affected tasks and plausible regressions for a focused change. For a requested broader assessment, [WCAG-EM 2.0](https://www.w3.org/TR/wcag-em-2/) can frame scope, states, sampling, and reporting. It is an evaluation method, not extra criteria or a mandatory stage. A sampled assessment alone does not justify a whole-product claim.

## Include users with varied needs

Combine relevant [disabled-user evaluation](https://www.w3.org/WAI/test-evaluate/involving-users/) with standards assessment; neither replaces the other.

For authorized research, make recruitment, consent, tasks, session tools, communication, timing, and feedback channels usable. Support relevant assistive setups, breaks, privacy, and compensation. Distinguish a product barrier from an inaccessible research method or unfamiliar setup.

One person or disability group cannot represent everyone. Simulations and model-generated personas do not replace evidence from people with those needs.

## Prioritize and report barriers

Prioritize blocked tasks, trapped interaction, hidden commitments, lost work, and absent usable alternatives. Consider impact, reach, and frequency separately from confidence. Conformance level is not a severity ranking.

Repair the cause: a hidden label cannot fix wrong behavior, and simpler copy cannot create a missing recovery route. Preserve effective content and supports.

Report location/state, task or access route, observation, applicable need or criterion, proposed repair, and remaining verification. Distinguish observed failure, potential barrier, intended support, and unperformed checks. Include relevant platform/tool versions for behavioral evidence. A finding that mockup states differ only by color can be supported without claiming uninspected runtime semantics.
