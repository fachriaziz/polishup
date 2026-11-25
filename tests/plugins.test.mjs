import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../cli/index.mjs', import.meta.url));
const api = () => import('../cli/plugins.mjs');

test('native plugin operations use host managers and a durable Git source', async () => {
  const { pluginCommands } = await api();
  assert.deepEqual(pluginCommands('codex', 'install', 'user'), [
    ['plugin', 'marketplace', 'add', 'fachriaziz/polishup'],
    ['plugin', 'add', 'polishup@polishup-local'],
  ]);
  assert.deepEqual(pluginCommands('codex', 'update', 'user'), [
    ['plugin', 'marketplace', 'upgrade', 'polishup-local'], ['plugin', 'add', 'polishup@polishup-local'],
  ]);
  assert.deepEqual(pluginCommands('codex', 'uninstall', 'user'), [['plugin', 'remove', 'polishup@polishup-local']]);
  assert.deepEqual(pluginCommands('claude', 'install', 'project'), [
    ['plugin', 'marketplace', 'add', 'fachriaziz/polishup'],
    ['plugin', 'install', 'polishup@polishup-local', '--scope', 'project'],
  ]);
  assert.deepEqual(pluginCommands('claude', 'update', 'user'), [
    ['plugin', 'marketplace', 'update', 'polishup-local'],
    ['plugin', 'update', 'polishup@polishup-local', '--scope', 'user'],
  ]);
  assert.deepEqual(pluginCommands('claude', 'uninstall', 'user'), [
    ['plugin', 'uninstall', 'polishup@polishup-local', '--scope', 'user'],
  ]);
  assert.throws(() => pluginCommands('codex', 'install', 'project'), /personal|user/);
  assert.throws(() => pluginCommands('opencode', 'install', 'user'), /Codex|Claude/);
  assert.throws(() => pluginCommands('codex', 'anything', 'user'), /action/);
});

test('native execution preserves argument boundaries, stops after failure and keeps the marketplace on removal', async () => {
  const { runPlugin } = await api();
  const calls = [];
  await runPlugin({ agent: 'codex', action: 'install', scope: 'user' }, {
    invocation: { executable: 'native host', prefix: [] },
    run: async (file, args) => { calls.push([file, args]); },
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], 'native host');
  assert.equal(calls[0][1].at(-1), 'fachriaziz/polishup');
  let count = 0;
  await assert.rejects(runPlugin({ agent: 'codex', action: 'install', scope: 'user' }, {
    invocation: { executable: 'native host', prefix: [] }, run: async () => { count++; throw new Error('native failed'); },
  }), /native failed/);
  assert.equal(count, 1);
});

test('Windows npm launchers use Node directly without a shell or PowerShell execution-policy change', async t => {
  const { pluginInvocation } = await api();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'polishup plugin ü '));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const pkg = path.join(root, 'node_modules/@openai/codex');
  fs.mkdirSync(path.join(pkg, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: '@openai/codex', bin: { codex: 'bin/codex.js' } }));
  fs.writeFileSync(path.join(pkg, 'bin/codex.js'), '');
  const launcher = path.join(root, 'codex.cmd'); fs.writeFileSync(launcher, '');
  const resolved = pluginInvocation('codex', { platform: 'win32', launcher });
  assert.equal(resolved.executable, process.execPath);
  assert.deepEqual(resolved.prefix, [path.join(pkg, 'bin/codex.js')]);
  fs.writeFileSync(path.join(pkg, 'package.json'), JSON.stringify({ name: '@openai/codex', bin: { codex: '../outside.js' } }));
  assert.throws(() => pluginInvocation('codex', { platform: 'win32', launcher }), /launcher|entry|outside/);
});

test('CLI plugin previews need no host executable, do not alter files and reject unsupported targets', t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-plugin-preview-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [cli, 'install', '--plugin', '--agent', 'codex', '--dry-run', '--no-input'], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /codex plugin marketplace add fachriaziz\/polishup/);
  assert.deepEqual(fs.readdirSync(cwd), []);
  const invalid = spawnSync(process.execPath, [cli, 'install', '--plugin', '--agent', 'opencode', '--no-input'], { cwd, encoding: 'utf8' });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Codex|Claude/);
});
