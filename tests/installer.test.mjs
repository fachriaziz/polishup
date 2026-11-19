import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test, mock } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const entry = path.join(root, 'cli/index.mjs');

function fixture(t) {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup test caf\u00e9 \u6e2c\u8a66 ')));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const cwd = path.join(base, 'project with spaces');
  const home = path.join(base, 'home');
  const source = path.join(base, 'package');
  const skillSource = path.join(source, 'skills/polishup');
  for (const directory of [cwd, path.join(cwd, '.git'), home, path.join(skillSource, 'references')]) fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({ name: 'polishup', version: '0.1.0', private: true }));
  fs.writeFileSync(path.join(skillSource, 'SKILL.md'), '---\nname: polishup\ndescription: Test skill\n---\nPreserve existing work.\n');
  fs.writeFileSync(path.join(skillSource, 'references/topic.md'), 'Test guidance.\n');
  return { cwd, home, source, skillSource, base, env: {} };
}

async function api() {
  assert.ok(fs.existsSync(path.join(root, 'cli/installations.mjs')), 'The installer lifecycle must be implemented');
  return import('../cli/installations.mjs');
}

function run(args, f) {
  const env = { ...process.env, HOME: f.home, USERPROFILE: f.home, LOCALAPPDATA: f.home };
  for (const key of ['OPENCODE_CONFIG_DIR', 'XDG_CONFIG_HOME', 'CLAUDE_CONFIG_DIR', 'CODEX_HOME', 'HERMES_HOME',
    'HERMES_DATA_DIR_SUFFIX', 'GEMINI_CLI_HOME', 'PI_CODING_AGENT_DIR', 'OMP_PROFILE', 'PI_PROFILE', 'PI_CONFIG_DIR', 'XDG_DATA_HOME']) delete env[key];
  return spawnSync(process.execPath, [entry, ...args], { cwd: f.cwd, env, encoding: 'utf8' });
}

test('help and the install alias do not require an interactive terminal', t => {
  const f = fixture(t);
  const help = run(['--help'], f);
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /install/);
  assert.match(help.stdout, /update/);
  const missingChoice = run(['install'], f);
  assert.equal(missingChoice.status, 1);
  assert.match(missingChoice.stderr, /--agent/);
  assert.deepEqual(fs.readdirSync(f.cwd), ['.git']);
});

test('help uses commands appropriate to the package publication status', t => {
  const f = fixture(t);
  fs.cpSync(path.join(root, 'cli'), path.join(f.source, 'cli'), { recursive: true });
  fs.mkdirSync(path.join(f.source, '.opencode/commands'), { recursive: true });
  fs.copyFileSync(path.join(root, '.opencode/commands/polishup.md'), path.join(f.source, '.opencode/commands/polishup.md'));
  const localEntry = path.join(f.source, 'cli/index.mjs');
  const local = spawnSync(process.execPath, [localEntry, '--help'], { cwd: f.cwd, encoding: 'utf8' });
  assert.equal(local.status, 0, local.stderr);
  assert.match(local.stdout, /node "<path-to-polishup>\/cli\/index\.mjs" update/);
  assert.doesNotMatch(local.stdout, /npx polishup/);
  assert.deepEqual(fs.readdirSync(f.cwd), ['.git']);

  fs.writeFileSync(path.join(f.source, 'package.json'), JSON.stringify({ name: 'polishup', version: '0.1.0', private: false }));
  const published = spawnSync(process.execPath, [localEntry, '--help'], { cwd: f.cwd, encoding: 'utf8' });
  assert.equal(published.status, 0, published.stderr);
  assert.match(published.stdout, /npx polishup update/);
  assert.doesNotMatch(published.stdout, /<path-to-polishup>/);
  assert.deepEqual(fs.readdirSync(f.cwd), ['.git']);
});

test('unknown commands fail instead of falling through to installation', t => {
  const f = fixture(t);
  const result = run(['udpate'], f);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown command/);
  assert.deepEqual(fs.readdirSync(f.cwd), ['.git']);
});

