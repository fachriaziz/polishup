import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { HOSTS, getManualTarget, getTarget, getStorageGroup } from './hosts.mjs';

export const AGENTS = Object.fromEntries(Object.entries(HOSTS).map(([key, host]) => [key, host.label]));
export { getManualTarget, getTarget };
export const PACKAGE_NAME = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).name;
const RECEIPT = '.polishup-install.json';
const hash = value => createHash('sha256').update(value).digest('hex');
const exists = file => fs.existsSync(file);
const command = fs.readFileSync(assertSafePath(fileURLToPath(new URL('../.opencode/commands/polishup.md', import.meta.url))), 'utf8').replace(/\r\n/g, '\n');

export function assertSafePath(destination) {
  const absolute = path.resolve(destination);
  const { root } = path.parse(absolute);
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Refusing a symbolic link or junction: ${current}`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return absolute;
}

function safeRelative(file) {
  return typeof file === 'string' && file.length > 0 && !file.includes('\\') &&
    !file.includes(':') && !file.startsWith('/') && file.split('/').every(p => p && p !== '.' && p !== '..');
}

function filesIn(directory, prefix = '') {
  assertSafePath(directory);
  const files = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix + entry.name;
    if (!safeRelative(relative)) throw new Error(`Unsafe file path: ${relative}`);
    if (entry.isSymbolicLink()) throw new Error(`Refusing a symbolic link: ${path.join(directory, entry.name)}`);
    if (entry.isDirectory()) Object.assign(files, filesIn(path.join(directory, entry.name), `${relative}/`));
    else if (entry.isFile()) files[relative] = fs.readFileSync(path.join(directory, entry.name));
    else throw new Error(`Unsupported file type: ${relative}`);
  }
  return files;
}

export function loadPayload(packageRoot) {
  packageRoot = assertSafePath(packageRoot);
  const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const skillRoot = assertSafePath(path.join(packageRoot, 'skills', 'polishup'));
  const files = { 'SKILL.md': fs.readFileSync(assertSafePath(path.join(skillRoot, 'SKILL.md'))) };
  const license = path.join(skillRoot, 'LICENSE.txt');
  if (fs.existsSync(license)) files['LICENSE.txt'] = fs.readFileSync(assertSafePath(license));
  Object.assign(files, filesIn(path.join(skillRoot, 'references'), 'references/'));
  const scripts = path.join(skillRoot, 'scripts');
  if (fs.existsSync(scripts)) Object.assign(files, filesIn(scripts, 'scripts/'));
  const hashes = Object.fromEntries(Object.keys(files).sort().map(file => [file, hash(files[file])]));
  if (metadata.name !== PACKAGE_NAME || !/^\d+\.\d+\.\d+$/.test(metadata.version)) throw new Error('Invalid PolishUp package identity.');
  return { version: metadata.version, files, hashes, revision: hash(JSON.stringify(hashes)), packageRoot, skillRoot };
}

function readReceipt(file) {
  let receipt;
  try { receipt = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { throw new Error(`Invalid installation receipt: ${file}. Preserve the folder and inspect it before replacing it.`); }
  const validFiles = receipt.files && Object.hasOwn(receipt.files, 'SKILL.md') &&
    Object.entries(receipt.files).every(([p, digest]) => safeRelative(p) && /^[a-f0-9]{64}$/.test(digest));
  const validLegacy = receipt.schema === 1 && Object.hasOwn(AGENTS, receipt.agent) && ['project', 'user'].includes(receipt.scope) &&
    (!receipt.commandHash || /^[a-f0-9]{64}$/.test(receipt.commandHash));
  const validCurrent = receipt.schema === 2 && typeof receipt.storageGroup === 'string' && Array.isArray(receipt.consumers) &&
    receipt.consumers.length > 0 && receipt.consumers.every(consumer => Object.hasOwn(AGENTS, consumer.agent) &&
      ['project', 'user'].includes(consumer.scope) &&
      (consumer.profile === null || typeof consumer.profile === 'string') &&
      (!consumer.commandHash || /^[a-f0-9]{64}$/.test(consumer.commandHash)));
  if ((!validLegacy && !validCurrent) || receipt.name !== 'polishup' || !validFiles ||
      !/^\d+\.\d+\.\d+$/.test(receipt.version)) {
    throw new Error(`Invalid receipt or receipt path: ${file}`);
  }
  return receipt;
}

export function inspect(target) {
  for (const file of [target.skillDir, target.stateRoot, ...(target.commandFile ? [target.commandFile] : [])]) assertSafePath(file);
  const present = exists(target.skillDir);
  const files = present ? filesIn(target.skillDir) : {};
  const receiptPath = path.join(target.skillDir, RECEIPT);
  const receipt = present && exists(receiptPath) ? readReceipt(receiptPath) : null;
  let consumers = [];
  if (receipt?.schema === 1) {
    consumers = [{ agent: receipt.agent, scope: receipt.scope, profile: receipt.profile ?? null,
      ...(receipt.commandHash ? { commandHash: receipt.commandHash } : {}) }];
    const sameTarget = receipt.agent === target.agent && receipt.scope === target.scope && (receipt.profile ?? null) === target.profile;
    const compatibleLegacy = target.storageGroup === 'agents-project' && getStorageGroup(receipt.agent, receipt.scope) === 'agents-project';
    if (!sameTarget && !compatibleLegacy) throw new Error(`Installation ownership differs from the selected target: ${target.skillDir}`);
  } else if (receipt?.schema === 2) {
    if (receipt.storageGroup !== target.storageGroup) throw new Error(`Installation ownership differs from the selected target: ${target.skillDir}`);
    consumers = receipt.consumers;
    if (new Set(consumers.map(consumerId)).size !== consumers.length) throw new Error(`Duplicate consumers in installation receipt: ${receiptPath}`);
  }
  delete files[RECEIPT];
  const hashes = Object.fromEntries(Object.keys(files).sort().map(file => [file, hash(files[file])]));
  const commandHash = target.commandFile && exists(target.commandFile) ? hash(fs.readFileSync(target.commandFile)) : null;
  const changed = receipt ? Object.keys(receipt.files).filter(file => hashes[file] !== receipt.files[file]) : [];
  const extra = receipt ? Object.keys(hashes).filter(file => !Object.hasOwn(receipt.files, file)) : [];
  const consumer = consumers.find(item => consumerId(item) === consumerId(target.consumer));
  const expectedCommandHash = consumer?.commandHash ?? (receipt?.schema === 1 && consumer ? receipt.commandHash : null);
  const commandChanged = Boolean(commandHash && (!consumer || commandHash !== expectedCommandHash));
  return { exists: present, receipt, hashes, commandHash, changed, extra,
    consumers, consumer, hasTarget: Boolean(consumer), commandChanged,
    signature: hash(JSON.stringify({ hashes, commandHash, receipt })) };
}

function consumerId(consumer) {
  return `${consumer.agent}:${consumer.scope}:${consumer.profile ?? ''}`;
}

export function compareVersions(a, b) {
  const left = a.split('.').map(Number), right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  return 0;
}

export function plan(target, payload, action = 'install', { selectedConsumers = [target.consumer] } = {}) {
  if (!['install', 'update', 'uninstall'].includes(action)) throw new Error(`Unknown action: ${action}`);
  if (!Array.isArray(selectedConsumers) || selectedConsumers.length === 0 ||
      !selectedConsumers.some(item => consumerId(item) === consumerId(target.consumer)) ||
      new Set(selectedConsumers.map(consumerId)).size !== selectedConsumers.length) {
    throw new Error('Selected installation consumers are invalid.');
  }
  if (selectedConsumers.some(item => !Object.hasOwn(AGENTS, item.agent) || item.scope !== target.scope ||
      (item.profile ?? null) !== (target.profile ?? null) || target.storageGroup !== getStorageGroup(item.agent, item.scope))) {
    throw new Error('Selected installation consumers do not share this target location.');
  }
  const current = inspect(target);
  if (exists(path.join(target.stateRoot, 'lock'))) throw new Error(`Another or interrupted operation holds ${path.join(target.stateRoot, 'lock')}. Inspect it before removing the lock.`);
  const sourceRelative = path.relative(target.skillDir, payload.skillRoot);
  if (sourceRelative === '' || (sourceRelative !== '..' && !sourceRelative.startsWith(`..${path.sep}`) && !path.isAbsolute(sourceRelative))) {
    throw new Error('The source skill cannot replace or remove itself or its containing directory.');
  }
  const selectedIds = new Set(selectedConsumers.map(consumerId));
  const registeredSelection = current.consumers.filter(item => selectedIds.has(consumerId(item)));
  if (action === 'update' && registeredSelection.length === 0) throw new Error(`No selected installation to update at ${target.skillDir}. Run polishup install first.`);
  if (action === 'uninstall' && current.exists && current.receipt && registeredSelection.length === 0) {
    throw new Error(`None of the selected hosts is registered as a consumer of ${target.skillDir}.`);
  }
  const conflicts = [];
  if (current.exists && !current.receipt) conflicts.push('Unmanaged skill folder');
  if (current.changed.length) conflicts.push(`Locally modified or missing files: ${current.changed.join(', ')}`);
  if (current.extra.length) conflicts.push(`Custom files: ${current.extra.join(', ')}`);
  if (current.commandChanged) conflicts.push('Unmanaged or modified OpenCode command');
  if (action !== 'uninstall' && current.receipt && compareVersions(current.receipt.version, payload.version) > 0) conflicts.push('A newer package version is installed; replacement would downgrade it');
  const identical = current.receipt && registeredSelection.length === selectedConsumers.length && current.receipt.schema === 2 &&
    current.receipt.version === payload.version &&
    JSON.stringify(current.hashes) === JSON.stringify(payload.hashes) &&
    (!target.commandFile || current.commandHash === hash(command)) && !conflicts.length;
  const remainingConsumers = current.consumers.filter(item => !selectedIds.has(consumerId(item)));
  const kind = action === 'uninstall'
    ? (!current.exists && !current.commandHash ? 'none' : current.receipt && remainingConsumers.length ? 'detach' : 'uninstall')
    : (identical ? 'none' : action);
  return { target, payload, current, conflicts, kind, action, selectedConsumers };
}

export function apply(operation, { replace = false, dryRun = false } = {}) {
  const { target, payload, current, kind, conflicts, action } = operation;
  if (dryRun) return { changed: false, dryRun: true, conflicts, kind };
  if (conflicts.length && !replace) throw new Error(`Installation conflict: ${conflicts.join('; ')}. Back up and replace only after an explicit choice.`);
  if (kind === 'none') return { changed: false };
  if (kind === 'detach') return detachConsumer(operation);
  assertSafePath(target.stateRoot);
  assertSafePath(path.join(target.stateRoot, 'backups'));
  fs.mkdirSync(target.stateRoot, { recursive: true });
  const lock = path.join(target.stateRoot, 'lock');
  let handle;
  try { handle = fs.openSync(lock, 'wx'); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Another or interrupted operation holds ${lock}. Inspect it before removing the lock.`);
    throw error;
  }
  const staging = path.join(target.stateRoot, `staging-${randomUUID()}`);
  const backup = path.join(target.stateRoot, 'backups', randomUUID());
  let skillSaved = false, commandSaved = false, skillWritten = false, commandWritten = false;
  let recoveryFailed = false;
  try {
    assertSafePath(backup);
    if (inspect(target).signature !== current.signature) throw new Error('Installation changed after inspection. Run the command again.');
    fs.mkdirSync(staging);
    if (action !== 'uninstall') {
      fs.mkdirSync(path.join(staging, 'skill'));
      for (const [relative, bytes] of Object.entries(payload.files)) {
        const file = path.join(staging, 'skill', relative);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, bytes);
      }
      const selectedIds = new Set(operation.selectedConsumers.map(consumerId));
      const consumers = current.consumers.filter(item => !selectedIds.has(consumerId(item)));
      for (const selected of operation.selectedConsumers) {
        const next = { ...selected };
        if (target.commandFile && consumerId(selected) === consumerId(target.consumer)) next.commandHash = hash(command);
        consumers.push(next);
      }
      const receipt = { schema: 2, name: 'polishup', version: payload.version, revision: payload.revision,
        storageGroup: target.storageGroup, consumers, files: payload.hashes };
      fs.writeFileSync(path.join(staging, 'skill', RECEIPT), JSON.stringify(receipt, null, 2) + '\n');
      if (target.commandFile) fs.writeFileSync(path.join(staging, 'command.md'), command);
    }
    fs.mkdirSync(backup, { recursive: true });
    if (exists(target.skillDir)) { fs.renameSync(target.skillDir, path.join(backup, 'skill')); skillSaved = true; }
    if (target.commandFile && exists(target.commandFile)) { fs.renameSync(target.commandFile, path.join(backup, 'command.md')); commandSaved = true; }
    if (kind !== 'uninstall') {
      fs.mkdirSync(path.dirname(target.skillDir), { recursive: true });
      fs.renameSync(path.join(staging, 'skill'), target.skillDir);
      skillWritten = true;
      if (target.commandFile) {
        fs.mkdirSync(path.dirname(target.commandFile), { recursive: true });
        fs.renameSync(path.join(staging, 'command.md'), target.commandFile);
        commandWritten = true;
      }
      const installed = inspect(target);
      if (installed.changed.length || installed.extra.length ||
          JSON.stringify(installed.hashes) !== JSON.stringify(payload.hashes) ||
          (target.commandFile && installed.commandHash !== hash(command))) throw new Error('Post-install verification failed.');
    } else if (exists(target.skillDir) || (target.commandFile && exists(target.commandFile))) throw new Error('Removal verification failed.');
    if (!skillSaved && !commandSaved) fs.rmSync(backup, { recursive: true });
    return { changed: true, backup: skillSaved || commandSaved ? backup : null };
  } catch (error) {
    try {
      if (commandWritten) fs.rmSync(target.commandFile);
      if (skillWritten) fs.rmSync(target.skillDir, { recursive: true });
      if (skillSaved) fs.renameSync(path.join(backup, 'skill'), target.skillDir);
      if (commandSaved) fs.renameSync(path.join(backup, 'command.md'), target.commandFile);
    } catch (recoveryError) {
      recoveryFailed = true;
      throw new Error(`${error.message}. Recovery also failed: ${recoveryError.message}. Preserve ${backup} and ${staging}.`);
    }
    throw error;
  } finally {
    fs.closeSync(handle);
    if (!recoveryFailed) {
      fs.rmSync(staging, { recursive: true, force: true });
      fs.rmSync(lock, { force: true });
    }
  }
}

