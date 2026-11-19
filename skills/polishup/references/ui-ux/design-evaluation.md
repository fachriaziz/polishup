# Design Evaluation

Use to diagnose problems, select evaluation methods, prioritize findings, choose the extent of change, or verify repairs. A narrow task does not require a full audit, participant study, score, or separate report. Topic references supply design criteria; this reference supplies judgment and evaluation methods.

## Define the review scope

Reuse the brief, relevant tasks, conventions, findings, and constraints. Determine whether the work must identify a problem, choose an alternative, verify a repair, or assess a defined experience.

Respect the requested action and target: review reports findings without applying edits to the reviewed artifacts; changes stay within authorization. A spacing repair does not authorize a new identity. Flag consequential out-of-scope issues with evidence and follow-up.

Select tasks, views, states, users, content extremes, and access conditions that could change the decision. Shared components and actions with serious consequences may need broader checks. Local repairs can stay focused. Preserve work that already meets the need.

Assess usefulness, usability, accessibility, visual coherence, and distinctiveness separately against the brief. A familiar form may serve its task well; a striking layout may still obstruct it. Explain whether a concern violates a requirement, creates a plausible usage problem, conflicts with agreed identity, or is a stylistic preference. Do not require novelty in every component or infer usability from originality.

## Match checks to available evidence

Record the relevant version, location, state, and conditions when they affect the finding.

| Available evidence | Supports | Does not establish alone |
| --- | --- | --- |
| Screenshot | Visible hierarchy, alignment, collisions, wording, density, emphasis at the shown scale | Unshown states, navigation outcomes, keyboard behavior, semantics, persistence, or comprehension |
| Design file or specification | Intended geometry, relationships, variants, documented behavior | Delivered rendering or implemented behavior |
| Interactive prototype | Exercised paths and cues within its fidelity; participant understanding when actually observed | Backend effects, production performance, or unsupported access routes |
| Running application | Exercised behavior in recorded states and conditions | Untested roles, devices, routes, services, or users |
| Sessions with relevant users | What participants understood, attempted, and completed in those conditions | Exhaustive issue coverage, population prevalence, long-term use, or causality |

Source inspection, analytics, and support records can supplement evidence. Distinguish specification, implementation, observed behavior, and remembered reports. Confirm that inspected source code matches the running version before claiming a runtime finding.

Use tools that answer the question. If unavailable, complete supported inspection and state the remaining check. Never invent a click, screenshot, measurement, participant response, or tool result. Exercise consequential actions only within authorization.

## Choose an evaluation method

### Use heuristic evaluation

Use heuristics to identify a specific problem, explain how it arises, and describe its likely effect. Naming a heuristic is not a finding. Several principles may describe the same defect.