for (const schema of [1, 2]) {
  for (const action of ['update', 'uninstall']) {
    test(`CLI automatically selects the sole registered shared-path consumer for ${action} (schema ${schema})`, async t => {
      const f = fixture(t);
      const { loadPayload, getTarget, inspect, plan, apply } = await api();
      const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
      apply(plan(target, loadPayload(f.source), 'install'));
      const receiptPath = path.join(target.skillDir, '.polishup-install.json');
      if (schema === 1) {
        const current = inspect(target).receipt;
        fs.writeFileSync(receiptPath, JSON.stringify({ schema: 1, name: current.name, version: current.version,
          revision: current.revision, agent: 'codex', scope: 'project', files: current.files }));
      }
      const before = fs.readFileSync(receiptPath);
      const preview = run([action, '--scope', 'project', '--dry-run'], f);
      assert.equal(preview.status, 0, preview.stderr || preview.stdout);
      assert.match(preview.stdout, /Codex \|/);
      assert.deepEqual(fs.readFileSync(receiptPath), before);
      const result = run([action, '--scope', 'project'], f);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      if (action === 'update') {
        const installed = inspect(target);
        assert.deepEqual(installed.hashes, loadPayload(root).hashes);
        assert.deepEqual(installed.consumers.map(item => item.agent), ['codex']);
      } else assert.equal(fs.existsSync(target.skillDir), false);
    });
  }
}

test('CLI keeps registered shared consumers distinct and selects the remaining consumer after detach', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, inspect, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const codex = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const antigravity = getTarget({ ...f, agent: 'antigravity', scope: 'project' });
  apply(plan(codex, payload, 'install'));
  apply(plan(antigravity, payload, 'install'));
  const receiptPath = path.join(codex.skillDir, '.polishup-install.json');
  const before = fs.readFileSync(receiptPath);
  for (const action of ['update', 'uninstall']) {
    const ambiguous = run([action, '--scope', 'project', '--dry-run'], f);
    assert.equal(ambiguous.status, 1);
    assert.match(ambiguous.stderr, /--agent/);
    assert.deepEqual(fs.readFileSync(receiptPath), before);
  }
  const detach = run(['uninstall', '--agent', 'codex', '--scope', 'project'], f);
  assert.equal(detach.status, 0, detach.stderr || detach.stdout);
  assert.ok(fs.existsSync(path.join(codex.skillDir, 'SKILL.md')));
  assert.deepEqual(inspect(antigravity).consumers.map(item => item.agent), ['antigravity']);
  const preview = run(['update', '--scope', 'project', '--dry-run'], f);
  assert.equal(preview.status, 0, preview.stderr || preview.stdout);
  assert.match(preview.stdout, /Antigravity \|/);
  const removeLast = run(['uninstall', '--scope', 'project'], f);
  assert.equal(removeLast.status, 0, removeLast.stderr || removeLast.stdout);
  assert.equal(fs.existsSync(codex.skillDir), false);
});

test('CLI auto-selection ignores unmanaged folders and explicit removal retains their backup', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const claude = getTarget({ ...f, agent: 'claude', scope: 'project' });
  const codex = getTarget({ ...f, agent: 'codex', scope: 'project' });
  apply(plan(claude, loadPayload(f.source), 'install'));
  fs.mkdirSync(codex.skillDir, { recursive: true });
  const unmanaged = path.join(codex.skillDir, 'SKILL.md');
  fs.writeFileSync(unmanaged, 'User-managed skill.');
  const selected = run(['update', '--scope', 'project', '--dry-run'], f);
  assert.equal(selected.status, 0, selected.stderr || selected.stdout);
  assert.match(selected.stdout, /Claude Code \|/);
  assert.equal(fs.readFileSync(unmanaged, 'utf8'), 'User-managed skill.');
  const refused = run(['uninstall', '--agent', 'codex', '--scope', 'project'], f);
  assert.equal(refused.status, 1);
  assert.equal(fs.readFileSync(unmanaged, 'utf8'), 'User-managed skill.');
  const removed = run(['uninstall', '--agent', 'codex', '--scope', 'project', '--replace'], f);
  assert.equal(removed.status, 0, removed.stderr || removed.stdout);
  assert.equal(fs.existsSync(codex.skillDir), false);
  const backup = fs.readdirSync(path.join(codex.stateRoot, 'backups'));
  assert.equal(backup.length, 1);
  assert.equal(fs.readFileSync(path.join(codex.stateRoot, 'backups', backup[0], 'skill/SKILL.md'), 'utf8'), 'User-managed skill.');
  assert.ok(fs.existsSync(path.join(claude.skillDir, 'SKILL.md')));
});

