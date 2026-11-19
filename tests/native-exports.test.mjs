import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { nativeExports } from '../scripts/export-native.mjs';
import { HOSTS, getTarget } from '../cli/hosts.mjs';

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-exports-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'skills/polishup/references'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ name: 'polishup', version: '0.1.0' }));
  fs.writeFileSync(path.join(root, 'skills/polishup/SKILL.md'), '---\nname: polishup\ndescription: Test\n---\nRead references/topic.md.\n');
  fs.writeFileSync(path.join(root, 'skills/polishup/references/topic.md'), 'Original guidance.\n');
  return root;
}

test('native exports match full source trees and repeated generation writes nothing', t => {
  const root = fixture(t);
  assert.throws(() => nativeExports({ root, check: true }), /Missing or stale/);
  assert.equal(fs.existsSync(path.join(root, '.cursor')), false);
  const generated = nativeExports({ root });
  assert.equal(generated.changed, 7);
  assert.deepEqual(generated.exports.map(p => p.split('/')[0]).sort(), ['.agents', '.claude', '.cursor', '.gemini', '.github', '.omp', '.opencode']);
  for (const target of generated.exports) {
    for (const file of ['SKILL.md', 'references/topic.md']) {
      assert.deepEqual(fs.readFileSync(path.join(root, target, file)), fs.readFileSync(path.join(root, 'skills/polishup', file)));
    }
    assert.equal(fs.existsSync(path.join(root, target, '.polishup-install.json')), false);
  }
  assert.equal(nativeExports({ root }).changed, 0);
  assert.equal(nativeExports({ root, check: true }).revision, generated.revision);
});

test('exports cover every declared project installer target with shared locations coalesced', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, '.git'));
  const result = nativeExports({ root });
  const destinations = Object.keys(HOSTS).filter(agent => HOSTS[agent].projectDir).map(agent =>
    getTarget({ agent, scope: 'project', cwd: root, env: {} }).skillDir);
  assert.equal(destinations.length, 9);
  assert.equal(new Set(destinations).size, 7);
  assert.deepEqual(new Set(result.exports.map(relative => path.join(root, relative))), new Set(destinations));
});

test('native generation leaves the authored OpenCode command untouched', t => {
  const root = fixture(t);
  const command = path.join(root, '.opencode/commands/polishup.md');
  fs.mkdirSync(path.dirname(command), { recursive: true });
  fs.writeFileSync(command, 'Authored command.');
  nativeExports({ root });
  assert.equal(fs.readFileSync(command, 'utf8'), 'Authored command.');
  fs.writeFileSync(command, 'Updated command.');
  nativeExports({ root });
  assert.equal(fs.readFileSync(command, 'utf8'), 'Updated command.');
});

test('reference-only changes, deleted source files and missing output files are handled', t => {
  const root = fixture(t);
  const first = nativeExports({ root });
  fs.writeFileSync(path.join(root, 'skills/polishup/references/topic.md'), 'Revised guidance.\n');
  assert.throws(() => nativeExports({ root, check: true }), /stale/);
  assert.notEqual(nativeExports({ root }).revision, first.revision);
  fs.unlinkSync(path.join(root, '.cursor/skills/polishup/references/topic.md'));
  assert.throws(() => nativeExports({ root, check: true }), /stale/);
  nativeExports({ root });
  fs.unlinkSync(path.join(root, 'skills/polishup/references/topic.md'));
  nativeExports({ root });
  assert.equal(fs.existsSync(path.join(root, '.cursor/skills/polishup/references/topic.md')), false);
  assert.equal(fs.existsSync(path.join(root, '.omp/skills/polishup/references/topic.md')), false);
});

