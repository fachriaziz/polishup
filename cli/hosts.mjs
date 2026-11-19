import fs from 'node:fs';
import os from 'node:os';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const HOSTS = {
  codex: { projectDir: '.agents', label: 'Codex', invocation: '$polishup review ...' },
  claude: { projectDir: '.claude', label: 'Claude Code', invocation: '/polishup review ...' },
  opencode: { projectDir: '.opencode', label: 'OpenCode', invocation: '/polishup review ...' },
  cursor: { projectDir: '.cursor', label: 'Cursor', invocation: '/polishup review ... (select the skill in Agent chat)' },
  omp: { projectDir: '.omp', label: 'Oh My Pi (OMP)', invocation: '/skill:polishup review ... (when skill commands are enabled)' },
  gemini: { projectDir: '.gemini', label: 'Gemini CLI', invocation: 'Use the polishup skill to review ...; approve native activation when prompted.' },
  copilot: { projectDir: '.github', label: 'GitHub Copilot', invocation: 'Use the polishup skill to review ...' },
  antigravity: { projectDir: '.agents', label: 'Antigravity', invocation: '/polishup review ...' },
  hermes: { projectDir: '.agents', label: 'Hermes', invocation: '/skill polishup (then state the task and target)' },
  manual: { label: 'Manual destination', invocation: 'Read the installed SKILL.md and follow its linked references.' },
};

export function getStorageGroup(agent, scope) {
  return scope === 'project' && HOSTS[agent]?.projectDir === '.agents' ? 'agents-project' : `${agent}-${scope}`;
}
const PROFILE_NAME = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const RESERVED_PROFILES = new Set(['hermes', 'default', 'test', 'tmp', 'root', 'sudo']);

function projectRootFor(cwd) {
  let current = path.resolve(cwd);
  while (true) {
    if (fs.existsSync(path.join(current, '.git'))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(cwd);
    current = parent;
  }
}

function expandHome(value, home) {
  return value === '~' || value.startsWith(`~${path.sep}`) || value.startsWith('~/') || value.startsWith('~\\')
    ? path.join(home, value.slice(2))
    : value;
}

function expandHermesPath(value, { home, env, cwd, platform }) {
  let unresolved = false;
  const expanded = expandHome(value, home).replace(/%([^%]+)%|\$\{([^}]+)\}|\$([A-Za-z0-9_]+)/g, (match, win, braced, plain) => {
    if (win && platform !== 'win32') return match;
    const key = win || braced || plain;
    const result = env[key] ?? (platform === 'win32'
      ? Object.entries(env).find(([name]) => name.toLowerCase() === key.toLowerCase())?.[1]
      : undefined);
    if (result === undefined) { unresolved = true; return match; }
    return result;
  });
  if (unresolved) throw new Error('HERMES_HOME contains an environment variable that is not set.');
  return path.resolve(cwd, expanded);
}

function hermesDefaultHome({ home, env, platform }) {
  const suffix = env.HERMES_DATA_DIR_SUFFIX || '';
  if (platform === 'win32') {
    const local = env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    return path.join(local, `hermes${suffix}`);
  }
  return path.join(home, `.hermes${suffix}`);
}

function relativeName(root, candidate, leaf) {
  const rel = path.relative(path.resolve(root), path.resolve(candidate));
  const parts = rel.split(path.sep);
  return parts.length === 2 && parts[0] === leaf ? parts[1] : null;
}

function hermesTargetHome({ home, env, cwd, platform, profile }) {
  const defaultHome = hermesDefaultHome({ home, env, platform });
  const configuredHome = env.HERMES_HOME?.trim()
    ? expandHermesPath(env.HERMES_HOME.trim(), { home, env, cwd, platform })
    : defaultHome;
  const configuredProfileRoot = path.basename(path.dirname(configuredHome)) === 'profiles'
    ? path.dirname(path.dirname(configuredHome))
    : configuredHome;
  if (profile) {
    if (!PROFILE_NAME.test(profile) || RESERVED_PROFILES.has(profile)) throw new Error('Invalid Hermes profile name. Use an existing lowercase profile name of up to 64 characters.');
    const profileHome = path.join(configuredProfileRoot, 'profiles', profile);
    if (!fs.statSync(profileHome, { throwIfNoEntry: false })?.isDirectory()) {
      throw new Error(`Hermes profile "${profile}" does not exist at ${profileHome}.`);
    }
    return { home: profileHome, profile };
  }
  if (env.HERMES_HOME?.trim()) return { home: configuredHome, profile: relativeName(configuredProfileRoot, configuredHome, 'profiles') || (path.resolve(configuredHome) === path.resolve(defaultHome) ? 'default' : 'custom') };
  return { home: defaultHome, profile: 'default' };
}

