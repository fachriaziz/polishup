import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

const packageName = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).name;

async function api() {
  assert.ok(fs.existsSync(new URL('../cli/update.mjs', import.meta.url)), 'Automatic package update must be implemented');
  return import('../cli/update.mjs');
}

test('unpublished local builds never fetch or execute an unrelated registry package', async () => {
  const { checkUpdate } = await api();
  const result = await checkUpdate({ name: packageName, version: '0.1.0', private: true }, {
    fetchImpl: () => { throw new Error('must not fetch'); },
  });
  assert.equal(result.kind, 'local');
});

test('published update selects an exact stable version and rejects invalid identity', async () => {
  const { checkUpdate } = await api();
  const metadata = { name: packageName, version: '0.1.0' };
  let requested;
  const result = await checkUpdate(metadata, { fetchImpl: async url => {
    requested = url;
    return new Response(JSON.stringify({ name: packageName, version: '0.2.0' }));
  } });
  assert.equal(requested, `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`);
  assert.equal(result.version, '0.2.0');
  assert.equal(result.kind, 'newer');
  await assert.rejects(checkUpdate(metadata, { fetchImpl: async () => new Response(JSON.stringify({ name: 'other', version: '1.0.0' })) }), /identity/);
  await assert.rejects(checkUpdate(metadata, { fetchImpl: async () => new Response(JSON.stringify({ name: packageName, version: '1.0.0;echo injected' })) }), /identity/);
});

test('registry failures are not reported as up-to-date and handoffs do not loop', async () => {
  const { checkUpdate } = await api();
  const metadata = { name: packageName, version: '0.1.0' };
  await assert.rejects(checkUpdate(metadata, { fetchImpl: async () => new Response('', { status: 503 }) }), /503/);
  const result = await checkUpdate(metadata, { env: { POLISHUP_UPDATE_HANDOFF: '0.1.0' }, fetchImpl: () => { throw new Error('must not fetch'); } });
  assert.equal(result.kind, 'current');
});

test('delegation uses Node and npm-cli with argument arrays, not a command shell', async () => {
  const { updateInvocation, forwardedTargetArgs } = await api();
  const result = updateInvocation('0.2.0', ['--agent', 'codex', '--scope', 'project'], '/example/npm-cli.js');
  assert.equal(result.executable, process.execPath);
  assert.deepEqual(result.args, ['/example/npm-cli.js', 'exec', '--yes', '--registry=https://registry.npmjs.org/', `--package=${packageName}@0.2.0`, '--', 'polishup', 'update', '--agent', 'codex', '--scope', 'project']);
  assert.throws(() => updateInvocation('x;bad', [], '/npm-cli.js'), /version/);
  assert.deepEqual(forwardedTargetArgs({ agent: 'hermes', scope: 'user', profile: 'writer', replace: true }),
    ['--agent', 'hermes', '--scope', 'user', '--profile', 'writer', '--replace']);
  assert.deepEqual(forwardedTargetArgs({ agents: ['codex', 'hermes'], scope: 'project' }),
    ['--agent', 'codex,hermes', '--scope', 'project']);
  assert.deepEqual(forwardedTargetArgs({ agents: ['manual'], scope: 'project', destination: 'C:/skills/polishup' }),
    ['--agent', 'manual', '--scope', 'project', '--destination', 'C:/skills/polishup']);
});

test('the handoff runs a real child process in the selected project without a global install', async t => {
  const { runNewVersion } = await api();
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-handoff-')));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const cwd = path.join(base, 'project with spaces');
  const npmDir = path.join(base, 'npm tools');
  fs.mkdirSync(cwd); fs.mkdirSync(npmDir);
  const npmCli = path.join(npmDir, 'npm-cli.js');
  const report = path.join(base, 'result.json');
  fs.writeFileSync(npmCli, "require('node:fs').writeFileSync(process.env.POLISHUP_TEST_RESULT, JSON.stringify({args: process.argv.slice(2), cwd: process.cwd(), version: process.env.POLISHUP_UPDATE_HANDOFF}));\n");
  await runNewVersion('0.2.0', ['--agent', 'codex', '--scope', 'project'], {
    cwd, env: { ...process.env, npm_execpath: npmCli, POLISHUP_TEST_RESULT: report },
  });
  const result = JSON.parse(fs.readFileSync(report));
  assert.equal(result.cwd, cwd);
  assert.equal(result.version, '0.2.0');
  assert.equal(result.args.includes(`--package=${packageName}@0.2.0`), true);
  assert.equal(result.args.includes('-g'), false);
});
