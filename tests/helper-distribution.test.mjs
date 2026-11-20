import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadPayload, getManualTarget, plan, apply } from '../cli/installations.mjs';
import { nativeExports } from '../scripts/export-native.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const { name: packageName, version: packageVersion } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
function temporary(t) {
  const directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup helper ü ')));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}
function invoke(skill, args, cwd, input) {
  return spawnSync(process.execPath, [path.join(skill, 'scripts/color.mjs'), ...args], {
    cwd, input, encoding: 'utf8', windowsHide: true, timeout: 15000,
    env: { ...process.env, NODE_PATH: '', NODE_OPTIONS: '' },
  });
}

test('a manually copied skill runs its helper without a package or node_modules', async t => {
  const directory = temporary(t);
  const skill = path.join(directory, 'copied skill', 'polishup');
  await fs.promises.cp(path.join(root, 'skills/polishup'), skill, { recursive: true });
  assert.equal(fs.existsSync(path.join(directory, 'package.json')), false);
  assert.equal(fs.existsSync(path.join(directory, 'node_modules')), false);
  for (const [color, status, result] of [['#000', 0, 'pass'], ['#777', 1, 'fail'], ['#0008', 3, 'incomplete'], ['bad', 2, 'error']]) {
    const response = invoke(skill, ['check', color, '#fff', '--json'], directory);
    assert.equal(response.status, status, response.stderr);
    const report = JSON.parse(response.stdout);
    assert.equal(report.status, result);
    assert.equal(report.toolVersion, packageVersion);
    if (result !== 'error') assert.equal(report.engine.version, '0.7.1');
  }
  const preview = path.join(directory, 'preview ü.html');
  const generated = invoke(skill, ['generate', '--input', '-', '--preview', preview, '--json'], directory,
    JSON.stringify({ base: '#3366cc', scheme: 'triadic' }));
  assert.equal(generated.status, 0, generated.stderr);
  assert.equal(JSON.parse(generated.stdout).harmony.length, 3);
  assert.ok(fs.readFileSync(preview, 'utf8').includes('Palette preview'));
  const notice = fs.readFileSync(path.join(skill, 'scripts/NOTICE.txt'), 'utf8');
  assert.match(notice, /MIT License/);
  assert.match(notice, /Copyright \(c\) 2021 Lea Verou, Chris Lilley/);
  assert.match(notice, /Permission is hereby granted/);
});

test('the installer owns and verifies helper files with the rest of a manual skill', t => {
  const directory = temporary(t);
  const payload = loadPayload(root);
  assert.ok(payload.files['scripts/color.mjs']);
  assert.ok(payload.files['scripts/NOTICE.txt']);
  const target = getManualTarget({ destination: path.join(directory, 'polishup'), scope: 'project', cwd: directory });
  apply(plan(target, payload, 'install'));
  const response = invoke(target.skillDir, ['check', '#000', '#fff', '--json'], directory);
  assert.equal(response.status, 0, response.stderr);
  const receipt = JSON.parse(fs.readFileSync(path.join(target.skillDir, '.polishup-install.json'), 'utf8'));
  assert.equal(receipt.files['scripts/color.mjs'], payload.hashes['scripts/color.mjs']);
  fs.appendFileSync(path.join(target.skillDir, 'scripts/color.mjs'), '\n// Local edit\n');
  assert.ok(plan(target, payload, 'update').conflicts.length > 0);
});

test('native export generation includes helper resources and preserves update checks', t => {
  const directory = temporary(t);
  fs.mkdirSync(path.join(directory, 'skills/polishup/references'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'skills/polishup/scripts'));
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name: packageName, version: '0.1.0' }));
  fs.writeFileSync(path.join(directory, 'skills/polishup/SKILL.md'), 'Test skill');
  fs.writeFileSync(path.join(directory, 'skills/polishup/scripts/color.mjs'), 'export const value = 1;\n');
  fs.writeFileSync(path.join(directory, 'skills/polishup/scripts/NOTICE.txt'), 'License notice\n');
  const result = nativeExports({ root: directory });
  for (const destination of result.exports) {
    assert.equal(fs.readFileSync(path.join(directory, destination, 'scripts/color.mjs'), 'utf8'), 'export const value = 1;\n');
    assert.equal(fs.readFileSync(path.join(directory, destination, 'scripts/NOTICE.txt'), 'utf8'), 'License notice\n');
  }
  assert.equal(nativeExports({ root: directory, check: true }).changed, 0);
});

test('prepared helper freshness detects drift without changing output files', async t => {
  const { prepareTools } = await import('../scripts/prepare-tools.mjs');
  const directory = temporary(t);
  await prepareTools({ directory });
  const helper = path.join(directory, 'color.mjs');
  const original = fs.readFileSync(helper);
  await prepareTools({ directory, check: true });
  assert.deepEqual(fs.readFileSync(helper), original);
  fs.appendFileSync(helper, '\n// Stale generated helper\n');
  const edited = fs.readFileSync(helper);
  await assert.rejects(prepareTools({ directory, check: true }), /stale|Missing/i);
  assert.deepEqual(fs.readFileSync(helper), edited);
});
