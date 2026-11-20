# PolishUp

An agent skill for writing, design, code, and more.

PolishUp is an agent skill for creating, refining, and reviewing work. It helps address **AI slop**: generic writing, repetitive interface designs, unsupported claims, and unnecessarily complicated code.

It uses relevant research and professional guidance while respecting your goals and existing project conventions.

## What it covers

| Area | Focus |
| --- | --- |
| [Writing](skills/polishup/references/writing/index.md) | Clear, specific communication with sound evidence, structure, and an appropriate voice |
| [UI/UX Design](skills/polishup/references/ui-ux/index.md) | Usable interfaces with coherent visual design, accessible interactions, and responsive layouts |
| [Code](skills/polishup/references/code/index.md) | Readable, maintainable implementations without unnecessary complexity |

For other fields, PolishUp uses task-specific research and checks. Guidance loads on demand, using your agent's available tools without requiring a particular model, framework, MCP server, or hook.

An optional [color helper](skills/polishup/references/colors.md) supports contrast checks and palette exploration.

## Installation

Requires **Node.js 22 or newer**. Choose either option below and run the installer from the project where you want to use PolishUp.

### Run with npx

Use the installer without installing the CLI globally:

```sh
npx polishup-cli
```

### Install with npm

Install the CLI once, then use the shorter `polishup` command:

```sh
npm install -g polishup-cli
polishup
```

Both options open the same installer. Choose your agent, select project or personal installation, and review the destinations before confirming. Installing the CLI alone does not install the skill into your agent. Project installation applies to the nearest Git project, or the current folder when there is no Git repository.

The installer supports Codex, Claude Code, OpenCode, Cursor, Oh My Pi, Gemini CLI, GitHub Copilot, Antigravity, and Hermes, plus custom destinations. It runs on Windows, macOS, and Linux, subject to your agent's platform support.

Reload your agent's skills or start a new session after installation. Discovery and available commands depend on the agent.

<details>
<summary>Other installation methods</summary>

### From source

```sh
git clone https://github.com/fachriaziz/polishup.git
cd polishup
npm ci --ignore-scripts
npm start
```

This runs the local installer. Choose personal installation to use PolishUp across your projects. Project installation targets this checkout; to install into another project, run `node "<path-to-polishup>/cli/index.mjs"` from that project's folder.

### Manual installation

Copy the complete `skills/polishup/` folder into your agent's skills directory, keeping its contents and relative paths intact. For example, Claude Code project skills use `.claude/skills/polishup/`.

Reading the skill requires no Node.js or Python. The optional color helper requires Node.js 22+. For OpenCode's `/polishup` command, also copy `.opencode/commands/polishup.md` into the matching commands directory; the installer handles this automatically.

### Native plugins

The source checkout also includes native plugin manifests. These are separate from the npm skill installer:

| Agent | Installation |
| --- | --- |
| Claude Code | Load the checkout with `claude --plugin-dir "<path-to-polishup>"` |
| Codex | Add the checkout as a local plugin marketplace, then install `polishup@polishup-local` |
| Antigravity | Install the checkout through its plugin manager |

Use one installation method per agent and scope to avoid duplicate copies.

</details>

## Using the skill

In your agent's chat, name PolishUp and describe the task:

```text
Use PolishUp to write a product announcement from these facts.
```

```text
Use PolishUp to refine this dashboard. Preserve its visual identity and workflows.
```

```text
Use PolishUp to review this function for unnecessary complexity. Report findings without editing it.
```

Ask it to create new work, refine existing work, review without editing, or redesign specified parts. Refinement preserves existing meaning, identity, and behavior outside the requested changes.

These requests go in your agent's chat, not your terminal. You can also use its supported skill shortcuts:

| Agent | Invocation |
| --- | --- |
| Codex | `$polishup review ...` |
| Claude Code, OpenCode, Antigravity | `/polishup review ...` |
| Cursor | Type `/` and select `polishup` in Agent chat |
| Oh My Pi | `/skill:polishup ...` when skill commands are enabled |
| Hermes | `/skill polishup`, then describe the task |
| Gemini CLI, supported Copilot clients | Request PolishUp by name and approve activation if prompted |

Plugin installations may use a namespaced command. Available shortcuts depend on the agent and installation method.

Default anti-slop rules guide new choices without authorizing unrelated rewrites or redesigns. State any specific style preferences in your request.

## CLI commands

Run these commands in your terminal. The examples use the globally installed CLI; with npx, replace `polishup` with `npx polishup-cli`, for example `npx polishup-cli update`.

| Command | Purpose |
| --- | --- |
| `polishup` | Open guided installation or manage existing installations |
| `polishup install` | Start installation setup directly |
| `polishup update` | Check for a newer published release and update installed skills |
| `polishup uninstall` | Remove an installer-managed skill installation |
| `polishup color check <foreground> <background>` | Check a color pair's contrast ratio |
| `polishup color generate --input <file>` | Generate palette candidates from a JSON file |
| `polishup --help` | Show installer options and examples |
| `polishup --version` | Show the CLI version |

Run installation management commands from the target project. `update` applies the published release to selected skill installations; to also replace your globally installed CLI, rerun `npm install -g polishup-cli`.

<details>
<summary>Optional flags and color examples</summary>

Choose agents and preview a project installation without writing files:

```sh
polishup install --agent codex,claude --scope project --dry-run
```

Use `--scope user` for personal installation, `--plain` for text menus, or `--no-input` with explicit target options for noninteractive use. Run `polishup --help` for custom destinations, Hermes profiles, and replacement options.

Check a color pair:

```sh
polishup color check "#222222" "#ffffff" --json
```

Generate a palette from `palette.json`, optionally creating a new preview file:

```sh
polishup color generate --input palette.json --preview preview.html --json
```

Read [Color Tools](skills/polishup/references/colors.md) for the JSON format, supported methods, and limits. Color checks do not establish complete accessibility.

</details>

For a source checkout, run `git pull`, then `npm ci --ignore-scripts` and `npm start` to apply the updated copy. Update or remove manual and plugin installations through their original installation method.

## Help

If the skill is missing, check the installation destination and refresh your agent's skills. For questions or problems, [open an issue](https://github.com/fachriaziz/polishup/issues).

## License

[MIT](LICENSE). The color helper includes a [third-party notice](skills/polishup/scripts/NOTICE.txt).
