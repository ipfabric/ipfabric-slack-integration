## Webhook Worker / testing webhook agent

In this directory you can find a simple webhook agent (receiver) that you can use for testing the webhook sub-system
of the IP Fabric platform.

To start it, you need to:
```
$ yarn install
$ yarn start [config/config.json]
```

(In the following text, the `highlighted` words are fields from config.json file.)

The agent will start HTTP server listening on `port` and `route`. When a HTTP POST message
arrives, the agent prints information about it and reads raw payload attached to the message.

Then it calculates SHA256 HMAC hash of the payload with provided `secret` and compares it with
server-calculated hash of the payload sent in X-IPF-Signature HTTP header. In case the hashes
don't match, the message is dropped and "400 Bad request" is sent back. Note: the `secret` string
is the one you configured in IPF UI while creating the webhook.

Otherwise the payload is legitimate and it is parsed (if parsing fails, "400 Bad request" is sent
back as well). The parsed payload is printed to the output and the agent sends "200 OK" back
to indicate confirmation of successfully processed webhook. Then the payload is passed to the
payload handler that, in this demo, examines the payload, fetches extra data from IP Frabric platform
as needed, and posts notifications to Slack.

### Slack integration

To integrate with Slack, you need an OAuth access token that you can use to authenticate
and send messages to given Slack workspace / channel(s).

In case you don't have one yet, navigate to [https://api.slack.com/apps](https://api.slack.com/apps)
and create a new application there. In Features / OAuth & Permissions, you need to add some Bot
Token Scopes, depending on what features your application will be using:
* `chat:write` is for sending messages,
* `chat:write.public` is to send messages to public channels without joining them first, and
* `channels:read` is for listing channels (and getting their ids).

This demo expects all the above permissions set (i.e. part of the Bot Token Scopes). We use
[slack](https://github.com/smallwins/slack) npm package, see its `README.md` file for documentation
and the list of available API along with the token scope(s) you'll need to set in order to
make use of given API call.

After setting the permissions, you can install the new application into your Slack workspace.
Finally, navigate again to Features / OAuth & Permissions and you'll get your access token there.

Add the token into `config.json` file under `slackToken` key, and configure the target *public*
Slack channel (its name) under `slackChannel` key.

Sometimes the agent fetches additional data from IP Fabric API server (details about the reported
event). For this purpose, the platform supports API tokens, and this demo also makes use
of this feature. To make it work, please create an API token in IPF UI, and store it
under `ipfToken` key. To know what API server to talk to, please specify the URL of IPF API server
under `ipfApi` key in `config.json`.

### Development

The webhook agent is written using `koa` framework (similar to `express`, just better :-)),
and there is no tooling around it needed, as it is written in plain JS.

`src/agent.js` code is responsible for handling the webhook payload receiving part,
while `src/handler.js` code is the "what to do with the webhook payload" part.

### License

MIT
