import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AGENTS, getTarget, getManualTarget, inspect } from './installations.mjs';
import { projectRootFor, hermesProfiles } from './hosts.mjs';
import { BACK } from './prompts.mjs';
import { detectHarnesses } from './detection.mjs';

const contextFor = context => ({ cwd: process.cwd(), home: os.homedir(), env: process.env, platform: process.platform, ...context });

export function findInstallations(context = {}) {
  const options = contextFor(context);
  const installations = [], issues = [], seen = new Set(), failedPaths = new Set();
  for (const agent of Object.keys(AGENTS).filter(agent => agent !== 'manual')) {
    for (const scope of options.scope ? [options.scope] : ['project', 'user']) {
      let profiles = [undefined];
      if (agent === 'hermes' && scope === 'user') {
        try { profiles = options.profile ? [options.profile] : [undefined, ...hermesProfiles(options)]; }
        catch { /* Explicit Hermes selection reports profile-resolution errors. */ }
      }
      for (const profile of profiles) {
        let target;
        try { target = getTarget({ ...options, agent, scope, profile }); }
        catch { continue; }
        if (!fs.existsSync(target.skillDir)) continue;
        const directory = options.platform === 'win32' ? target.skillDir.toLowerCase() : target.skillDir;
        const key = `${agent}:${scope}:${directory}`;
        if (seen.has(key)) continue;
        seen.add(key);
        try {
          const state = inspect(target);
          if (state.hasTarget) installations.push({ target, state, profile });
        } catch (error) {
          if (!failedPaths.has(directory)) { issues.push({ target, error }); failedPaths.add(directory); }
        }
      }
    }
  }
  return { installations, issues };
}

export function harnessChoices(context = {}, found = { installations: [] }) {
  context = contextFor(context);
  const detected = detectHarnesses({ ...context, cwd: projectRootFor(context.cwd) });
  const choices = Object.entries(AGENTS).map(([value, label]) => {
    const scopes = [...new Set(found.installations.filter(entry => entry.target.agent === value).map(entry => entry.target.scope))];
    return { value, label: `${label}${detected[value]?.status === 'detected' ? ' (Detected)' : ''}`,
      ...(scopes.length ? { hint: `PolishUp installed: ${scopes.join(', ')}` } : {}) };
  });
  const rank = choice => choice.value === 'manual' ? 2 : detected[choice.value]?.status === 'detected' ? 0 : 1;
  return choices.sort((left, right) => rank(left) - rank(right));
}

export async function selectSetup({ action = 'install', explicitAction = false, agents = [], values = {}, ui, context = {}, resume }) {
  context = contextFor(context);
  const found = (!agents.length || ui.interactive) ? findInstallations({ ...context, scope: values.scope, profile: values.profile }) : { installations: [], issues: [] };
  const state = { action, agents: [...agents], scope: values.scope, profile: values.profile, destination: values.destination, ...resume };
  const existingMode = () => state.action !== 'install' && !agents.length && found.installations.length > 0;
  const selectExisting = entry => { state.agents = [entry.target.agent]; state.scope = entry.target.scope; state.profile = entry.profile; };
  const selection = () => ({ action: state.action, agents: state.agents, scope: state.scope,
    profile: state.scope === 'user' && state.agents.includes('hermes') ? state.profile : undefined,
    destination: state.agents.includes('manual') ? state.destination : undefined, issues: found.issues });
  if (!ui.interactive) {
    if (existingMode() && found.installations.length === 1 && !found.issues.length) selectExisting(found.installations[0]);
    if (!state.agents.length || !state.scope) throw new Error('Supply --agent and --scope outside an interactive terminal.');
    if (state.agents.includes('manual') && !state.destination) throw new Error('--agent manual requires --destination <path> when input is disabled.');
    return selection();
  }
  const rootMenu = !explicitAction && !agents.length && !values.destination && !values.profile && Boolean(found.installations.length || found.issues.length);
  const profileStep = () => state.agents.includes('hermes') && state.scope === 'user' && !values.profile && !existingMode();
  const profilesAvailable = () => {
    if (!profileStep()) return false;
    try { return hermesProfiles(context).length > 0; }
    catch { return true; }
  };
  const steps = [
    { enabled: () => rootMenu, run: opts => ui.choose('What would you like to do?', [
      { value: 'install', label: 'Install' }, { value: 'update', label: 'Update' },
      { value: 'uninstall', label: 'Uninstall' }, { value: 'details', label: 'View installation details' }, { value: 'exit', label: 'Exit' },
    ], { ...opts, initialValue: state.action }), save: value => { state.action = value; } },
    { enabled: existingMode, run: opts => ui.choose('Choose an existing installation', found.installations.map(entry => ({
      value: entry, label: `${AGENTS[entry.target.agent]} (${entry.target.scope}${entry.target.profile ? `, ${entry.target.profile}` : ''})`, hint: entry.target.skillDir,
    })), { ...opts, initialValue: found.installations.find(entry => entry.target.agent === state.agents[0] && entry.target.scope === state.scope && entry.profile === state.profile) }), save: selectExisting },
    { enabled: () => !agents.length && !existingMode(), run: opts => ui.multi('Select harnesses', harnessChoices(context, found),
      { ...opts, initialValues: state.agents }), save: value => { state.agents = value; } },
    { enabled: () => !values.scope && !existingMode(), run: opts => ui.choose('Where should PolishUp be available?', [
      { value: 'project', label: 'This project', hint: projectRootFor(context.cwd) },
      { value: 'user', label: 'Personal installation', hint: context.home },
    ], { ...opts, initialValue: state.scope }), save: value => { state.scope = value; } },
    { enabled: () => state.agents.includes('manual') && !values.destination,
      run: opts => ui.text('Custom skill folder path (must end in polishup)', { ...opts, initialValue: state.destination, validate(value) {
        try { getManualTarget({ ...context, destination: value, scope: state.scope }); }
        catch (error) { return error.message; }
      } }), save: value => { state.destination = value; } },
    { enabled: profilesAvailable, run: opts => {
      const configured = getTarget({ ...context, agent: 'hermes', scope: 'user' });
      return ui.choose('Choose a Hermes profile', [{ value: '', label: 'Current location', hint: configured.configRoot },
        ...hermesProfiles(context).map(value => ({ value, label: value }))], { ...opts, initialValue: state.profile || '' });
    }, save: value => { state.profile = value || undefined; } },
  ];
  const available = () => steps.flatMap((step, index) => step.enabled() ? [index] : []);
  let index = resume ? available().at(-1) : available()[0];
  while (index !== undefined && index < steps.length) {
    if (!steps[index].enabled()) { index++; continue; }
    const previous = available().filter(value => value < index).at(-1);
    let value;
    try { value = await steps[index].run({ back: previous !== undefined }); }
    catch (error) {
      if (error.message === 'Cancelled.') throw error;
      if (!['EACCES', 'EPERM', 'ENOENT', 'ENOTDIR', 'ELOOP'].includes(error.code) && !/^HERMES_HOME|^Hermes profile|^Invalid Hermes/.test(error.message)) throw error;
      value = await ui.choose(`Cannot continue: ${error.message}`, [{ value: 'retry', label: 'Retry' }], { back: true });
      if (value === 'retry') continue;
    }
    if (value === BACK) {
      if (previous === undefined) throw new Error('Cancelled.');
      index = previous;
      continue;
    }
    steps[index].save(value);
    if (state.action === 'exit' || state.action === 'details') return { action: state.action, ...found };
    index++;
  }
  return { ...selection(), canGoBack: available().length > 0 };
}
