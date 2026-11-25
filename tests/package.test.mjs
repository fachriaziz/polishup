import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('source plugin contains one portable skill and ready native resources', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  const skillRoot = path.join(root, 'skills/polishup');
  assert.equal(metadata.license, 'MIT');
  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
  assert.match(license, /^MIT License\n/);
  assert.equal(fs.readFileSync(path.join(skillRoot, 'LICENSE.txt'), 'utf8'), license);
  assert.ok(fs.existsSync(path.join(root, 'cli/hosts.mjs')), 'Host path resolution must ship with the installer');
  assert.ok(fs.existsSync(path.join(skillRoot, 'SKILL.md')), 'The canonical skill must exist in source');
  assert.equal(fs.existsSync(path.join(root, 'SKILL.md')), false, 'Do not advertise a second root skill');
  assert.equal(fs.existsSync(path.join(root, 'references')), false);
  assert.deepEqual(fs.readdirSync(path.join(root, 'skills')), ['polishup']);
  for (const file of ['plugin.json', '.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.antigravity-plugin/plugin.json']) {
    assert.ok(fs.existsSync(path.join(root, file)), `Source manifest missing: ${file}`);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, file)));
    assert.equal(manifest.name, 'polishup');
    assert.equal(manifest.version, metadata.version);
    if (manifest.skills) assert.ok(fs.statSync(path.resolve(root, manifest.skills)).isDirectory());
    for (const forbidden of ['hooks', 'mcpServers', 'apps', 'agents', 'rules']) assert.equal(Object.hasOwn(manifest, forbidden), false);
  }
  const marketplace = JSON.parse(fs.readFileSync(path.join(root, '.agents/plugins/marketplace.json')));
  assert.equal(marketplace.name, 'polishup-local');
  assert.equal(marketplace.plugins[0].name, 'polishup');
  assert.equal(marketplace.plugins[0].source.path, './');
  assert.equal(fs.existsSync(path.join(root, marketplace.plugins[0].source.path, 'plugin.json')), true);
  const portable = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json')));
  assert.equal(portable.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(portable.extensions['com.openai'].interface.displayName, 'PolishUp');
  const shortDescription = portable.extensions['com.openai'].interface.shortDescription;
  assert.ok([...shortDescription].length <= 30, 'Plugin short description must fit the 30-character UI target');
  const skillUi = fs.readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');
  const skillShort = skillUi.match(/^\s*short_description:\s*"([^"]+)"/m)?.[1];
  assert.equal(skillShort, shortDescription, 'Skill and plugin short descriptions must match');
  const antigravity = JSON.parse(fs.readFileSync(path.join(root, '.antigravity-plugin/plugin.json')));
  assert.equal(antigravity.$schema, 'https://antigravity.google/schemas/v1/plugin.json');
  assert.ok(antigravity.suggestedPrompts.length > 0 && antigravity.suggestedPrompts.length <= 3);
  const { loadPayload } = await import('../cli/installations.mjs');
  const payload = loadPayload(root);
  assert.equal(Object.keys(payload.files).length, 39);
  assert.match(payload.files['agents/openai.yaml'].toString('utf8'), /display_name: "PolishUp"/);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, '.codex-plugin/plugin.json'))).interface,
    portable.extensions['com.openai'].interface);
  const claudeMarketplace = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin/marketplace.json')));
  assert.equal(claudeMarketplace.plugins[0].source, './');
  assert.equal(payload.files['LICENSE.txt'].toString('utf8'), license);
  assert.deepEqual(metadata.dependencies, { '@clack/core': '1.6.0', '@clack/prompts': '1.9.0' }, 'Only the CLI prompt libraries are runtime dependencies; the skill and helper remain self-contained');
});

test('npm packs the complete installer directly from source without development files', async t => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const cache = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-npm-cache-')));
  t.after(() => fs.rmSync(cache, { recursive: true, force: true }));
  const npmCli = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ].find(file => file && path.basename(file) === 'npm-cli.js' && fs.existsSync(file));
  assert.ok(npmCli, 'npm is required for package checks; run npm test with a standard Node.js/npm installation.');
  const result = spawnSync(process.execPath, [npmCli, 'pack', '--dry-run', '--json', '--ignore-scripts', '--offline'], {
    cwd: root, encoding: 'utf8', env: { ...process.env, npm_config_cache: cache },
    timeout: 60000, windowsHide: true,
  });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  const report = JSON.parse(result.stdout);
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const packed = Array.isArray(report) ? report[0] : report[metadata.name];
  assert.ok(packed && Array.isArray(packed.files), 'Unexpected npm pack report: ' + result.stdout.slice(0, 800));
  assert.equal(packed.name, metadata.name);
  const { loadPayload } = await import('../cli/installations.mjs');
  const core = Object.keys(loadPayload(root).files).map(file => 'skills/polishup/' + file);
  const expected = [...core, 'README.md', 'LICENSE', 'package.json', '.opencode/commands/polishup.md',
    'plugin.json', '.codex-plugin/plugin.json', '.claude-plugin/plugin.json', '.antigravity-plugin/plugin.json',
    '.agents/plugins/marketplace.json', '.claude-plugin/marketplace.json',
    'cli/plugins.mjs',
    'cli/index.mjs', 'cli/hosts.mjs', 'cli/detection.mjs', 'cli/menu.mjs', 'cli/prompts.mjs', 'cli/installations.mjs', 'cli/update.mjs'];
  assert.deepEqual(packed.files.map(file => file.path).sort(), expected.sort());
  const included = new Set(packed.files.map(file => file.path));
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  for (const match of readme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    const relative = path.posix.normalize(decodeURIComponent(target));
    assert.ok(included.has(relative), `README.md links to an unpackaged file: ${target}`);
  }
});
