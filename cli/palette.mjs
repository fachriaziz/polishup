import Color from 'colorjs.io';
import { checkPair, parseLiteral } from './color.mjs';

const offsets = { analogous: [0, -30, 30], complementary: [0, 180],
  'split-complementary': [0, 150, 210], triadic: [0, 120, 240] };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const has = (value, key) => Object.hasOwn(value, key);

function fields(value, allowed, label) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) throw new Error(`Invalid ${label} fields. Allowed: ${allowed.join(', ')}.`);
}

function hex(color) {
  return color.clone().to('srgb').toGamut({ space: 'srgb', method: 'css' }).toString({ format: 'hex', collapse: false }).toLowerCase();
}

function harmony(base, scheme) {
  if (base === undefined) {
    if (scheme !== undefined) throw new Error('A harmony scheme needs a base color.');
    return { colors: [], limitations: [] };
  }
  if (scheme !== 'monochromatic' && !has(offsets, scheme)) throw new Error('Use monochromatic, analogous, complementary, split-complementary, or triadic.');
  const parsed = parseLiteral(base);
  if (parsed.reason) return { colors: [], incomplete: true, limitations: [parsed.reason] };
  const seed = parsed.color;
  const colors = [{ name: 'base', color: hex(seed) }];
  if (scheme === 'monochromatic') {
    const lab = seed.to('oklab').coords;
    for (const [name, endpoint] of [['lighter', [1, 0, 0]], ['darker', [0, 0, 0]]]) {
      colors.push({ name, color: hex(new Color('oklab', lab.map((value, i) => value * 0.65 + endpoint[i] * 0.35))) });
    }
    return { colors, limitations: ['Monochromatic samples interpolate 35% toward white/black in OKLab; these are exploration samples, not UI-state defaults.'] };
  }
  const [lightness, chroma, hue] = seed.to('oklch').coords;
  if (!Number.isFinite(hue) || chroma < 1e-7) {
    return { colors, incomplete: true, limitations: ['The neutral base has no meaningful hue for this harmony. Supply an intentional chromatic base or use monochromatic.'] };
  }
  for (const offset of offsets[scheme].slice(1)) {
    colors.push({ name: `hue${offset >= 0 ? '+' : ''}${offset}`, color: hex(new Color('oklch', [lightness, chroma, (hue + offset + 360) % 360])) });
  }
  return { colors, limitations: ['Hue offsets are OKLCH exploration conventions, not accessibility results or an exact reproduction of an RGB/RYB color wheel.'] };
}

function pairChecks(roles, pairs) {
  return pairs.map(pair => ({ foregroundRole: pair.foreground, backgroundRole: pair.background,
    ...checkPair(roles[pair.foreground].color, roles[pair.background].color, pair.minimum) }));
}

function adjustRole(name, roles, pairs) {
  const incident = pairs.filter(pair => pair.foreground === name || pair.background === name);
  if (!incident.length) return;
  const current = pairChecks(roles, incident);
  if (current.every(check => check.result === 'pass') || current.some(check => check.result === 'incomplete')) return;
  const seed = parseLiteral(roles[name].original).color;
  const [seedL, chroma, hue] = seed.to('oklch').coords;
  const cache = new Map();
  function sample(lightness) {
    const color = hex(new Color('oklch', [lightness, chroma, Number.isFinite(hue) ? hue : 0]));
    if (cache.has(color)) return cache.get(color);
    const candidates = { ...roles, [name]: { color } };
    const passes = pairChecks(candidates, incident).every(check => check.result === 'pass');
    const value = { color, passes, distance: new Color(color).deltaEOK(seed) };
    cache.set(color, value);
    return value;
  }
  // Explore a defined OKLCH curve, then refine observed pass/fail boundaries.
  // No monotonicity or globally optimal multi-role solution is assumed.
  const samples = Array.from({ length: 65 }, (_, i) => ({ lightness: i / 64, value: sample(i / 64) }));
  samples.push({ lightness: seedL, value: sample(seedL) });
  samples.sort((a, b) => a.lightness - b.lightness);
  for (let i = 1; i < samples.length; i++) {
    let left = samples[i - 1].lightness;
    let right = samples[i].lightness;
    const leftPasses = samples[i - 1].value.passes;
    if (leftPasses === samples[i].value.passes) continue;
    for (let step = 0; step < 20; step++) {
      const middle = (left + right) / 2;
      if (sample(middle).passes === leftPasses) left = middle;
      else right = middle;
    }
  }
  const valid = [...cache.values()].filter(value => value.passes)
    .sort((a, b) => a.distance - b.distance || (a.color < b.color ? -1 : a.color > b.color ? 1 : 0));
  if (valid.length) roles[name].color = valid[0].color;
}

