# Visual Design

Use for hierarchy, grouping, layout, spacing, typography, color, density, and visual detail. Apply [UI/UX rules](rules.md) unless already in context. Reuse the established task, content, and identity. Use [UX Research](ux-research.md) when those are unresolved, or [Art Direction](art-direction.md) when the decision concerns concepts or imagery.

## Contents

- [Hierarchy](#set-visual-hierarchy) and [grouping](#group-related-elements)
- [Layout and spacing](#define-layout-and-spacing), including [spacing scales](#choose-a-spacing-scale)
- [Typography](#define-typography-styles) and [color](#define-color-roles-and-contrast)
- [Density](#choose-content-density), [borders, shadows, and shape](#use-borders-shadows-and-shape)
- [Visual details](#refine-visual-details) and [generic patterns](#review-generic-design-patterns)
- [Rendered checks](#check-the-rendered-design) and [accessibility requirements](#standards-and-reading-flexibility)

## Set visual hierarchy

Identify what people need to notice, read, compare, or do now. Distinguish the main work, supporting context, secondary options, and important conditions. Several elements can share priority in a comparison; every screen does not need one dominant CTA.

Combine size, weight, contrast, placement, grouping, and spacing. Reduce competing emphasis before enlarging the main element. Keep important costs, limits, and conditions readable beside the affected choice.

A marketing page, reading view, and operations dashboard need different emphasis. Check hierarchy against their actual use, rather than a standard hero or equal-weight card grid.

## Group related elements

Use related cues together; one visual rule does not determine every grouping.

| Cue | Application | Problem to check |
| --- | --- | --- |
| Proximity | Associate labels, values, help, and actions | A heading appears attached to the preceding section |
| Similarity | Give comparable roles a recognizable treatment | Different roles look interchangeable |
| Boundaries | Enclose an independent object or task when useful | Nested cards fragment a continuous comparison |
| Alignment and continuity | Connect rows, columns, and sequences | Drift associates a control with the wrong item |
| Foreground and background | Separate useful content from context | Texture or overlays obscure meaning |
| Repetition and difference | Establish a pattern and identify exceptions | Unique styling everywhere, or identical styling hiding a real distinction |

Choose spacing, alignment, boundaries, and surfaces for the relationship and intended identity, within the permitted direction. Clear grouping alone does not justify removing an intentional frame or surface. Check at actual display size.

## Define layout and spacing

Establish content regions and shared alignment lines. Allocate space by reading and comparison needs; equal columns and symmetrical sections are optional. A narrow identifier column and wide description column can serve a table better than equal widths.

Reuse the project grid and spacing scale. If none exists, establish a small set of relationships: within items, between related items, between groups, and around major regions. Do not build a token catalog for one page.

For a new multi-column layout, separate the content area from navigation and side panels. Align major containers to shared columns; use internal spacing for labels, icons, and controls rather than forcing every element onto the page grid. [Atlassian's grid guidance](https://atlassian.design/foundations/grid/) makes this distinction. A simple stack may need no column grid. Choose a bounded reading width, wider comparison area, or fluid workspace by the content, without imposing one column count or maximum width everywhere.

Usually keep related items closer than separate groups, considering type size, alignment, and borders together. Equal gaps can hide hierarchy; arbitrary gaps can imply relationships that do not exist.

Inspect text baselines and visible contours as well as bounding boxes. Use optical corrections sparingly, without replacing a coherent layout with unrelated offsets. Test real labels, wrapped values, errors, and translations. Let containers grow or reorganize instead of shrinking text or clipping conditions to maintain equal heights.

### Choose a spacing scale

Establish the relevant task, content, input, density, and direction before choosing spacing. For a new interface with material gaps, use [UX Research](ux-research.md#set-an-initial-design-direction) to resolve them through available evidence, focused questions, or proportionate research. Settled context does not require another design-system comparison.

For custom layout spacing with no suitable project or platform convention, prefer a documented eight-based scale such as [Atlassian's](https://atlassian.design/foundations/spacing/). Use this fallback only for missing spacing decisions. Choose steps for grouping, density, and content; keep equivalent gaps consistent. It does not select the overall design.

| Decision | Guidance |
| --- | --- |
| Main layout relationships | Prefer eight-based steps such as 8, 16, 24, 32, 48, or 64 within the selected scale |
| Tight component detail | Use supported smaller steps; Atlassian also includes 2, 4, 6, and 12, among others |
| Repeated roles and distinct groups | Keep equivalent relationships consistent and separate groups more strongly than their internal parts |
| Optical mismatch | Inspect visible shapes and text metrics; adjust deliberately rather than preserving an imbalance to satisfy the grid |

The examples are CSS pixels for web layout; use relative units where appropriate, respecting the user's default text size. Native units and controls need their own guidance. Do not round font sizes, line heights, borders, radii, hit areas, safe areas, or computed geometry to this spacing scale.

Eight-based does not mean every value is divisible by eight. Preserve working project conventions and documented component metrics, including justified exceptions. Adjust spacing choices across available space and input conditions while retaining meaningful relationships. Source-derived values are design conventions, not guarantees of usability or accessibility.

## Define typography styles

Choose needed roles first: body text, headings, labels, values, captions. Coordinate size, weight, spacing, and placement without creating a separate style for every nesting level.

Select type for reading conditions, supported scripts, distinguishable characters, and product character. Check glyph coverage and fallback. Existing or system fonts are valid; novelty and price do not establish suitability. Data views need distinguishable digits, letters, punctuation, and units.

Adjust font size, line length, line height, weight, and letter spacing together. The same nominal size can look different across fonts. Tight line height can obscure accents; excessive line height separates related lines. Long lines can be hard to follow, while narrow columns cause frequent wrapping. [Butterick's line-length guidance](https://practicaltypography.com/line-length.html) offers roughly 45 to 90 characters as a starting range for Latin-script body text, not labels, tables, all scripts, or every viewport.

Keep characters distinguishable when adjusting tracking or weight. Do not compress lettering or shrink important text to preserve a decorative composition; change the wrapping or available space when needed.

Preserve script conventions. Check diacritics, punctuation, numerals, line breaks, and mixed-direction content. Do not apply Latin uppercase, tracking, hyphenation, or left alignment mechanically to another writing system. Keep units near values; use consistent numeric alignment and suitable tabular figures when comparison benefits. Monospace is not required for every number.

Read real content at its intended size and enlarged. A font sample alone does not show whether product text is readable.

When no type guidance exists, select a small set of matched styles for the actual font, task, script, and platform. For example, [Carbon's type sets](https://www.carbondesignsystem.com/building-blocks/foundations/typography/type-sets) pair 14/20 CSS pixels for productive body text and 16/24 for expressive body text, calibrated with IBM Plex. These are contextual size/line-height examples, not mandatory defaults for another font. [Spectrum's typography guidance](https://spectrum.adobe.com/foundations/typography/typography-system) explains platform and script differences. Use appropriate native text styles and user preferences; preserve their metrics instead of rounding to the spacing grid.

Give recurring roles recognizable size, weight, and spacing relationships. A local panel heading need not be as large as a page title. Select larger expressive type when the brief supports it; do not create hierarchy by making every heading huge or every secondary label faint. Visual size and semantic heading level are separate decisions. Check the actual font, adjacent controls, wrapping, and enlargement before repeating the styles.

## Define color roles and contrast

Assign roles to content, surfaces, boundaries, actions, selection, status, and identity. Reuse established mappings. Check actual foreground/background pairs, including transparency, imagery, gradients, and relevant states.

Without color guidance, define only needed roles: page/surface, primary/secondary text, border, action and its label, focus, selection, and relevant status pairs. Keep each foreground with its intended background; a label suitable on an action fill may fail on a pale surface. [Material's color-role guidance](https://m3.material.io/styles/color/roles) explains pairing and layering. Select actual colors for identity and verified contrast, not a default brand palette. When focused and selected states coexist, preserve selection while adding a distinguishable focus cue.

Preserve role meaning across themes. Brand, status, selection, and action can share a hue without sharing a treatment; avoid contradictory meanings and add non-color cues for essential distinctions. Inspect actual foreground/surface pairs after customization in light, dark, selected, focused, hovered, and disabled states. Inverting colors, choosing a token, or reusing a palette does not establish hierarchy or contrast. Keep useful metadata readable rather than making it resemble unavailable content.

Color associations vary with language and context; a hue does not guarantee trust or conversion. Contrast calculations answer a specific question, not every reading, hierarchy, or accessibility question. Use the scoped requirements below.

## Choose content density

Keep information visible together when people must compare it. A dense operational table can reduce navigation and memory work; turning every row into a large card can make comparison harder. An expressive reading page can legitimately need more space and pacing.

Adjust row height, controls, gaps, widths, labels, and emphasis together. Remove redundant decoration before making text smaller. Whitespace should separate, connect, pace, or emphasize. Excessive gaps can break a group or push important context out of view.

Use repeatable relationships with variation where function changes. Equal section heights, alternating left/right blocks, and identical feature groups are not required. Check whether the intended reader can find and compare what matters without avoidable scrolling or memorizing. Minimalism is not a universal quality standard.

## Use borders, shadows, and shape

Use borders, surfaces, shadows, rounding, and layering to communicate grouping, interaction, depth, or identity. Keep treatment consistent with its role. Raising a static paragraph like a movable object can imply a capability it lacks.

Choose the separation needed: spacing can group a continuous task, a boundary can distinguish an object, and elevation can identify an overlapping layer. Do not give every container the same shadow or roundness by default. For nested rounded surfaces, inspect the relationship between outer curve, inset, and inner curve; independently chosen radii can produce uneven corners. Preserve appropriate native materials or project geometry rather than imposing one radius everywhere.

Apply the [UI/UX rules](rules.md) before adding effects or decorative containers. Within an approved direction, adjust an effect's strength, area, placement, or contrast when it competes with content. A style need not improve task speed to serve expression or identity.

## Refine visual details

Compare equivalent elements in the same context: role, alignment, spacing, type, boundaries, icon proportions, and state treatment. Repair accidental differences; preserve intentional variants.

Inspect clipping, collisions, line breaks, truncated conditions, baseline drift, long or missing content, large values, and translated labels. Address unreadable information or misleading hierarchy before low-impact adjustments. Match precision to the deliverable: a discovery sketch does not need production polish.

### Review generic design patterns

First check the [UI/UX rules and exceptions](rules.md). For other patterns and permitted exceptions, inspect purpose, hierarchy, and fit. Identify the element, its effect, and a proportionate change. Distinguish a PolishUp policy mismatch from a usability defect; popularity alone does not establish the latter.

Check priority, proximity, density, and wording before adding styling. Retain meaningful status badges and useful constraints. For claims with an unclear basis, check supplied records before judging them; flag unverified claims, use honest placeholders, and never invent proof.

For decorative controls or polished happy paths with unresolved states, define relevant actions and states using [Interaction Design](interaction-design.md); use [Motion Design](motion-design.md) for movement. Label illustrative mockups and prototype limits rather than implying unavailable capabilities.

For a project-specific screen, consider whether changing only the name would leave its priorities and claims equally suitable for unrelated products. If so, inspect task context and identity. Standard forms need not be made unusual. A permitted style still needs coherent hierarchy and readable content; replacing one excluded preset with another does not improve fit.

For example, reduce a decorative dashboard introduction when it hides urgent comparisons; allow pricing conditions to wrap rather than clipping them for equal card heights; preserve a readable asymmetric portfolio while repairing collisions.

## Check the rendered design

Inspect representative content, relevant states, and the delivered result when available. Compare task priority with visible emphasis. Blurred or grayscale views can help reveal grouping, but cannot verify readability, color accessibility, semantics, or task success.

Separate aesthetic response, predicted usability, and observed outcomes. An attractive interface can still obstruct work. A screenshot reveals its displayed state; unshown behavior remains unverified. Use [Design Evaluation](design-evaluation.md) when a decision needs a different evaluation method.

### Standards and reading flexibility

For web work targeting [WCAG 2.2](https://www.w3.org/TR/WCAG22/), retain these distinctions:

| Criterion | Level | Requirement and boundary |
| --- | --- | --- |
| 1.4.1 Use of Color | A | Color is not the only visual means of conveying essential information or distinctions |
| 1.4.3 Contrast (Minimum) | AA | Text/images of text normally need 4.5:1; qualifying large text needs 3:1. Large text is at least 18 point or 14 point bold, or equivalent CJK size. Apply the specified incidental-text and logotype exceptions |
| 1.4.11 Non-text Contrast | AA | Needed control/state information and meaningful graphic parts need 3:1 against adjacent colors, subject to inactive, unmodified user-agent, and essential-presentation exceptions |
| 1.4.4 Resize Text | AA | Except captions and images of text, text can grow to 200% without losing content or functionality |
| 1.4.12 Text Spacing | AA | Preserve content/function when the relevant overrides apply together: line height 1.5 times font size, paragraph spacing 2 times, letter spacing 0.12 times, word spacing 0.16 times, with the language/script exception. These are tolerance conditions, not required authored defaults |
| 1.4.10 Reflow | AA | Preserve information/function without two-dimensional scrolling at 320 CSS-pixel width for vertically scrolling content, or 256 CSS-pixel height for horizontally scrolling content, except parts requiring two-dimensional layout for use or meaning |

Secondary importance is not a contrast exception, and decorative borders are not all subject to non-text contrast. Meaningful reading sequence also needs appropriate programmatic representation under 1.3.2, A. Coordinate actual rendering and semantics with Engineering; use [Accessibility](accessibility.md) for applicability and broader access checks.
