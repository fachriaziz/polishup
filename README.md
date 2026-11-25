# PolishUp

An AI agent skill that helps create, improve, and review writing, designs, code, and more.

PolishUp helps reduce common **AI slop**, including generic writing, repetitive designs, unsupported claims, and unnecessarily complex code. It uses relevant guidance and research while respecting your goals and existing project conventions.

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

For a native plugin, use `npx polishup-cli install --plugin --agent codex` or replace `codex` with `claude`. The selected host CLI must be installed. Guided personal setup for these hosts also offers a plugin option.

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

The package includes native plugin manifests and catalogs. `--plugin` delegates installation, updates, and removal to the host's own plugin manager, using the GitHub repository as a persistent source:

| Agent | Installation |
| --- | --- |
| Codex / ChatGPT desktop | `polishup install --plugin --agent codex` |
| Claude Code | `polishup install --plugin --agent claude` |
| Antigravity | Install the checkout through its plugin manager |

Codex CLI plugin installation is personal. Claude Code also accepts `--scope project`. Native host policies and permissions remain in effect. Installing locally does not publish PolishUp to the public plugin directory or install it into web/mobile sessions.

For source development, Codex accepts `codex plugin marketplace add "<path-to-polishup>"`, then `codex plugin add polishup@polishup-local`. Claude Code accepts `claude --plugin-dir "<path-to-polishup>"` for a local session.

Use one installation method per agent and scope. Existing standalone copies are preserved; remove the old copy through its installer if you want to use only the plugin. Refresh plugins or restart the host afterward.

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
| `polishup install --plugin --agent codex` | Install through Codex's native plugin manager |
| `polishup update` | Check for a newer published release and update installed skills |
| `polishup uninstall` | Remove an installer-managed skill installation |
| `polishup color check <foreground> <background>` | Check a color pair's contrast ratio |
| `polishup color generate --input <file>` | Generate palette candidates from a JSON file |
| `polishup --help` | Show installer options and examples |
| `polishup --version` | Show the CLI version |

Run installation management commands from the target project. `update` applies the published release to selected skill installations; to also replace your globally installed CLI, rerun `npm install -g polishup-cli`.

For native plugins, use `polishup update --plugin --agent codex` or `polishup uninstall --plugin --agent codex`, replacing `codex` with `claude` when appropriate. These use the host's registered Git marketplace and leave the marketplace available after removal. `--dry-run` previews the native commands without executing them.

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