export function generatePalette(input) {
  fields(input, ['schemaVersion', 'base', 'scheme', 'mode', 'roles', 'pairs'], 'palette');
  if (input.schemaVersion !== undefined && input.schemaVersion !== 1) throw new Error('Palette schemaVersion must be 1.');
  if (input.mode !== undefined && !['light', 'dark'].includes(input.mode)) throw new Error('Mode must be light or dark; provide its actual colors.');
  if (input.base === undefined && input.roles === undefined) throw new Error('Supply a base color or explicit roles and pairs.');
  const selectedScheme = input.base === undefined ? input.scheme : input.scheme || 'monochromatic';
  const selected = harmony(input.base, selectedScheme);
  const limitations = [...selected.limitations];
  const roles = Object.create(null);
  const pairs = input.pairs || [];
  if (input.roles !== undefined) {
    if (!object(input.roles) || Object.keys(input.roles).length < 1 || Object.keys(input.roles).length > 64) throw new Error('Supply 1 to 64 named roles.');
    if (!Array.isArray(pairs) || pairs.length < 1 || pairs.length > 128) throw new Error('Supply 1 to 128 explicit role pairs.');
    for (const [name, value] of Object.entries(input.roles)) {
      if (!name.trim() || name.length > 128) throw new Error('Role names must contain 1 to 128 characters.');
      fields(value, ['color', 'locked'], `role ${name}`);
      if (value.locked !== undefined && typeof value.locked !== 'boolean') throw new Error('Role locked must be a boolean.');
      parseLiteral(value.color);
      roles[name] = { color: value.color, original: value.color, locked: value.locked === true };
    }
    for (const pair of pairs) {
      fields(pair, ['foreground', 'background', 'minimum'], 'pair');
      if (typeof pair.foreground !== 'string' || typeof pair.background !== 'string' || !has(roles, pair.foreground) || !has(roles, pair.background)) throw new Error('Each pair must name existing foreground and background roles.');
      checkPair(roles[pair.foreground].color, roles[pair.background].color, pair.minimum);
      if (pair.minimum === undefined) throw new Error('Every palette pair needs an explicit minimum.');
    }
    for (const name of Object.keys(roles).sort()) if (!roles[name].locked) adjustRole(name, roles, pairs);
  } else {
    if (input.pairs !== undefined) throw new Error('Pairs require named roles.');
    limitations.push('No role pairs were checked; harmony candidates do not establish readability or accessibility.');
  }
  const checks = pairChecks(roles, pairs);
  const status = checks.some(check => check.result === 'fail') ? 'fail'
    : selected.incomplete || checks.some(check => check.result === 'incomplete') ? 'incomplete'
      : pairs.length ? 'pass' : 'generated';
  if (status === 'fail') limitations.push('Requested targets remain unmet. Locked colors or the bounded curve search may limit results; this is not proof that every possible solution is impossible.');
  limitations.push('Only declared color relationships were evaluated; meaning, identity, user perception and full interface accessibility require contextual review.');
  if (input.mode) limitations.push(`Mode ${input.mode} is a context label; themes are not automatically inverted or generated.`);
  const unused = Object.keys(roles).filter(name => !pairs.some(pair => pair.foreground === name || pair.background === name));
  if (unused.length) limitations.push(`Roles without a requested pair were retained and not checked: ${unused.join(', ')}.`);
  return { status, space: 'oklch', scheme: selectedScheme || null, source: input.base || 'Provided role colors',
    mode: input.mode || null, harmony: selected.colors, roles, checks,
    parameters: { roleAdjustment: 'oklch-curve-v1', gamutMapping: 'css', output: 'srgb-hex',
      harmony: selectedScheme === 'monochromatic'
        ? { space: 'oklab', method: 'linear endpoint interpolation', endpointMix: 0.35 }
        : { space: 'oklch', hueOffsets: selectedScheme ? offsets[selectedScheme] : [] },
      curveIntervals: 64, boundaryRefinements: 20, selection: 'minimum OKLab distance among passing sampled candidates',
      roleOrder: 'code-unit lexical', tieBreak: 'hex lexical' }, limitations };
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const previewColor = color => `color(srgb ${color.to('srgb').coords.join(' ')})`;

export function createPreview(report) {
  const swatches = [...(report.harmony || []), ...Object.entries(report.roles || {}).map(([name, value]) => ({ name, color: value.color }))];
  const cards = swatches.map(item => {
    const parsed = parseLiteral(item.color);
    return `<li><span class="swatch"${parsed.color ? ` style="background:${previewColor(parsed.color)}"` : ''}></span><strong>${escape(item.name)}</strong> <code>${escape(item.color)}</code></li>`;
  }).join('\n');
  const pairs = report.checks.map(check => {
    const fg = parseLiteral(check.foreground);
    const bg = parseLiteral(check.background);
    const style = fg.color && bg.color ? ` style="color:${previewColor(fg.color)};background:${previewColor(bg.color)}"` : '';
    return `<li><p>${escape(check.foregroundRole || check.foreground)} / ${escape(check.backgroundRole || check.background)}: ${escape(check.result)}${check.ratio === null ? '' : `, ${check.ratio.toFixed(4)}:1 (minimum ${check.minimum}:1)`}</p><div class="sample"${style}>${fg.color && bg.color ? 'Sample text and action label' : 'Unresolved pair; no color sample rendered.'}</div></li>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
<title>Palette preview</title>
<style>body{font:1rem/1.5 system-ui;margin:2rem;max-width:64rem;background:#fff;color:#111}ul{list-style:none;padding:0}li{margin-block:1rem}.swatch{display:inline-block;width:3rem;height:2rem;border:1px solid #666;vertical-align:middle;margin-inline-end:1rem}.sample{padding:1rem;border:1px solid #666;overflow-wrap:anywhere}code{overflow-wrap:anywhere}</style>
<h1>Palette preview</h1><p>Candidate values and declared pair checks. This preview does not validate a complete interface.</p>
<h2>Colors</h2><ul>${cards}</ul><h2>Requested pairs</h2><ul>${pairs}</ul>
<h2>Limits</h2><ul>${report.limitations.map(text => `<li>${escape(text)}</li>`).join('')}</ul></html>\n`;
}
