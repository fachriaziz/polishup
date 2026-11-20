import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as menuNavigation from '../cli/menu.mjs';

const harnessChoices = (...args) => {
  assert.equal(typeof menuNavigation.harnessChoices, 'function', 'Harness choices must expose compact, detected-first ordering');
  return menuNavigation.harnessChoices(...args);
};

async function menu() {
  assert.ok(fs.existsSync(new URL('../cli/menu.mjs', import.meta.url)), 'The installer must provide reusable menu navigation');
  return import('../cli/menu.mjs');
}

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-menu-')));
  const cwd = path.join(root, 'project', 'nested');
  const home = path.join(root, 'home');
  fs.mkdirSync(cwd, { recursive: true });
  fs.mkdirSync(path.join(root, 'project', '.git'));
  fs.mkdirSync(home);
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return { root, cwd, home, env: {}, platform: process.platform };
}

function answers({ selections = [], multiples = [], texts = [] } = {}) {
  const calls = [];
  return {
    interactive: true, calls,
    async choose(message, choices) { calls.push({ message, choices }); return selections.shift() ?? choices[0].value; },
    async multi(message, choices) { calls.push({ message, choices }); return multiples.shift() ?? [choices[0].value]; },
    async text(message) { calls.push({ message }); return texts.shift(); },
  };
}

test('scope choices display the resolved Git root, and manual paths are requested after complete selection', async t => {
  const context = fixture(t);
  const ui = answers({ selections: ['project'], multiples: [['codex', 'manual']], texts: ['./custom/skills/polishup'] });
  const { selectSetup } = await menu();
  const selected = await selectSetup({ action: 'install', explicitAction: true, agents: [], values: {}, ui, context });
  assert.deepEqual(selected.agents, ['codex', 'manual']);
  assert.equal(selected.destination, './custom/skills/polishup');
  const scope = ui.calls.find(call => call.choices?.some(choice => choice.value === 'project'));
  assert.ok(scope.choices.find(choice => choice.value === 'project').hint.includes(path.dirname(context.cwd)));
  assert.ok(!scope.choices.find(choice => choice.value === 'project').hint.endsWith('nested'));
  assert.match(ui.calls.at(-1).message, /folder path/i);
});

test('invalid receipts are visible to discovery without granting management ownership', async t => {
  const context = fixture(t);
  const skill = path.join(context.root, 'project', '.claude', 'skills', 'polishup');
  fs.mkdirSync(skill, { recursive: true });
  fs.writeFileSync(path.join(skill, 'SKILL.md'), 'User content');
  fs.writeFileSync(path.join(skill, '.polishup-install.json'), '{broken');
  const { findInstallations } = await menu();
  const found = findInstallations(context);
  assert.equal(found.installations.length, 0);
  assert.equal(found.issues.length, 1);
  assert.match(found.issues[0].error.message, /receipt/i);
  assert.equal(fs.readFileSync(path.join(skill, 'SKILL.md'), 'utf8'), 'User content');
});

test('personal Hermes setup offers existing profiles without creating or selecting reserved names', async t => {
  const context = fixture(t);
  const configured = path.join(context.home, 'configured-hermes');
  context.env.HERMES_HOME = configured;
  fs.mkdirSync(path.join(configured, 'profiles', 'work'), { recursive: true });
  fs.mkdirSync(path.join(configured, 'profiles', 'default'));
  const ui = answers({ selections: ['user', 'work'], multiples: [['hermes']] });
  const { selectSetup } = await menu();
  const selected = await selectSetup({ action: 'install', explicitAction: true, agents: [], values: {}, ui, context });
  assert.equal(selected.profile, 'work');
  assert.equal(selected.scope, 'user');
  const profiles = ui.calls.find(call => /profile/i.test(call.message));
  assert.ok(profiles.choices.some(choice => choice.value === 'work'));
  assert.ok(!profiles.choices.some(choice => choice.value === 'default'));
});

test('noninteractive setup never guesses missing targets', async t => {
  const context = fixture(t);
  const { selectSetup } = await menu();
  await assert.rejects(selectSetup({ action: 'install', agents: [], values: {}, ui: { interactive: false }, context }), /--agent.*--scope/);
});

