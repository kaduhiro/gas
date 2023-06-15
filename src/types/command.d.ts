export type CommandFunction = Partial<{ [key: string]: (args: CommandArgs) => boolean | string }>;
export type CommandArgs = string;
