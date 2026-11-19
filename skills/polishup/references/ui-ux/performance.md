# Performance

Use for loading feedback, content availability, slow operations, work preservation, and performance measurement. [Interaction Design](interaction-design.md) defines states and recovery; this reference covers waiting and delivery.

## Identify the operation and wait

Identify the operation and what must be available or confirmed for the next meaningful action. Loading a shell, fetching choices, transferring, processing, saving, and confirming are different stages.

Keep three questions separate: measured system timing; perceived speed, predictability, and effort; and successful task completion with work retained. A pleasant wait need not be shorter, and a quick acknowledgment need not mean completion.

## Choose loading feedback

Choose feedback for the affected area, expected delay and variation, measurable progress, risk, and content that remains usable. Prefer product evidence over fixed timing rules.

| Situation | Starting treatment | Important limit |
| --- | --- | --- |
| Prompt, predictable response | Control acknowledgment and actual result | Avoid unnecessary loading flicker |
| Local wait with no meaningful total | Scoped indeterminate indicator and useful context | Not proof of server liveness or remaining time |
| Known content structure, pending values | Faithful skeleton or reserved region | Avoid fictional structure and distracting motion |
| Known total and completed work | Labeled progress, count, or stage measure | Work proportion need not equal time proportion |
| Useful partial content | Reveal coherent safe portions | Do not expose dependent actions too early |
| Long independent operation | Durable status and a return route | Leaving, closing, and canceling have different effects |

