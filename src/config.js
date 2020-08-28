const {readFileSync} = require('fs');
const {basename} = require('path');

const {logNoTime} = require('./logger');

const configFilename = process.argv[2] || 'config/config.json';

try {
  const buffer = readFileSync(configFilename);
  module.exports.config = JSON.parse(buffer.toString());
} catch (e) {
  logNoTime(e.message);
  process.exit(1);
}
