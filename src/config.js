const {readFileSync} = require('fs');
const {basename} = require('path');

const {logNoTime} = require('./logger');

// --- config ---

if (process.argv.length < 2) {
  logNoTime(`usage: node ${basename(process.argv[1])} [path/to/config.json]`);
  process.exit(1);
}

const configFilename = process.argv[2] || 'config/config.json';

let config;
try {
  const confStr = readFileSync(configFilename)
    .toString();
  config = JSON.parse(confStr);
} catch (e) {
  logNoTime(e.message);
  process.exit(1);
}

module.exports.config = config;