test('an existing Hermes installation keeps its selected location without a second profile question', async t => {
  const context = fixture(t);
  context.env.HERMES_HOME = path.join(context.home, 'hermes');
  fs.mkdirSync(path.join(context.env.HERMES_HOME, 'profiles', 'work'), { recursive: true });
  const { getTarget, apply, plan, loadPayload } = await import('../cli/installations.mjs');
  const target = getTarget({ ...context, agent: 'hermes', scope: 'user' });
  apply(plan(target, loadPayload(fileURLToPath(new URL('../', import.meta.url))), 'install'));
  const ui = { interactive: true, choose(message, choices) {
    assert.doesNotMatch(message, /profile/i, 'A selected managed location must not ask for its profile again');
    return choices[0].value;
  } };
  const { selectSetup } = await menu();
  const selected = await selectSetup({ action: 'update', explicitAction: true, agents: [], values: {}, ui, context });
  assert.deepEqual(selected.agents, ['hermes']);
  assert.equal(selected.profile, undefined);
});

function runInteractive(args, input, context) {
  const entry = fileURLToPath(new URL('../cli/index.mjs', import.meta.url));
  const program = `process.stdin.isTTY=true;process.argv=${JSON.stringify([process.execPath, entry, ...args])};await import(${JSON.stringify(new URL('../cli/index.mjs', import.meta.url).href)});`;
  const bootstrap = path.join(context.root, 'bootstrap.mjs');
  fs.writeFileSync(bootstrap, program);
  const env = { ...process.env, HOME: context.home, USERPROFILE: context.home, LOCALAPPDATA: context.home, CI: '0' };
  for (const name of ['CODEX_HOME', 'CLAUDE_CONFIG_DIR', 'OPENCODE_CONFIG_DIR', 'XDG_CONFIG_HOME', 'GEMINI_CLI_HOME',
    'HERMES_HOME', 'HERMES_DATA_DIR_SUFFIX', 'PI_CODING_AGENT_DIR', 'OMP_PROFILE', 'PI_PROFILE', 'PI_CONFIG_DIR', 'XDG_DATA_HOME']) delete env[name];
  const choices = harnessChoices({ ...context, env }, { installations: [] });
  input = input.replace(/\{(codex|claude|manual)\}/g, (_match, agent) => String(choices.findIndex(choice => choice.value === agent) + 1));
  return spawnSync(process.execPath, [bootstrap], {
    cwd: context.cwd, env, input, encoding: 'utf8', timeout: 15000,
  });
}

test('actual CLI retries invalid input and previews Codex plus a validated custom path without writing', t => {
  const context = fixture(t);
  const destination = path.join(context.root, 'custom', 'skills', 'polishup');
  const result = runInteractive(['--plain', '--dry-run'], `0\n{codex},{manual}\n1\nwrong-folder\n${destination}\n`, context);
  assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
  assert.match(result.stdout, /Codex \| install/);
  assert.match(result.stdout, /Manual destination \| install/);
  assert.match(result.stdout, /Dry run: no files were written/);
  assert.match(result.stdout, /valid, distinct numbers/);
  assert.doesNotMatch(result.stdout, /\x1b/);
  assert.equal(fs.existsSync(destination), false);
  assert.equal(fs.existsSync(path.join(context.root, 'project', '.agents')), false);
});

test('actual CLI cancels on EOF and no-input reports the missing custom destination', t => {
  const context = fixture(t);
  const cancelled = runInteractive(['--plain', '--dry-run'], '{codex},{manual}\n1\n', context);
  assert.equal(cancelled.status, 130, cancelled.error?.message || cancelled.stderr);
  assert.match(cancelled.stderr, /Cancelled/);
  const noInput = runInteractive(['install', '--agent', 'manual', '--scope', 'project', '--no-input'], '', context);
  assert.equal(noInput.status, 1);
  assert.match(noInput.stderr, /--destination/);
  assert.doesNotMatch(noInput.stdout, /Choose|Select harnesses|folder path/);
});

test('installation details expose a damaged receipt without modifying it', t => {
  const context = fixture(t);
  const directory = path.join(context.root, 'project', '.claude', 'skills', 'polishup');
  fs.mkdirSync(directory, { recursive: true });
  const receipt = path.join(directory, '.polishup-install.json');
  fs.writeFileSync(receipt, '{broken');
  const result = runInteractive(['--plain'], '4\n1\n', context);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Needs attention:.*receipt/);
  assert.match(result.stdout, /Local file inspection only/);
  assert.equal(fs.readFileSync(receipt, 'utf8'), '{broken');
});