export function getTarget({ agent, scope, cwd = process.cwd(), home = os.homedir(), env = process.env, profile, platform = process.platform }) {
  const definition = HOSTS[agent];
  if (!definition) throw new Error(`Unknown agent: ${agent}`);
  if (agent === 'manual') throw new Error('Use getManualTarget with an explicit manual destination.');
  if (!['project', 'user'].includes(scope)) throw new Error(`Unknown scope: ${scope}`);
  if (profile && agent !== 'hermes') throw new Error('--profile only applies to Hermes.');

  const projectRoot = projectRootFor(cwd);
  const base = scope === 'project' ? projectRoot : path.resolve(home);
  let configRoot, effectiveProfile = null;
  if (scope === 'project') {
    if (agent === 'hermes' && !fs.existsSync(path.join(projectRoot, '.git'))) {
      throw new Error('Hermes project skills require a Git project root. Use user scope or initialize/review the project repository first.');
    }
    configRoot = path.join(base, definition.projectDir || '.agents');
  } else if (agent === 'codex') {
    if (env.CODEX_HOME) {
      const codexHome = path.resolve(env.CODEX_HOME);
      if (!fs.statSync(codexHome, { throwIfNoEntry: false })?.isDirectory()) {
        throw new Error(`CODEX_HOME must name an existing directory: ${codexHome}`);
      }
      configRoot = codexHome;
    } else configRoot = path.join(base, '.agents');
  } else if (agent === 'claude') {
    configRoot = path.resolve(env.CLAUDE_CONFIG_DIR || path.join(base, '.claude'));
  } else if (agent === 'opencode') {
    configRoot = path.resolve(env.OPENCODE_CONFIG_DIR || path.join(env.XDG_CONFIG_HOME || path.join(base, '.config'), 'opencode'));
  } else if (agent === 'antigravity') {
    configRoot = path.join(base, '.gemini', 'config');
  } else if (agent === 'cursor' || agent === 'copilot') {
    configRoot = path.join(base, agent === 'cursor' ? '.cursor' : '.copilot');
  } else if (agent === 'gemini') {
    configRoot = path.resolve(cwd, env.GEMINI_CLI_HOME || base, '.gemini');
  } else if (agent === 'omp') {
    if (!env.PI_CODING_AGENT_DIR && (env.OMP_PROFILE || env.PI_PROFILE || env.PI_CONFIG_DIR || (platform === 'linux' && env.XDG_DATA_HOME))) {
      throw new Error('OMP uses a custom profile or data directory. Set PI_CODING_AGENT_DIR to the effective agent directory, or use --agent manual --destination <effective-agent-dir>/skills/polishup.');
    }
    configRoot = path.resolve(expandHome(env.PI_CODING_AGENT_DIR || path.join(base, '.omp', 'agent'), base));
  } else {
    const resolved = hermesTargetHome({ home: base, env, cwd, platform, profile });
    configRoot = resolved.home;
    effectiveProfile = resolved.profile;
  }

  const storageGroup = getStorageGroup(agent, scope);
  const target = {
    agent, scope, profile: effectiveProfile, projectRoot, configRoot,
    skillDir: path.join(configRoot, 'skills', 'polishup'),
    stateRoot: path.join(configRoot, '.polishup'),
    storageGroup,
    consumer: { agent, scope, profile: effectiveProfile },
    invocation: definition.invocation,
    discoveryNote: agent === 'hermes' && scope === 'project'
      ? 'Hermes loads project skills only from trusted Git projects. This installer does not grant trust.'
      : null,
    commandFile: agent === 'opencode' ? path.join(configRoot, 'commands', 'polishup.md') : null,
  };
  return target;
}

export function getManualTarget({ destination, scope, cwd = process.cwd(), home = os.homedir(), platform = process.platform }) {
  if (typeof destination !== 'string' || !destination.trim()) throw new Error('Manual installation requires --destination <path>.');
  if (!['project', 'user'].includes(scope)) throw new Error('Manual destination requires --scope project or user.');
  const skillDir = path.resolve(cwd, destination.trim());
  const name = path.basename(skillDir);
  if ((platform === 'win32' ? name.toLowerCase() : name) !== 'polishup') throw new Error('The manual destination must name the final `polishup` skill folder.');
  const projectRoot = projectRootFor(cwd);
  const stateBase = scope === 'project' ? projectRoot : path.resolve(home);
  const key = createHash('sha256').update(platform === 'win32' ? skillDir.toLowerCase() : skillDir).digest('hex').slice(0, 24);
  const profileKey = platform === 'win32' ? skillDir.toLowerCase() : skillDir;
  return {
    agent: 'manual', scope, profile: profileKey, projectRoot,
    configRoot: path.dirname(skillDir), skillDir,
    stateRoot: path.join(stateBase, '.polishup', 'manual', key),
    storageGroup: `manual-${scope}`,
    consumer: { agent: 'manual', scope, profile: profileKey },
    invocation: HOSTS.manual.invocation,
    discoveryNote: 'The skill is outside a harness-managed default location. Load the displayed SKILL.md path manually.',
    commandFile: null,
  };
}