for (const agent of ['codex', 'claude', 'opencode', 'antigravity', 'hermes', 'cursor', 'omp', 'gemini', 'copilot']) {
  test(`${agent}: install, repeat, update, and uninstall preserve unrelated files`, async t => {
    const f = fixture(t);
    const { loadPayload, getTarget, plan, apply } = await api();
    const target = getTarget({ ...f, agent, scope: 'project' });
    fs.mkdirSync(target.configRoot, { recursive: true });
    const unrelated = path.join(target.configRoot, 'keep.txt');
    fs.writeFileSync(unrelated, 'user content');
    let payload = loadPayload(f.source);
    const preview = apply(plan(target, payload, 'install'), { dryRun: true });
    assert.equal(preview.changed, false);
    assert.equal(fs.existsSync(target.skillDir), false);
    assert.equal(fs.existsSync(target.stateRoot), false);
    assert.equal(apply(plan(target, payload, 'install')).changed, true);
    assert.equal(fs.readFileSync(path.join(target.skillDir, 'references/topic.md'), 'utf8'), 'Test guidance.\n');
    assert.equal(apply(plan(target, payload, 'install')).changed, false);
    if (agent === 'opencode') assert.match(fs.readFileSync(target.commandFile, 'utf8'), /\$ARGUMENTS/);
    fs.writeFileSync(path.join(f.skillSource, 'references/topic.md'), 'Updated guidance.\n');
    payload = loadPayload(f.source);
    assert.equal(apply(plan(target, payload, 'update')).changed, true);
    assert.equal(fs.readFileSync(path.join(target.skillDir, 'references/topic.md'), 'utf8'), 'Updated guidance.\n');
    assert.equal(apply(plan(target, payload, 'uninstall')).changed, true);
    assert.equal(fs.existsSync(target.skillDir), false);
    if (target.commandFile) assert.equal(fs.existsSync(target.commandFile), false);
    assert.equal(fs.readFileSync(unrelated, 'utf8'), 'user content');
  });
}

for (const agent of ['codex', 'opencode']) {
  test(`${agent}: package-only version updates refresh the receipt`, async t => {
    const f = fixture(t);
    const { loadPayload, getTarget, inspect, plan, apply } = await api();
    const target = getTarget({ ...f, agent, scope: 'project' });
    const original = loadPayload(f.source);
    apply(plan(target, original, 'install'));
    if (agent === 'codex') {
      const shared = getTarget({ ...f, agent: 'antigravity', scope: 'project' });
      apply(plan(shared, original, 'install'));
    }
    const before = inspect(target);
    const receiptPath = path.join(target.skillDir, '.polishup-install.json');
    const receiptBytes = fs.readFileSync(receiptPath);
    const commandBytes = target.commandFile ? fs.readFileSync(target.commandFile) : null;
    fs.writeFileSync(path.join(f.source, 'package.json'), JSON.stringify({ name: 'polishup', version: '0.1.1', private: true }));
    const newer = loadPayload(f.source);
    assert.equal(newer.revision, original.revision);
    const update = plan(target, newer, 'update');
    assert.equal(update.kind, 'update');
    assert.equal(apply(update, { dryRun: true }).changed, false);
    assert.deepEqual(fs.readFileSync(receiptPath), receiptBytes);
    const result = apply(update);
    assert.equal(result.changed, true);
    const after = inspect(target);
    assert.equal(after.receipt.version, '0.1.1');
    assert.deepEqual(after.hashes, before.hashes);
    assert.deepEqual(after.consumers.map(item => item.agent).sort(), before.consumers.map(item => item.agent).sort());
    if (target.commandFile) assert.deepEqual(fs.readFileSync(target.commandFile), commandBytes);
    assert.deepEqual(fs.readFileSync(path.join(result.backup, 'skill/.polishup-install.json')), receiptBytes);
    const repeat = plan(target, newer, 'update');
    assert.equal(repeat.kind, 'none');
    assert.equal(apply(repeat).changed, false);
    assert.throws(() => apply(plan(target, original, 'update')), /downgrade|conflict/i);
    assert.equal(inspect(target).receipt.version, '0.1.1');
  });
}

