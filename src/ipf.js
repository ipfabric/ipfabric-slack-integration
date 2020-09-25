const axios = require('axios');

const {config} = require('./config');
const {log} = require('./logger');

const {ipfToken} = config;

module.exports.fetch = async (path, method = 'GET', body = {}) => {
  try {
    log(` +  fetching additional data from ${path}`);
    let resp;
    if (method === 'GET') {
      resp = await axios.get(`${config.ipfApi}/v1/${path}`, {headers: {'X-API-Token': ipfToken}});
    } else if (method === 'POST') {
      resp = await axios.post(`${config.ipfApi}/v1/${path}`, body, {headers: {'X-API-Token': ipfToken}});
    } else {
      log(` !  fetching failed: HTTP method "${method}" not supported`);
      return null;
    }
    if (!resp || !resp.data) {
      log(' !  fetching failed with ERROR: no response / data');
      return null;
    }
    log(` +  got response (type = ${typeof resp.data === 'string' ? 'text' : 'JSON'})`);
    log(` +  response data (first 100 chars): ${(typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data)).substr(0, 100)}`);
    return resp.data;
  } catch (e) {
    log(` !  fetching failed with ERROR: ${e.message}`);
    return null;
  }
};
