import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generatePalette, createPreview } from '../cli/palette.mjs';

const entry = fileURLToPath(new URL('../cli/index.mjs', import.meta.url));
const roleInput = () => ({ schemaVersion: 1, roles: {
  surface: { color: '#ffffff', locked: true },
  action: { color: '#bbbbbb' },
  label: { color: '#ffffff', locked: true },
}, pairs: [{ foreground: 'label', background: 'action', minimum: 4.5 }] });

test('named harmonies preserve the seed and produce bounded explicit candidates', () => {
  for (const [scheme, count] of [['monochromatic', 3], ['analogous', 3], ['complementary', 2], ['split-complementary', 3], ['triadic', 3]]) {
    const report = generatePalette({ base: '#3366cc', scheme });
    assert.equal(report.status, 'generated');
    assert.equal(report.harmony.length, count);
    assert.equal(report.harmony[0].color, '#3366cc');
    assert.equal(report.space, 'oklch');
    assert.deepEqual(report.checks, []);
    assert.ok(report.limitations.some(text => /No role pairs/.test(text)));
    for (const item of report.harmony) assert.match(item.color, /^#[0-9a-f]{6}$/i);
  }
});

test('neutral inputs do not acquire arbitrary colorful harmonies', () => {
  const report = generatePalette({ base: '#777777', scheme: 'triadic' });
  assert.equal(report.status, 'incomplete');
  assert.equal(report.harmony.length, 1);
  assert.equal(report.harmony[0].color, '#777777');
});

test('role adjustment respects a locked label and checks serialized output', () => {
  const input = roleInput();
  const before = JSON.stringify(input);
  const report = generatePalette(input);
  assert.equal(report.status, 'pass');
  assert.equal(report.roles.label.color, '#ffffff');
  assert.equal(report.roles.surface.color, '#ffffff');
  assert.notEqual(report.roles.action.color, '#bbbbbb');
  assert.ok(report.checks[0].ratio >= 4.5);
  // Independent WCAG relative-luminance calculation on final six-digit output.
  const rgb = report.roles.action.color.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255);
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  assert.ok(1.05 / (luminance + 0.05) >= 4.5);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(generatePalette(input), report);
});

test('passing and locked colors are retained; unmet targets stay failures', () => {
  const input = roleInput();
  input.roles.action.color = '#123456';
  assert.equal(generatePalette(input).roles.action.color, '#123456');
  input.roles.action = { color: '#bbbbbb', locked: true };
  const failed = generatePalette(input);
  assert.equal(failed.status, 'fail');
  assert.equal(failed.roles.action.color, '#bbbbbb');
  assert.equal(failed.checks[0].result, 'fail');
});

test('multiple backgrounds, dark contexts and incomplete pairs retain honest results', () => {
  const input = { mode: 'dark', roles: { ink: { color: '#666' }, page: { color: '#000', locked: true }, panel: { color: '#fff', locked: true } },
    pairs: [{ foreground: 'ink', background: 'page', minimum: 3 }, { foreground: 'ink', background: 'panel', minimum: 3 }] };
  assert.equal(generatePalette(input).status, 'pass');
  input.roles.panel.color = '#fff8';
  const report = generatePalette(input);
  assert.equal(report.status, 'incomplete');
  assert.ok(report.checks.some(check => check.result === 'incomplete'));
});

test('invalid palette contracts fail explicitly', () => {
  for (const input of [null, [], {}, { base: 'bad' }, { base: '#3366cc', scheme: 'triangle' },
    { roles: {}, pairs: [] }, { ...roleInput(), pairs: [{ foreground: 'missing', background: 'action', minimum: 4.5 }] },
    { ...roleInput(), scheme: 'triadic' }, { ...roleInput(), surprise: true }]) {
    assert.throws(() => generatePalette(input), JSON.stringify(input));
  }
});

test('preview contains escaped labels and checked pairs without executable scripts', () => {
  const input = { roles: { '<img src=x onerror=alert(1)>': { color: '#000', locked: true }, bg: { color: '#fff', locked: true } },
    pairs: [{ foreground: '<img src=x onerror=alert(1)>', background: 'bg', minimum: 4.5 }] };
  const html = createPreview(generatePalette(input));
  assert.match(html, /&lt;img/);
  assert.doesNotMatch(html, /<script|<img/i);
  assert.match(html, /21/);
});

test('preview retains fractional sRGB values instead of quantizing a passing locked pair', () => {
  const report = generatePalette({ roles: { text: { color: 'rgb(118.6 118.6 118.6)', locked: true }, bg: { color: '#fff', locked: true } },
    pairs: [{ foreground: 'text', background: 'bg', minimum: 4.5 }] });
  assert.equal(report.status, 'pass');
  const html = createPreview(report);
  assert.match(html, /color\(srgb 0\.465098/);
  assert.doesNotMatch(html, /(?:color|background):#777777/);
});

test('CLI reads Unicode paths and stdin, writes only an explicitly requested new preview', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'polishup colors '));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'warna ü.json');
  fs.writeFileSync(input, JSON.stringify(roleInput()));
  const run = args => spawnSync(process.execPath, [entry, 'color', 'generate', ...args, '--json'], { cwd: dir, encoding: 'utf8' });
  const response = run(['--input', input]);
  assert.equal(response.status, 0, response.stderr);
  assert.equal(JSON.parse(response.stdout).status, 'pass');
  assert.deepEqual(fs.readdirSync(dir), ['warna ü.json']);
  const stdin = spawnSync(process.execPath, [entry, 'color', 'generate', '--input', '-', '--json'], { input: JSON.stringify(roleInput()), encoding: 'utf8' });
  assert.equal(stdin.status, 0, stdin.stderr);
  const preview = path.join(dir, 'preview.html');
  assert.equal(run(['--input', input, '--preview', preview]).status, 0);
  assert.ok(fs.readFileSync(preview, 'utf8').includes('Palette preview'));
  const existing = fs.readFileSync(preview);
  assert.equal(run(['--input', input, '--preview', preview]).status, 2);
  assert.deepEqual(fs.readFileSync(preview), existing);
});
