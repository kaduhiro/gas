import { SLACK } from '#/constants/slack';
import { Kvs } from '#/libraries/kvs';
import { Url } from '#/libraries/url';
import { UsersListResponse } from '@slack/web-api';
import { Member } from '@slack/web-api/dist/response/UsersListResponse';

const _generateOptions = async (option: SlackAPIOption) => {
  const { token, payload } = option;

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
  };

  if (typeof payload !== 'undefined') {
    let attachment = {};

    // channel
    let channel = payload.channel ?? 'general';
    const match = channel.match(/^#?(?<name>[^#]{1,80})$/);
    if (typeof match?.groups === 'undefined') {
      console.log(`Slack: invalid channel '${channel}'`);
      return null;
    }

    channel = `#${match.groups.name}`;

    // title
    if (typeof payload.title !== 'undefined') {
      attachment = { ...attachment, title: payload.title };
    }

    // color
    if (typeof payload.color !== 'undefined') {
      if (!payload.color.match(/^(good|warning|danger|#[\da-zA-Z]{6})$/)) {
        console.log(`Slack: invalid color '${payload.color}'`);
        return null;
      }

      attachment = { ...attachment, color: payload.color };
    }

    // text
    if (typeof payload.text === 'string') {
      const specials = ['channel', 'here', 'everyone'];
      const userIdMap: Partial<{ [key: string]: string }> = {};

      const users = await _usersList();
      users.forEach((user: Member) => {
        if (user.profile?.display_name) {
          userIdMap[user.profile?.display_name] = user.id;
        }
      });

      let text = payload.text;

      const matches = text.matchAll(/(?:^|[^<])@(?<name>[\da-zA-Z]+)/g);
      Array.from(matches).forEach((match) => {
        if (match.groups) {
          if (specials.includes(match.groups.name)) {
            text = text.replace(`@${match.groups.name}`, `<!${match.groups.name}>`);
          }
          if (userIdMap[match.groups.name]) {
            text = text.replace(`@${match.groups.name}`, `<@${userIdMap[match.groups.name]}>`);
          }
        }
      });

      options.method = 'post';
      options.payload = Object.keys(attachment).length
        ? { channel, attachments: [{ ...attachment, text }] }
        : { channel, text };
    }
  }

  return options;
};

const _usersList = async () => {
  const url = `${SLACK.API_URL}/users.list`;

  const cache = Kvs.get(SLACK.USERS_KEY, SLACK.TABLE);
  const cacheCreated = new Date(cache?.created);
  if (cacheCreated && new Date().getTime() - cacheCreated.getTime() < SLACK.CACHE_EXPIRE_MINUTES_USERS_LIST * 60 * 1000) {
    return cache.members;
  }

  const token = Kvs.getSecrets(SLACK.BOT_TOKEN_KEY);
  if (!token) {
    return null;
  }

  const options = await _generateOptions({ token });
  if (!options) {
    throw new Error('failed to get user list');
  }

  if (typeof process !== 'undefined' && process.env.ENVIRONMENT === 'development') {
    console.log('Slack: users list.', JSON.stringify(options, null, '\t'));
  }

  const responseText = await Url.fetch(url, options);

  const responseJson: UsersListResponse = JSON.parse(responseText);
  if (!responseJson.ok) {
    console.log(responseJson.error);
    return null;
  }

  const members: Member[] = responseJson.members ?? [];
  console.log(`request Slack API '${url}'`);

  Kvs.set(SLACK.USERS_KEY, { members, created: new Date() }, SLACK.TABLE);

  return members;
};

const _botPostMessage = async (payload: SlackAPIPostMessage) => {
  const token = Kvs.getSecrets(SLACK.BOT_TOKEN_KEY);
  if (!token) {
    return null;
  }

  return _chatPostMessage({ token, payload });
};

const _userPostMessage = async (payload: SlackAPIPostMessage) => {
  const token = Kvs.getSecrets(SLACK.USER_TOKEN_KEY);
  if (!token) {
    return null;
  }

  return _chatPostMessage({ token, payload });
};

const _chatPostMessage = async (option: SlackAPIOption) => {
  const url = `${SLACK.API_URL}/chat.postMessage`;

  const options = await _generateOptions(option);
  if (!options) {
    throw new Error('failed to post message');
  }

  if (typeof process !== 'undefined' && process.env.ENVIRONMENT === 'development') {
    console.log('Slack: post message.', JSON.stringify(options, null, '\t'));
  }

  const responseText = await Url.fetch(url, options);

  return JSON.parse(responseText);
};

export namespace Slack {
  export const botPostMessage = _botPostMessage;
  export const userPostMessage = _userPostMessage;
}
