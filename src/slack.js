const axios = require('axios');
const Bluebird = require('bluebird');
const slack = require('slack');

const {config} = require('./config');
const {log} = require('./logger');

class Slack {
  constructor(token) {
    this.token = token;
    this.channel = null;
  }

  async init(channelName) {
    let id;
    let cursor;
    const {token} = this;
    do {
      const response = await slack.conversations.list({cursor, token}); // eslint-disable-line no-await-in-loop
      if (response.ok) {
        const channel = response.channels.find(ch => (ch.name === channelName));
        if (channel) {
          id = channel.id;
        }
        cursor = response.response_metadata && response.response_metadata.next_cursor;
      } else {
        throw new Error(`Slack.init: ${response.error}`);
      }
    } while (!id && cursor);
    if (!id) {
      throw new Error(`Slack.init: cannot find channel "${channelName}"`);
    }
    this.channel = id;
  }

  async send(text) {
    const {token, channel} = this;
    if (!token || !channel) {
      return;
    }
    let retry = true;
    while (retry) {
      try {
        await slack.chat.postMessage({ // eslint-disable-line no-await-in-loop
          channel,
          text,
          token,
        });
        retry = false;
      } catch (e) {
        log(` !  Slack.send ERROR: ${e.message}`);
        if (e.message === 'ratelimited') {
          await Bluebird.delay(100); // eslint-disable-line no-await-in-loop
        } else {
          retry = false;
        }
      }
    }
  }
}

const {slackToken, slackChannel} = config;
const app = new Slack(slackToken);
app.init(slackChannel);

// send a message to Slack
module.exports.postSlackMessage = async text => {
  await app.send(text);
};

// format in italics for Slack (don't bother if there are braces or underscores in the text)
module.exports.toItalics = str => {
  if ((str.indexOf('(') !== -1) || (str.indexOf(')') !== -1) || (str.indexOf('_') !== -1)) {
    return str.trim();
  }
  return `_${str.trim()}_`;
};

// send a response to Slack
module.exports.postSlackResponse = async (url, body) => {
  await axios.post(url, body);
};
