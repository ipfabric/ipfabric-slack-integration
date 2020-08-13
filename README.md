## Webhook Worker / testing webhook agent

In this directory you can find a simple webhook agent (receiver) that you can use for testing the webhook sub-system.

To start it, you need to:
```
$ yarn
$ node webhook-agent.js <config.json>
```

(In the following text, the `highlighted` words are fields from config.json file.)

The agent will start HTTP server listening on `port` and `route`. When a HTTP POST message
arrives, the agent prints information about it and reads raw payload attached to the message.

Then it calculates SHA256 HMAC hash of the payload with provided `secret` and compares it with
server-calculated hash of the payload sent in X-IPF-Signature HTTP header. In case the hashes
don't match, the message is dropped and "400 Bad request" is sent back.

Otherwise the payload is legitimate and is parsed (if parsing fails, "400 Bad request" is sent
back as well). The parsed payload is printed to the output and the agent sends "200 OK" back
to indicate confirmation of successfully processed webhook.

```
$ yarn webhook-agent
```
is an alias for
```
$ node webhook-agent.js config/ok.json
```

### Development

The webhook agent is written using `koa` framework (similar to `express`, just better :-)),
and there is no tooling around it needed, as it is written in plain JS.

`webhook-agent.js` code is responsible for handling the webhook payload receiving part,
while `webhook-handler.js` code is the "what to do with the webhook payload" part.
