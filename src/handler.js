// const {config} = require('./config');
const {log} = require('./logger');

const handler = async (/* data */) => {
  log();
  log('*** webhook handler: begin');
  log('*** webhook handler: end');
};

module.exports.handler = handler;
