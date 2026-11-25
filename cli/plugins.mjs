import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { detectHarnesses } from './detection.mjs';

export const PLUGIN_HOSTS = { codex: 'Codex / ChatGPT desktop', claude: 'Claude Code' };
const selector = 'polishup@polishup-local';
const repository = 'fachriaziz/polishup';

export function pluginCommands(agent, action, scope = 'user') {
  if (!Object.hasOwn(PLUGIN_HOSTS, agent)) throw new Error('Native plugin installation supports Codex and Claude Code. Use the skill installer for other agents.');
  if (!['install', 'update', 'uninstall'].includes(action)) throw new Error('Invalid plugin action.');
  if (!['user', 'project'].includes(scope)) throw new Error('Invalid plugin scope.');
  if (agent === 'codex' && scope !== 'user') throw new Error('The native Codex CLI manages personal plugins. Use --scope user, or install a project-scoped skill without --plugin.');
  if (agent === 'codex') {
    if (action === 'uninstall') return [['plugin', 'remove', selector]];
    return [action === 'install' ? ['plugin', 'marketplace', 'add', repository]
      : ['plugin', 'marketplace', 'upgrade', 'polishup-local'], ['plugin', 'add', selector]];
  }
  if (action === 'uninstall') return [['plugin', 'uninstall', selector, '--scope', scope]];
  return [action === 'install' ? ['plugin', 'marketplace', 'add', repository]
    : ['plugin', 'marketplace', 'update', 'polishup-local'], ['plugin', action, selector, '--scope', scope]];
}

export function pluginInvocation(agent, { env = process.env, platform = process.platform, launcher } = {}) {
  if (!Object.hasOwn(PLUGIN_HOSTS, agent)) throw new Error('Unsupported plugin host.');
  const detected = launcher ? undefined : detectHarnesses({ env, platform })[agent];
  const executable = launcher || (detected?.status === 'detected' ? detected.evidence : undefined);
  if (!executable) throw new Error(`${PLUGIN_HOSTS[agent]} CLI was not found. Install or update the host CLI, or use its native plugin manager. No host software was installed.`);
  if (platform !== 'win32' || !/\.(cmd|bat)$/i.test(executable)) return { executable, prefix: [] };
  // npm's Windows shims cannot be spawned directly. Resolve the declared Node entry instead.
  const packageName = agent === 'codex' ? '@openai/codex' : '@anthropic-ai/claude-code';
  for (const root of [path.join(path.dirname(executable), 'node_modules', packageName), path.join(path.dirname(executable), '..', packageName)]) {
    const manifest = path.join(root, 'package.json');
    if (!fs.existsSync(manifest)) continue;
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    const relative = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[agent];
    if (pkg.name !== packageName || typeof relative !== 'string') continue;
    const entry = path.resolve(root, relative);
    const contained = path.relative(path.resolve(root), entry);
    if (!contained || contained.startsWith('..') || path.isAbsolute(contained)) throw new Error('Native CLI entry is outside its package.');
    if (fs.statSync(entry, { throwIfNoEntry: false })?.isFile()) return { executable: process.execPath, prefix: [entry] };
  }
  throw new Error('This Windows CLI launcher could not be resolved safely. Use the native plugin commands directly, or install the host native executable.');
}

const runNative = (executable, args, { cwd = process.cwd(), env = process.env } = {}) => new Promise((resolve, reject) => {
  const child = spawn(executable, args, { cwd, env, stdio: 'inherit', shell: false, windowsHide: true });
  child.once('error', error => reject(new Error(`Cannot run native plugin manager: ${error.message}`)));
  child.once('close', (code, signal) => {
    if (code === 0) resolve();
    else if (code === 130 || signal === 'SIGINT') reject(new Error('Cancelled.'));
    else reject(new Error(`Native plugin manager failed (${signal || `exit ${code}`}). Check its output and host CLI version before retrying.`));
  });
});

export async function runPlugin({ agent, action, scope = 'user' }, { invocation, run = runNative, cwd, env = process.env, platform } = {}) {
  const commands = pluginCommands(agent, action, scope);
  const resolved = invocation || pluginInvocation(agent, { env, platform });
  for (const args of commands) await run(resolved.executable, [...resolved.prefix, ...args], { cwd, env });
}
