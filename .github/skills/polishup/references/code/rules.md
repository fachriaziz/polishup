# Code Rules

Apply when writing, changing, refactoring, or reviewing code. Use [implementation guidance](implementation.md) when a decision needs explanation or alternatives.

## Required rules

- Do not invent packages, APIs, dependency capabilities, or verification results. Check material uncertainty against the project or version-appropriate documentation; identify unresolved assumptions.
- Do not make a problem appear resolved by suppressing failures, weakening checks, bypassing types, or removing meaningful tests. A changed contract needs a valid requirement and corresponding updates.
- Preserve required behavior, public contracts, and safeguards. A refactor preserves behavior unless a change is requested. Include affected callers and related artifacts needed to complete the change; avoid unrelated cleanup.
- Stay within current authorization. Ask before a material scope expansion or an unresolved choice with significant behavior, compatibility, or data impact. Continue routine required changes without repeated approval; the number of affected files alone is not a reason to stop.

## Default coding guidance

- Follow project and language conventions. Use names that explain purpose, units, or state where relevant. Do not rename working code solely for personal preference.
- Before choosing version-sensitive syntax or APIs, identify supported versions and consult current official documentation for those targets. Prefer maintained, stable patterns that fit the project. Do not mix API versions, introduce preview features without a requirement, or modernize unrelated code.
- Prefer explicit, traceable control flow over clever compression, unnecessary nesting, or duplicated branches. Avoid repeated checks or exception wrappers that add no validation, recovery, or context. Fewer lines alone do not establish quality.
- For asynchronous work, use actual completion or state conditions rather than arbitrary delays that hide ordering bugs. Retain justified timeouts, scheduling, and bounded retry backoff.
- Reuse suitable project facilities or native capabilities before adding custom code or dependencies. Check behavior and constraints before substituting them.
- Add abstractions, wrappers, options, and configuration for actual responsibilities or requirements. Do not add speculative flexibility or compatibility branches for versions the project does not support. Keep useful boundaries even when they currently have one implementation or caller.
- Keep comments and documentation that explain contracts, decisions, constraints, or difficult behavior. Remove narration of obvious syntax, inaccurate descriptions, and repeated explanations. Preserve required notices; follow project conventions when updating generated files.
- Remove unused code and imports, superseded commented-out code, temporary diagnostics, and scratch files left by the change. Preserve intentional operational logs, fixtures, requested evidence, and unrelated user work. Do not leave nonfunctional stubs or hardcoded success in a completed implementation; identify deliberately incomplete work.

Adapt defaults to explicit user requirements and project context. Retain necessary complexity, defensive checks, and documentation. There are no fixed limits on function length, helper count, comments, dependencies, or tests.

