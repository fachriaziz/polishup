# Changelog

Notable user-facing changes only. Unreleased work has no release date.

## [Unreleased]

### Added

- MIT license for PolishUp, included in the npm package and standalone skill installations; third-party notices remain intact.
- On-demand tool selection and verification guidance for scoped inspection, responsive/content checks, interaction and accessibility, and preservation of existing work.
- Local color-pair checks, named harmony candidates, constrained role adjustment, and an explicitly requested static preview, with structured results and distinct incomplete/error outcomes.
- A self-contained color helper and dependency notice included in manual, native and installer skill copies; Node is required for execution, with no global CLI or npm runtime dependencies.
- Writing, UI/UX, and Code guidance with on-demand references and domain-specific rules.
- Review, Refine, Create, and Redesign actions with scope and preservation boundaries.
- A project/personal installer for nine harnesses and custom destinations, with conflict checks, backups, shared ownership, and update/removal support.
- Native plugin manifests, a local Codex catalog, and generated native skill copies for direct installation.

### Changed

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

