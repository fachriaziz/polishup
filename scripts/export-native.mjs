import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { loadPayload, assertSafePath } from '../cli/installations.mjs';
import { HOSTS } from '../cli/hosts.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const MARKER = '.polishup-export.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const TARGETS = [...new Set(Object.values(HOSTS).map(host => host.projectDir).filter(Boolean))];

function inventory(directory, prefix = '') {
  assertSafePath(directory);
  const result = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    const relative = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Export contains a link: ${file}`);
    if (entry.isDirectory()) Object.assign(result, inventory(file, `${relative}/`));
    else if (entry.isFile()) result[relative] = hash(fs.readFileSync(file));
    else throw new Error(`Export contains an unsupported file: ${file}`);
  }
  return result;
}

function inspect(root, configDir, payload) {
  const destination = assertSafePath(path.join(root, configDir, 'skills', 'polishup'));
  if (!fs.existsSync(destination)) return { configDir, destination, current: false };
  const markerPath = path.join(destination, MARKER);
  assertSafePath(markerPath);
  let marker;
  try { marker = JSON.parse(fs.readFileSync(markerPath, 'utf8')); }
  catch { throw new Error(`Unmanaged native export: ${destination}. Preserve or move it before generating.`); }
  if (marker.generatedBy !== 'polishup-native-export' || marker.schema !== 1 || !marker.files ||
      !Object.hasOwn(marker.files, 'SKILL.md') || Object.hasOwn(marker.files, MARKER) ||
      Object.values(marker.files).some(value => typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))) {
    throw new Error(`Invalid native export marker: ${markerPath}`);
  }
  const actual = inventory(destination);
  delete actual[MARKER];
  for (const [file, digest] of Object.entries(actual)) {
    if (marker.files[file] !== digest) throw new Error(`Modified or unowned export file: ${path.join(destination, file)}. Preserve it before generating.`);
  }
  const current = marker.revision === payload.revision &&
    Object.keys(actual).length === Object.keys(payload.hashes).length &&
    Object.entries(payload.hashes).every(([file, digest]) => actual[file] === digest) &&
    Object.keys(marker.files).length === Object.keys(payload.hashes).length &&
    Object.entries(payload.hashes).every(([file, digest]) => marker.files[file] === digest) &&
    marker.commandHash === undefined;
  return { configDir, destination, current };
}

export function nativeExports({ root = projectRoot, check = false } = {}) {
  root = assertSafePath(root);
  const payload = loadPayload(root);
  // Inspect every destination before writing, so a known conflict cannot leave a partial update.
  const targets = TARGETS.map(configDir => inspect(root, configDir, payload));
  const stale = targets.filter(target => !target.current);
  if (check && stale.length) throw new Error(`Missing or stale native exports: ${stale.map(target => target.configDir).join(', ')}. Run npm run sync.`);
  if (!check) for (const target of stale) {
    const configRoot = assertSafePath(path.join(root, target.configDir));
    fs.mkdirSync(configRoot, { recursive: true });
    const staging = fs.mkdtempSync(path.join(configRoot, '.polishup-export-'));
    const backup = path.join(configRoot, `.polishup-export-backup-${randomUUID()}`);
    let saved = false, skillWritten = false, committed = false;
    try {
      for (const [relative, bytes] of Object.entries(payload.files)) {
        const output = path.join(staging, relative);
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, bytes);
      }
      fs.writeFileSync(path.join(staging, MARKER), JSON.stringify({ schema: 1,
        generatedBy: 'polishup-native-export', revision: payload.revision, files: payload.hashes }, null, 2) + '\n');
      // Recheck ownership and edits immediately before committing the staged directory.
      inspect(root, target.configDir, payload);
      fs.mkdirSync(path.dirname(target.destination), { recursive: true });
      if (fs.existsSync(target.destination)) { fs.renameSync(target.destination, backup); saved = true; }
      fs.renameSync(staging, target.destination);
      skillWritten = true;
      committed = true;
    } catch (error) {
      if (skillWritten) fs.rmSync(target.destination, { recursive: true });
      if (saved) fs.renameSync(backup, target.destination);
      throw error;
    } finally {
      fs.rmSync(staging, { recursive: true, force: true });
      if (committed && saved) fs.rmSync(backup, { recursive: true });
    }
  }
  return { revision: payload.revision, skillFiles: Object.keys(payload.files).length,
    exports: targets.map(target => path.relative(root, target.destination).split(path.sep).join('/')),
    changed: check ? 0 : stale.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some(arg => arg !== '--check') || args.length > 1) throw new Error('Usage: node scripts/export-native.mjs [--check]');
    console.log(JSON.stringify(nativeExports({ check: args.includes('--check') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
