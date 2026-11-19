# Interaction Design

Use for controls, action scope, states, validation, feedback, recovery, and interruptions. [Performance](performance.md) develops waiting and delivery; [Information Architecture](information-architecture.md) develops destinations and task sequence.

## Contents

- [Actions and consequences](#define-actions-and-consequences), [controls](#make-controls-recognizable), and [priority](#set-action-priority)
- [States](#define-relevant-states) and [feedback](#give-accurate-feedback)
- [Validation](#prevent-errors-and-validate-input) and [recovery](#provide-useful-recovery)
- [Safe retries](#retry-without-duplicating-consequences) and [cancel, undo, and compensation](#distinguish-cancel-undo-and-compensation)
- [Notifications and confirmations](#choose-notifications-and-confirmations), [background work](#keep-complex-and-background-work-understandable)
- [Behavior checks](#check-interaction-behavior) and [accessibility requirements](#accessibility-requirements-and-pattern-guidance)

## Define actions and consequences

For actions with important consequences, define the purpose, affected items, availability, when the action takes effect, and how completion is confirmed. Distinguish selecting, previewing, applying, saving, submitting, and publishing. Immediate settings, saved drafts, and external actions need different feedback.

Make scope clear before commitment: one record, a workspace, selected items, or all matching results. An accepted request may still be running. Transfer can finish before processing; local saving can precede synchronization. Say when the outcome is unknown.

## Make controls recognizable

Match labels, shape, placement, and state to the actual behavior. A clickable-looking surface must offer the expected action. Map controls to the correct target; a row control must not silently affect another row or a shared setting.

| Decision | Starting choice | Check |
| --- | --- | --- |
| Navigate | Link or established navigation control | Predictable destination |
| Execute | Button or established action control | Clear target and consequence |
| Choose one option | Radio group or single-selection picker | Visible comparison versus space and hidden choices |
| Choose independent options | Checkboxes or multi-selection | Selection remains separate from execution; mixed states are accurate |
| Change a setting | Switch or established two-state control | Current state and save timing; accurate rollback after failure |
| Find a value in a large/changing set | Searchable selection | Recognizable values without exact internal names |
| Set a quantity | Direct entry, stepper, or range control | Precision, limits, units, and usable alternatives |
| Manipulate directly | Dragging or gestures when useful | Discoverability, scope, accidental activation, and alternatives |

Keep focus, hover, selection, and commitment distinct. Do not make required actions available only through hover, hidden gestures, or shortcuts. Retain discoverable paths while adding accelerators for experienced users when useful. A cue being noticed does not establish that its meaning is understood.

### Set action priority

Use the project's supported button hierarchy to distinguish the main action from supporting or routine actions. A toolbar or repeated record list may need low-emphasis controls rather than a prominent button for every action. Communicate destructive consequences without making every destructive option the dominant action. [Carbon's button guidance](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines) explains emphasis and variants; its secondary-button semantics, placement, and action counts are system conventions, not universal rules.

Keep equivalent actions predictably labeled and sized within their context. Use a label that states the actual outcome; let it wrap or choose a supported layout when necessary rather than removing essential meaning. Add an icon only when it improves recognition. A different input mode, density, or task importance can justify a supported size or emphasis variation.

Use concise labels that distinguish actions in their visible and accessible context. A conventional label such as Continue can work when the next step is clear; replace generic wording when distinct destinations or consequences are otherwise unclear. Keep helper text for constraints, formats, prerequisites, or recovery, and remove text that only repeats the label. Preserve needed labels and accessible descriptions. Use [Writing](../writing/index.md) for substantive wording or tone decisions.

## Define relevant states

Choose the distinctions relevant to this task. States can coexist; refreshing one panel need not replace the entire screen with loading.

| Situation | Communicate |
| --- | --- |
| Initial loading | What is being prepared and what remains available |
| Refresh | Existing usable content, update scope, and freshness |
| Empty collection | Why no items exist and a relevant permitted next action |
| No results | Query or filters and a way to broaden them |
| Queued/running/waiting | Actual stage and useful available actions |
| Confirmed success | What completed, at which scope |
| Failure/invalid input | Affected work, retained input, and useful correction or recovery |
| Partial outcome | Completed, failed, pending, or skipped items separately |
| Disabled/read-only | Unavailable capability and a useful reason or prerequisite |
| Permission/session problem | Access or authentication issue and a permitted next step |
| Offline/unsynchronized | Local, cached, queued, and unconfirmed work |
| Stale/conflicting content | What changed and how to review or resolve it |

Do not treat unloaded content as empty, filtered results as the entire collection, or a connection loss as confirmed transaction failure. Do not conceal protected content through an explanation. A read-only record can still contain useful information.

## Give accurate feedback

Acknowledge meaningful input promptly; distinguish receipt, pending work, and completion. Keep safe unaffected content usable. Scope blocking to the actual dependency, and preserve selection and context during updates.

Make feedback available through relevant access modes, not only color, sound, animation, or a transient visual change. Associate messages with their task. Do not repeatedly move focus or announce every small update.

An optimistic update shows the expected result before server confirmation. Use it for low-risk, reversible actions only when failure can be handled. Define pending feedback, rollback, retained input, and an explanation. Wait for confirmation when a false success could mislead an important decision. Progress measurement and waiting patterns belong in [Performance](performance.md).

## Prevent errors and validate input

Expose important requirements before commitment. Distinguish required input, accept legitimate formats, and preserve meaningful names or identifiers when normalizing presentation.

Keep a field's purpose recognizable after entry. Prefer a persistent visible label; when context makes it redundant, retain an appropriate programmatic name. A placeholder alone is not a dependable label. Keep necessary units, formats, and help available rather than disappearing with input. [WAI's labeling guidance](https://www.w3.org/WAI/tutorials/forms/labels/) explains the distinction between visible context and accessible naming. Group related fields and keep labels clearly associated with their controls; choose widths for expected content without forcing users to guess missing information.

Validate when enough evidence exists: before submission, after a completed entry, or when a corrected error can be reassessed. An incomplete value during typing is not necessarily wrong. Check submission even when inline validation exists.

Update an error when reliably corrected. Re-evaluate dependent fields together, distinguish a pending remote check from valid/invalid, and prevent an older response from overriding newer input.

Place correctable errors near their controls. A summary can help locate multiple errors but does not replace local explanation. Preserve valid entries and useful focus. Explain what a positive check proves: valid syntax does not establish deliverability, authorization, or successful payment.

## Provide useful recovery

Explain what is affected, what remains intact, and the useful next action. A service failure, expired session, forbidden action, invalid entry, and edit conflict need different recovery. Avoid unsupported causes, blame, or recovery-time promises.

Offer an action that can change the situation: correct input, reauthenticate, request access, inspect newer information, safely retry, or use an alternative/support route. A specialist may need diagnostic detail, but an opaque code is not the entire explanation.

### Retry without duplicating consequences

For an unconfirmed consequential request, provide a way to check or reconcile its status before another commitment. Loss of payment confirmation does not establish a failed payment. [Safe-retry guidance](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) explains the underlying uncertainty; Engineering must establish actual duplicate protection.

When automatic retries are supported, limit them, show waiting status, prevent overlapping submissions, and offer a stop or next action where feasible. Choose retry timing for the service. Disabling a button alone cannot guarantee that an action runs only once.

### Distinguish cancel, undo, and compensation

- **Cancel:** request that unfinished work stop; it may arrive too late or leave completed portions.
- **Undo:** reverse a supported prior change within a defined scope and availability.
- **Compensation:** counter an effect with another action, such as a refund; it may take time or not restore every consequence.

Closing a dialog or dismissing a notice need not stop a job. Keep cancellation pending until confirmed. If completion came first, explain the outcome and remaining choices.

Undo must restore the relevant state, not just remove a message. Consider shared edits and dependencies. A fleeting toast may not provide sufficient time or a durable recovery route for the task.

## Choose notifications and confirmations

Choose placement, persistence, and interruption by urgency, context, required action, and the cost of being missed.

| Need | Starting response |
| --- | --- |
| Correct local input | Nearby accessible guidance |
| Understand an ongoing condition | Persistent contextual status |
| Receive a routine result | Evident state change or nonblocking acknowledgment |
| Act later | Retrievable notification or status |
| Decide before safely proceeding | Focused blocking interaction when justified |

Dismissal does not resolve the condition. Group redundant low-urgency notices without hiding distinct important events.

Use a modal for a focused task or decision that justifies blocking the current view. Frequent work, long comparisons, or tasks needing background context may fit an inline region, panel, or page better. Scrolling alone does not make a modal wrong. [Carbon's modal guidance](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines) illustrates task and sizing choices; preserve focus, dismissal, return context, and access under the chosen pattern.

For destructive actions, expose affected objects, scope, cascading effects, and reversibility. Choose separation from routine actions, review, confirmation, or recovery according to risk. Repeated trivial confirmations can become automatic clicking. A confirmation should help detect mistakes; keep meaningful cancellation and avoid bundled promotion or misleading emphasis. Use [Design Ethics](design-ethics.md) for choice and pressure concerns.

## Keep complex and background work understandable

Expose outcomes needed for decisions without reproducing every internal step. If work continues away from the view, provide a way to return to status and results. Clarify the effect of leaving, closing, canceling, and retrying.

Make bulk-selection scope explicit, including selections beyond the visible page or changing search results. Recheck important eligibility before commitment; a refresh must not silently broaden selection.

For example, "7 updated, 2 failed, 1 still running" describes a partial outcome when those counts are known. Identify affected items and allow retry or correction of that subset when supported. Do not repeat completed external actions.

Distinguish local edits, queued changes, remote confirmation, and conflicts. Promise persistence through closing or reauthentication only when supported. Reconnection can reveal changed data or permissions; it is not permission to replay everything.

## Check interaction behavior

Exercise relevant alternatives: corrected input, repeated activation, delay, lost confirmation, denied access, partial completion, cancellation, and return. Check recognition, predictable scope, accepted versus completed work, recovery, and retained focus/input. A small control does not require every scenario.

Use actual behavior and relevant input/access modes when available. A screenshot cannot establish keyboard operation, live announcements, persistence, or recovery. For broader method choices use [Design Evaluation](design-evaluation.md).

### Accessibility requirements and pattern guidance

For web work targeting [WCAG 2.2](https://www.w3.org/TR/WCAG22/):

| Criterion | Level | Boundary |
| --- | --- | --- |
| 2.1.1 Keyboard | A | Keyboard-operable functionality, except functions inherently dependent on movement paths rather than endpoints |
| 2.5.7 Dragging Movements | AA | Single-pointer alternative without dragging, except essential dragging or unmodified user-agent functionality; keyboard alone is insufficient for this criterion |
| 3.3.1 Error Identification; 3.3.3 Error Suggestion | A; AA | Describe automatically detected input errors in text; give known correction suggestions unless they jeopardize security or purpose |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | For legal/financial commitments, stored user-controllable data changes/deletions, and user test-response submissions, supply reversibility, input checking/correction, or review/confirmation/correction; not a modal for every save |
| 4.1.2 Name, Role, Value | A | Programmatically available control identity, state, value, and changes |
| 4.1.3 Status Messages | AA | Relevant status messages in markup can be presented by assistive technology without receiving focus; not every update must be announced |

[ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) are informative behavior guidance. A modal needs appropriate entry focus, contained interaction, usable exit, and logical return focus; the original trigger may no longer exist. Delivered semantics and support require actual checks. Use [Accessibility](accessibility.md) for wider barriers and conformance scope.
