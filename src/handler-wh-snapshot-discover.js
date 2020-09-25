const {fetch} = require('./ipf');
const {log} = require('./logger');
const {postSlackMessage} = require('./slack');
const {statusEmoji, typeEmoji} = require('./slack-emoji');
const {diffToStr} = require('./time');

module.exports.discoveryHandler = async data => {
  if (data.status !== 'completed') {
    // post to slack
    log(` +  received snapshot / discover webhook, with status "${data.status}", sending to slack`);
    await postSlackMessage(`${typeEmoji[data.type] || ''} Discovery process has just ${data.status}. ${statusEmoji[data.status] || ''}`);
  } else {
    // fetch additional data first
    log(' +  received snapshot / discover / completed webhook');
    const resp = await fetch(`snapshots/${data.snapshot.id}`);
    // post to slack
    log(' +  sending to slack');
    const msg = `${typeEmoji[data.type] || ''} Discovery process has just completed! ${statusEmoji[data.status] || ''}`;
    if (!resp) {
      await postSlackMessage(msg);
    } else {
      await postSlackMessage(`${msg}
  • duration: ${diffToStr(resp.tsEnd - resp.tsStart)},
  • devices: ${resp.totalDevCount} (out of which ${resp.licensedDevCount} are licensed).`);
    }
  }
};
