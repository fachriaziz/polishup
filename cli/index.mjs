#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { AGENTS, loadPayload, getManualTarget, getTarget, inspect, plan, apply } from './installations.mjs';
import { checkUpdate, forwardedTargetArgs, runNewVersion } from './update.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const helpCommand = metadata.private ? 'node "<path-to-polishup>/cli/index.mjs"' : `npx ${metadata.name}`;
const HELP = `PolishUp ${metadata.version}

Usage: ${helpCommand} [install|update|uninstall|color] [options]

  install                  Guided setup (also used when no command is given)
  update                   Update an existing installation
  uninstall                Remove an installation
  color check|generate     Check color pairs or generate palette candidates

Choose the harness and location in the menu. Flags are optional:
  --agent <id[,id...]>      Select one or more harnesses (for example codex,claude)
  --scope project|user     Select the installation scope
  --profile <name>         Select an existing Hermes user profile
  --destination <path>     Set a custom manual skill folder (must end in polishup)
  --dry-run                Show changes without writing files
  --replace                Back up and replace modified or unmanaged files
  --help                   Show this help
  --version                Show the installer package version

Examples:
  ${helpCommand}
  ${helpCommand} update
  ${helpCommand} uninstall
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
  } });
  const action = positionals[0] || 'install';
  if (positionals.length > 1 || !['install', 'update', 'uninstall'].includes(action)) throw new Error(`Unknown command: ${positionals.join(' ')}. Run polishup --help.`);
  if (values.help) { console.log(HELP); return; }
  if (values.version) { console.log(metadata.version); return; }
  let agents = parseAgents(values.agent);
  if (values.profile && agents.length === 0) agents = ['hermes'];
  if (values.scope && !['project', 'user'].includes(values.scope)) throw new Error('Choose --scope project or user.');
  if (values.profile && agents.some(agent => agent !== 'hermes' && agent !== 'manual')) throw new Error('--profile only applies to Hermes targets.');
  if (values.profile && values.scope && values.scope !== 'user') throw new Error('--profile requires --scope user.');
  if (values.profile && !values.scope) values.scope = 'user';
  if (values.destination && agents.length && !agents.includes('manual')) throw new Error('--destination requires --agent manual.');
  if (agents.includes('manual') && !values.destination && !process.stdin.isTTY) throw new Error('--agent manual requires --destination <path>.');

  let reader;
  const ask = async question => {
    if (!process.stdin.isTTY) throw new Error('An interactive terminal is required, or supply --agent and --scope.');
    reader ??= createInterface({ input: process.stdin, output: process.stdout });
    const controller = new AbortController();
    const cancel = () => controller.abort();
    reader.once('SIGINT', cancel);
    try { return (await reader.question(question, { signal: controller.signal })).trim(); }
    catch (error) { if (error.name === 'AbortError' || error.code === 'ERR_USE_AFTER_CLOSE') throw new Error('Cancelled.'); throw error; }
    finally { reader.removeListener('SIGINT', cancel); }
  };
  const choose = async (label, choices) => {
    console.log(label);
    choices.forEach((item, i) => console.log(`  ${i + 1}. ${item.label}`));
    const answer = await ask('Choose a number: ');
    const selected = choices[Number(answer) - 1];
    if (!selected) throw new Error('No valid choice selected. Nothing was changed.');
    return selected.value;
  };

  try {
    let scope = values.scope;
    if (action !== 'install' && agents.length === 0) {
      const candidates = Object.keys(AGENTS).filter(agent => agent !== 'manual').flatMap(agent => ['project', 'user'].map(candidateScope => {
        try { return getTarget({ agent, scope: candidateScope, profile: agent === 'hermes' && candidateScope === 'user' ? values.profile : undefined }); }
        catch { return null; }
      })).filter(target => target && (!values.profile || target.agent === 'hermes') && (!scope || target.scope === scope) && fs.existsSync(target.skillDir))
        .filter(target => {
          try { return inspect(target).hasTarget; }
          // Explicit selection reports invalid receipts or ownership conflicts before any change.
          catch { return false; }
        });
      if (candidates.length === 1) { agents = [candidates[0].agent]; scope ||= candidates[0].scope; }
      else if (candidates.length > 1 && process.stdin.isTTY) {
        const selected = await choose('Choose an existing installation:', candidates.map(target => ({
          label: `${AGENTS[target.agent]} (${target.scope}): ${target.skillDir}`, value: target,
        })));
        agents = [selected.agent];
        scope ||= selected.scope;
      }
    }
    if (!agents.length || !scope) {
      if (!process.stdin.isTTY) throw new Error('Supply --agent and --scope outside an interactive terminal.');
      if (!agents.length) agents = [await choose('Choose a harness:', Object.entries(AGENTS).map(([value, label]) => ({ value, label })))];
      scope ||= await choose('Where should PolishUp be available?', [
        { value: 'project', label: `This project (${process.cwd()})` },
        { value: 'user', label: `All my projects (${os.homedir()})` },
      ]);
    }
    if (values.profile && !agents.includes('hermes')) throw new Error('--profile requires Hermes in the selected --agent list.');
    if (values.destination && !agents.includes('manual')) throw new Error('--destination requires --agent manual.');
    if (agents.includes('manual') && !values.destination) values.destination = await ask('Custom skill folder path (the final folder must be named polishup): ');
    if (action === 'install' && !values.agent && process.stdin.isTTY) {
      while (agents.length < Object.keys(AGENTS).length) {
        const answer = await ask('Install for another harness too? [y/N] ');
        if (!/^y(es)?$/i.test(answer)) break;
        const remaining = Object.entries(AGENTS).filter(([agent]) => !agents.includes(agent));
        agents.push(await choose('Choose another harness:', remaining.map(([value, label]) => ({ value, label }))));
      }
    }
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
        const base = scope === 'project' ? process.cwd() : os.homedir();
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
        const forwarded = forwardedTargetArgs({ agents, scope, profile: values.profile, destination: values.destination, replace: values.replace });
        reader?.close();
        reader = null;
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
    if (!replace && valid.some(entry => entry.operation.conflicts.length) && process.stdin.isTTY) {
      replace = /^y(es)?$/i.test(await ask('Back up and replace/remove only the conflicting targets? [y/N] '));
    }
    if (process.stdin.isTTY && !(values.agent && values.scope)) {
      if (!/^y(es)?$/i.test(await ask(`Apply the prepared changes to ${valid.length} target location(s)? [y/N] `))) {
        console.log('Cancelled. No files changed.'); return;
      }
    }
    let failed = failedBeforeApply.length > 0;
    for (const entry of valid) {
      const { operation, targets } = entry;
      const names = targets.map(target => AGENTS[target.agent]).join(' + ');
      if (operation.kind === 'none') { console.log(`${names}: already up to date or not installed.`); continue; }
      if (operation.conflicts.length && !replace) {
        console.log(`${names}: skipped because conflicts were not approved for replacement.`);
        failed = true;
        continue;
      }
      try {
        const result = apply(operation, { replace });
        console.log(`${names}: ${action === 'uninstall' ? result.detached ? 'association removed; shared files retained' : 'removed' : 'installed and verified'}.`);
        if (result.backup) console.log(`  Previous files retained at: ${result.backup}`);
        if (action !== 'uninstall') for (const target of targets) console.log(`  In ${AGENTS[target.agent]}: ${target.invocation}`);
      } catch (error) {
        console.log(`${names}: failed: ${error.message}`);
        failed = true;
      }
    }
    if (valid.some(entry => entry.operation.kind !== 'none' && entry.operation.conflicts.length === 0) && action !== 'uninstall') {
      console.log('Refresh skills or start a new session if a harness does not show the change. File verification does not prove activation.');
    }
    if (failed) process.exitCode = 1;
  } finally { reader?.close(); }
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
});
