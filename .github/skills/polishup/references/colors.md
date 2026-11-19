# Color Tools

Use for pair calculations, named harmony exploration, or adapting explicit color roles. Preserve established palettes unless changes are requested or a scoped defect justifies them. Use [Visual Design](ui-ux/visual-design.md) for color decisions and [Data Visualization](ui-ux/data-visualization.md) for data scales. No calculator establishes good design or complete accessibility.

## Availability

The complete skill includes a prepared helper at [scripts/color.mjs](../scripts/color.mjs), with Color.js already bundled and its [license notice](../scripts/NOTICE.txt). It needs Node.js 22+ and script execution, with no npm installation, global command, Python, MCP, model or network call. The Markdown guidance remains usable without Node. Reuse an adequate available checker if execution is unavailable; report any remaining gap without installing software automatically.

Resolve the installed skill directory from the harness or the file being read. Run the prepared helper rather than loading its bundled implementation into context as instructions. From any working directory:

```text
node "<absolute-skill-path>/scripts/color.mjs" check "#222222" "#ffffff" --json
node "<absolute-skill-path>/scripts/color.mjs" generate --input "<palette.json>" --json
```

Keep caller-relative input paths relative to the caller. Do not assume package-cache locations. `node "<package>/cli/index.mjs" color ...` is an optional wrapper over the same prepared implementation. The current private package is unpublished; do not fetch an unrelated registry package named PolishUp. Complete manual, native and installer copies carry the helper; reading instructions alone does not supply file access or a runtime.

## Check a pair

`color check <foreground> <background>` compares opaque color literals within sRGB. The default minimum is 4.5, a normal-text starting point with applicable standard exceptions. `--minimum <ratio>` accepts a custom number from 1 to 21; supplying a number does not establish standards applicability. Determine that from the actual role, text and context.

The helper retains inputs and calculates the ratio before display rounding. Transparency, unresolved CSS expressions/channels and unsupported wide-gamut contexts are incomplete; malformed inputs are errors. It does not composite a page, test rendered states or alter supplied colors to make them pass.

## Generate candidates

Provide JSON through `--input <file>`, or pipe it with `--input -`. The 1 MiB input, 64-role and 128-pair limits bound execution, not palette design. Unknown fields and invalid role/pair references are rejected.

For harmony exploration:

```json
{ "base": "#3366cc", "scheme": "triadic" }
```

Schemes: `monochromatic`, `analogous`, `complementary`, `split-complementary`, `triadic`. Without a scheme, a supplied base uses monochromatic. Monochromatic samples retain the base and interpolate 35% toward white/black in OKLab. Others rotate OKLCH hue by offsets recorded in the report. These are exploration conventions, not obligatory UI roles or an exact RYB wheel. Neutral bases cannot provide meaningful chromatic harmony. A hue scheme alone has no checked role pairs.

For explicit role adjustment:

```json
{
  "schemaVersion": 1,
  "mode": "light",
  "roles": {
    "surface": { "color": "#ffffff", "locked": true },
    "action": { "color": "#bbbbbb" },
    "actionText": { "color": "#ffffff", "locked": true }
  },
  "pairs": [
    { "foreground": "actionText", "background": "action", "minimum": 4.5 }
  ]
}
```

Keep project names and declare only needed relationships. Each pair needs an explicit minimum. Locked colors and passing roles are retained. `mode` labels context without inverting colors or creating another theme. A base/scheme may accompany roles, but harmony swatches do not automatically replace role seeds.

Unlocked failing roles are searched along a defined OKLCH lightness curve. Sampling identifies pass/fail boundaries for bounded refinement; generated six-digit sRGB colors are checked again after mapping and serialization. The helper selects the closest passing sampled candidate in OKLab distance with stable ordering. Its report records settings and limitations. This is not a global solution or proof of brand preservation. Coupled constraints can remain unmet; this does not prove no other solution exists.

Use approved brand data first. Logo/image candidates require an available asset-reading tool; these helpers do not decode images, parse SVG/token systems or identify official brand colors. Do not give a monochrome logo an invented hue. Select sequential, diverging or categorical data palettes with appropriate data guidance/tools instead of applying brand harmonies mechanically.

## Preview and results

`--preview <new-file.html>` writes a static local preview only when requested. Existing files are not overwritten. The preview has escaped labels, swatches and declared pairs, with no external assets or scripts. Locked fractional colors retain their sRGB coordinates. It is a proposal, not a production UI or audit. Inspect it visually when useful and supported; creating the file does not prove it was viewed.

`--json` returns one report with method/version, values, checks, parameters and limits. Exit codes: 0 for completion without failed/incomplete requested checks; 1 for a failed target; 2 for input/dependency/execution errors; 3 for incomplete checks without confirmed failure. A harmony-only `generated` report has no contrast pass. Failure plus incomplete uses exit 1 and retains both outcomes. Read the report as well as the exit code.

Applicability: [W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Calculation and mapping: [Color.js](https://colorjs.io/). A helper result or library method name does not establish full WCAG conformance.