test('plain prompts retry invalid selections, retain pasted answers and cancel on EOF', async () => {
  assert.ok(fs.existsSync(new URL('../cli/prompts.mjs', import.meta.url)), 'The installer must provide plain prompt fallback');
  const { createPrompts } = await import('../cli/prompts.mjs');
  const input = new PassThrough();
  input.isTTY = true;
  const output = new PassThrough();
  let transcript = '';
  output.on('data', chunk => { transcript += chunk; });
  const ui = await createPrompts({ input, output, plain: true, env: {} });
  try {
    const selection = ui.multi('Select harnesses', [{ value: 'codex', label: 'Codex' }, { value: 'manual', label: 'Custom destination' }]);
    input.end('0\n1, 2\n/custom/skills/polishup\n');
    assert.deepEqual(await selection, ['codex', 'manual']);
    assert.equal(await ui.text('Folder path'), '/custom/skills/polishup');
    await assert.rejects(ui.text('Folder path'), /Cancelled/);
    assert.match(transcript, /valid/i);
    assert.doesNotMatch(transcript, /\x1b/);
  } finally { ui.close(); }
});

test('plain terminal prompts cancel on Ctrl+C and restore input mode', async () => {
  const { createPrompts } = await import('../cli/prompts.mjs');
  const input = new PassThrough();
  input.isTTY = true;
  const modes = [];
  input.setRawMode = value => { modes.push(value); };
  const output = new PassThrough();
  output.isTTY = true;
  output.columns = 80;
  output.resume();
  const ui = await createPrompts({ input, output, plain: true, env: {} });
  const pending = ui.text('Folder path').then(() => 'accepted', error => error.message);
  try {
    input.write('\x03');
    const outcome = await Promise.race([pending, new Promise(resolve => setTimeout(() => resolve('still waiting'), 200))]);
    assert.equal(outcome, 'Cancelled.');
    assert.equal(modes.at(-1), false);
  } finally { ui.close(); input.end(); }
});

test('Back from scope retains harness selection and permits changing the selection', async t => {
  const context = fixture(t);
  const { BACK } = await import('../cli/prompts.mjs');
  assert.equal(typeof BACK, 'symbol', 'Back must be distinct from a user selection');
  const ui = answers({ selections: [BACK, 'project'], multiples: [['codex', 'manual'], ['claude']] });
  const { selectSetup } = await menu();
  const selected = await selectSetup({ explicitAction: true, agents: [], values: {}, ui, context });
  assert.deepEqual(selected.agents, ['claude']);
  assert.equal(selected.destination, undefined);
  assert.equal(ui.calls.filter(call => call.message === 'Select harnesses').length, 2);
});

test('Back from a custom path can change scope without losing the entered draft', async t => {
  const context = fixture(t);
  const { BACK } = await import('../cli/prompts.mjs');
  assert.equal(typeof BACK, 'symbol');
  const ui = answers({ selections: ['project', 'user'], multiples: [['manual']], texts: [BACK, '/custom/skills/polishup'] });
  const { selectSetup } = await menu();
  const selected = await selectSetup({ explicitAction: true, agents: [], values: {}, ui, context });
  assert.equal(selected.scope, 'user');
  assert.equal(selected.destination, '/custom/skills/polishup');
});

test('final review Back can revise the target before any installation is written', t => {
  const context = fixture(t);
  const result = runInteractive(['--plain'], '{codex}\n1\nb\nb\n{claude}\n1\n2\n', context);
  assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
  assert.match(result.stdout, /Back/);
  assert.match(result.stdout, /Claude Code \| install/);
  assert.equal(fs.existsSync(path.join(context.root, 'project', '.agents')), false);
  assert.equal(fs.existsSync(path.join(context.root, 'project', '.claude')), false);
});

test('Back from a Hermes profile can switch to project scope without leaking the personal profile', async t => {
  const context = fixture(t);
  const { BACK } = await import('../cli/prompts.mjs');
  context.env.HERMES_HOME = path.join(context.home, 'hermes');
  fs.mkdirSync(path.join(context.env.HERMES_HOME, 'profiles', 'work'), { recursive: true });
  const { selectSetup } = await menu();
  const first = await selectSetup({ explicitAction: true, agents: [], values: {}, context,
    ui: answers({ multiples: [['hermes']], selections: ['user', 'work'] }) });
  const revised = await selectSetup({ explicitAction: true, agents: [], values: {}, context, resume: first,
    ui: answers({ selections: [BACK, 'project'] }) });
  assert.equal(revised.scope, 'project');
  assert.equal(revised.profile, undefined);
});

