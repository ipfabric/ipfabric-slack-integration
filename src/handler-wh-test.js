/* eslint sort-keys: 0 */

const {log} = require('./logger');
const {postSlackMessage} = require('./slack');
const {msToStr, utcToLocal} = require('./time');

module.exports.testHandler = async data => {
  log(' +  received testing webhook, sending to slack');
  await postSlackMessage(`:wrench: Received the following *testing* webhook data:
  • type: ${data.type},
  • action: ${data.action},
  • status: ${data.status},
  • timestamp: ${msToStr(utcToLocal(data.timestamp))}.
For additional data fields, please check the webhook agent console. :female-detective:`);
};
