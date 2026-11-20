import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

async function detector() {
  assert.ok(fs.existsSync(new URL('../cli/detection.mjs', import.meta.url)), 'Harness detection must inspect application evidence separately from skill directories');
  return import('../cli/detection.mjs');
}

function files(entries, { windows = false } = {}) {
  const key = value => windows ? value.toLowerCase() : value;
  const map = new Map(Object.entries(entries).map(([name, value]) => [key(name), value]));
  return {
    statSync(name) {
      const value = map.get(key(name));
      if (!value) throw Object.assign(new Error('Missing'), { code: 'ENOENT' });
      return { isFile: () => value !== 'directory', isDirectory: () => value === 'directory' };
    },
    accessSync(name) { if (map.get(key(name)) !== 'executable') throw Object.assign(new Error('Not executable'), { code: 'EACCES' }); },
    realpathSync: name => name,
  };
}

test('Windows detection handles Path casing, quoted entries, PATHEXT, spaces and known agy location', async () => {
  const { detectHarnesses } = await detector();
  const fileSystem = files({ 'C:\\Tools With Space\\codex.CMD': 'file', 'C:\\Bin\\claude.EXE': 'file',
    'C:\\Users\\A\\AppData\\Local\\agy\\bin\\agy.exe': 'file' }, { windows: true });
  const result = detectHarnesses({ platform: 'win32', cwd: 'C:\\Project', home: 'C:\\Users\\A',
    env: { Path: '"C:\\Tools With Space";C:\\Bin', PathExt: '.EXE;.CMD', LOCALAPPDATA: 'C:\\Users\\A\\AppData\\Local' } }, { fileSystem });
  assert.equal(result.codex.status, 'detected');
  assert.equal(result.claude.status, 'detected');
  assert.equal(result.antigravity.status, 'detected');
  assert.equal(result.gemini.status, 'not-detected');
});

test('Linux detection requires executable permission and never treats shared folders or a generic agent as a harness', async () => {
  const { detectHarnesses } = await detector();
  const fileSystem = files({ '/bin/codex': 'executable', '/bin/claude': 'file', '/bin/agent': 'executable',
    '/home/a/.agents': 'directory', '/work/.github': 'directory', '/home/a/.codex': 'directory' });
  const result = detectHarnesses({ platform: 'linux', cwd: '/work', home: '/home/a', env: { PATH: '/bin' } }, { fileSystem });
  assert.equal(result.codex.status, 'detected');
  for (const agent of ['claude', 'cursor', 'hermes', 'antigravity', 'copilot']) assert.equal(result[agent].status, 'not-detected');
});

test('macOS detects known application bundles and distinguishes configuration-only evidence', async () => {
  const { detectHarnesses } = await detector();
  const fileSystem = files({ '/Applications/Cursor.app': 'directory', '/Users/a/.claude': 'directory', '/Users/a/.gemini/config': 'directory' });
  const result = detectHarnesses({ platform: 'darwin', cwd: '/work', home: '/Users/a', env: {} }, { fileSystem });
  assert.equal(result.cursor.status, 'detected');
  assert.equal(result.claude.status, 'configured');
  assert.equal(result.antigravity.status, 'configured');
  assert.equal(result.gemini.status, 'not-detected');
});
