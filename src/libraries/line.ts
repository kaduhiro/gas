import { LINE } from '#/constants/line';
import { Kvs } from '#/libraries/kvs';
import { Url } from '#//libraries/url';

const _generateOptions = (args: Partial<{ [key: string]: string }>) => {
  const { to, replyToken, message } = args;

  const channelToken = Kvs.getSecrets(LINE.CHANNEL_TOKEN_KEY);
  if (!channelToken) {
    return undefined;
  }

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Bearer ${channelToken}`,
  };

  const messages = [
    {
      type: 'text',
      text: message,
    },
  ];

  const payload = JSON.stringify({
    to,
    replyToken,
    messages,
  });
  const method = 'post';

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    headers,
    method,
    payload,
  };

  return options;
};

const _pushMessage = async (to: string, message: string) => {
  const url = `${LINE.API_URL}/message/push`;

  const options = _generateOptions({ to, message });
  if (!options) {
    throw new Error('failed to push message')
  }

  if (typeof process !== 'undefined' && process.env.ENVIRONMENT === 'development') {
    console.log('Line: push message.', JSON.stringify(options, null, '\t'));
    return;
  }

  const responseText = await Url.fetch(url, options);

  return JSON.parse(responseText);
};

const _replyMessage = async (replyToken: string, message: string) => {
  const url = `${LINE.API_URL}/message/reply`;

  const options = _generateOptions({ replyToken, message });
  if (!options) {
    throw new Error('failed to reply message')
  }

  if (typeof process !== 'undefined' && process.env.ENVIRONMENT === 'development') {
    console.log('Line: reply message.', JSON.stringify(options, null, '\t'));
    return;
  }

  const responseText = await Url.fetch(url, options);

  return JSON.parse(responseText);
};

export namespace Line {
  export const pushMessage = _pushMessage;
  export const replyMessage = _replyMessage;
}
