const Router = require('@koa/router');
const {createHmac} = require('crypto');
const Koa = require('koa');
const getRawBody = require('raw-body');
const url = require('url');

const {config} = require('./config');
const {handler: handlerChatbot, verify} = require('./handler-chatbot');
const {handler: handlerWebhook} = require('./handler-webhook');
const {log} = require('./logger');

// --- webhook-agent ---

const logRequest = req => {
  log();
  log('>>> request received');
  log(` +  method  = ${req.method}`);
  log(` +  url     = ${req.url}`);
  log(` +  headers = ${JSON.stringify(req.headers, null, 2)}`);
};

const sendResponse = (ctx, code, message) => {
  log();
  log(`<<< sending ${code} response`);
  log(` +  ${message}`);
  ctx.status = code;
};

const sendJSON = (ctx, code, json) => {
  log();
  log(`<<< sending ${code} response with JSON body`);
  log(` +  ${JSON.stringify(json, null, 2)}`);
  ctx.status = code;
  ctx.body = json;
};

const app = new Koa();
const router = new Router();
router.post(config.routeWebhook, async ctx => {
  logRequest(ctx.request);
  const bodyStr = await getRawBody(ctx.req, {
    length: ctx.headers['content-length'],
    limit: '1mb',
  });
  if (!bodyStr) {
    return sendResponse(ctx, 400, 'request body is missing');
  }

  const hmac = createHmac('sha256', config.secret);
  hmac.update(bodyStr);
  const verified = (hmac.digest('hex') === ctx.request.headers['x-ipf-signature']);
  log();
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
    handlerWebhook(body);
  });

  return null;
});

router.post(config.routeChatbot, async ctx => {
  logRequest(ctx.request);
  const buffer = await getRawBody(ctx.req, {
    length: ctx.headers['content-length'],
    limit: '1mb',
  });
  if (!buffer) {
    return sendResponse(ctx, 400, 'request body is missing');
  }
  const parsed = new url.URLSearchParams(buffer.toString());
  const body = {};
  parsed.forEach((value, key) => {
    body[key] = value;
  });
  log(`=== body: ${JSON.stringify(body, null, 2)}`);

  const immediate = verify(body);
  sendJSON(ctx, 200, immediate.response);

  // immediate message sent back to slack, now we have time to fetch the data from API,
  // and prepare the response
  if (immediate.ok) {
    setImmediate(() => {
      handlerChatbot(immediate.filters, body);
    });
  }

  return null;
});

app.use(router.routes());

app.listen(config.port, () => {
  log(`*** webhook agent ready, listening on :${config.port}`);
  log(`*** webhook route: ${config.routeWebhook}`);
  log(`*** chatbot route: ${config.routeChatbot}`);
});