[Carbon's loading guidance](https://www.carbondesignsystem.com/building-blocks/core/patterns/loading) illustrates alternatives, not a universal ranking. Combine indicators only when each adds information. Defer an optional flashing indicator rather than delay a ready result. A transition must not keep completed work falsely labeled as running.

## Communicate honest progress

Define what a number measures: bytes, items, stages, or another observable amount. Keep the total being measured clear when moving between transfer, validation, processing, and publication.

Use a percentage only when total and completed work are meaningful. Otherwise show the known stage or count. Unequal items can support a count without predicting equal remaining time. "Upload complete. Processing file." distinguishes transfer from task completion.

Use supported estimates with appropriate uncertainty; update those that no longer fit. Do not manufacture percentages, race to an arbitrary limit, restart countdowns, or manipulate apparent progress to retain users.

For stalled progress, distinguish queued work, a dependency, lost observation, and confirmed failure where known. No visible movement does not prove failure; a looping animation does not prove continuing backend work. Communicate usable next actions without irrelevant internal detail.

## Show usable partial content

Separate shell, content, and task dependencies. An input can work before images load; a decision may remain unsafe until required data or validation is ready.

Reveal coherent groups: value, unit, label, condition, and action together. Keep guesses out of final content. Explain a dependent action's pending or unavailable state when useful.

On refresh, retain safe useful content and identify material freshness limits. Preserve selection, edits, and reading position. Constrain a consequential action when stale information could mislead. A late response to an old query must not replace current results.

Resolve loading into ready, empty, partial, or failed states. Do not leave a failed resource as a permanent skeleton or label unavailable data "no results."

## Prevent disruptive layout shifts

Inspect late images, fonts, media, messages, recommendations, and data. Reserve space when useful geometry is predictable; avoid rigid guesses that clip enlarged content or leave misleading gaps.

Preserve the reading or task anchor when content changes. Do not move targets beneath active pointers, shift focus unnecessarily, or reveal a control before it is usable and then relocate it. Check banners and errors after initial rendering, not only the first frame.

A deliberate layout change can help; zero movement is not an absolute goal. Animation can smooth a shift while leaving the underlying loss of orientation unresolved. Use [Responsive Design](responsive-design.md) for changing layout and content, or [Motion Design](motion-design.md) for intended movement.

## Prioritize media loading

Prioritize content and controls needed for useful work. Optional video, galleries, or effects must not block unrelated essential actions.

A low-detail preview can preserve context, but a blurred price or product condition cannot support a decision. A poster or first frame is not playback readiness. Plan buffering/failure feedback, controls, and relevant alternatives; autoplay is not a loading indicator.

Consider bandwidth, devices, and optional deferred media. Report file size or duration only when known and useful. Asset purpose belongs in [Art Direction](art-direction.md); playback and alternatives in [Audio & Video](audio-and-video.md). Engineering verifies actual delivery.

## Preserve work during interruptions

Identify what should survive delay, connection loss, expiry, refresh, or switching tasks, and what the product actually supports.

| Evidence | Honest status |
| --- | --- |
| Input in the current view | Active edit, not necessarily persisted |
| Confirmed local save | Stored locally within supported limits; remote acceptance may remain pending |
| Queued or acknowledged request | Waiting or accepted, not necessarily complete |
| Lost response | Outcome may be unknown |
| Confirmed result | Known completed scope and remaining work |
| Partial completion | Useful completed portion and affected remaining subset |

Retain usable content and input during temporary interruptions where permitted. Privacy, permissions, expiry, and storage can limit retention. Promise recovery after closing or signing in again only when supported.

For an unconfirmed consequential action, use [Interaction's safe-retry guidance](interaction-design.md#retry-without-duplicating-consequences). Prefer a supported status check over a potentially duplicating retry. Reconnection alone does not establish success or current validity. Bound supported retries and explain when another action is needed; avoid endless waiting and repeated notices.

## Support long-running operations

When work can continue independently, let people leave and return to its status and results. Keep enough context to recognize the job: target, submitted scope, useful time context, and current outcome.

Keep useful results and remaining failures available after switching tasks. An expiring toast should not be the only record when later action matters. Group routine events without losing important results.

Closing the view does not imply background execution or cancellation. Stopping transfer, canceling queued work, requesting processing cancellation, and undoing a completed effect are different capabilities. Explain actual limits and completed portions using Interaction's definitions.

## Choose relevant metrics

[Core Web Vitals](https://web.dev/articles/vitals) describe selected web experience signals:

| Metric | Meaning | Limit |
| --- | --- | --- |
| LCP (Largest Contentful Paint) | Largest eligible content element's render time in the viewport | Not all resources, controls, or dependencies ready |
| INP (Interaction to Next Paint) | Qualifying click, tap, and keyboard responsiveness through the next paint | Not remote-operation completion; excludes continuous scrolling, hover, and zoom |
| CLS (Cumulative Layout Shift) | Unexpected layout-shift impact under session-window rules | Not every movement or disruptive change |

The recommended good boundaries are LCP at most 2.5 seconds, INP at most 200 milliseconds, and CLS at most 0.1, evaluated at the 75th percentile of field page loads with mobile/desktop segmentation. They are web-metric guidance, not universal task waits, native-app standards, or guarantees for every person. Recheck official definitions for a new measurement plan.

Separate field observations from controlled lab runs. A load-only test misses later shifts and interactions; without meaningful interaction it cannot establish INP. Lab proxies do not replace field measurements.

Measure the relevant task when necessary: useful content, acknowledgment, next-action availability, completion, retained work, failure, and recovery effort. Define start and end points. Inspect relevant user groups and unusually slow cases rather than relying only on an average. A screenshot cannot supply measured performance.

## Check loading and recovery

Choose informative conditions: cached response, ordinary/variable wait, lost observation, failed dependency, partial results, and return. Add only relevant content, device, and access variations.

Inspect real flow with controlled delays or failures when available; label artificial conditions accordingly. Check recovery as well as waiting. Use reader evidence for perceived wait and understanding, and technical measurement for defined timings. Neither alone establishes the whole experience.

Keep status accessible without announcing every increment or requiring animation perception. Use [Design Evaluation](design-evaluation.md) for broader evidence choices. Report measured improvements only from comparable measurements, not a design rationale converted into a percentage.
