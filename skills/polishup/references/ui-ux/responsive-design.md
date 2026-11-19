# Responsive Design

Use when space, content, language, orientation, or input changes can affect usability. Reuse [Visual Design](visual-design.md) for hierarchy and [Interaction Design](interaction-design.md) for control behavior.

## Identify changing conditions

Identify what varies: the available region, task, content, language, enlargement, input, orientation, obstructions, and concurrent work. A desktop can have a narrow split window; a large touch device can use a keyboard. Do not infer exclusive capabilities from a device label.

Choose mobile-first, desktop-first, or another starting point from actual use and constraints. Keep required work available across supported conditions rather than shrinking one ideal mockup.

## Choose a responsive layout

Use fluid sizing, wrapping, stacking, or a different arrangement of panels as the content requires.

| Constraint | Possible response | Preserve |
| --- | --- | --- |
| Structure still works at another size | Expand/contract within useful limits | Reading, targets, and proportions |
| Adjacent groups become too narrow | Wrap, stack, or reallocate space | Meaningful order and associations |
| List and detail no longer fit | Show the active pane with a clear route to the other | Selected item, filters, list position, and draft |
| Secondary controls compete with work | Use a recognizable panel or alternative presentation | Discoverability, active restrictions, and required functions |
| Comparison needs two dimensions | Bounded scrolling or a useful alternate view | Row/column relationships, labels, and actions |
| Extra room becomes available | Expose useful context or constrain content | Task priority; no obligation to fill space |

Compare costs: a filter panel can hide restrictions, and cards can make row comparison harder. Preserve semantic groups instead of rearranging visual fragments independently. Reading and focus order need appropriate implementation.