test('a Hermes configuration error offers Back so another scope can be selected', async t => {
  const context = fixture(t);
  context.env.HERMES_HOME = '$UNSET_HERMES_PATH';
  const { BACK } = await import('../cli/prompts.mjs');
  const ui = answers({ multiples: [['hermes']], selections: ['user', BACK, 'project'] });
  const { selectSetup } = await menu();
  const selected = await selectSetup({ explicitAction: true, agents: [], values: {}, context, ui });
  assert.equal(selected.scope, 'project');
  assert.ok(ui.calls.some(call => /Cannot continue: HERMES_HOME/.test(call.message)));
});

test('installation details can return to the main menu without changing a damaged receipt', t => {
  const context = fixture(t);
  const directory = path.join(context.root, 'project', '.claude', 'skills', 'polishup');
  fs.mkdirSync(directory, { recursive: true });
  const receipt = path.join(directory, '.polishup-install.json');
  fs.writeFileSync(receipt, '{broken');
  const result = runInteractive(['--plain'], '4\nb\n5\n', context);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal((result.stdout.match(/What would you like to do\?/g) || []).length, 2);
  assert.equal(fs.readFileSync(receipt, 'utf8'), '{broken');
});

test('detected harnesses come first with compact labels and no negative installation noise', async t => {
  const context = fixture(t);
  const bin = path.join(context.root, 'bin');
  fs.mkdirSync(bin);
  const command = path.join(bin, process.platform === 'win32' ? 'opencode.cmd' : 'opencode');
  fs.writeFileSync(command, 'This file must never be executed by detection.');
  fs.chmodSync(command, 0o755);
  context.env.PATH = bin;
  const choices = harnessChoices(context, { installations: [] });
  const selected = choices.find(choice => choice.value === 'opencode');
  assert.equal(selected.label, 'OpenCode (Detected)');
  assert.equal(selected.hint, undefined);
  assert.equal(choices.at(-1).value, 'manual');
  assert.ok(choices.indexOf(selected) < choices.findIndex(choice => choice.value === 'claude'));
  assert.doesNotMatch(JSON.stringify(choices), /not installed|Configured|Shared skills directory|Configuration directory/);
});

test('closing an unused prompt adapter releases its input stream', async () => {
  const { createPrompts } = await import('../cli/prompts.mjs');
  const input = new PassThrough();
  input.resume();
  let unreferenced = false;
  input.unref = () => { unreferenced = true; };
  const ui = await createPrompts({ input, output: new PassThrough(), plain: true, env: {} });
  ui.close();
  assert.equal(input.isPaused(), true);
  assert.equal(unreferenced, true);
  input.destroy();
});

test('plain navigation instructions sit below choices without Back or Cancel menu entries', async () => {
  const { createPrompts, BACK } = await import('../cli/prompts.mjs');
  const input = new PassThrough(); input.isTTY = true;
  const output = new PassThrough(); let transcript = '';
  output.on('data', chunk => { transcript += chunk; });
  const ui = await createPrompts({ input, output, plain: true, env: {} });
  try {
    const pending = ui.choose('Choose scope', [{ value: 'project', label: 'Project' }], { back: true });
    input.end('b\n');
    assert.equal(await pending, BACK);
    assert.doesNotMatch(transcript, /\b[bq]\. (Back|Cancel)/);
    assert.ok(transcript.indexOf('Project') < transcript.indexOf('Back'));
  } finally { ui.close(); }
});

