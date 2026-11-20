import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const COMMANDS = {
  codex: ['codex'], claude: ['claude'], opencode: ['opencode'], cursor: ['cursor', 'cursor-agent'],
  omp: ['omp'], gemini: ['gemini'], copilot: ['copilot'], antigravity: ['agy', 'antigravity'], hermes: ['hermes'],
};

export function detectHarnesses({ home = os.homedir(), cwd = process.cwd(), env = process.env, platform = process.platform } = {}, { fileSystem = fs } = {}) {
  const windows = platform === 'win32';
  const paths = windows ? path.win32 : path.posix;
  const get = name => env[name] ?? (windows ? Object.entries(env).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] : undefined);
  const kind = (file, directory = false) => {
    try { const stat = fileSystem.statSync(file); return directory ? stat.isDirectory() : stat.isFile(); }
    catch { return false; }
  };
  const executable = file => {
    if (!kind(file)) return false;
    if (windows) return true;
    try { fileSystem.accessSync(file, fs.constants.X_OK); return true; }
    catch { return false; }
  };
  const directories = (get('PATH') || '').split(windows ? ';' : ':')
    .map(value => value.trim().replace(/^"(.*)"$/, '$1')).filter(value => paths.isAbsolute(value));
  const extensions = windows ? (get('PATHEXT') || '.COM;.EXE;.BAT;.CMD').split(';')
    .filter(value => /^\.[a-z0-9]+$/i.test(value)).map(value => value.toLowerCase()) : [''];
  const find = commands => {
    for (const directory of directories) for (const command of commands) for (const extension of extensions) {
      const file = paths.join(directory, `${command}${extension}`);
      if (executable(file)) return file;
    }
  };
  const configured = value => value ? paths.resolve(cwd, value) : undefined;
  const local = get('LOCALAPPDATA') || paths.join(home, 'AppData', 'Local');
  const programFiles = [get('ProgramFiles'), get('ProgramFiles(x86)')].filter(Boolean);
  const results = {};
  for (const [agent, commands] of Object.entries(COMMANDS)) {
    let evidence = find(commands);
    // `agent` is a generic name: only accept an identifiable Cursor installation path.
    if (!evidence && agent === 'cursor') {
      const launcher = find(['agent']);
      if (launcher) {
        try { if (/cursor[-_ ]?agent|[\\/]cursor[\\/]/i.test(fileSystem.realpathSync(launcher))) evidence = launcher; }
        catch { /* A broken or unreadable launcher is not detected. */ }
      }
    }
    const appFiles = windows ? {
      cursor: [paths.join(local, 'Programs', 'cursor', 'Cursor.exe'), ...programFiles.map(root => paths.join(root, 'Cursor', 'Cursor.exe'))],
      antigravity: [paths.join(local, 'agy', 'bin', 'agy.exe')],
    } : {};
    if (!evidence) evidence = (appFiles[agent] || []).find(executable);
    if (!evidence && platform === 'darwin' && agent === 'cursor') {
      evidence = ['/Applications/Cursor.app', paths.join(home, 'Applications', 'Cursor.app')].find(file => kind(file, true));
    }
    if (evidence) { results[agent] = { status: 'detected', evidence }; continue; }
    const own = name => [paths.join(cwd, name), paths.join(home, name)];
    const configDirectories = {
      codex: [configured(get('CODEX_HOME')), ...own('.codex')],
      claude: [configured(get('CLAUDE_CONFIG_DIR')), ...own('.claude')],
      opencode: [configured(get('OPENCODE_CONFIG_DIR')), ...own('.opencode'), paths.join(get('XDG_CONFIG_HOME') || paths.join(home, '.config'), 'opencode')],
      cursor: own('.cursor'), omp: [configured(get('PI_CODING_AGENT_DIR')), ...own('.omp')],
      gemini: [], copilot: [paths.join(home, '.copilot')],
      antigravity: [paths.join(home, '.gemini', 'config'), paths.join(home, '.gemini', 'antigravity')],
      hermes: [configured(get('HERMES_HOME')), windows ? paths.join(local, `hermes${get('HERMES_DATA_DIR_SUFFIX') || ''}`) : paths.join(home, `.hermes${get('HERMES_DATA_DIR_SUFFIX') || ''}`)],
    };
    evidence = configDirectories[agent].filter(Boolean).find(file => kind(file, true));
    if (!evidence && agent === 'gemini') {
      evidence = [paths.join(cwd, '.gemini', 'settings.json'), paths.resolve(cwd, get('GEMINI_CLI_HOME') || home, '.gemini', 'settings.json')].find(file => kind(file));
    }
    if (!evidence && agent === 'copilot') evidence = [paths.join(cwd, '.github', 'copilot-instructions.md')].find(file => kind(file));
    results[agent] = evidence ? { status: 'configured', evidence } : { status: 'not-detected' };
  }
  return results;
}
