import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makeReport, runColorCommand } from './color.mjs';

export async function runCli(args) {
  try { return await runColorCommand(args); }
  catch (error) {
    if (args.includes('--json')) console.log(JSON.stringify(makeReport(`color.${args[0] || 'unknown'}`, { status: 'error', message: error.message })));
    else console.error(`PolishUp: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = await runCli(process.argv.slice(2));
}
