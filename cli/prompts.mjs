import { createInterface } from 'node:readline';
import { styleText } from 'node:util';

const enabled = value => Boolean(value && value !== '0' && value !== 'false');
const cancelled = () => new Error('Cancelled.');
export const BACK = Symbol('back');

export async function createPrompts({ input = process.stdin, output = process.stdout, env = process.env, plain = false, noInput = false } = {}) {
  const interactive = Boolean(input.isTTY && !noInput && !enabled(env.CI));
  let rich, core;
  if (interactive && output.isTTY && !plain && !env.NO_COLOR && env.TERM !== 'dumb' && !enabled(env.ACCESSIBLE)) {
    try { rich = await import('@clack/prompts'); core = await import('@clack/core'); }
    catch (error) {
      if (error.code !== 'ERR_MODULE_NOT_FOUND' || !error.message.includes('@clack/prompts')) throw error;
      output.write('Using text menus. Run npm ci in the checkout to enable keyboard menus.\n');
    }
  }
  let reader, lines, aborted = false, activeBack = false;
  const write = message => output.write(`${message}\n`);
  const interrupt = () => { aborted = true; reader?.close(); };
  const plainEscape = (_value, key) => {
    if (activeBack && key?.name === 'escape') {
      reader.write(null, { ctrl: true, name: 'u' });
      reader.emit('line', BACK);
    }
  };
  const terminal = Boolean(input.isTTY && output.isTTY && typeof input.setRawMode === 'function');
  const footer = (kind, back) => [
    ...(kind !== 'text' ? [rich ? '↑/↓: Move' : 'Numbers: Select'] : []),
    ...(kind === 'multi' && rich ? ['Space: Select'] : []),
    'Enter: Continue', ...(back ? [terminal || rich ? 'Esc: Back' : kind === 'text' ? ':back: Back' : 'b: Back'] : []), 'Ctrl+C: Cancel',
  ];
  const ask = async (message, back = false) => {
    if (!interactive) throw new Error('Supply --agent and --scope outside an interactive terminal, or when input is disabled.');
    if (aborted) throw cancelled();
    if (!reader) {
      reader = createInterface({ input, output,
        terminal, crlfDelay: Infinity, escapeCodeTimeout: 50 });
      lines = reader[Symbol.asyncIterator]();
      reader.on('SIGINT', interrupt);
      process.on('SIGINT', interrupt);
      input.on('keypress', plainEscape);
    }
    activeBack = back;
    if (reader.terminal) { reader.setPrompt(`${message}: `); reader.prompt(); }
    else output.write(`${message}: `);
    const result = await lines.next();
    activeBack = false;
    if (result.done || aborted) throw cancelled();
    return result.value === BACK ? BACK : result.value.trim();
  };
  const result = async (run, back = false) => {
    let goBack = false;
    const keypress = (_value, key) => { goBack = key?.name === 'escape'; };
    if (back) input.on('keypress', keypress);
    try {
      const value = await run();
      if (rich.isCancel(value)) { if (back && goBack) return BACK; throw cancelled(); }
      return value;
    } finally { input.removeListener('keypress', keypress); }
  };
  const options = choices => choices.map(({ value, label, hint }) => ({ value, label, ...(hint ? { hint } : {}) }));
  const richPrompt = async ({ kind, message, choices, back, initialValue, initialValues, validate }) => {
    const paint = (format, text) => styleText(format, text, { validateStream: false });
    const Prompt = kind === 'text' ? core.TextPrompt : kind === 'multi' ? core.MultiSelectPrompt : core.SelectPrompt;
    const instructions = rich.formatInstructionFooter(output, footer(kind, back), true);
    const controller = new AbortController();
    const abort = () => controller.abort();
    const endKey = (_value, key) => { if (key?.ctrl && key.name === 'd') queueMicrotask(abort); };
    const prompt = new Prompt({ input, output, signal: controller.signal, ...(choices ? { options: options(choices) } : {}),
      initialValue, initialValues, defaultValue: kind === 'text' ? initialValue : undefined,
      validate: validate || (kind === 'multi' ? value => value?.length ? undefined : 'Select at least one harness.' : undefined),
      render() {
        const title = `${rich.symbol(this.state)}  ${message}\n`;
        if (this.state === 'submit' || this.state === 'cancel') {
          const summary = kind === 'text' ? this.value || '' : choices.filter(choice => kind === 'multi'
            ? this.value?.includes(choice.value) : choice.value === this.value).map(choice => choice.label).join(', ');
          return `${title}${rich.S_BAR}  ${paint('dim', summary)}`;
        }
        const body = kind === 'text' ? [this.userInputWithCursor] : rich.limitOptions({
          options: this.options, cursor: this.cursor, output, columnPadding: 3, rowPadding: instructions.length + 4,
          style: (choice, focused) => {
            const selected = kind === 'multi' && this.value?.includes(choice.value);
            const marker = kind === 'multi' ? selected ? rich.S_CHECKBOX_SELECTED : rich.S_CHECKBOX_INACTIVE
              : focused ? rich.S_RADIO_ACTIVE : rich.S_RADIO_INACTIVE;
            const row = `${marker} ${choice.label}${focused && choice.hint ? ` (${choice.hint})` : ''}`;
            return focused ? paint(['cyanBright', 'bold'], `> ${row}`) : `  ${paint(selected ? 'green' : 'dim', row)}`;
          },
        });
        const error = this.state === 'error' ? String(this.error).split('\n').map(line => `${rich.S_BAR}  ${paint('yellow', line)}`) : [];
        return [title.trimEnd(), ...body.map(line => `${rich.S_BAR}  ${line}`), ...error, ...instructions].join('\n');
      },
    });
    input.once('end', abort);
    input.once('close', abort);
    input.on('keypress', endKey);
    try {
      if (input.readableEnded || input.destroyed) abort();
      return await prompt.prompt();
    } finally {
      input.removeListener('end', abort);
      input.removeListener('close', abort);
      input.removeListener('keypress', endKey);
    }
  };
  const choose = async (message, choices, { multiple = false, back = false, initialValue, initialValues = [] } = {}) => {
    if (!choices.length) throw new Error('No available choices. Supply an explicit target instead.');
    if (!interactive) throw new Error('Supply --agent and --scope outside an interactive terminal.');
    if (rich) {
      return result(() => richPrompt({ kind: multiple ? 'multi' : 'select', message, choices, back, initialValue, initialValues }), back);
    }
    write(message);
    choices.forEach((item, i) => write(`  ${i + 1}. ${item.label}${item.hint ? ` (${item.hint})` : ''}${(multiple ? initialValues.includes(item.value) : item.value === initialValue) ? ' [selected]' : ''}`));
    if (multiple ? initialValues.length : initialValue !== undefined) write('Enter keeps the previous selection.');
    write(footer(multiple ? 'multi' : 'select', back).join(' | '));
    while (true) {
      const answer = await ask(multiple ? 'Choose numbers separated by commas' : 'Choose a number', back);
      if (answer === BACK) return BACK;
      if (back && /^(b|:back)$/i.test(answer)) return BACK;
      if (/^(q|:cancel)$/i.test(answer)) throw cancelled();
      if (!answer && (multiple ? initialValues.length : initialValue !== undefined)) return multiple ? [...initialValues] : initialValue;
      const parts = answer.split(',').map(part => part.trim());
      const indexes = parts.map(part => Number(part) - 1);
      if (parts.every(part => /^[1-9]\d*$/.test(part)) && (multiple || parts.length === 1) &&
          new Set(indexes).size === indexes.length && indexes.every(index => index < choices.length)) {
        const values = indexes.map(index => choices[index].value);
        return multiple ? values : values[0];
      }
      write(`Enter ${multiple ? 'valid, distinct numbers' : 'a valid number'} from 1 to ${choices.length}, or press Ctrl+C to cancel.`);
    }
  };
  return {
    interactive,
    intro(message) { if (interactive) { if (rich) rich.intro(message, { output }); else write(`${message}\n`); } },
    choose,
    multi(message, choices, options = {}) { return choose(message, choices, { ...options, multiple: true }); },
    async text(message, { validate = value => value ? undefined : 'Enter a value.', back = false, initialValue } = {}) {
      const check = value => value === ':cancel' || (back && value === ':back') ? undefined : validate(value);
      if (rich) {
        const value = await result(() => richPrompt({ kind: 'text', message, initialValue, validate: check, back }), back);
        if (value === BACK || (back && value === ':back')) return BACK;
        if (value === ':cancel') throw cancelled();
        return value;
      }
      write(message);
      write(footer('text', back).join(' | '));
      while (true) {
        const value = await ask(`Path${initialValue ? ` [${initialValue}]` : ''}`, back);
        if (value === BACK) return BACK;
        const answer = value || initialValue || '';
        if (back && answer === ':back') return BACK;
        if (answer === ':cancel') throw cancelled();
        const error = validate(answer);
        if (!error) return answer;
        write(error);
      }
    },
    close() {
      reader?.close();
      input.pause();
      input.unref?.();
      input.removeListener('keypress', plainEscape);
      process.removeListener('SIGINT', interrupt);
    },
  };
}