test('update and uninstall protect local edits and custom files; explicit replacement retains a backup', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const payload = loadPayload(f.source);
  apply(plan(target, payload, 'install'));
  fs.writeFileSync(path.join(target.skillDir, 'SKILL.md'), 'custom instructions');
  fs.writeFileSync(path.join(target.skillDir, 'custom.md'), 'personal note');
  for (const action of ['update', 'uninstall']) assert.throws(() => apply(plan(target, payload, action)), /modified|custom|conflict/i);
  const result = apply(plan(target, payload, 'update'), { replace: true });
  assert.equal(fs.readFileSync(path.join(result.backup, 'skill/SKILL.md'), 'utf8'), 'custom instructions');
  assert.equal(fs.readFileSync(path.join(result.backup, 'skill/custom.md'), 'utf8'), 'personal note');
  assert.ok(!result.backup.startsWith(path.join(target.configRoot, 'skills') + path.sep));
});

test('unmanaged folders and existing OpenCode commands are not silently overwritten', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const target = getTarget({ ...f, agent: 'opencode', scope: 'project' });
  fs.mkdirSync(target.skillDir, { recursive: true });
  fs.mkdirSync(path.dirname(target.commandFile), { recursive: true });
  fs.writeFileSync(path.join(target.skillDir, 'SKILL.md'), 'manual skill');
  fs.writeFileSync(target.commandFile, 'manual command');
  assert.throws(() => apply(plan(target, loadPayload(f.source), 'install')), /unmanaged|conflict/i);
  assert.equal(fs.readFileSync(target.commandFile, 'utf8'), 'manual command');
});

test('project and personal scopes remain separate, including an OpenCode config override', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const project = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const user = getTarget({ ...f, agent: 'codex', scope: 'user' });
  apply(plan(project, payload, 'install'));
  apply(plan(user, payload, 'install'));
  apply(plan(project, payload, 'uninstall'));
  assert.equal(fs.existsSync(user.skillDir), true);
  const custom = getTarget({ ...f, agent: 'opencode', scope: 'user', env: { OPENCODE_CONFIG_DIR: path.join(f.home, 'profile') } });
  assert.equal(custom.configRoot, path.join(f.home, 'profile'));
});

test('shared project skills track known hosts and uninstall only detaches the selected host', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const codex = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const antigravity = getTarget({ ...f, agent: 'antigravity', scope: 'project' });
  const hermes = getTarget({ ...f, agent: 'hermes', scope: 'project' });
  assert.equal(codex.skillDir, antigravity.skillDir);
  assert.equal(codex.skillDir, hermes.skillDir);
  apply(plan(codex, payload, 'install'));
  apply(plan(antigravity, payload, 'install'));
  apply(plan(hermes, payload, 'install'));
  const receiptPath = path.join(codex.skillDir, '.polishup-install.json');
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(receipt.schema, 2);
  assert.deepEqual(receipt.consumers.map(item => item.agent).sort(), ['antigravity', 'codex', 'hermes']);
  apply(plan(antigravity, payload, 'uninstall'));
  assert.equal(fs.existsSync(path.join(codex.skillDir, 'SKILL.md')), true);
  assert.deepEqual(JSON.parse(fs.readFileSync(receiptPath, 'utf8')).consumers.map(item => item.agent).sort(), ['codex', 'hermes']);
  apply(plan(codex, payload, 'update'));
  assert.deepEqual(JSON.parse(fs.readFileSync(receiptPath, 'utf8')).consumers.map(item => item.agent).sort(), ['codex', 'hermes']);
  apply(plan(hermes, payload, 'uninstall'));
  assert.equal(fs.existsSync(codex.skillDir), true);
  apply(plan(codex, payload, 'uninstall'));
  assert.equal(fs.existsSync(codex.skillDir), false);
});

