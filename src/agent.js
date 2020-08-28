const Router = require('@koa/router');
const {createHmac} = require('crypto');
const Koa = require('koa');
const getRawBody = require('raw-body');

const {config} = require('./config');
const {handler} = require('./handler');
const {log} = require('./logger');

// --- webhook-agent ---

const sendResponse = (ctx, code, message) => {
  log();
  log(`<<< sending ${code} response`);
  log(` +  ${message}`);
  ctx.status = code;
};

const app = new Koa();
const router = new Router();
router.post(config.route, async ctx => {
  log();
  log('>>> request received');
  log(` +  method  = ${ctx.request.method}`);
  log(` +  url     = ${ctx.request.url}`);
  log(` +  headers = ${JSON.stringify(ctx.request.headers, null, 2)}`);
  const bodyStr = await getRawBody(ctx.req, {
    length: ctx.headers['content-length'],
    limit: '1mb',
  });
  if (!bodyStr) {
    return sendResponse(ctx, 400, 'request body is missing');
  }

  log();
  const hmac = createHmac('sha256', config.secret);
  hmac.update(bodyStr);
  const verified = (hmac.digest('hex') === ctx.request.headers['x-ipf-signature']);
  log(`=== payload verified: ${verified}`);
  if (!verified) {
    return sendResponse(ctx, 400, 'payload signature is not matching');
  }

  let body;
  try {
    body = JSON.parse(bodyStr);
  } catch (e) {
    return sendResponse(ctx, 400, 'cannot parse request body');
  }
  log(`=== parsed body: ${JSON.stringify(body, null, 2)}`);
  sendResponse(ctx, 200, 'OK');

  // payload is valid, response has been sent, now it's time to handle the data
  // data is processed asynchronously, as we do not want to block sending 200 OK back
  // (that could cause timeout on the sender side, and webhook delivery retries)
  setImmediate(() => {
    handler(body);
  });

  return null;
});

app.use(router.routes());

app.listen(config.port, () => {
  log(`*** webhook agent ready, listening on :${config.port}${config.route}`);
});
