# Information Architecture

Use to organize information and capabilities, select navigation, sequence work, or diagnose findability and continuity. Preserve effective structures; a navigation edit does not require rebuilding the product architecture.

## Map content and tasks

Reuse established goals and constraints. For an unfamiliar collection, inspect representative real content, core objects, attributes, relationships, ownership, tasks, and exceptions within the affected area.

Distinguish:

- **Information architecture:** what exists, what it means, and how it relates.
- **Navigation:** routes for discovering and moving between destinations.
- **Task flow:** actions, dependencies, alternatives, and continuation toward an outcome.

A sitemap is not a task flow; a sidebar is not the architecture. Include relevant cross-person or external handoffs without requiring a complete journey map.

Make consequential scope differences visible, such as changing one project versus the whole workspace. Investigate mismatches with user expectations rather than silently copying them or declaring them wrong.

## Group and prioritize information

Organize by useful relationships: subject, object, task, stage, time, location, or audience. Use hierarchies for parent-child relationships, facets for independent attributes such as status or owner, and contextual links for related items across groups.

Keep sibling categories distinguishable. Hybrid schemes can work when their sections and meanings remain clear. Role-based entries help only when people recognize their role and can handle overlapping roles. Internal departments are useful categories only if they match how users seek information.

Prioritize by importance, consequence, frequency, sequence, and affected groups. Rare emergency or recovery paths may need prominence; stakeholder ownership does not automatically justify primary navigation.

Keep names and meanings stable. Cross-links or aliases can support several plausible entry points while retaining one maintained resource. Avoid cross-listing everything until categories lose meaning.

**Check:** Can intended users predict where representative items belong? Investigate items fitting nowhere or everywhere. A structure requiring the designer's explanation needs clearer distinctions or available context.

## Balance navigation breadth and depth

Information scent means the clues that help users predict a destination, such as labels, descriptions, and recognizable images. Make these clues match what users will find. “Resources” can fit a small familiar site; a developer portal may need “API reference” and “Setup guides.”

Flattening exposes choices but increases scanning. Extra levels reduce local clutter but add categorical decisions and recovery effort. Assess understanding, route choice, arrival, correction, and completion together.

Do not impose a three-click rule, a fixed menu-item count, or a memory-based maximum depth. Hiding choices may transfer effort from scanning to discovery and recall. A cleaner screenshot does not establish lower cognitive load.

## Choose navigation by scope and movement

| Need | Candidate approach | Check |
| --- | --- | --- |
| Move among major product areas | Persistent primary destinations | Content-space cost and priority |
| Explore a substantial section | Local navigation, overview, grouped submenu | Scope is clear rather than duplicating primary navigation |
| Move from an object to related work | Contextual routes | Discovery from other entry points remains possible |
| Understand containment | Breadcrumbs or another location cue | Hierarchy is real; this is not the only navigation |
| Find a specific resource in a large collection | Search with suitable browsing and filters | Scope and result distinctions are understandable |
| Complete dependent decisions | Guided sequence | Order has a purpose; comparison and revision remain possible |
| Complete independent or recurring work | Task overview or workspace | Prerequisites and completion states are clear |

Retain useful project and platform conventions. A small page may need only section links; a large product may combine several scopes.

Support arrival through notifications, search, saved links, and shared resources. Identify the destination, relevant object or workspace, and useful next routes. Handle missing prerequisites, changed permissions, or unavailable resources without an unrelated restart.

Distinguish a destination from an action and an account/workspace switch from movement within it. Breadcrumbs describe containment; browser Back retraces visits; “Back to results” should restore relevant result context. They need not lead to the same place.

## Integrate browsing, search, and refinement

Support the current information-seeking task rather than classifying people permanently as search or browse users. Known-item lookup may favor search; learning available options may need categories and comparison.

Use facets for meaningful, sufficiently reliable attributes. A facet defines a dimension, a filter constrains the set, and sorting changes its order. Avoid creating nested categories for every attribute combination.

Show the relevant query, collection or workspace, restrictions, and ordering. Distinguish global from within-collection search. Allow broadening the query or removing constraints without restarting. Scope changes should not silently preserve incompatible restrictions or discard useful ones.

Explain filter combinations when they affect results. Selecting two statuses might include either status, while an owner filter narrows both. Choose AND or OR for the intended task. Update results immediately when useful; costly queries or dependent filters may justify an Apply action.