[Nielsen's heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) are rules of thumb, not requirements that every page have help, search, or a notification after every action. Confirm that the capability matters and is not already available elsewhere.

Use [Visual Design](visual-design.md) for craft criteria. Distinguish collisions and unintended inconsistency from a defensible expressive direction. Perceived quality and observed usability are different findings.

For accessibility, identify the requirement or user need and inspect the relevant access route. Use [Accessibility](accessibility.md#choose-accessibility-checks) for standards and assistive-technology checks. Automated checks assist evaluation; a clean run does not establish conformance.

### Use cognitive walkthroughs

For discovery of an unfamiliar route, establish the user's relevant knowledge, task, initial state, and intended actions. At each consequential step ask:

- Would the person pursue the needed goal?
- Could they notice the action?
- Could they connect it to the goal?
- Would feedback let them recognize progress?

Support answers with available interface and user evidence. Flag knowledge the interface assumes without supplying. A short task can use a focused walkthrough.

The [cognitive-walkthrough practitioner guide](https://www.colorado.edu/ics/sites/default/files/attached-files/93-07.pdf) addresses exploratory learning; it is not a complete evaluation of expert efficiency, accessibility, or recovery. Predicted user responses are not observed behavior.

### Observe users completing tasks

When justified and authorized, use a sufficiently functional artifact and participants relevant to the question. Give realistic goals without naming controls or teaching the route. Define meaningful completion, partial completion, failure, and assistance. Assisted success is not unassisted success.

Distinguish product problems from prototype gaps, ambiguous instructions, missing data, and setup failures. Choose think-aloud deliberately: narration and directed explanation can affect behavior and task time differently. Do not compare narrated and silent timings as equivalent.

Use qualitative evidence for mechanisms and variation. Population estimates require defined measures, sampling, suitable precision, and uncertainty. Two failures among five participants describe those observations, not a precise population failure rate. No fixed participant count guarantees coverage.

For comparisons, control or explain consequential differences in tasks, content, state, viewport, order, learning, and facilitation. Uncontrolled before/after changes do not establish causality. An experiment is an option for a causal question, not the default for every refinement. Use [UX Research](ux-research.md#choose-research-methods) for method selection and participant safeguards.

## Document findings with evidence

Connect the location or path, applicable requirement or goal, evidence, and practical consequence.

| Finding type | Meaning |
| --- | --- |
| Observed defect | Evidence shows a mismatch in stated conditions |
| Potential problem | A plausible mechanism needs confirmation of occurrence or consequence |
| Trade-off | Improving one supported quality costs another |
| Preference or proposal | A direction without evidence the current choice fails |

Use these distinctions without requiring a report template. A user preference can be a project constraint. Confidence in a prediction does not make it an observation.

Check alternatives before diagnosing: feedback may occur later, disabled controls may reflect permissions, and density may support comparison. A screenshot of one state does not prove every other state is absent.

Combine symptoms sharing a cause and repair; separate similar-looking symptoms with different causes. Do not target a finding count. Resolve reviewer disagreements through evidence and reasoning, using observation or another qualified perspective when needed. No reviewer is exhaustive.

## Prioritize findings

Assess blocked work, wrong commitments, data loss, exclusion, repeated effort, and presentational defects. Consider task importance, affected people, recurrence, persistence, and usable alternatives.

Keep observed frequency distinct from estimated or unknown reach. Keep confidence distinct from impact: a plausible irreversible-loss risk can deserve urgent investigation while a certain alignment defect waits. WCAG level is not a severity score.

Reuse a project severity scale when present; otherwise justify priority briefly. Do not invent percentages or precision. Effort, dependencies, migration, and regression risk affect scheduling, not the underlying harm. Shared causes may warrant coordinated repair; a safe mitigation can precede a larger fix.

## Choose the extent of change

Preserve useful behavior, content, identity, access support, and familiar routes. Repair locally when that addresses the cause. Repeated inconsistencies may justify a pattern-level change; use [Design Systems](design-systems.md).

Consider deeper restructuring when the task model prevents the outcome, local patches conflict repeatedly, or the product purpose changed. Explain the basis and what should remain; propose wider work when it is not already authorized. A requested new identity is legitimate without inventing a usability failure in the old style.

Evaluate the problem behind feedback before adopting its proposed solution. If alternatives are viable, choose for the brief or resolve consequential uncertainty. Do not create variants or replace a whole interface merely to show activity.

## Verify the changes

Identify what would demonstrate repair before changing the artifact. Retain a useful before-state or reproducible description. Repeat the affected check under comparable conditions, then inspect plausible nearby regressions.

A screenshot can confirm repaired overlap in that view; a prototype can demonstrate its supported path; an exercised application can demonstrate the tested response. A code edit alone does not prove the delivered interface changed. A successful route does not verify material failure, cancellation, or other roles.

For shared or responsive changes, check representative uses and content extremes. Inspect motion over time and measure performance where relevant. Report completed checks, results, and gaps. An unavailable check remains unverified.

## Use model-assisted review

Judge AI-generated interfaces by the same task, content, access, and quality criteria. Check [PolishUp's default pattern restrictions](rules.md), including user direction and existing-project exceptions. Report a design-policy mismatch only after checking the pattern's scope and exceptions, even when no usability failure is established. Other repeated patterns or fashionable effects remain review signals, not proof of a defect or AI origin.

Check whether a recommendation serves the brief or merely the reviewer's preferred palette, density, typography, or design system. Assess policy compliance, usability, and visual fit separately; a policy-mismatch count is not a severity or originality score.

Models and pattern detectors can suggest where to inspect. Check findings against the actual design: a flagged font, color, radius, or component is not proof of poor quality or AI authorship. Some [pattern scores](https://slopfix.getbags.app/checklist) explicitly describe model estimates rather than calibrated authorship probabilities. Do not use a detector threshold as a quality target or require a detector to complete a task.

For each important finding, verify the location, task, context, and supporting evidence. Source scans alone do not establish contrast in every rendered state; desktop captures omit mobile behavior and unshown states. A metric with no visible source is unverified from that view, not necessarily fabricated. Check available records and report limits rather than inventing absent behavior or presenting aesthetic preferences as requirements.

A model rating is not a human usability questionnaire, participant evidence, or proof of task success. Repeated self-review or agreement among models does not establish correctness. Prefer direct inspection or relevant human evidence for consequential uncertainty; another model or paid service is not required.

## Know when to stop

Stop when the requested outcome is met, important findings are fixed or reported, checks and their limits are clear, and further edits have no concrete benefit.

Keep unresolved high-impact risks visible. Do not pursue perfect scores, stylistic sameness, issue counts, or endless approval. A short review may need only prioritized findings with location, consequence, evidence, next action, and relevant preservation trade-offs. Do not manufacture praise or criticism.