test('schema 1 receipts migrate safely when the managed skill is next updated', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
  apply(plan(target, payload, 'install'));
  const receiptPath = path.join(target.skillDir, '.polishup-install.json');
  const current = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  fs.writeFileSync(receiptPath, JSON.stringify({ schema: 1, name: current.name, version: current.version,
    revision: current.revision, agent: 'codex', scope: 'project', files: current.files }));
  apply(plan(target, payload, 'update'));
  const migrated = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(migrated.schema, 2);
  assert.deepEqual(migrated.consumers, [{ agent: 'codex', scope: 'project', profile: null }]);
});

test('a legacy shared-project receipt can attach another documented host', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const codex = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const hermes = getTarget({ ...f, agent: 'hermes', scope: 'project' });
  apply(plan(codex, payload, 'install'));
  const receiptPath = path.join(codex.skillDir, '.polishup-install.json');
  const current = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  fs.writeFileSync(receiptPath, JSON.stringify({ schema: 1, name: current.name, version: current.version,
    revision: current.revision, agent: 'codex', scope: 'project', files: current.files }));
  apply(plan(hermes, payload, 'install'));
  const migrated = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(migrated.schema, 2);
  assert.deepEqual(migrated.consumers.map(item => item.agent).sort(), ['codex', 'hermes']);
  apply(plan(hermes, payload, 'uninstall'));
  assert.equal(fs.existsSync(path.join(codex.skillDir, 'SKILL.md')), true);
});

test('Hermes project scope requires a Git root and never grants repository trust', async t => {
  const f = fixture(t);
  const { getTarget } = await api();
  fs.rmSync(path.join(f.cwd, '.git'), { recursive: true });
  assert.throws(() => getTarget({ ...f, agent: 'hermes', scope: 'project' }), /Git project root/i);
});

test('a config override cannot replace or remove the canonical source skill', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan } = await api();
  const payload = loadPayload(f.source);
  const target = getTarget({ ...f, agent: 'claude', scope: 'user', env: { CLAUDE_CONFIG_DIR: f.source } });
  assert.equal(target.skillDir, f.skillSource);
  for (const action of ['install', 'update', 'uninstall']) {
    assert.throws(() => plan(target, payload, action), /source.*itself/i);
  }
  const ancestor = { ...target, skillDir: f.source };
  assert.throws(() => plan(ancestor, payload, 'uninstall'), /source.*itself/i);
  assert.equal(fs.readFileSync(path.join(f.skillSource, 'references/topic.md'), 'utf8'), 'Test guidance.\n');
});