Results need enough information to judge relevance and distinguish similar items. For no matches, preserve the query and offer a route to broaden it. Distinguish no matches, unavailable data, and failed search. [Baymard's applied-filter guidance](https://baymard.com/research-articles/how-to-design-applied-filters) illustrates scope visibility in ecommerce; adapt the principle without adding a filter sidebar to every list.

## Sequence work around dependencies and meaningful stages

Identify entry, decisions, dependencies, alternative paths, completion, and consequential exceptions. Put prerequisite information before the decisions needing it. Keep necessary comparisons available.

| A single page or workspace can fit when | A staged flow can fit when |
| --- | --- |
| Related inputs need frequent comparison or repeated editing | Earlier answers determine later branches |
| People need overview and flexible order | Coherent groups reduce simultaneous demands |
| Short work remains understandable in one place | Long work benefits from checkpoints and supported resumption |

A crowded page can hide priorities; unnecessary stages can hide context and increase revision effort. Independent sections may fit an overview better than a rigid wizard. Choose by content, effort, dependencies, recovery, and device constraints, not screen count or frontend architecture.

For linear work, distinguish completed, current, remaining, and optional stages. For branching work, do not promise a fixed remaining count that answers can change. The indicator need not be navigation.

Allow appropriate revision. Explain when an answer invalidates dependent work; preserve unaffected sections and identify the next required action. Distinguish final submission from saving a draft or proceeding.

## Preserve context and return paths

Define the return path as well as the forward path. Preserve task-relevant object, query, filters, ordering, position, draft, and decisions when viewing details, seeking help, authenticating, or returning later.

Restore relevant context where supported. If a resource, permission, price, or dependency changed, identify what needs attention rather than presenting stale work as current.

Make saved versus submitted work and the next unfinished action clear. Specify persistence, expiry, authorization, and re-entry needs without promising unsupported saving or retaining sensitive data indefinitely.

For external payment or approval, handle users leaving, not returning, returning later, and finding a pending or failed result. Restoring navigation must not repeat a payment or approval.

## Plan progressive disclosure

Keep necessary information available now; defer supporting detail or uncommon options when people can recognize how to access them.

Do not conceal material prices, prerequisites, essential comparison attributes, or necessary recovery paths to simplify appearance. If comparison requires repeatedly opening several groups, consider an overview, parallel presentation, or persistent summary. Preserve context and a clear return from deeper routes.

## Check navigation and task flows

| Question | Useful check | Limit |
| --- | --- | --- |
| Do groupings match expectations? | Card sorting with open or supplied categories as appropriate | Associations do not determine priority or prove findability |
| Can people predict a route? | Tree testing with realistic tasks and acceptable destinations | Omits visual cues, search, content, and contextual links |
| Can people use the actual presentation? | Task sessions with the relevant prototype or product | First click or preference alone does not prove completion |
| Where do current routes fail? | Search logs, paths, support reports, targeted observation | Backtracking and drop-off do not establish causes |
| Does the flow preserve work? | Trace a branch, correction, detour, and resumption | Diagrams cannot verify implemented persistence |

[NN/g's card-sorting and tree-testing comparison](https://www.nngroup.com/articles/card-sorting-tree-testing-differences/) explains their distinct purposes. A simple text tree can answer a focused question without specialist tooling.

Use goal-based tasks without revealing the category label. Include plausible ambiguity and consequential cases. Accept several valid routes when the product supports them.

Evaluate destination accuracy, route choices, backtracking, effort, and confidence together. A direct route to the wrong destination fails; backtracking may reflect comparison. Use equivalent tasks and relevant participants when comparing designs, accounting for learning and test order. No score band or participant count fits every study.

### Standards relevant to this scope

For web work targeting [WCAG 2.2](https://www.w3.org/TR/WCAG22/):

- **2.4.5 Multiple Ways, AA:** provide more than one way to locate pages in a set, except pages resulting from or forming a process step. It does not require search on every interface.
- **3.2.3 Consistent Navigation, AA:** repeated navigation retains relative order unless the user initiates a change. Presentation can adapt to viewport size.
- **3.3.7 Redundant Entry, A:** information already entered or provided and required again in the same process is auto-populated or selectable, except essential re-entry, content security, or invalid information. This does not require cross-session draft storage.
- **2.4.8 Location, AAA:** location information is available within a page set. Breadcrumbs are one technique, not a universal AA requirement.

A tree test or successful task session does not establish conformance.

## Keep responsibilities distinct

Use [UX Research](ux-research.md#choose-research-methods) for unresolved needs and research selection; [Interaction Design](interaction-design.md) for controls, feedback, validation, and recovery; [Responsive Design](responsive-design.md) for changing presentation; and [Data Visualization](data-visualization.md) for data-specific exploration.

[Content Structure](../writing/content-structure.md) concerns explanation within content; [Language & Style](../writing/language-and-style.md) concerns expression. Engineering implements routing, retrieval, persistence, and permission enforcement. Specify the experience without claiming uninspected implementation behavior.
