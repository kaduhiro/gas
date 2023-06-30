type SlackAPIOption = {
  token: string;
  payload?: SlackAPIPostMessage;
}

type SlackAPIPostMessage = {
  channel?: string;
  title?: string;
  color?: string;
  text: string;
};
