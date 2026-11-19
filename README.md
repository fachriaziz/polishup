# PolishUp

An agent skill for research-informed creation, refinement, and review across fields. Preserve user intent and project conventions; research methods and quality criteria suited to the task.

Bundled knowledge covers the domains below. Other fields, such as 3D work, data analysis, and learning materials, use task-specific research and appropriate checks, not a claim of complete specialist expertise.

| Domain | Guidance |
| --- | --- |
| [Writing](skills/polishup/references/writing/index.md) | Purpose, evidence, structure, language, voice, accessibility, and revision |
| [UI/UX Design](skills/polishup/references/ui-ux/index.md) | Research, navigation, interaction, visual design, responsiveness, accessibility, and evaluation |
| [Code](skills/polishup/references/code/index.md) | Readability, simplicity, correctness, and proportionate verification |

## Installation

### Local installer

The npm package is not published. With Node.js 22 or newer, open a terminal in the destination project. Replace `<path-to-polishup>` with the absolute path to this checkout or an extracted installer package:

```text
node "<path-to-polishup>/cli/index.mjs"
```

Choose one or more harnesses and project or personal scope. `install` is an optional alias for the same setup. Project scope uses the nearest Git root, or the current directory without Git. Running from the PolishUp checkout selects that checkout, not another project.

The installer supports the nine harnesses below and custom destinations. It checks conflicts, preserves backups outside skill discovery, and displays the affected paths. Shared project locations are written once; failures in independent targets are reported separately.

Use `--help` for optional flags. `--dry-run` previews changes; `--agent` and `--scope` support noninteractive use. Choose `--agent manual --destination <path> --scope project|user` for a custom folder ending in `polishup`. This copies files without registering discovery. `--replace` explicitly backs up and replaces conflicting content.

### Manual installation

Copy the complete `skills/polishup/` directory to one destination below. Preserve `SKILL.md`, `LICENSE.txt`, `references/`, `scripts/`, notices and relative paths; avoid an extra nested `skills/polishup/` inside the destination. Copying and reading the skill needs no runtime or package manager. The optional executable helper needs Node.js 22+.