function detachConsumer(operation) {
  const { target, current } = operation;
  assertSafePath(target.stateRoot);
  assertSafePath(path.join(target.stateRoot, 'backups'));
  fs.mkdirSync(target.stateRoot, { recursive: true });
  const lock = path.join(target.stateRoot, 'lock');
  let handle;
  try { handle = fs.openSync(lock, 'wx'); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error(`Another or interrupted operation holds ${lock}. Inspect it before removing the lock.`);
    throw error;
  }
  const receiptPath = path.join(target.skillDir, RECEIPT);
  const staging = path.join(target.stateRoot, `staging-${randomUUID()}`);
  let saved = false, written = false, recoveryFailed = false;
  const backup = path.join(target.stateRoot, 'backups', randomUUID());
  try {
    assertSafePath(backup);
    if (inspect(target).signature !== current.signature) throw new Error('Installation changed after inspection. Run the command again.');
    fs.mkdirSync(backup, { recursive: true });
    const selectedIds = new Set(operation.selectedConsumers.map(consumerId));
    const consumers = current.consumers.filter(item => !selectedIds.has(consumerId(item)));
    const receipt = { ...current.receipt, schema: 2, storageGroup: target.storageGroup, consumers };
    delete receipt.agent;
    delete receipt.scope;
    delete receipt.profile;
    delete receipt.commandHash;
    fs.writeFileSync(staging, JSON.stringify(receipt, null, 2) + '\n');
    fs.renameSync(receiptPath, path.join(backup, RECEIPT));
    saved = true;
    fs.renameSync(staging, receiptPath);
    written = true;
    const verified = inspect(target);
    if (operation.selectedConsumers.some(item => verified.consumers.some(remaining => consumerId(remaining) === consumerId(item))) ||
        verified.consumers.length !== consumers.length) throw new Error('Shared installation update verification failed.');
    fs.rmSync(backup, { recursive: true, force: true });
    return { changed: true, detached: true, remainingConsumers: consumers };
  } catch (error) {
    try {
      if (written) fs.rmSync(receiptPath, { force: true });
      if (saved) fs.renameSync(path.join(backup, RECEIPT), receiptPath);
    } catch (recoveryError) {
      recoveryFailed = true;
      throw new Error(`${error.message}. Recovery also failed: ${recoveryError.message}. Preserve ${backup} and ${staging}.`);
    }
    throw error;
  } finally {
    fs.closeSync(handle);
    if (!recoveryFailed) {
      fs.rmSync(staging, { force: true });
      fs.rmSync(backup, { recursive: true, force: true });
      fs.rmSync(lock, { force: true });
    }
  }
}
