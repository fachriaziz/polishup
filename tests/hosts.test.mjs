import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { getManualTarget, getTarget } from '../cli/hosts.mjs';

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'polishup-hosts-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const home = path.join(root, 'home');
  const project = path.join(root, 'repo');
  const nested = path.join(project, 'packages', 'app');
  fs.mkdirSync(path.join(project, '.git'), { recursive: true });
  fs.mkdirSync(nested, { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  return { root, home, project, nested };
}

test('additional harnesses use documented project and personal locations without command wrappers', t => {
  const f = fixture(t);
  for (const [agent, projectDir, userDir] of [
    ['cursor', '.cursor', '.cursor'], ['omp', '.omp', '.omp/agent'],
    ['gemini', '.gemini', '.gemini'], ['copilot', '.github', '.copilot'],
  ]) {
    const project = getTarget({ ...f, cwd: f.nested, agent, scope: 'project', env: {} });
    assert.equal(project.skillDir, path.join(f.project, projectDir, 'skills', 'polishup'));
    assert.equal(project.commandFile, null);
    const user = getTarget({ ...f, agent, scope: 'user', env: {} });
    assert.equal(user.skillDir, path.join(f.home, userDir, 'skills', 'polishup'));
  }
});

test('OMP custom homes are explicit and unresolved profiles are rejected', t => {
  const f = fixture(t);
  const agentDir = path.join(f.home, 'custom-agent');
  assert.equal(getTarget({ ...f, agent: 'omp', scope: 'user', env: { PI_CODING_AGENT_DIR: agentDir, OMP_PROFILE: 'writer' } }).skillDir,
    path.join(agentDir, 'skills', 'polishup'));
  for (const env of [{ OMP_PROFILE: 'writer' }, { PI_CONFIG_DIR: '.custom' }, { XDG_DATA_HOME: '/data' }]) {
    assert.throws(() => getTarget({ ...f, agent: 'omp', scope: 'user', platform: 'linux', env }), /effective agent directory/i);
  }
});

test('Gemini personal skills honor absolute and relative home overrides', t => {
  const f = fixture(t);
  for (const configuredHome of [path.join(f.root, 'gemini home'), 'relative-home']) {
    const target = getTarget({ ...f, cwd: f.nested, agent: 'gemini', scope: 'user', env: { GEMINI_CLI_HOME: configuredHome } });
    assert.equal(target.skillDir, path.resolve(f.nested, configuredHome, '.gemini', 'skills', 'polishup'));
    assert.equal(target.stateRoot, path.resolve(f.nested, configuredHome, '.gemini', '.polishup'));
    assert.equal(fs.existsSync(target.configRoot), false, 'Resolving a target must not create directories');
  }
  assert.equal(getTarget({ ...f, agent: 'gemini', scope: 'user', env: { GEMINI_CLI_HOME: '' } }).skillDir,
    path.join(f.home, '.gemini', 'skills', 'polishup'));
});

test('Gemini project skills stay project-local when personal home is overridden', t => {
  const f = fixture(t);
  const target = getTarget({ ...f, cwd: f.nested, agent: 'gemini', scope: 'project', env: { GEMINI_CLI_HOME: path.join(f.root, 'gemini-home') } });
  assert.equal(target.skillDir, path.join(f.project, '.gemini', 'skills', 'polishup'));
});

test('Codex, Antigravity and Hermes use their common discovered project skills directory', t => {
  const f = fixture(t);
  const targets = ['codex', 'antigravity', 'hermes'].map(agent =>
    getTarget({ ...f, cwd: f.nested, agent, scope: 'project', home: f.home, env: {} }));
  assert.ok(targets.every(target => target.skillDir === path.join(f.project, '.agents', 'skills', 'polishup')));
  assert.ok(targets.every(target => target.configRoot === path.join(f.project, '.agents')));
  assert.ok(targets.every(target => target.projectRoot === f.project));
});

test('Codex user scope honors CODEX_HOME while default remains the cross-tool directory', t => {
  const f = fixture(t);
  assert.equal(getTarget({ ...f, agent: 'codex', scope: 'user', home: f.home, env: {} }).skillDir,
    path.join(f.home, '.agents', 'skills', 'polishup'));
  const codexHome = path.join(f.home, 'codex-config');
  fs.mkdirSync(codexHome);
  assert.equal(getTarget({ ...f, agent: 'codex', scope: 'user', home: f.home, env: { CODEX_HOME: codexHome } }).skillDir,
    path.join(codexHome, 'skills', 'polishup'));
  assert.throws(() => getTarget({ ...f, agent: 'codex', scope: 'user', home: f.home, env: { CODEX_HOME: path.join(f.home, 'missing') } }), /CODEX_HOME.*existing directory/i);
});

test('Antigravity App, IDE and CLI share their documented user skill path', t => {
  const f = fixture(t);
  const target = getTarget({ ...f, agent: 'antigravity', scope: 'user', home: f.home, env: {} });
  assert.equal(target.skillDir, path.join(f.home, '.gemini', 'config', 'skills', 'polishup'));
});

test('Hermes user scope honors the effective home and named profile without writing either', t => {
  const f = fixture(t);
  const env = { LOCALAPPDATA: path.join(f.home, 'AppData', 'Local') };
  const custom = path.join(f.root, 'hermes-custom');
  fs.mkdirSync(path.join(custom, 'profiles', 'writer'), { recursive: true });
  const envTarget = getTarget({ ...f, agent: 'hermes', scope: 'user', home: f.home, env: { ...env, HERMES_HOME: custom } });
  assert.equal(envTarget.skillDir, path.join(custom, 'skills', 'polishup'));
  assert.equal(envTarget.profile, 'custom');
  const profile = path.join(env.LOCALAPPDATA, 'hermes', 'profiles', 'writer');
  fs.mkdirSync(profile, { recursive: true });
  assert.equal(getTarget({ ...f, agent: 'hermes', scope: 'user', home: f.home, env, profile: 'writer' }).skillDir,
    path.join(profile, 'skills', 'polishup'));
  assert.equal(getTarget({ ...f, agent: 'hermes', scope: 'user', home: f.home, env: { ...env, HERMES_HOME: custom }, profile: 'writer' }).skillDir,
    path.join(custom, 'profiles', 'writer', 'skills', 'polishup'));
  assert.throws(() => getTarget({ ...f, agent: 'hermes', scope: 'user', home: f.home, env, profile: 'missing' }), /does not exist/i);
  assert.throws(() => getTarget({ ...f, agent: 'hermes', scope: 'user', home: f.home, env, profile: 'Bad Name' }), /profile name/i);
});

test('Hermes home variables follow the selected operating system', t => {
  const f = fixture(t);
  for (const platform of ['linux', 'darwin']) {
    const shared = { ...f, cwd: f.nested, agent: 'hermes', scope: 'user', platform };
    const target = getTarget({ ...shared, env: { HERMES_HOME: '$profile_home/hermes', profile_home: f.home } });
    assert.equal(target.configRoot, path.join(f.home, 'hermes'));
    assert.throws(() => getTarget({ ...shared, env: { HERMES_HOME: '$profile_home/hermes', PROFILE_HOME: f.home } }), /not set/);
    const literal = getTarget({ ...shared, env: { HERMES_HOME: '%profile_home%/hermes', profile_home: f.home } });
    assert.equal(literal.configRoot, path.resolve(f.nested, '%profile_home%/hermes'));
  }
  const windows = getTarget({ ...f, cwd: f.nested, agent: 'hermes', scope: 'user', platform: 'win32',
    env: { HERMES_HOME: '%profile_home%/hermes', Profile_Home: f.home } });
  assert.equal(windows.configRoot, path.join(f.home, 'hermes'));
});

test('manual destinations preserve the portable skill name on POSIX', t => {
  const f = fixture(t);
  for (const platform of ['linux', 'darwin']) {
    assert.throws(() => getManualTarget({ ...f, cwd: f.nested, destination: './PolishUp', scope: 'project', platform }), /polishup/);
  }
  assert.equal(path.basename(getManualTarget({ ...f, cwd: f.nested, destination: './POLISHUP', scope: 'project', platform: 'win32' }).skillDir), 'POLISHUP');
});

test('native host resolution never guesses a manual destination', t => {
  const f = fixture(t);
  for (const scope of ['project', 'user']) {
    assert.throws(() => getTarget({ ...f, cwd: f.nested, agent: 'manual', scope, env: {} }), /manual destination/i);
  }
});
