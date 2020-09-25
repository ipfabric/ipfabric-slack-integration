const {fetch} = require('./ipf');
const {log} = require('./logger');
const {postSlackResponse} = require('./slack');
const {resultEmoji} = require('./slack-emoji');

const getErrorResponseText = reason => `${resultEmoji.failed} ${reason}

*Supported commands:*
*\`/ipf inventory [<filter><operator><value> ...]\`*

Supported inventory filter names: hostname, site, vendor, family, platform, model.
Supported inventory operator values: = for exact match, =~ for regexp match (case insensitive).

In case you provide more filters, logical _AND_ operation applies.

In case there are many results, they are returned in batches of 10 records.
`;

module.exports.verify = data => {
  log();
  log('*** chatbot verify: begin');

  const result = {
    ok: false,
    response: {
      response_type: 'ephemeral',
    },
  };

  const command = data.text
    .replace(/\s+/, ' ')
    .trim();
  if (!command.length) {
    result.response.text = getErrorResponseText('Command missing.');
    log(' !  chatbot command missing, ignoring');
  } else {
    const [arg0, ...filters] = command.split(' ');
    if (arg0 !== 'inventory') {
      result.response.text = getErrorResponseText(`Command "${arg0}" not supported.`);
      log(` !  chatbot command "${arg0}" not supported, ignoring`);
    } else {
      // command: inventory; parse and validate filters if provided
      result.filters = [];
      let fail = false;
      filters.forEach(f => {
        const idx = f.indexOf('=');
        if (idx === -1 || idx === 0 || idx === f.length - 1) {
          fail = true; // "=" not found, or is at the beginning or at the end
          result.failedFilter = f;
          return;
        }
        const rxMatch = f.charAt(idx + 1) === '~';
        if (rxMatch && (idx + 1 === f.length - 1)) {
          fail = true; // "=~" at the end
          result.failedFilter = f;
          return;
        }
        const key = f.substr(0, idx);
        const value = f.substr(rxMatch ? idx + 2 : idx + 1);
        if (
          (key !== 'hostname')
          && (key !== 'site')
          && (key !== 'vendor')
          && (key !== 'family')
          && (key !== 'platform')
          && (key !== 'model')
        ) {
          fail = true; // filter name not supported
          result.failedFilter = f;
          return;
        }
        result.filters.push({
          key,
          rxMatch,
          value,
        });
      });
      if (!fail) {
        result.ok = true;
        result.response.text = `${resultEmoji.success} On it!`;
        log(' +  chatbot command verified successfully');
      } else {
        result.response.text = getErrorResponseText(`Invalid inventory filter "${result.failedFilter}".`);
        log(` !  invalid inventory filter "${result.failedFilter}", ignoring`);
      }
    }
  }

  log('*** chatbot verify: end');
  return result;
};

const columns = [
  'hostname',
  'siteName',
  'vendor',
  'platform',
  'family',
  'model',
];

const ELEM_MAX = 40;
const ELEM_BATCH_SIZE = 10;

const sendInventoryToSlack = async (inventory, responseUrl) => {
  let respText = `${inventory.length ? resultEmoji.finished : resultEmoji.zero} Found ${inventory.length} devices!\n`;
  if (inventory.length) {
    respText += (inventory.length > ELEM_MAX) ? `Here are first ${ELEM_MAX} of them...` : 'Here they are...';
  }
  await postSlackResponse(responseUrl, {
    response_type: 'in_channel',
    text: respText,
  });
  if (!inventory.length) {
    return;
  }
  // limit the output to ELEM_MAX items only
  const idxMax = Math.min(ELEM_MAX, inventory.length);
  // collect maximum lengths of strings in each column (for formatting purposes)
  const widths = [];
  columns.forEach(c => {
    widths.push((c === 'siteName' ? 'site' : c).length);
  });
  for (let i = 0; i < idxMax; i += 1) {
    const rec = inventory[i];
    for (let j = 0; j < columns.length; j += 1) {
      if (typeof rec[columns[j]] === 'string') {
        widths[j] = Math.max(widths[j], rec[columns[j]].length);
      }
    }
  }
  // header ...
  let buffer = '```\n';
  for (let j = 0; j < columns.length; j += 1) {
    buffer += (columns[j] === 'siteName' ? 'site' : columns[j]).padEnd(widths[j], ' ');
    if (j < columns.length - 1) {
      buffer += '   ';
    }
  }
  buffer += '\n';
  // ... with delimiting ruler
  for (let j = 0; j < columns.length; j += 1) {
    buffer += ''.padEnd(widths[j], '–');
    if (j < columns.length - 1) {
      buffer += '–+–';
    }
  }
  buffer += '\n';
  // inventory items, print ELEM_BATCH_SIZE items at once (slack message has limited size)
  for (let i = 0; i < idxMax; i += 1) {
    if (i && (i % ELEM_BATCH_SIZE === 0)) {
      buffer += '```';
      await postSlackResponse(responseUrl, { // eslint-disable-line no-await-in-loop
        response_type: 'in_channel',
        text: buffer,
      });
      buffer = '```\n';
    }
    const rec = inventory[i];
    for (let j = 0; j < columns.length; j += 1) {
      buffer += ((typeof rec[columns[j]] === 'string') ? rec[columns[j]] : '').padEnd(widths[j], ' ');
      if (j < columns.length - 1) {
        buffer += '   ';
      }
    }
    buffer += '\n';
  }
  buffer += '```';
  await postSlackResponse(responseUrl, {
    response_type: 'in_channel',
    text: buffer,
  });
};

module.exports.handler = async (filters, data) => {
  log();
  log('*** chatbot handler: begin');
  const filtersObj = {};
  filters.forEach(f => { // convert filter structure returned by verify() into filter object understood by API
    filtersObj[f.key === 'site' ? 'siteName' : f.key] = [f.rxMatch ? 'reg' : 'eq', f.value];
  });
  const resp = await fetch(
    'tables/inventory/devices',
    'POST',
    {
      columns,
      filters: Object.keys(filtersObj) ? filtersObj : undefined,
      snapshot: '$last',
    },
  );
  if (resp && resp.data) {
    log(' +  all good, we have a response from API, sending data to slack');
    await sendInventoryToSlack(resp.data, data.response_url);
  } else {
    log(' !  something went wrong, cannot read data from API');
    await postSlackResponse(data.response_url, {
      response_type: 'in_channel',
      text: `${resultEmoji.failed} Something went wrong, cannot get data from the API server.`,
    });
  }
  log('*** chatbot handler: end');
};
