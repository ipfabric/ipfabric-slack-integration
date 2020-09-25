const Bluebird = require('bluebird');

const {fetch} = require('./ipf');
const {log} = require('./logger');
const {postSlackMessage, toItalics} = require('./slack');
const {
  colorEmoji,
  statusEmoji,
  typeEmoji,
} = require('./slack-emoji');

const postHeader = async data => {
  await postSlackMessage(`${typeEmoji[data.type] || ''} Intent-verification process \
(triggered by _${data.requester}_) has just completed! ${statusEmoji[data.status] || ''}`);
};

// get one property given its `path` (as a string array) in object `obj`, return undefined if the property does not exist
const get1 = (obj, path) => {
  let current = obj;
  path.forEach(segment => {
    current = (current ? current[segment] : undefined);
  });
  return current;
};

// get properties from given object `obj` described with property `paths` (as a string array, dot-delimited)
const get = (obj, paths) => (paths.map(path => (get1(obj, path.split('.')))));

const LEVELS = [
  '0',
  '10',
  '20',
  '30',
];

const postRed = async report => {
  const [value, descr] = get(report, ['result.checks.30', 'descriptions.checks.30']);
  if (value) {
    await postSlackMessage(`*${report.name}*
${colorEmoji[30]} *${value}* ${descr ? `(${toItalics(descr)})` : ''}`);
  }
};

const postReport = async report => {
  const [description] = get(report, ['descriptions.general']);
  let message = `*${report.name}*\n`;
  if (description) {
    message = `${message}(${toItalics(description)})\n`;
  }
  let entries = 0;
  LEVELS.forEach(level => {
    const [value, descr] = get(report, [`result.checks.${level}`, `descriptions.checks.${level}`]);
    if (value !== undefined) {
      entries += 1;
      message = `${message}\n${colorEmoji[level]} *${value}* ${descr ? `(${toItalics(descr)})` : ''}`;
    }
  });
  if (entries) {
    await postSlackMessage(message);
  }
};

module.exports.reportHandler = async data => {
  if (data.status !== 'completed') {
    // ignore
    log(` +  received intent-verification / calculate webhook, with status "${data.status}", ignoring`);
  } else {
    // fetch additional data first
    log(' +  received intent-verification / calculate / completed webhook');
    if (data.snapshotId) {
      // all reports for given snapshot
      const resp = await fetch(`reports?snapshot=${data.snapshotId}`);
      log(' +  sending to slack');
      await postHeader(data);
      if (resp) {
        await Bluebird.each(resp, postRed);
      }
    } else if (data.reportId) {
      // single report (for unknown snapshot?)
      const resp = await fetch(`reports/${data.reportId}`);
      log(' +  sending to slack');
      await postHeader(data);
      if (resp) {
        await postReport(resp);
      }
    } else {
      log(' !  ERROR: webhook data missing both "snapshotId" and "reportId" fields, ignoring');
    }
  }
};
