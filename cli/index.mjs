#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { AGENTS, loadPayload, getManualTarget, getTarget, plan, apply } from './installations.mjs';
import { checkUpdate, forwardedTargetArgs, runNewVersion } from './update.mjs';
import { BACK, createPrompts } from './prompts.mjs';
import { selectSetup } from './menu.mjs';
import { PLUGIN_HOSTS, pluginCommands, pluginInvocation, runPlugin } from './plugins.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const helpCommand = metadata.private ? 'node "<path-to-polishup>/cli/index.mjs"' : `npx ${metadata.name}`;
const HELP = `PolishUp ${metadata.version}

Usage: ${helpCommand} [install|update|uninstall|color] [options]

  install                  Guided setup (the default for a new installation)
  update                   Update an existing installation
  uninstall                Remove an installation
  color check|generate     Check color pairs or generate palette candidates

Choose the harness and location in the menu. Flags are optional:
  --agent <id[,id...]>      Select one or more harnesses (for example codex,claude)
  --scope project|user     Select the installation scope
  --plugin                 Use the native Codex or Claude Code plugin manager
  --profile <name>         Select an existing Hermes user profile
  --destination <path>     Set a custom manual skill folder (must end in polishup)
  --dry-run                Show changes without writing files
  --replace                Back up and replace modified or unmanaged files
  --plain                  Use numbered text menus without styling
  --no-input               Disable prompts; supply explicit target options
  --help                   Show this help
  --version                Show the installer package version

Examples:
  ${helpCommand}
  ${helpCommand} update
  ${helpCommand} uninstall
  ${helpCommand} install --plugin --agent codex
  ${helpCommand} install --agent codex,claude --scope project
  ${helpCommand} install --agent manual --destination ./custom/skills/polishup --scope project

${metadata.private
    ? 'Replace <path-to-polishup> with the absolute package directory. Run from the destination project.\nThis build is unpublished; registry updates are disabled.'
    : 'Registry updates are enabled.'}
`;

function parseAgents(value) {
  if (value === undefined) return [];
  const agents = value.split(',').map(item => item.trim());
  if (!agents.length || agents.some(agent => !agent)) throw new Error('Use comma-separated harness IDs without empty entries.');
  const unknown = agents.filter(agent => !Object.hasOwn(AGENTS, agent));
  if (unknown.length) throw new Error(`Unknown harness: ${unknown.join(', ')}. Choose --agent ${Object.keys(AGENTS).join(', ')}.`);
  if (new Set(agents).size !== agents.length) throw new Error('List each harness only once in --agent.');
  return agents;
}

function groupTargets(targets) {
  const groups = new Map();
  for (const target of targets) {
    const key = path.resolve(target.skillDir);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(target);
  }
  return [...groups.values()];
}

