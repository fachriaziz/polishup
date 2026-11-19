# Motion Design

Use to decide whether movement helps, choose its treatment, or evaluate an effect. [Interaction Design](interaction-design.md) defines action and state meaning; motion defines how the change is presented.

## Define the purpose of motion

Identify what people should notice, understand, control, or experience. Feedback, orientation, explanation, attention, and expression are valid purposes. Match the effect to frequency of use and context.

Use local feedback to acknowledge input without implying success. Movement can show a change of location; repeated decorative effects can interrupt routine work. Compare static changes, short transitions, or longer sequences only when useful. Apply the [default restrictions on decorative motion](rules.md) before adding new effects; retain useful feedback and approved motion patterns.

[Carbon's motion guidance](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) illustrates productive and expressive roles; its exact values are system choices. Attracting attention does not prove that users understand an action or can find it again.

## Define animation states

Identify meaningful start, intermediate, and end states; what persists; and what must remain understandable without the effect. Keep identity through useful labels, grouping, anchors, and spatial relationships.

| Relationship | Possible treatment | Check |
| --- | --- | --- |
| Local state change | Restrained response | Neighboring controls remain stable |
| Appearance/disappearance | Direct change or opacity | Spatial information is not needed or lost |
| Move between meaningful locations | Trackable path | Source and destination remain clear |
| Expand/contract | Reveal containment | Preserve readable content and a useful anchor |
| Navigate | Contextual transition | Do not imply a false hierarchy or direction |
| Explain a process | Staged changes | Important intermediate relationships can be inspected |

Do not morph unrelated objects into false equivalence. Scaling text or controls can distort them; fading can remove needed continuity. Choose for the relationship, not physical realism. If exact before/after comparison matters, keep values, annotations, a trail, replay, or another persistent view.

## Set timing and response

Check when input is acknowledged, how the effect develops, and when the next action is available. Shortening duration does not fix delayed acknowledgment. A smooth animation can still block work.

Reuse suitable project animation patterns. Adjust timing for distance, affected area, complexity, repetition, user control, and information to understand. Neither distance alone nor one fixed duration suits every effect.

Inspect cumulative delay: many short effects can become a long wait. Do not hold ready content or controls behind decorative timing. A small stagger can clarify order, but should not delay required acknowledgment.

For complex explanations, allow pause, revisit, or inspection when needed. Simplify or retain comparison information instead of merely slowing everything.

## Choose easing and motion behavior

Easing controls progression over time.

| Behavior | Starting consideration | Risk |
| --- | --- | --- |
| Arrive and settle | Deceleration | Long tail obscures readiness |
| Leave | Acceleration when tracking is unnecessary | Recoverable nearby content may need continuity |
| Begin and end in view | Balanced acceleration/deceleration | Slow start delays visible response |
| Represent constant rate or timing | Linear progression | Expressive easing changes the meaning |
| Gesture release or changing target | Dynamics from current position and useful velocity | Excessive bounce or settling interferes with work |

Spring-based motion can redirect an object from its current position and velocity. It is not always better or more accessible. Bouncing may suit playful expression but misrepresent a precise value. Coordinate related effects without forcing identical timing.

Commitment and cancellation must not depend on a decorative effect completing. Engineering must preserve correct state if motion stops, changes, or is reduced.

## Coordinate animation sequences

Group movement that represents one change; stage changes when their order helps understanding. Preserve useful anchors and coherent layers. Avoid unnecessary crossing paths, occlusion, and competing effects.

Use staggering for meaningful order or suitable expression. Check total arrival time, especially the last item. Do not serially reveal every row in a large work list or hide important text behind a parent animation.

Keep content intended to be available usable if an entrance effect or its JavaScript fails, or motion is reduced. Do not make essential information or actions depend on a reveal completing. Preserve intentionally hidden states such as closed menus and dialogs; this is not a requirement to expose every state at once.

Persistent context can reduce the need to remember a disappearing state. Evaluate tracking, understanding, pacing, and expression separately; a more elaborate sequence does not automatically explain more.

## Keep gestures and repeated input responsive

During dragging or other direct manipulation, keep movement tied to the input. When the user changes direction, continue from the visible position instead of restarting a preset animation.

Handle immediate reversal, repeated input, changing targets, resizing, late content, and return from background. Avoid queues of obsolete effects and finishing at stale coordinates. Show current state instead of replaying irrelevant missed animation.

Preserve positional continuity and useful velocity. A deliberate snap can clarify a boundary better than continuous but misleading motion.

Early press feedback need not commit the action on press. Reversing a panel animation is not cancellation of a job or undo of a transaction. Respect [Interaction's recovery definitions](interaction-design.md#distinguish-cancel-undo-and-compensation). Do not make hover, focus, selection, or repeated touch/keyboard use depend on watching a moving target.

## Keep scroll-driven motion usable

Distinguish entry-triggered transitions, scroll-coupled movement, and media on an independent timeline. Make what advances and what pauses predictable.

Keep meaningful text, controls, and progress reachable through forward/backward movement, fast scrolling, keyboard navigation, deep links, and return visits. Pinned visuals should stay related to the current explanation without trapping normal navigation.

Do not require an exact scroll position to reveal essential information. Provide a usable static or reduced route if effects do not run. Do not present a looping video as scroll-controlled; use [Audio & Video](audio-and-video.md) when independent playback matters.

Use an expressive scroll treatment when it serves the brief and remains controllable. Avoid adding it by default to every landing page.

## Provide reduced-motion alternatives

Identify meaning and possible difficulty: spatial movement, zoom, parallax, oscillation, peripheral effects, or essential information available only during motion.

Choose a direct state change, reduced displacement, restrained opacity, persistent highlight, or static sequence according to the need. A fade, shorter effect, or fewer frames is not automatically comfortable or equivalent.

Honor relevant system and supported preferences before large effects begin. If preference changes during use, settle into an accurate state without replaying the effect. Describe the alternative's behavior rather than only requesting reduced motion.

Keep functional updates and feedback available when animation is disabled or interrupted. A hidden panel must not remain operable as open; revealed controls must become usable appropriately. Essential state must not rely solely on an animation-completion event.

Use [Accessibility's sensory criteria](accessibility.md#plan-motion-and-media-alternatives) for motion, auto-updating content, and flashes. They have different scopes and levels. Reduced motion does not establish flash safety.

## Check animation performance

Check initial response, smooth rendering, and task completion separately. Large animated areas, simultaneous effects, complex styling, and unnecessary layers can slow rendering. Simplify where useful while preserving needed feedback.

Inspect actual content, input, relevant hardware, and concurrent work when available. Use existing profiling to investigate a demonstrated issue; no library, property whitelist, or universal frame rate is required.

A recording can hide or introduce frame problems. Smooth playback does not establish input latency or another device's behavior. Use [Performance](performance.md) for broader waiting and delivery metrics.

## Check animation and interruption

Inspect start, intermediate, and final states at normal speed. Slow playback can diagnose paths or overlaps, but clarity only in slow motion does not establish normal-speed usability.

Exercise relevant reversal, rapid input, resize/content change, and reduced/no-motion conditions. Check content availability, state, operability, and the next action. A screenshot cannot establish timing or interruption.

For a narrow repair, check the effect and affected neighbors. For claims of improved understanding or discovery, use suitable task evidence when warranted. When documenting motion, state the trigger, states, movement, timing, interruption behavior, and reduced-motion alternative. Use [Design Evaluation](design-evaluation.md) for diagnosis and evidence limits.
