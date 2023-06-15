import { CommandHandler } from '@/features/command';

const _run = (cmd: string) => {
  const matches = cmd.match(/^\/(?<command>\S+)(?: (?<args>\S+))?$/);
  if (!matches) {
    console.log(`✘ command not found '${cmd}'`);
    return false;
  }

  if (!matches.groups) {
    return false;
  }

  const handler = CommandHandler[matches.groups.command as keyof typeof CommandHandler];
  if (typeof handler === 'undefined') {
    console.log(`✘ unknown command '${matches.groups.command}'`);
    return false;
  }

  console.log(`? command '${matches.groups.command} ${matches.groups.args ?? ''}'`);

  return handler(matches.groups.args);
};

export namespace Command {
  export const run = _run;
}
