import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { compareVersions } from './installations.mjs';

const REGISTRY = 'https://registry.npmjs.org/';
const stableVersion = version => typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version);

export async function checkUpdate(metadata, { fetchImpl = fetch, env = process.env } = {}) {
  if (metadata.private) return { kind: 'local' };
  if (env.POLISHUP_UPDATE_HANDOFF === metadata.version) return { kind: 'current' };
  let response;
  try { response = await fetchImpl(`${REGISTRY}polishup/latest`, { signal: AbortSignal.timeout(8000), redirect: 'error' }); }
  catch (error) { throw new Error(`Could not check for updates: ${error.message}. The installation was not changed. Retry when the registry is available.`); }
  if (!response.ok) throw new Error(`Update registry returned HTTP ${response.status}. The installation was not changed. Retry later.`);
  const latest = await response.json();
  if (latest.name !== 'polishup' || !stableVersion(latest.version)) throw new Error('Invalid update package identity or version.');
  return compareVersions(latest.version, metadata.version) > 0 ? { kind: 'newer', version: latest.version } : { kind: 'current' };
}

export function updateInvocation(version, args, npmCli) {
  if (!stableVersion(version)) throw new Error('Invalid update version.');
  return { executable: process.execPath, args: [npmCli, 'exec', '--yes', `--registry=${REGISTRY}`,
    `--package=polishup@${version}`, '--', 'polishup', 'update', ...args] };
}

export function forwardedTargetArgs({ agent, agents, scope, profile, destination, replace = false }) {
  const selected = agents ?? (agent ? [agent] : []);
  return ['--agent', selected.join(','), '--scope', scope, ...(profile ? ['--profile', profile] : []),
    ...(destination ? ['--destination', destination] : []), ...(replace ? ['--replace'] : [])];
}

function findNpmCli(env) {
  const candidates = [
    env.npm_execpath && path.join(path.dirname(env.npm_execpath), 'npm-cli.js'),
    path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ].filter(Boolean);
  const found = candidates.find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  if (!found) throw new Error('npm-cli.js could not be located. Run npx polishup@latest update instead.');
  return found;
}

export async function runNewVersion(version, args, { cwd = process.cwd(), env = process.env } = {}) {
  const invocation = updateInvocation(version, args, findNpmCli(env));
  return new Promise((resolve, reject) => {
    const child = spawn(invocation.executable, invocation.args, {
      cwd, env: { ...env, POLISHUP_UPDATE_HANDOFF: version }, stdio: 'inherit', shell: false, windowsHide: true,
      timeout: 180000,
    });
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`The newer installer did not complete (${signal || `exit ${code}`}). Inspect its output before retrying.`));
    });
  });
}
