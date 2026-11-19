# UX Research

Use when the design goal, user need, evidence, or direction is unresolved. For a settled narrow task, use the relevant section without reopening product strategy.

## Frame the problem

Inspect the brief, current product, content, components, brand guidance, design files, constraints, feedback, and prior research as relevant. Reuse established decisions. A project requirement states what is requested; it does not prove user demand.

Establish enough context to decide:

- **Outcome:** what people must understand, decide, accomplish, or experience; what prevents it.
- **People:** users and affected groups, including operators, buyers, administrators, and customers with different interests.
- **Situation:** task trigger, environment, devices, interruptions, dependencies, and work before or after the screen.
- **Limits:** requested deliverable, business objectives, commitments, non-goals, resources, and deadline.
- **Success:** useful improvement and behavior or identity to preserve.

Separate needs from solutions. “Add a dashboard” specifies an approach; locating unresolved exceptions before handover describes a possible need. Verify that interpretation. Reframing does not authorize replacing an explicitly requested implementation or expanding scope.

Expose tensions between business and user goals. Informed plan selection can support subscriptions; concealing terms to increase conversion creates a conflict. Seek an approach serving legitimate objectives without hiding consequences.

Framing can evolve during exploration. If a sketch reveals missing data rather than a layout problem, revisit that assumption without restarting all discovery.

## Understand user tasks

Describe relevant behavior and conditions, not invented demographic biographies. Domain expertise, product familiarity, use frequency, language, permissions, and access needs can affect decisions independently.

For complex work, identify the trigger, desired end state, inputs, decisions, handoffs, tools, and consequential exceptions. Inspect workarounds: an accompanying spreadsheet may reveal missing functionality or a necessary approval. Determine a step's purpose before removing it as friction. Use a diagram only when it clarifies complexity.

Use mental models to describe how users expect objects, terms, steps, status, and consequences to work. Compare these expectations with observed behavior; clicks alone do not reveal motives. Preserve familiar conventions and explain necessary differences.

## Assess evidence and assumptions

| Basis | Supports | Does not establish alone |
| --- | --- | --- |
| Requirement or project convention | What the project requests or commits to | User demand |
| Observation or measured behavior | What happened under recorded conditions | Intent, prevalence, or causality |
| Participant report | That person's account or evaluation | Accurate recall or future adoption |
| External research or professional guidance | Findings within its population, task, and scope | Transfer to every product; heuristics and standards have different authority |
| Assumption, interpretation, or preference | A proposed explanation or choice | An observed user fact |

Check evidence age, product version, method, missing groups, and relevance. Support tickets omit people who never contact support; analytics omit untracked behavior. Few complaints do not prove few problems.

When findings conflict, inspect segments, tasks, definitions, and collection methods. Seek counterexamples to consequential assumptions. A rare severe access barrier can outweigh a frequent inconvenience.

Record the basis for major decisions in existing notes. Never invent interviews, quotations, researched personas, sample counts, or validation. Model-generated personas can suggest hypotheses; they are not evidence from participants.

## Ask, research, or proceed

Identify the uncertainty that could change the decision, consequences if wrong, and reversibility.

| Situation | Action |
| --- | --- |
| Answer exists in supplied material or the current product | Inspect it rather than asking again |
| Missing intent, authority, scope, or business constraint would materially change work | Ask a focused stakeholder question; public research cannot establish a private decision |
| Unknown concerns actual behavior, comprehension, or use conditions | Use relevant user evidence or an appropriate research method |
| Choice is low-risk, reversible, and has a defensible project or platform default | Proceed; disclose assumptions that materially affect the result |
| Consequential unknown cannot be resolved | Keep that choice provisional, explain the consequence and next check, and complete unaffected work |

Ordinary design work does not authorize participant contact, published experiments, or external sharing of private research. If tools or access are unavailable, use authorized artifacts and state limitations rather than reporting simulated research.

Stop when evidence is adequate for the scoped decision. More browsing cannot establish an individual's unobserved needs or a missing stakeholder decision.

## Choose research methods

Reuse relevant findings. Choose methods for the question, available access, risk, and evidence needed. Do not let a tool or fixed sequence determine the method.