| Harness | Project skill directory | Default personal skill directory |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/polishup/` | `~/.agents/skills/polishup/` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/polishup/` | `~/.claude/skills/polishup/` |
| [OpenCode](https://opencode.ai/docs/skills/) | `.opencode/skills/polishup/` | `~/.config/opencode/skills/polishup/` |
| [Cursor](https://cursor.com/docs/skills) | `.cursor/skills/polishup/` | `~/.cursor/skills/polishup/` |
| [Oh My Pi (OMP)](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md) | `.omp/skills/polishup/` | `~/.omp/agent/skills/polishup/` |
| [Gemini CLI](https://geminicli.com/docs/cli/skills/) | `.gemini/skills/polishup/` | `~/.gemini/skills/polishup/` |
| [GitHub Copilot](https://docs.github.com/en/copilot/concepts/customizations/agent-skills) | `.github/skills/polishup/` | `~/.copilot/skills/polishup/` |
| [Antigravity](https://antigravity.google/docs/skills) | `.agents/skills/polishup/` | `~/.gemini/config/skills/polishup/` |
| [Hermes](https://github.com/NousResearch/hermes-agent/blob/main/agent/skill_utils.py) | `.agents/skills/polishup/` | `<effective Hermes home>/skills/polishup/` |

`~` means your home directory. These are default locations; the installer honors the following overrides for personal scope:

- Codex: an existing `CODEX_HOME` selects its backward-compatible `skills/` location. Claude uses `CLAUDE_CONFIG_DIR`; OpenCode uses `OPENCODE_CONFIG_DIR` or its `XDG_CONFIG_HOME` location.
- Gemini: `<GEMINI_CLI_HOME>/.gemini/skills/polishup/`; relative home overrides resolve from the working directory.
- OMP: set `PI_CODING_AGENT_DIR` for a custom agent directory, or choose a manual destination when its profile location is unresolved.
- Hermes: honors `HERMES_HOME` and `HERMES_DATA_DIR_SUFFIX`; default homes are `~/.hermes` on POSIX and `%LOCALAPPDATA%/hermes` on Windows. `--profile` selects an existing named personal profile. Project discovery requires a trusted Git project; installation does not grant trust.

For OpenCode's `/polishup` command, also copy `.opencode/commands/polishup.md` into the corresponding project or personal `commands/` directory. The installer does this automatically. No JavaScript plugin is needed for the skill or command.

The source checkout also includes seven generated native skill copies at the project locations above. They offer direct-copy routes to the same knowledge. Cloning the checkout does not install them into unrelated projects.

### Native plugins

These alternatives require the source checkout. Plugin manifests are not included in the standalone npm archive, and the local installer does not register or enable plugins.

| Host | Source route |
| --- | --- |
| Claude Code | `.claude-plugin/plugin.json`; load locally with `claude --plugin-dir "<path-to-polishup>"` |
| Codex | Root `plugin.json`, `.codex-plugin/plugin.json`, and `.agents/plugins/marketplace.json`; register the root as a local marketplace, then add `polishup@polishup-local` through the host |
| Antigravity | `.antigravity-plugin/plugin.json`; use its documented plugin manager |
| Cursor and OMP | Portable `plugin.json` is present; native plugin installation and activation remain unverified |

## Usage

State the task, target, and constraints:

- "Use PolishUp to draft a product announcement from these facts."
- "Use PolishUp to refine this interface. Preserve its visual identity."
- "Use PolishUp to review this function. Report findings without editing it."
- "Use PolishUp to plan a Blender product render. Research methods for my version and delivery requirements."

Review reports findings without editing the target. Refine preserves satisfactory work; Create produces new work; Redesign changes the agreed aspects. These are optional action labels on one skill.

Type native invocations in the agent prompt, not the OS terminal:

| Harness | Invocation |
| --- | --- |
| Codex | `$polishup review ...`, or select it in the skills menu |
| Claude Code, OpenCode, Antigravity | `/polishup review ...`; Claude plugin skills use the host's namespace |
| Cursor | Type `/` and select `polishup` in Agent chat |
| OMP | `/skill:polishup ...` when skill commands are enabled; otherwise request it by name |
| Hermes | `/skill polishup`, then state the task |
| Gemini CLI and supported Copilot clients | Request PolishUp by name; approve native activation when prompted |

PolishUp requires initial research into applicable methods, quality criteria, and documented failures. Depth follows the task; evidence already checked for it can be reused. Research supports decisions and does not replace checking the actual result. When current research cannot be accessed, the agent must disclose the limitation and avoid unsupported claims.

Domain rules and topic references apply selectively. Interface styling restrictions do not govern standalone 3D work or other visual media. The Markdown skill requires no particular model, framework, interpreter, MCP server, or hook; research and artifact checks use available tools. Discovery and available commands depend on the host. Personal installation does not automatically reach cloud or remote sessions.

## Update and uninstall

Run from the destination project, using the same package path:

```text
node "<path-to-polishup>/cli/index.mjs" update
node "<path-to-polishup>/cli/index.mjs" uninstall
```

The CLI selects a single registered consumer automatically or asks you to choose among registered consumers. Unmanaged folders require explicit harness selection; custom destinations require `--agent manual --destination <path> --scope project|user`. This private build updates from the bundled files, so obtain the newer source/package first; registry updates are disabled.

Keep the displayed backup paths and inspect interrupted-operation locks before removing them. Uninstalling one registered Codex, Antigravity, or Hermes project consumer retains shared files while another registered consumer remains. Other readers of compatible paths cannot be enumerated.

For manual updates, preserve customizations outside discovery roots and replace the complete selected skill. For manual removal, delete or move that exact directory outside discovery roots; renaming it within a scanned directory may leave it discoverable. Instructions already loaded can remain in the current session.

Use the original manager for manager-owned installations. Avoid installing the same skill through several routes in one scope without a concrete need.

## Optional tools

PolishUp uses suitable tools already available in the harness or project. Its [tools reference](skills/polishup/references/tools.md) guides scoped inspection, checks and evidence reporting. No browser provider, MCP, hooks or setup document is required.

The complete skill includes a ready-to-run helper for color-pair checking, five harmony methods, constrained role adjustment and an optional static preview. Node.js 22+ is required; no global CLI, npm dependencies or build step is needed to use it. From this package directory:

```text
node skills/polishup/scripts/color.mjs check "#222222" "#ffffff" --json
node skills/polishup/scripts/color.mjs generate --input palette.json --preview preview.html --json
```

For an installed skill, use its actual absolute `scripts/color.mjs` path. The optional package CLI, `node cli/index.mjs color ...`, uses the same prepared implementation. Read [Color Tools](skills/polishup/references/colors.md) for inputs and limits and preserve the [bundled dependency notice](skills/polishup/scripts/NOTICE.txt). Output is report-only except for an explicitly requested new preview. Color checks do not establish full accessibility or design quality.

## Troubleshooting

- **Skill not listed:** check the complete references tree, exact `SKILL.md` filename and case, selected scope/profile, duplicate copies, and host permissions. Refresh through the host's supported mechanism.
- **Conflict or unsafe path:** inspect local changes and backups. Use the intended physical path instead of a symlink/junction. Do not remove ownership markers or locks to force replacement.
- **Native discovery unavailable:** provide the installed `SKILL.md` path and ask the agent to read it and only relevant linked references. Supply the texts directly if file access is unavailable. This does not register native discovery.
- **Windows PowerShell blocks npm:** use `npm.cmd` for development commands; no execution-policy change is needed. Quote paths containing spaces and preserve Unicode filenames.
- **Custom Hermes path fails:** POSIX variable names are case-sensitive; Windows expansion is case-insensitive. `%NAME%` expansion is Windows-only; `$NAME` and `${NAME}` are also supported. Undefined referenced variables stop installation.

To check loading, request a review of a supplied paragraph without editing it. Inspect exposed skill events or file-read records where available. Installed files, a listed skill, loaded instructions, and applied references are separate observations; an answer mentioning PolishUp proves none of them alone.

## Development

Run development commands from the `polishup` directory in the source checkout. Install locked dependencies once before development checks. Edit knowledge only in `skills/polishup/`, then synchronize native copies and run checks:

```text
npm ci --ignore-scripts
npm run sync
npm test
```

`npm run sync` prepares the helper and notices, then updates the repository's native skill copies. Edit helper logic in `cli/color.mjs`, `cli/palette.mjs`, and `cli/color-entry.mjs`; do not hand-edit the prepared `skills/polishup/scripts/` files. The native exporter protects unmarked, locally edited, extra, or linked files. Preserve intended customizations before regeneration; missing generated files can be restored. `npm test` checks prepared-helper and full-tree freshness before the tests. `npm run check` performs those freshness checks without changing files. Existing complete skill copies are ready to use without rebuilding.

Plugin manifests point to the canonical source. Destinations live in `cli/hosts.mjs`; the authored OpenCode command lives in `.opencode/commands/polishup.md`. The `.polishup-export.json` marker identifies a generated native copy, not an installer-owned installation.

Inspect the npm payload without publishing:

```text
npm pack --dry-run --json --ignore-scripts
```

To create an archive, omit `--dry-run` and add `--pack-destination <existing-output-directory>`. npm needs a writable cache. The package includes the complete skill and prepared helper, four installer CLI modules, OpenCode command, README, and package metadata. Color.js and esbuild are development dependencies only. Tests, helper source/build tooling, native exports, source manifests, and development records are excluded. No `dist/` directory or install-time compilation is used.

Notable user-facing changes belong in the source checkout's `CHANGELOG.md`. Routine internal cleanup and research notes are not release notes.

## Project status

The npm package remains private and unpublished; `npx polishup` is not a current installation route. Public package ownership remains pending.

The installer targets Windows, Linux, and macOS, subject to host availability. The [Checks workflow](https://github.com/fachriaziz/polishup/actions/workflows/checks.yml) runs installer and package checks on all three OS families using Node.js 22; inspect the latest run for results. Mechanical checks do not establish automatic activation, output quality, token savings, or cross-harness effectiveness.

## License

[MIT](LICENSE), copyright (c) 2026 fachriaziz. Standalone skill copies include `LICENSE.txt`; the bundled Color.js helper retains its [third-party notice](skills/polishup/scripts/NOTICE.txt).