async function main() {
  if (process.argv[2] === 'color') {
    const { runCli } = await import('../skills/polishup/scripts/color.mjs');
    process.exitCode = await runCli(process.argv.slice(3));
    return;
  }
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    agent: { type: 'string' }, scope: { type: 'string' }, profile: { type: 'string' }, destination: { type: 'string' }, 'dry-run': { type: 'boolean' },
    replace: { type: 'boolean' }, help: { type: 'boolean', short: 'h' }, version: { type: 'boolean' },
    plain: { type: 'boolean' }, 'no-input': { type: 'boolean' }, plugin: { type: 'boolean' },
  } });
  let action = positionals[0] || 'install';
  if (positionals.length > 1 || !['install', 'update', 'uninstall'].includes(action)) throw new Error(`Unknown command: ${positionals.join(' ')}. Run polishup --help.`);
  if (values.help) { console.log(HELP); return; }
  if (values.version) { console.log(metadata.version); return; }
  let agents = parseAgents(values.agent);
  if (values.profile && agents.length === 0) agents = ['hermes'];
  if (values.destination && agents.length === 0) agents = ['manual'];
  if (values.scope && !['project', 'user'].includes(values.scope)) throw new Error('Choose --scope project or user.');
  if (values.profile && !agents.includes('hermes')) throw new Error('--profile only applies to Hermes targets.');
  if (values.profile && values.scope && values.scope !== 'user') throw new Error('--profile requires --scope user.');
  if (values.profile && !values.scope) values.scope = 'user';
  if (values.destination && agents.length && !agents.includes('manual')) throw new Error('--destination requires --agent manual.');
  const ui = await createPrompts({ plain: values.plain, noInput: values['no-input'] });

  try {
    ui.intro(`PolishUp ${metadata.version}`);
    const nativePlugins = async (selected, scope) => {
      if (values.profile || values.destination || values.replace) throw new Error('--profile, --destination, and --replace do not apply to native plugins. The host manages plugin locations and conflicts.');
      const operations = selected.map(agent => ({ agent, commands: pluginCommands(agent, action, scope) }));
      console.log(`PolishUp ${metadata.version} | native plugin | ${action} | ${scope}`);
      for (const { agent, commands } of operations) for (const args of commands) console.log(`  ${agent} ${args.join(' ')}`);
      if (values['dry-run']) { console.log('Dry run: no native commands were executed.'); return; }
      const invocations = operations.map(({ agent }) => pluginInvocation(agent));
      ui.close();
      for (const [index, { agent }] of operations.entries()) {
        await runPlugin({ agent, action, scope }, { invocation: invocations[index], env: values.plain ? { ...process.env, NO_COLOR: '1' } : process.env });
        console.log(`${PLUGIN_HOSTS[agent]}: native plugin ${action} completed.`);
        if (action !== 'uninstall') {
          const standalone = getTarget({ agent, scope }).skillDir;
          if (fs.existsSync(standalone)) console.log(`  Standalone skill also present: ${standalone}. To use only the plugin, remove that copy with ${helpCommand} uninstall --agent ${agent} --scope ${scope}.`);
        }
      }
      console.log('Refresh plugins or start a new session in the host. Other plugins and standalone skill copies were not removed.');
    };
    if (values.plugin) {
      if (!agents.length) {
        if (!ui.interactive) throw new Error('Supply --agent codex or --agent claude for native plugin installation outside an interactive terminal.');
        agents = [await ui.choose('Choose a plugin host', Object.entries(PLUGIN_HOSTS).map(([value, label]) => ({ value, label })))];
      }
      await nativePlugins(agents, values.scope || 'user');
      return;
    }
    const request = { action, explicitAction: positionals.length > 0, agents: [...agents], values: { ...values } };
    let draft;
    while (true) {
      const selection = await selectSetup({ ...request, ui, resume: draft });
      for (const issue of selection.issues || []) console.error(`Needs attention: ${issue.target.skillDir}: ${issue.error.message}`);
      if (selection.action === 'exit') return;
      if (selection.action === 'details') {
        for (const { target, state } of selection.installations) {
          const changed = state.changed.length + state.extra.length + Number(state.commandChanged ||
            (target.commandFile && state.consumer?.commandHash && !state.commandHash));
          console.log(`${AGENTS[target.agent]} | ${target.scope}${target.profile ? ` | profile ${target.profile}` : ''} | ${state.receipt.version}`);
          console.log(`  ${target.skillDir}`);
          console.log(`  ${changed ? 'Local changes found; replacement requires approval.' : 'Managed files match their installation record.'}`);
        }
        console.log('Local file inspection only; harness activation and registry updates were not checked.');
        const next = await ui.choose('Installation details', [{ value: 'exit', label: 'Exit' }], { back: true });
        if (next === BACK) { draft = undefined; continue; }
        if (selection.issues.length) process.exitCode = 1;
        return;
      }
      action = selection.action;
      agents = selection.agents;
      const scope = selection.scope;
      values.profile = selection.profile;
      values.destination = selection.destination;
      if (ui.interactive && selection.canGoBack && action === 'install' && agents.every(agent => Object.hasOwn(PLUGIN_HOSTS, agent)) &&
          (scope === 'user' || !agents.includes('codex'))) {
        const format = await ui.choose('Installation type', [
          { value: 'skill', label: 'Standalone skill' },
          { value: 'plugin', label: 'Native plugin', hint: 'Managed by the selected host; Codex plugins also support ChatGPT desktop' },
        ], { back: true });
        if (format === BACK) { draft = selection; continue; }
        if (format === 'plugin') { await nativePlugins(agents, scope); return; }
      }
      if (values.profile && !agents.includes('hermes')) throw new Error('--profile requires Hermes in the selected --agent list.');
      if (values.destination && !agents.includes('manual')) throw new Error('--destination requires --agent manual.');
      const payload = loadPayload(packageRoot);
      const entries = [];
      for (const agent of agents) {
        try { entries.push({ targets: [agent === 'manual'
          ? getManualTarget({ destination: values.destination, scope })
          : getTarget({ agent, scope, profile: agent === 'hermes' ? values.profile : undefined })] }); }
        catch (error) { entries.push({ targets: [], label: `${AGENTS[agent]} (${scope})`, error }); }
      }
      for (const group of groupTargets(entries.flatMap(entry => entry.targets))) {
        try {
          const operation = plan(group[0], payload, action, { selectedConsumers: group.map(target => target.consumer) });
          entries.push({ targets: group, operation });
        } catch (error) { entries.push({ targets: group, error }); }
      }
      const prepared = entries.filter(entry => entry.operation || entry.error);
      const valid = prepared.filter(entry => entry.operation);
      const failedBeforeApply = prepared.filter(entry => entry.error);
      console.log(`PolishUp ${metadata.version} | ${action} | ${scope}`);
      for (const entry of failedBeforeApply) console.log(`${entry.label || entry.targets.map(target => AGENTS[target.agent]).join(' + ')}: failed to prepare: ${entry.error.message}`);
      for (const entry of valid) {
        const { operation, targets } = entry;
        const names = targets.map(target => AGENTS[target.agent]).join(' + ');
        const target = operation.target;
        console.log(`${names} | ${operation.kind} | ${target.agent === 'hermes' && target.profile ? `profile ${target.profile} | ` : ''}${target.skillDir}`);
        console.log(`  Installed: ${operation.current.receipt?.version || (operation.current.exists ? 'unmanaged' : 'not installed')} | Available: ${payload.version} (${payload.revision.slice(0, 12)})`);
        if (operation.conflicts.length) console.log(`  Conflicts: ${operation.conflicts.join('; ')}`);
        for (const noteTarget of targets.filter(item => item.discoveryNote)) console.log(`  ${AGENTS[noteTarget.agent]}: ${noteTarget.discoveryNote}`);
        for (const consumer of operation.current.consumers) {
          if (!targets.some(item => item.agent === consumer.agent && item.scope === consumer.scope && item.profile === consumer.profile)) {
            console.log(`  Other registered consumer: ${AGENTS[consumer.agent]} (${consumer.scope}${consumer.profile ? `, ${consumer.profile}` : ''})`);
          }
        }
        for (const targetWithCommand of targets.filter(item => item.commandFile)) {
          console.log(`  OpenCode command: ${targetWithCommand.commandFile}`);
          const base = scope === 'project' ? target.projectRoot : os.homedir();
          for (const folder of ['.agents', '.claude']) {
            const compatible = path.join(base, folder, 'skills', 'polishup');
            if (fs.existsSync(compatible)) console.log(`  Also present: ${compatible}. The selected OpenCode location takes precedence.`);
          }
        }
      }

      if (action === 'update') {
        const release = await checkUpdate(metadata);
        if (release.kind === 'local') console.log('Local build: checking bundled files. Public registry updates are disabled until publication.');
        if (release.kind === 'newer') {
          console.log(`Installer ${release.version} is available.`);
          if (values['dry-run']) { console.log('Dry run: the newer package was not downloaded or executed.'); return; }
          const forwarded = forwardedTargetArgs({ agents, scope, profile: values.profile, destination: values.destination,
            replace: values.replace, plain: values.plain, noInput: values['no-input'] });
          ui.close();
          await runNewVersion(release.version, forwarded);
          return;
        }
      }
      if (values['dry-run']) {
        for (const entry of valid) apply(entry.operation, { dryRun: true });
        console.log('Dry run: no files were written.');
        if (failedBeforeApply.length) process.exitCode = 1;
        return;
      }
      let replace = values.replace || false;
      if (!replace && valid.some(entry => entry.operation.conflicts.length) && ui.interactive) {
        const choice = await ui.choose('Local changes require a decision', [
          { value: 'replace', label: 'Back up and replace/remove conflicting targets' },
          { value: 'skip', label: 'Skip conflicting targets' },
          { value: 'cancel', label: 'Cancel' },
        ], { back: selection.canGoBack });
        if (choice === BACK) { draft = selection; continue; }
        if (choice === 'cancel') { console.log('Cancelled. No files changed.'); return; }
        replace = choice === 'replace';
      }
      const pending = valid.filter(entry => entry.operation.kind !== 'none' && (!entry.operation.conflicts.length || replace));
      if (ui.interactive && selection.canGoBack && (pending.length || failedBeforeApply.length)) {
        const choice = await ui.choose('Review changes', [
          ...(pending.length ? [{ value: 'apply', label: `${action === 'uninstall' ? 'Remove' : action === 'update' ? 'Update' : 'Install'} ${pending.length} target location(s)` }] : []),
          { value: 'cancel', label: 'Cancel' },
        ], { back: true });
        if (choice === BACK) { draft = selection; continue; }
        if (choice === 'cancel') {
          console.log('Cancelled. No files changed.'); return;
        }
      }
      let failed = failedBeforeApply.length > 0;
      let changed = 0, unchanged = 0, skipped = 0, failedCount = failedBeforeApply.length;
      for (const entry of valid) {
        const { operation, targets } = entry;
        const names = targets.map(target => AGENTS[target.agent]).join(' + ');
        if (operation.kind === 'none') {
          unchanged++;
          console.log(`${names}: ${action === 'uninstall' ? 'not installed' : 'unchanged; already up to date'}.`);
          continue;
        }
        if (operation.conflicts.length && !replace) {
          console.log(`${names}: skipped because conflicts were not approved for replacement.`);
          failed = true;
          skipped++;
          continue;
        }
        try {
          const result = apply(operation, { replace });
          changed++;
          console.log(`${names}: ${action === 'uninstall' ? result.detached ? 'association removed; shared files retained' : 'removed' : operation.current.exists ? 'updated and verified' : 'installed and verified'}.`);
          if (result.backup) console.log(`  Previous files retained at: ${result.backup}`);
          if (action !== 'uninstall') for (const target of targets) console.log(`  In ${AGENTS[target.agent]}: ${target.invocation}`);
        } catch (error) {
          console.log(`${names}: failed: ${error.message}`);
          failed = true;
          failedCount++;
        }
      }
      console.log(`Result: ${changed} changed, ${unchanged} unchanged, ${skipped} skipped, ${failedCount} failed.`);
      if (changed && action !== 'uninstall') {
        console.log('Refresh skills or start a new session if a harness does not show the change. File verification does not prove activation.');
      }
      if (failed) process.exitCode = 1;
      return;
    }
  } finally { ui.close(); }
}

main().catch(error => {
  if (process.argv[2] === 'color') {
    if (process.argv.includes('--json')) console.log(JSON.stringify({ schemaVersion: 1,
      operation: `color.${process.argv[3] || 'unknown'}`, toolVersion: metadata.version,
      status: 'error', message: error.message }));
    else console.error(`PolishUp: ${error.message}`);
    process.exitCode = 2;
    return;
  }
  console.error(`PolishUp: ${error.message}`);
  process.exitCode = error.message === 'Cancelled.' ? 130 : 1;
}).finally(async () => {
  // Windows console reads can survive readline cleanup after revisiting prompts.
  // Finish only after the command and its output are complete, including updater children.
  if (process.platform === 'win32' && process.stdin.isTTY) {
    await Promise.all([process.stdout, process.stderr].map(stream => new Promise(resolve => {
      if (stream.destroyed || !stream.writable) resolve();
      else stream.write('', resolve);
    })));
    process.exit(process.exitCode ?? 0);
  }
});