Use [Art Direction](art-direction.md#check-cropping-and-placement) when a crop changes meaning, and [Data Visualization](data-visualization.md) for representation-specific decisions. Technically fitting a chart or screenshot does not make it readable.

## Choose content-based breakpoints

Inspect actual regions through widths and heights. Change presentation where content collides, essential text clips, panes become unusable, or a useful relationship can be restored. A component can be narrow inside a wide window.

Reuse project breakpoints when suitable. Prefer flexible wrapping or a better constraint over adding a new threshold for every mismatch. [Responsive-design guidance](https://web.dev/articles/responsive-web-design-basics) supports content-led transitions.

Check sizes below, above, and between breakpoints, including resizing during work. Prevent layouts from repeatedly switching back and forth. Record important rules, such as stacking editor and preview when either becomes unreadable while preserving the draft and access to the preview.

## Preserve navigation context

Adapt the presentation of navigation to space, destinations, movement frequency, and platform expectations. Keep taxonomy, recognizable destinations, current location, selected state, and routes to important work.

When panes become sequential, preserve the active task. An open record editor should not reset to the collection on resize. Keep a route back to the actual filtered list; expanding the window should not trigger unrelated navigation.

Consider open menus, dialogs, and panels during transition. Keep them usable or deliberately change presentation. If their trigger disappears, use a visible counterpart or logical focus continuation instead of resetting focus to the page start.

## Handle variable text and data

Use representative extremes: long names, localized dates/numbers, error messages, identifiers, unusual units, valid zero/negative values, and late content.

- Allow wrapping or growth when content must be read; preserve labels and control associations.
- Truncate only when omitted content is not essential now and its full value remains available through a usable route, including touch and keyboard.
- Preserve accurate inspection/copying of long identifiers; do not alter their contents to fit.
- Distinguish empty, missing, partial, and large datasets; missing is not zero.
- Keep late content from moving an active target or losing task context.

Adjust the layout before shortening a translation in ways that change its meaning. Check supported scripts, glyphs, line breaks, direction, and local formatting using [Multilingual Writing](../writing/multilingual-writing.md). Text expansion tests can expose layout failures but do not verify a translation.

## Support text resizing and zoom

Text enlargement, zoom, and spacing overrides are separate conditions. Let content grow and reflow while keeping essential controls and relationships usable. Reconsider fixed heights and persistent headers/footers; do not force zooming out.

Use [Visual Design's scoped requirements](visual-design.md#standards-and-reading-flexibility): text resizing to 200%, combined spacing overrides, and reflow have different conditions and exceptions. For vertical content, the 320 CSS-pixel reflow condition corresponds to a 1280 CSS-pixel starting viewport at 400% zoom; horizontal content uses the corresponding 256 CSS-pixel height condition.

An essential two-dimensional table or map can qualify for a scoped exception, not exemption of the surrounding page or all text cells. Keep necessary comparison relationships while other content reflows.

## Support different input methods

Provide usable routes through supported touch, pointer, keyboard, and relevant assistive modes. Input can change during one task. Focus, hover, selection, and activation are different states.

Keep essential information and actions available without hover. Additional hover/focus content subject to WCAG 1.4.13, AA, must be dismissible, hoverable, and persistent under its exceptions. Keep the pointer route between trigger and revealed content usable.

Check target area and spacing at actual scale. An icon's visual size need not equal its hit area, but hit areas must not overlap ambiguously. CSS pixels, physical pixels, points, and density-independent units are not interchangeable.

Choose target dimensions for supported input and the actual component or platform. As contextual examples, [Material's density guidance](https://m3.material.io/foundations/layout/grids-spacing/density) uses a 48 by 48 CSS-pixel default target; [Android guidance](https://developer.android.com/guide/topics/ui/accessibility/apps) recommends 48 by 48 dp for touch; and [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility) lists a 44 by 44 pt iOS/iPadOS default separately from smaller minimum values. These are different contexts and units, not one required dimension for every control. A visual icon can remain smaller than its target. Preserve readable text when adjusting density, and inspect target separation, reach, and accidental activation. Dense pointer work and touch use may need different treatments while meeting applicable requirements.

Under [WCAG 2.2](https://www.w3.org/TR/WCAG22/), 2.5.8 Target Size (Minimum), AA, specifies 24 by 24 CSS pixels with spacing, equivalent-control, inline, user-agent, and essential-presentation exceptions. It is a minimum, not an ideal size for all tasks. 2.5.6 Concurrent Input Mechanisms is AAA, with essential, security, and user-setting exceptions; it does not mandate every imaginable input.

Use [Interaction's accessibility guidance](interaction-design.md#accessibility-requirements-and-pattern-guidance) for keyboard and dragging alternatives. Actual semantics and operation require delivered checks.

## Handle orientation and obstructions

Keep essential content clear of relevant cutouts, hinge gaps, persistent overlays, and keyboards. A decorative background can extend into space that important controls cannot.

Inspect short windows and keyboard-open states. Maintain access to the active field, instructions/errors, and next action. Allow scrolling, reduce nonessential persistent chrome, or change presentation when a sticky bar or modal consumes the view.

Use actual platform obstruction behavior, not a universal fixed inset. Under WCAG, 1.3.4 Orientation, AA, permits restriction only when essential. 2.4.11 Focus Not Obscured (Minimum), AA, addresses focused components not entirely hidden by author-created content, with its notes; it does not guarantee full visibility or specify operating-system keyboard behavior.

## Preserve work during layout changes

Preserve relevant item, values, selections, filters, step, expanded regions, pending work, and reading context within supported limits. Restore the relevant item or section rather than exact pixel coordinates.

Respect persistence, privacy, authorization, and expiry constraints; Engineering must establish actual behavior. Fitting content into another region is not personalization: reordering tasks based on inferred preferences requires a separate justified decision.

## Check responsive behavior

Exercise useful extremes and transitions: narrow/short regions, enlargement, long or localized text, input changes, open overlays, missing or partial content, and return to a previous size. Combine conditions where they could expose a failure, without a full device matrix for every edit.

For example, rotate while editing a selected record and verify the draft and return path; compare a table before replacing it with stacked cards; inspect a long translated label in a narrow keyboard-open form.

A static design can specify rules and reveal geometry problems. Resizing or emulation cannot reproduce every device, browser, input method, or assistive setup. Mark untested focus, operation, saved work, and obstruction behavior as unverified.