| Question | Suitable starting approach | Limit |
| --- | --- | --- |
| What exists and constrains the solution? | Product, brief, system, support, and domain-source inspection | Omits needs absent from those materials |
| What are people trying to achieve? | Contextual interviews, recent incidents, real-artifact walkthroughs | Hypothetical enthusiasm does not predict adoption |
| How is work actually done? | Observation, contextual inquiry; diaries for behavior over time | A small purposive sample does not measure prevalence |
| Can people understand and complete a task? | Task-based usability sessions with a sufficiently functional artifact | Does not establish demand or long-term adoption |
| How do people group or locate information? | Card sorting for grouping hypotheses; tree testing for findability | Neither produces a complete visual navigation design |
| How common is an issue or attitude? | Suitable survey or behavioral data with a defined population and measures | Does not establish causes or unmeasured explanations |
| Did a change affect an outcome? | Authorized, properly designed experiment; observational comparison with stated limits otherwise | Uncontrolled before/after differences do not establish causality |
| Which visual or interaction approaches might fit? | Focused reference research and meaningful concept comparison | Attractive examples do not validate usability |

[NN/g's methods comparison](https://www.nngroup.com/articles/which-ux-research-methods/) distinguishes attitudes, behavior, qualitative and quantitative inquiry, and use context. Combine methods when they resolve a meaningful gap, without a triangulation quota.

### Work with participant evidence

Recruit for relevant experience and variation, including newcomers, nonusers, or excluded users where needed. Colleagues and current customers may not represent them. Include relevant language and access needs; one participant cannot represent every disability or assistive strategy.

Use neutral prompts about specific events. Ask “Show how you handled the last failed import” rather than “Would this smart dashboard help?” Give usability participants a goal without teaching the route. Separate their words from interpretation and retain contradictory findings.

Explain participation and data use; obtain appropriate collection and recording consent, protect confidentiality, and avoid unnecessary sensitive data. Provide usable communication and accommodations. Do not upload identifiable research to external tools without authorization.

Choose sample size for the method, participant variation, and risk. There is no universal count. Information power, the relevant information an interview sample provides, is not a sample-size formula for experiments or usability tests. Population estimates and effect comparisons need suitable sampling and statistical justification. Limited access requires narrower claims, not unsupported claims of representativeness or saturation.

## Set an initial design direction

Reuse established tasks, real content, audience, brand, platform expectations, components, and constraints. A missing design-system file does not make an existing interface a blank slate. Separate missing visual direction from unknown user needs; resolve gaps that change this task. A missing formal system does not require adopting a complete one.

Before substantial visual work, define enough character, hierarchy, density, and conventions to guide implementation. Turn broad style requests into concrete choices; do not assign a style from the industry alone. Use [Art Direction](art-direction.md) to research references or compare meaningfully different concepts when the choice warrants it.

Research only gaps that could change the result. Use relevant guidelines, comparable products, and user evidence to answer questions about tasks, interaction, density, content, or identity. Comparing system names or spacing numbers alone does not establish fit. When existing guidance suffices, proceed; a small repair needs no new moodboard or approval cycle.

Use [Visual Design](visual-design.md) for craft choices. Its spacing fallback fills missing spatial choices after context is understood; it does not choose the direction or replace needed research. When evidence or tools are unavailable, state consequential assumptions and keep affected choices provisional. Record useful rationale in the existing deliverable without requiring a separate design-system document.

## Define requirements and success criteria

Connect a finding to a necessary capability before prescribing a component. If people lose their place while comparing records, specify what context must remain available, then evaluate suitable approaches.

Choose criteria representing outcomes and risks. “Three cards exist” describes an output; “an operator can identify the import needing action and explain its status” describes a task outcome. Clicks, session length, and completion speed can improve or worsen an experience depending on purpose.

Connect goals to observable signals and appropriate measures, following the distinction in [Google's user-centered metrics research](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/). Do not require every HEART category, invent baselines, or add instrumentation for a minor task. Mark unestablished targets as proposals.

Ask whether the criterion could pass while the problem remains. Successful submission does not prove someone understood the commitment. When useful, record the need, evidence, decision, trade-off, and remaining check in the deliverable. A plausible explanation is not user validation.

Use [Information Architecture](information-architecture.md) for grouping and flows, [Design Evaluation](design-evaluation.md) for evaluation and repair priority, and [Purpose, Audience & Context](../writing/purpose-audience-context.md) or [Content & Evidence](../writing/content-and-evidence.md) when the unresolved issue concerns communication.
