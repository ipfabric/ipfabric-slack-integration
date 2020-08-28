const axios = require('axios');

const {config} = require('./config');
const {log} = require('./logger');

const {ipfToken} = config;

module.exports.fetch = async path => {
  try {
    log(` +  fetching additional data from ${path}`);
    const resp = await axios.get(`${config.ipfApi}/v1/${path}`, {headers: {'X-API-Token': ipfToken}});
    if (!resp || !resp.data) {
      log(' !  fetching failed with ERROR: no response / data');
      return null;
    }
    return resp.data;
  } catch (e) {
    log(` !  fetching failed with ERROR: ${e.message}`);
    return null;
  }
};