test('unmanaged directories, local edits and extra files prevent overwrite of either target', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, '.omp/skills/polishup'), { recursive: true });
  assert.throws(() => nativeExports({ root }), /Unmanaged/);
  assert.equal(fs.existsSync(path.join(root, '.cursor')), false);
  fs.rmdirSync(path.join(root, '.omp/skills/polishup'));
  nativeExports({ root });
  const reference = path.join(root, '.omp/skills/polishup/references/topic.md');
  fs.writeFileSync(reference, 'User edit.\n');
  fs.writeFileSync(path.join(root, 'skills/polishup/references/topic.md'), 'New source.\n');
  assert.throws(() => nativeExports({ root }), /Modified or unowned/);
  assert.equal(fs.readFileSync(reference, 'utf8'), 'User edit.\n');
  assert.equal(fs.readFileSync(path.join(root, '.cursor/skills/polishup/references/topic.md'), 'utf8'), 'Original guidance.\n');
  fs.writeFileSync(reference, 'Original guidance.\n');
  const extra = path.join(root, '.omp/skills/polishup/custom.md');
  fs.writeFileSync(extra, 'Custom content.\n');
  assert.throws(() => nativeExports({ root }), /unowned/);
  assert.equal(fs.readFileSync(extra, 'utf8'), 'Custom content.\n');
});

test('native generation preserves sibling skills and harness settings', t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, '.cursor/skills/other'), { recursive: true });
  fs.writeFileSync(path.join(root, '.cursor/skills/other/SKILL.md'), 'Other skill');
  fs.writeFileSync(path.join(root, '.cursor/settings.json'), '{"custom":true}');
  nativeExports({ root });
  assert.equal(fs.readFileSync(path.join(root, '.cursor/skills/other/SKILL.md'), 'utf8'), 'Other skill');
  assert.equal(fs.readFileSync(path.join(root, '.cursor/settings.json'), 'utf8'), '{"custom":true}');
});

test('native generation refuses junctions or symbolic links', t => {
  const root = fixture(t);
  const external = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-external-')));
  t.after(() => fs.rmSync(external, { recursive: true, force: true }));
  fs.symlinkSync(external, path.join(root, '.cursor'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => nativeExports({ root }), /symbolic link or junction/);
  assert.deepEqual(fs.readdirSync(external), []);
  fs.unlinkSync(path.join(root, '.cursor'));
});

test('Git preserves knowledge bytes and checks out executable modules with LF', t => {
  if (spawnSync('git', ['--version']).status !== 0) return t.skip('Git is unavailable');
  const root = fixture(t);
  const relative = 'skills/polishup/references/topic.md';
  fs.writeFileSync(path.join(root, relative), 'Preserve these bytes.\r\n');
  nativeExports({ root });
  fs.copyFileSync(new URL('../.gitattributes', import.meta.url), path.join(root, '.gitattributes'));
  fs.mkdirSync(path.join(root, 'cli'));
  fs.writeFileSync(path.join(root, 'cli/index.mjs'), '#!/usr/bin/env node\r\nconsole.log("ok");\r\n');
  for (const args of [['init', '--quiet'], ['-c', 'core.autocrlf=true', 'add', '.gitattributes', 'skills', '.cursor', '.omp', 'cli']]) {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
  for (const file of [relative, '.cursor/skills/polishup/references/topic.md', '.omp/skills/polishup/references/topic.md', '.cursor/skills/polishup/.polishup-export.json']) {
    const indexed = spawnSync('git', ['show', `:${file}`], { cwd: root });
    assert.equal(indexed.status, 0, indexed.stderr.toString());
    assert.deepEqual(indexed.stdout, fs.readFileSync(path.join(root, file)));
  }
  fs.unlinkSync(path.join(root, 'cli/index.mjs'));
  const checkout = spawnSync('git', ['-c', 'core.autocrlf=true', 'checkout-index', '--force', '--', 'cli/index.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(checkout.status, 0, checkout.stderr);
  assert.equal(fs.readFileSync(path.join(root, 'cli/index.mjs'), 'utf8'), '#!/usr/bin/env node\nconsole.log("ok");\n');
});