test('invalid receipt paths and junction destinations are rejected', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const payload = loadPayload(f.source);
  const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
  apply(plan(target, payload, 'install'));
  const receiptPath = path.join(target.skillDir, '.polishup-install.json');
  const receipt = JSON.parse(fs.readFileSync(receiptPath));
  receipt.files['../outside.txt'] = 'a'.repeat(64);
  fs.writeFileSync(receiptPath, JSON.stringify(receipt));
  assert.throws(() => plan(target, payload, 'uninstall'), /receipt|path/i);
  const outside = path.join(f.base, 'outside');
  fs.mkdirSync(outside);
  const linkedProject = path.join(f.base, 'linked');
  fs.symlinkSync(outside, linkedProject, process.platform === 'win32' ? 'junction' : 'dir');
  const linkedTarget = getTarget({ ...f, cwd: linkedProject, agent: 'claude', scope: 'project' });
  assert.throws(() => plan(linkedTarget, payload, 'install'), /link|junction/i);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('a failed command commit restores the previous skill and command', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const target = getTarget({ ...f, agent: 'opencode', scope: 'project' });
  const oldPayload = loadPayload(f.source);
  apply(plan(target, oldPayload, 'install'));
  fs.writeFileSync(path.join(f.skillSource, 'references/topic.md'), 'new version');
  const original = fs.renameSync;
  let injected = false;
  const rename = mock.method(fs, 'renameSync', (from, to) => {
    if (!injected && String(from).endsWith('command.md') && to === target.commandFile) {
      injected = true;
      throw Object.assign(new Error('simulated locked command'), { code: 'EPERM' });
    }
    return original(from, to);
  });
  try {
    assert.throws(() => apply(plan(target, loadPayload(f.source), 'update')), /locked command/);
  } finally { rename.mock.restore(); }
  assert.equal(injected, true);
  assert.equal(fs.readFileSync(path.join(target.skillDir, 'references/topic.md'), 'utf8'), 'Test guidance.\n');
  assert.match(fs.readFileSync(target.commandFile, 'utf8'), /\$ARGUMENTS/);
});

test('a stale operation or interrupted-operation lock cannot overwrite newer state', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const payload = loadPayload(f.source);
  apply(plan(target, payload, 'install'));
  fs.writeFileSync(path.join(f.skillSource, 'references/topic.md'), 'new upstream');
  const operation = plan(target, loadPayload(f.source), 'update');
  fs.writeFileSync(path.join(target.skillDir, 'references/topic.md'), 'edit after preview');
  assert.throws(() => apply(operation), /changed after inspection/);
  assert.equal(fs.readFileSync(path.join(target.skillDir, 'references/topic.md'), 'utf8'), 'edit after preview');
  fs.writeFileSync(path.join(target.stateRoot, 'lock'), 'interrupted');
  assert.throws(() => plan(target, payload, 'uninstall'), /interrupted operation|lock/i);
});

test('CLI optional flags support noninteractive lifecycle and the real 37-file payload', t => {
  const f = fixture(t);
  const flags = ['--agent', 'codex', '--scope', 'project'];
  const preview = run(['install', ...flags, '--dry-run'], f);
  assert.equal(preview.status, 0, preview.stderr);
  assert.deepEqual(fs.readdirSync(f.cwd), ['.git']);
  assert.equal(run(['install', ...flags], f).status, 0);
  assert.equal(run(flags, f).status, 0);
  const skill = path.join(f.cwd, '.agents/skills/polishup');
  const receipt = JSON.parse(fs.readFileSync(path.join(skill, '.polishup-install.json')));
  assert.equal(Object.keys(receipt.files).length, 37);
  assert.equal(run(['update', ...flags], f).status, 0);
  assert.equal(run(['uninstall', ...flags], f).status, 0);
  assert.equal(fs.existsSync(skill), false);
});

test('CLI supports Antigravity and Hermes plus an explicit Hermes profile', async t => {
  const f = fixture(t);
  const { getTarget } = await api();
  const hermesHome = path.join(f.home, 'hermes');
  const profileHome = path.join(hermesHome, 'profiles', 'writer');
  fs.mkdirSync(profileHome, { recursive: true });
  assert.equal(getTarget({ ...f, agent: 'hermes', scope: 'user', profile: 'writer', env: { LOCALAPPDATA: f.home } }).configRoot,
    profileHome);
  const ag = getTarget({ ...f, agent: 'antigravity', scope: 'user' });
  assert.equal(ag.configRoot, path.join(f.home, '.gemini', 'config'));
  const hermesFlags = ['install', '--agent', 'hermes', '--scope', 'user', '--profile', 'writer', '--dry-run'];
  const preview = run(hermesFlags, f);
  assert.equal(preview.status, 0, preview.stderr);
  assert.match(preview.stdout, /writer/);
  assert.deepEqual(fs.readdirSync(profileHome), []);
  const antigravityFlags = ['install', '--agent', 'antigravity', '--scope', 'user', '--dry-run'];
  assert.equal(run(antigravityFlags, f).status, 0);
  assert.throws(() => getTarget({ ...f, agent: 'claude', scope: 'user', profile: 'writer' }), /only applies to Hermes/i);
});