test('Esc returns from a plain terminal path field without submitting or adding Back to its label', async () => {
  const { createPrompts, BACK } = await import('../cli/prompts.mjs');
  const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => {};
  const output = new PassThrough(); output.isTTY = true; output.columns = 80;
  let transcript = ''; output.on('data', chunk => { transcript += chunk; });
  const ui = await createPrompts({ input, output, plain: true, env: {} });
  const pending = ui.text('Custom folder path', { back: true }).catch(error => error.message);
  try {
    input.write('\x1b');
    assert.equal(await Promise.race([pending, new Promise(resolve => setTimeout(() => resolve('still waiting'), 200))]), BACK);
    assert.doesNotMatch(transcript, /Custom folder path \(/);
  } finally { ui.close(); input.end(); }
});

test('rich menus and path inputs render navigation in their footer without Back options', async () => {
  const { createPrompts, BACK } = await import('../cli/prompts.mjs');
  const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => {};
  const output = new PassThrough(); output.isTTY = true; output.columns = 110; output.rows = 30;
  let transcript = ''; output.on('data', chunk => { transcript += chunk; });
  const ui = await createPrompts({ input, output, env: {} });
  try {
    let pending = ui.choose('Choose scope', [{ value: 'project', label: 'Project' }], { back: true });
    assert.ok(transcript.indexOf('Choose scope') < transcript.indexOf('Project'));
    assert.ok(transcript.indexOf('Project') < transcript.indexOf('Esc: Back'));
    assert.doesNotMatch(transcript, /[○●]\s+Back/);
    input.emit('keypress', '\x1b', { name: 'escape', sequence: '\x1b' });
    assert.equal(await pending, BACK);
    transcript = '';
    pending = ui.text('Custom folder path', { back: true });
    assert.ok(transcript.indexOf('Custom folder path') < transcript.indexOf('Esc: Back'));
    assert.doesNotMatch(transcript, /:back to return|Custom folder path \(/);
    input.emit('keypress', '\x1b', { name: 'escape', sequence: '\x1b' });
    assert.equal(await pending, BACK);
  } finally { ui.close(); input.end(); }
});

test('rich menus highlight focused text without a background and distinguish checked options', async () => {
  const { createPrompts, BACK } = await import('../cli/prompts.mjs');
  const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => {};
  const output = new PassThrough(); output.isTTY = true; output.columns = 100; output.rows = 30;
  let transcript = ''; output.on('data', chunk => { transcript += chunk; });
  const ui = await createPrompts({ input, output, env: {} });
  try {
    const pending = ui.multi('Choose harnesses', [{ value: 'first', label: 'First option' }, { value: 'second', label: 'Second option' }], { back: true });
    assert.match(transcript, /\x1b\[96m[^\n]*First option/);
    assert.doesNotMatch(transcript, /\x1b\[(?:7|4[0-9]|10[0-7])m/);
    input.emit('keypress', ' ', { name: 'space', sequence: ' ' });
    transcript = '';
    input.emit('keypress', undefined, { name: 'down', sequence: '\x1b[B' });
    assert.match(transcript, /\x1b\[96m[^\n]*Second option/);
    assert.doesNotMatch(transcript, /\x1b\[(?:7|4[0-9]|10[0-7])m/);
    assert.match(transcript, /\x1b\[32m[^\n]*First option/);
    input.emit('keypress', '\x1b', { name: 'escape', sequence: '\x1b' });
    assert.equal(await pending, BACK);
  } finally { ui.close(); input.end(); }
});

test('rich selection and text prompts cancel on EOF, closed input, and Ctrl+D', async () => {
  const { createPrompts } = await import('../cli/prompts.mjs');
  for (const kind of ['choose', 'text']) for (const event of ['end', 'close', 'ctrl-d']) {
    const input = new PassThrough(); input.isTTY = true; input.setRawMode = () => {};
    const output = new PassThrough(); output.isTTY = true; output.columns = 100; output.rows = 30;
    output.resume();
    const ui = await createPrompts({ input, output, env: {} });
    let timer;
    try {
      const pending = (kind === 'text' ? ui.text('Custom folder path', { back: true })
        : ui.choose('Choose scope', [{ value: 'project', label: 'Project' }], { back: true }))
        .catch(error => error.message);
      if (event === 'end') input.end();
      else if (event === 'close') input.destroy();
      else input.write('\x04');
      const outcome = await Promise.race([pending, new Promise(resolve => { timer = setTimeout(() => resolve('still waiting'), 250); })]);
      assert.equal(outcome, 'Cancelled.', `${kind}: ${event} must cancel`);
      assert.equal(input.listenerCount('end'), 0, `${kind}: ${event} must release end handlers`);
      assert.equal(input.listenerCount('close'), 0, `${kind}: ${event} must release close handlers`);
      assert.equal(input.listenerCount('keypress'), 0, `${kind}: ${event} must release key handlers`);
    } finally { clearTimeout(timer); ui.close(); input.destroy(); output.destroy(); }
  }
});
