# Data Visualization

Use for comparison, charts, tables, dashboards, monitoring, exploration, or repeated work across many records. A number in a label does not require a dashboard. This reference concerns data meaning and use, not statistical analysis, a chart library, or data engineering.

## Define the data question

Identify the task: exact lookup, comparison, change detection, distribution, relationship, investigation, or action. Distinguish operational work, explanatory communication, and open exploration.

Define what chart marks, rows, and cells represent: entities, periods, aggregation, measures, units, denominators, population, exclusions, time zone, and coverage. Identify observed, modeled, provisional, revised, incomplete, or unavailable values.

“Users” could mean people, accounts, sessions, or active records. Clarify consequential definitions rather than inventing them. Presentation cannot repair an incorrect denominator or calculation.

Choose aggregation for the decision. Monthly averages can hide outages; overall improvements can hide subgroup deterioration; every event can obscure a trend. Explain material sampling or aggregation and provide relevant detail where needed. Correlated series do not establish causation.

## Choose tables or charts

| Question | Starting representation | Check |
| --- | --- | --- |
| Exact value, record, or status | Labeled value, list, table | Lookup is easy; patterns may remain hidden |
| Relative magnitude | Aligned bars, dots, comparison table | Order, units, differences, and uncertainty |
| Change over time | Line or suitable interval bars | Continuity, missing intervals, and time spacing |
| Distribution or unusual cases | Dots, histogram, box plot | Binning, summary limitations, and audience familiarity |
| Relationship between quantities | Scatterplot or coordinated comparison | Overplotting and unsupported causal interpretation |
| Parts of a meaningful whole | Stacked bar, part-to-whole view, or pie for coarse shares | Categories form the stated whole; similar shares are hard to compare |
| Spatial differences | Map when location matters | Counts, rates, and geographic area imply different meanings |
| Work across many records | Task-oriented table, queue, overview/detail | Identity, exceptions, and actions remain available |

