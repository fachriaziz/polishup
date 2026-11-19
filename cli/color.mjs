import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import Color from 'colorjs.io';

// Preparation embeds these values so installed helpers need no package metadata.
const toolVersion = typeof __POLISHUP_TOOL_VERSION__ === 'undefined'
  ? JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version : __POLISHUP_TOOL_VERSION__;
const engineVersion = typeof __POLISHUP_COLOR_VERSION__ === 'undefined'
  ? JSON.parse(fs.readFileSync(path.join(path.dirname(createRequire(import.meta.url).resolve('colorjs.io')), '../package.json'), 'utf8')).version
  : __POLISHUP_COLOR_VERSION__;

export function parseLiteral(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) throw new Error('Supply a color literal of 1 to 256 characters.');
  if (/\b(?:var|env|calc|color-mix)\s*\(|\b(?:currentcolor|none)\b/i.test(value)) {
    return { reason: 'The color needs resolved values from its rendering context.' };
  }
  let color;
  try { color = new Color(value); }
  catch { throw new Error(`Invalid color literal: ${value}`); }
  if (color.alpha !== 1) return { reason: 'Transparency needs a known compositing context.' };
  const srgb = color.to('srgb');
  if (srgb.coords.some(channel => !Number.isFinite(channel))) return { reason: 'The color has unresolved channels.' };
  if (srgb.coords.some(channel => channel < -1e-7 || channel > 1 + 1e-7)) {
    return { reason: 'The color is outside sRGB; rendered wide-gamut checking is not supported.' };
  }
  // Conversion noise at gamut boundaries is not an intentional color adjustment.
  srgb.coords = srgb.coords.map(channel => Math.max(0, Math.min(1, channel)));
  return { color: srgb };
}

export function checkPair(foreground, background, minimum = 4.5) {
  if (typeof minimum !== 'number' || !Number.isFinite(minimum) || minimum < 1 || minimum > 21) {
    throw new Error('The contrast minimum must be a number from 1 to 21.');
  }
  const fg = parseLiteral(foreground);
  const bg = parseLiteral(background);
  const result = { foreground, background, minimum, method: 'WCAG21', ratio: null };
  if (fg.reason || bg.reason) return { ...result, result: 'incomplete', reason: fg.reason || bg.reason };
  const ratio = fg.color.contrastWCAG21(bg.color);
  return { ...result, ratio, result: ratio >= minimum ? 'pass' : 'fail' };
}

export function makeReport(operation, details) {
  return { schemaVersion: 1, operation, toolVersion,
    engine: { name: 'colorjs.io', version: engineVersion }, ...details };
}

export function reportExitCode(report) {
  if (report.checks.some(check => check.result === 'fail')) return 1;
  if (report.status === 'incomplete' || report.checks.some(check => check.result === 'incomplete')) return 3;
  return 0;
}

async function readInput(file) {
  const maxBytes = 1024 * 1024;
  let text;
  if (file === '-') {
    if (process.stdin.isTTY) throw new Error('Pipe JSON to stdin when using --input -.');
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > maxBytes) throw new Error('Palette input exceeds 1 MiB.');
      chunks.push(chunk);
    }
    text = Buffer.concat(chunks).toString('utf8');
  } else {
    const stat = fs.statSync(file);
    if (!stat.isFile() || stat.size > maxBytes) throw new Error('Palette input must be a file of at most 1 MiB.');
    text = fs.readFileSync(file, 'utf8');
  }
  try { return JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('Palette input must contain valid JSON.'); }
}

function printReport(report, json) {
  if (json) { console.log(JSON.stringify(report, null, 2)); return; }
  console.log(`${report.operation}: ${report.status}`);
  for (const item of report.harmony || []) console.log(`  ${item.name}: ${item.color}`);
  for (const [role, item] of Object.entries(report.roles || {})) console.log(`  ${role}: ${item.color}${item.locked ? ' (locked)' : ''}`);
  for (const check of report.checks) {
    console.log(`  ${check.foregroundRole || check.foreground} / ${check.backgroundRole || check.background}: ${check.result}, ${check.ratio === null ? check.reason : `${check.ratio.toFixed(4)}:1, minimum ${check.minimum}:1`}`);
  }
  for (const limitation of report.limitations || []) console.log(`  Limit: ${limitation}`);
  if (report.preview) console.log(`  Preview: ${report.preview}`);
}

export async function runColorCommand(args) {
  const help = 'Usage: color check <foreground> <background> [--minimum <ratio>] [--json]\n       color generate --input <file|-> [--preview <new-html-file>] [--json]';
  if (args.length === 0 || ['--help', '-h'].includes(args[0])) { console.log(help); return 0; }
  const action = args[0];
  const { values, positionals } = parseArgs({ args: args.slice(1), allowPositionals: true, options: {
    minimum: { type: 'string' }, input: { type: 'string' }, preview: { type: 'string' },
    json: { type: 'boolean' }, help: { type: 'boolean', short: 'h' },
  } });
  if (!['check', 'generate'].includes(action)) throw new Error(`Unknown color operation: ${action}. ${help}`);
  if (values.help) { console.log(help); return 0; }
  let report;
  if (action === 'check') {
    if (positionals.length !== 2 || values.input !== undefined || values.preview !== undefined) throw new Error(help);
    const check = checkPair(positionals[0], positionals[1], values.minimum === undefined ? 4.5 : Number(values.minimum));
    report = makeReport('color.check', { status: check.result, scope: 'Provided color values only', checks: [check],
      limitations: ['No rendered composition, criterion applicability, or full accessibility evaluation was performed.',
        ...(values.minimum === undefined ? ['The 4.5 minimum is a normal-text starting point; standard exceptions require context.'] : ['The supplied numeric minimum is a custom target, not a conformance claim.'])] });
  } else {
    if (positionals.length || !values.input || values.minimum !== undefined) throw new Error(help);
    const { generatePalette, createPreview } = await import('./palette.mjs');
    report = makeReport('color.generate', generatePalette(await readInput(values.input)));
    if (values.preview !== undefined) {
      if (!values.preview || !/\.html?$/i.test(values.preview)) throw new Error('Preview output must be a new .html file.');
      const preview = path.resolve(values.preview);
      fs.writeFileSync(preview, createPreview(report), { encoding: 'utf8', flag: 'wx' });
      report.preview = preview;
    }
  }
  printReport(report, values.json);
  return reportExitCode(report);
}
