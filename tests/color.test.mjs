import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkPair } from '../cli/color.mjs';

const entry = fileURLToPath(new URL('../cli/index.mjs', import.meta.url));
const invoke = args => spawnSync(process.execPath, [entry, 'color', ...args], { encoding: 'utf8' });

test('contrast covers reference extremes and is symmetric', () => {
  assert.equal(checkPair('#000', '#fff').ratio, 21);
  assert.equal(checkPair('#fff', '#000').ratio, 21);
  assert.equal(checkPair('#123456', '#123456').ratio, 1);
  assert.equal(checkPair('#000', '#fff').result, 'pass');
  assert.equal(checkPair('#123456', '#123456').result, 'fail');
});

test('contrast does not round a below-threshold ratio into a pass', () => {
  assert.equal(checkPair('#777777', '#ffffff').result, 'fail');
  assert.equal(checkPair('#767676', '#ffffff').result, 'pass');
  const ratio = checkPair('#777777', '#ffffff').ratio;
  assert.equal(checkPair('#777777', '#ffffff', ratio).result, 'pass');
  assert.equal(checkPair('#777777', '#ffffff', ratio + 1e-9).result, 'fail');
});

test('opaque literal formats work without altering supplied strings', () => {
  const result = checkPair('rgb(0 0 0)', 'white');
  assert.equal(result.ratio, 21);
  assert.equal(result.foreground, 'rgb(0 0 0)');
  assert.equal(result.background, 'white');
});

test('unknown composition and wider gamut are incomplete, not passes', () => {
  for (const color of ['#0008', 'transparent', 'var(--text)', 'currentColor', 'color(display-p3 0 1 0)', 'oklch(50% none none)']) {
    const result = checkPair(color, '#fff');
    assert.equal(result.result, 'incomplete', color);
    assert.equal(result.ratio, null);
    assert.ok(result.reason);
  }
});

test('malformed colors and invalid thresholds are input errors', () => {
  for (const color of ['', 'not-a-color', 123]) assert.throws(() => checkPair(color, '#fff'));
  for (const minimum of [0, 22, NaN, Infinity, '4.5']) assert.throws(() => checkPair('#000', '#fff', minimum));
});

test('CLI JSON is parseable and preserves distinct check outcomes', () => {
  for (const [color, exit, result] of [['#000', 0, 'pass'], ['#777', 1, 'fail'], ['#0008', 3, 'incomplete']]) {
    const response = invoke(['check', color, '#fff', '--json']);
    assert.equal(response.status, exit, response.stderr);
    const report = JSON.parse(response.stdout);
    assert.equal(report.schemaVersion, 1);
    assert.equal(report.operation, 'color.check');
    assert.equal(report.checks[0].result, result);
    assert.equal(report.engine.name, 'colorjs.io');
    assert.equal(report.engine.version, '0.7.1');
  }
});

test('CLI rejects invalid invocations with error JSON and no installation', () => {
  for (const args of [['check', '#000'], ['check', 'bad', '#fff'], ['check', '#000', '#fff', '--minimum', '4.5junk'], ['unknown'], ['check', '#000', '#fff', '--fix']]) {
    const response = invoke([...args, '--json']);
    assert.equal(response.status, 2, response.stderr);
    assert.equal(JSON.parse(response.stdout).status, 'error');
  }
});