These are alternatives, not universal chart rankings. Chart and table can complement each other; do not duplicate representations without benefit. [Task-based visualization research](https://arxiv.org/html/1709.08546v3) supports selection by question, with findings bounded by the tested static datasets and tasks.

## Choose accurate visual encodings

Visual encoding maps data to position, length, area, color, or another visual property. Prefer aligned positions or lengths for precise comparisons. Use hues for categories and ordered lightness for ordered values. Add numbers or another view when area, angle, or color lacks the needed precision. Never use color alone for essential meaning.

- **Magnitude bars:** normally start at zero on a linear scale. Floating range bars need clear endpoints. Consider dots or a contextual detail view instead of cropped magnitude bars.
- **Lines and points:** a focused range can expose meaningful variation; retain extent and context. An axis-break symbol does not automatically prevent exaggeration.
- **Multiple panels:** use comparable scales for direct magnitude comparison. Clearly identify independent scales when emphasizing within-series patterns.
- **Nonlinear scales:** choose them for a relevant question and audience, label the transformation, and handle zero or negatives explicitly.
- **Proportional symbols:** scale area to quantity when area carries the meaning. Proportional radius implies a different relationship. Avoid distorting perspective or decorative volume.
- **Dual axes:** independent scaling can manufacture apparent agreement. Prefer aligned panels or a justified common transformation where suitable; otherwise identify series, units, and scales clearly.

[ONS axis guidance](https://service-manual.ons.gov.uk/data-visualisation/guidance/axes-and-gridlines) distinguishes magnitude encodings from lines and points. Its exact styling is house practice, not a universal appearance rule.

## Label data and comparisons

Place measures, units, periods, categories, and important limitations where users read the data. Titles may state a question or supported finding. Choose direct labels versus legends by readability and stability, not a requirement to label every mark.

Use justified precision and appropriate locale conventions. Distinguish counts from rates, and percentage-point changes from relative percentages. Preserve meaningful chronological, ordinal, and domain order rather than always ranking by value.

Make comparisons valid: partial current periods and complete previous periods are not equivalent. Explain normalization and denominators; keep counts visible when they represent actual workload, even when also showing normalized rates.

Distinguish established thresholds and baselines from proposed or illustrative targets. A rising measure is not universally positive. Never invent targets, precision, or KPI values to complete a layout.

## Design dense tables and views

Keep identifying columns, decision measures, status, and relevant actions available together. Defer supplementary detail only when comparison will not require remembering values across repeated transitions.

Distinguish reading rows, selecting records, editing cells, and executing actions. Record queues and spreadsheet-like work may need different navigation and commitment. Reuse suitable project components and [Interaction Design](interaction-design.md).

Test widths, numeric alignment, headers, wrapping, and density with real content. Preserve identifying and qualifying information; if truncating, provide a usable route to full content. Essential information should not depend on a tooltip.

Sticky headers or columns can preserve context without obscuring content or focus. Choose pagination, continuous loading, or rendered subsets by comparison and return needs. Distinguish loaded, matched, and selected records; do not promise that a bulk action or export includes all matches without evidence.

For smaller spaces, preserve necessary comparisons. Converting every row into a card can impair them; a constrained two-dimensional region or task-specific alternative may work better. Compactness still requires legible content and operable controls. [Carbon's table guidance](https://carbondesignsystem.com/components/data-table/usage/) supplies useful patterns, not universal row sizes or limits.

## Preserve exploration context

Add filtering, sorting, grouping, selection, and drill-down only where useful.

Make consequential scope clear:

- Does a filter affect one view or all linked views?
- Are summaries recalculated, and do percentages use the subset or full population?
- Is sorting applied to all results or only the loaded page?
- How are ties and missing values handled?
- Does highlighting retain context, or remove data?
- Can users reset or return with relevant filters and comparison references intact?

Preserve entity identity across linked views. Counts, distinct counts, subtotals, averages, and rates are not interchangeable; collapsed groups must not silently change denominators.

Live refresh can move rows or change a selected record during action. Consider visible update cues, controlled refresh, or a meaningful pause with explicit freshness limits. Do not silently freeze critical alerts or announce every changing cell. Use [Information Architecture](information-architecture.md#integrate-browsing-search-and-refinement) for general collection-refinement behavior.

## Show data status and uncertainty

| Condition | Communicate |
| --- | --- |
| Confirmed zero | Quantity is zero for the stated measure and scope |
| Missing or unknown | Value is unavailable, with a known reason where relevant |
| Not applicable or suppressed | Value does not apply or is withheld |
| Empty results or failed retrieval | No matches versus unsuccessful request |
| Stale or partial coverage | Actual time, scope, gaps, and limits on use |
| Estimate, imputation, or forecast | Status, relevant method, and supported uncertainty |

Do not replace missing values with zero or silently connect gaps. A justified interpolation or model can connect observations, but identify that relationship when it affects meaning. Separate missing history from a future forecast horizon.

Distinguish interface refresh time from source observation or update time. Different panel freshness may need local timestamps. Do not call data live without support.

Identify which measures have known quality issues. An anomaly is not automatically an error; identify material corrections or provisional revisions. Loading completion does not establish data validity.

Confidence intervals, prediction intervals, observed ranges, and individual variation answer different questions. Identify interval meaning, level where relevant, and assumptions. Do not invent error bars or treat interval overlap as a complete significance test. Statistical precision does not remove measurement bias or missing-population coverage.

Choose intervals, distributions, scenarios, frequencies, or explanation for the audience and decision. If uncertainty cannot be quantified, state the limitation without fabricating a range. Place consequential limits beside the decision.

## Organize dashboards by task

Select views serving related questions. Monitoring emphasizes timely exceptions; analysis supports investigation; explanation can provide a guided path. Combine purposes only with clear relationships.

Summaries need period, comparison, coverage, and relevant routes to underlying records. Do not add KPI cards, gauges, maps, or charts to fill a template. A single table can suffice.

Keep compared information close, identities and units coherent, and filter scope clear. Hide supporting detail only when the information needed for the decision remains visible.

## Make data exploration accessible

Provide names, scales, units, and non-color cues. Essential details must not depend solely on hover or fine pointer movement. Check keyboard and touch access, focus, tooltips, changes, reset, and navigation through meaningful data.

Choose alternatives preserving the task: a summary for a trend, an accessible table for exact lookup, or structured description and exploration for relationships. A raw table alone can burden trend discovery; a summary alone can prevent investigation. [WAI's complex-image guidance](https://www.w3.org/WAI/tutorials/images/complex/) describes alternatives without requiring every dataset inside alternative text.

Use [Accessibility](accessibility.md) for requirements and verification boundaries. A table fallback or library claim does not prove the delivered chart interaction is accessible.

## Check data interpretation and interaction

Select relevant checks:

- Can readers identify measure, scope, unit, period, and comparison?
- Are scales, denominators, aggregation, and conclusions truthful?
- Do known sample values agree across available marks, labels, tables, tooltips, and export scope?
- Do missing, stale, estimated, and partial states remain clear after exploration?
- Can relevant users compare and act with supported input methods?
- Do long labels, outliers, negative or zero values, large magnitudes, empty subsets, and updates remain usable?

Static review can identify visible integrity risks. Calculation, export, filtering, refresh, and persistence need suitable data or behavior evidence. A model rating does not establish correctness or comprehension. Resolve or report the specific gap without building an unrequested pipeline or charting framework. Use [Design Evaluation](design-evaluation.md) for diagnosis and repair priority.
