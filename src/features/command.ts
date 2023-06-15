import { CommandArgs } from '@/types/command';

const _cmdTest = (args?: CommandArgs) => {
  if (args) {
    console.log('? args', args);
  }

  console.log('ok');
};

const _cmdHelp = () => {
  return `usage:
    /test [args]
    /help`;
};

export namespace CommandHandler {
  export const test = _cmdTest;
  export const help = _cmdHelp;
}