test('backup junctions cannot move user files outside the selected configuration root', async t => {
  const f = fixture(t);
  const { loadPayload, getTarget, plan, apply } = await api();
  const target = getTarget({ ...f, agent: 'codex', scope: 'project' });
  const payload = loadPayload(f.source);
  apply(plan(target, payload, 'install'));
  const outside = path.join(f.base, 'external backups');
  fs.mkdirSync(outside);
  fs.rmdirSync(path.join(target.stateRoot, 'backups'));
  fs.symlinkSync(outside, path.join(target.stateRoot, 'backups'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => apply(plan(target, payload, 'uninstall')), /link|junction/i);
  assert.equal(fs.existsSync(path.join(target.skillDir, 'SKILL.md')), true);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('CLI installs multiple targets and coalesces shared project consumers', t => {
  const f = fixture(t);
  const result = run(['install', '--agent', 'codex,hermes', '--scope', 'project'], f);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Codex.*Hermes|Hermes.*Codex/);
  const skill = path.join(f.cwd, '.agents/skills/polishup');
  const receipt = JSON.parse(fs.readFileSync(path.join(skill, '.polishup-install.json')));
  assert.deepEqual(receipt.consumers.map(item => item.agent).sort(), ['codex', 'hermes']);
  assert.equal(run(['update', '--agent', 'codex,hermes', '--scope', 'project'], f).status, 0);
  assert.equal(run(['uninstall', '--agent', 'codex,hermes', '--scope', 'project'], f).status, 0);
  assert.equal(fs.existsSync(skill), false);
});

test('CLI manages a manual destination with the same receipt, backup, update, and removal protections', t => {
  const f = fixture(t);
  const destination = path.join(f.cwd, 'custom-skills/polishup');
  const args = ['--agent', 'manual', '--destination', destination, '--scope', 'project'];
  const installed = run(['install', ...args], f);
  assert.equal(installed.status, 0, installed.stderr);
  assert.match(installed.stdout, /Manual destination/);
  assert.match(fs.readFileSync(path.join(destination, 'SKILL.md'), 'utf8'), /name: polishup/);
  const receiptPath = path.join(destination, '.polishup-install.json');
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  assert.equal(receipt.consumers[0].agent, 'manual');
  assert.equal(receipt.consumers[0].profile, process.platform === 'win32' ? destination.toLowerCase() : destination);
  const updateArgs = ['--agent', 'manual', '--destination', process.platform === 'win32' ? destination.toUpperCase() : destination, '--scope', 'project'];
  assert.equal(run(['update', ...updateArgs], f).status, 0);
  assert.equal(run(['uninstall', ...args], f).status, 0);
  assert.equal(fs.existsSync(destination), false);
});

test('a failed target does not prevent an independent selected target from installing', t => {
  const f = fixture(t);
  const target = path.join(f.cwd, '.agents/skills/polishup');
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, 'custom.md'), 'keep this unmanaged folder');
  const result = run(['install', '--agent', 'codex,claude', '--scope', 'project'], f);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Codex: skipped because conflicts/i);
  assert.match(result.stdout, /Claude Code.*installed|installed.*Claude Code/i);
  assert.equal(fs.readFileSync(path.join(target, 'custom.md'), 'utf8'), 'keep this unmanaged folder');
  assert.equal(fs.existsSync(path.join(f.cwd, '.claude/skills/polishup/SKILL.md')), true);
});
