# Changelog

Notable user-facing changes only. Release dates use UTC.

## [0.3.0] - 2026-11-26

### Added

- Native Codex/ChatGPT desktop and Claude Code plugin installation through host CLI managers, including update/removal and preview commands.
- OpenAI skill display metadata, included in manual, npm, installer, and generated native copies.
- GitHub Actions publishing through npm Trusted Publishing, with release-tag checks, package tests, and a manual publishing option for existing tags.

### Changed

- npm packages now include the portable and native plugin manifests and catalogs. OpenAI presentation metadata is consistent across portable and compatibility manifests.
- Product descriptions now lead with writing, design, and code, name the four work modes, and keep the OpenAI short description within its 30-character limit. README presents work modes before installation.

## [0.2.0] - 2026-11-20

### Changed

- Guided installer now supports keyboard multi-selection, installation details, existing Hermes profiles, and a numbered text fallback. Existing commands and explicit target flags remain supported; the CLI uses `@clack/prompts`, while the skill and color helper remain self-contained.
- Installer output distinguishes changed, unchanged, skipped, and failed targets. CI and `--no-input` disable prompts; `--plain`, accessibility settings, and unsupported terminal output use text menus.
- Back navigation preserves choices through setup, installation details, conflict handling, and final review. Detected harnesses appear first with compact labels; shared or configuration folders alone do not identify installed applications.
- Keyboard guidance now stays in the footer for selection and custom-path prompts. Back uses Esc instead of a selectable menu entry, with text alternatives for line-based input.
- Focused menu items use bright text without a background highlight; checked items remain distinct when focus moves.
- README now documents npx and global npm installation, CLI commands, agent shortcuts, and usage examples in a shorter product guide.

### Fixed

- Project scope displays the resolved Git root, and custom destinations are requested after all harnesses have been selected.
- Invalid menu input can be retried; closed input and Ctrl+D cancel pending keyboard prompts. Damaged installation receipts remain visible without granting overwrite permission.
- Prompt cleanup releases terminal input so returning with Back and then cancelling does not leave the installer running.

## [0.1.0] - 2026-11-19

### Added

- `npm start` for running the local installer from a checkout or extracted package.
- Direct npm CLI installation and registry-backed updates for published releases.
- MIT license for PolishUp, included in the npm package and standalone skill installations; third-party notices remain intact.
- On-demand tool selection and verification guidance for scoped inspection, responsive/content checks, interaction and accessibility, and preservation of existing work.
- Local color-pair checks, named harmony candidates, constrained role adjustment, and an explicitly requested static preview, with structured results and distinct incomplete/error outcomes.
- A self-contained color helper and dependency notice included in manual, native and installer skill copies; Node is required for execution, with no global CLI or npm runtime dependencies.
- Writing, UI/UX, and Code guidance with on-demand references and domain-specific rules.
- Review, Refine, Create, and Redesign actions with scope and preservation boundaries.
- A project/personal installer for nine harnesses and custom destinations, with conflict checks, backups, shared ownership, and update/removal support.
- Native plugin manifests, a local Codex catalog, and generated native skill copies for direct installation.

### Changed

- Separate the npm distribution name from the stable `polishup` skill, plugin and executable names.
- Expanded UI/UX defaults for generic replacement presets, redundant interface content, unnecessary dialogs and unfinished assets, with clearer typography and failed-animation checks while preserving existing design direction.
- Strengthened Code guidance for version-matched APIs, supported modern patterns, dependency advisories, and asynchronous completion without unnecessary upgrades or compatibility scaffolding.
- Strengthened Writing guidance against unsupported analytical add-ons, vague authority, invented terminology, and unearned agreement while preserving factual meaning and author voice.
- Focused discovery wording and initial research on task decisions, with direct color-tool navigation and conditional loading of tool guidance.
- Expanded task discovery and guidance beyond Writing, UI/UX, and Code, with required initial research, an on-demand task research reference, and interface-specific limits on UI styling restrictions.
- Clarified design-reference permissions and reduced unintended aesthetic steering while preserving default pattern restrictions and existing project identity.
- Simplified development commands to `npm run sync` and `npm run check`.
- Consolidated installation, usage, maintenance, and development documentation in README.
- Consolidated runtime knowledge under one canonical skill, with synchronized native exports and direct npm packaging.

### Fixed

- Consistent MIT license line endings across Windows checkouts and standalone skill copies.
- Update and uninstall now select registered installation consumers instead of treating compatible readers of a shared folder as separate installations.
- Package-version-only updates now refresh the installed version record while preserving unchanged skill content and existing installer safeguards.
- Personal-directory overrides and OS-specific path handling, including Gemini custom homes and Hermes environment expansion.
- Installer help now shows local commands for private builds and npm commands for published builds.

### Removed

- Separate installation and roadmap documents, obsolete build output, and historical evaluation artifacts.

