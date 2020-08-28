const {reportHandler} = require('./handler-intent_verification-calculate');
const {discoveryHandler} = require('./handler-snapshot-discover');
const {testHandler} = require('./handler-test');
const {log} = require('./logger');

module.exports.handler = async data => {
  log();
  log('*** webhook handler: begin');
  if (data.test) {
    await testHandler(data);
  } else if (data.type === 'snapshot' && data.action === 'discover') {
    await discoveryHandler(data);
  } else if (data.type === 'intent-verification') {
    await reportHandler(data);
  } else {
    log(' ?  no handler matching the webhook data, ignoring');
  }
  log('*** webhook handler: end');
};
