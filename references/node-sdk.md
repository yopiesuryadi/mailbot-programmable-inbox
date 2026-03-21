# Node.js SDK Reference

Install:

```bash
npm install @yopiesuryadi/mailbot-sdk
```

Base URL:

- default constructor base: `https://getmail.bot`
- effective API base: `https://getmail.bot/v1`

## Setup

```ts
import { MailBot } from '@yopiesuryadi/mailbot-sdk';

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});
```

## Account

```ts
const account = await client.account.get();
await client.account.update({ name: 'New Name' });
```

## API Keys

```ts
const newKey = await client.apiKeys.create({ name: 'ci-pipeline' });
console.log(newKey.key); // mb_... — only shown once
const keys = await client.apiKeys.list();
await client.apiKeys.delete(keys.data[0].id);
```

## Inboxes

```ts
const inbox = await client.inboxes.create({
  username: 'support',
  display_name: 'Support',
});

const inboxes = await client.inboxes.list();
const oneInbox = await client.inboxes.get(inbox.id);
await client.inboxes.update(inbox.id, { display_name: 'Support v2' });
await client.inboxes.delete(inbox.id);
```

## Messages

```ts
const sent = await client.messages.send({
  inboxId: inbox.id,
  to: ['a@b.com'],
  subject: 'Hello',
  bodyText: 'Hi there',
  bodyHtml: '<p>Hi there</p>',
});

const messages = await client.messages.list(inbox.id, {
  direction: 'inbound',
  limit: 20,
});

const message = await client.messages.get(inbox.id, sent.id);

await client.messages.reply({
  inboxId: inbox.id,
  messageId: sent.id,
  bodyText: 'Following up.',
});

await client.messages.search({
  inboxId: inbox.id,
  query: 'invoice',
  limit: 10,
});

await client.messages.waitFor({
  inboxId: inbox.id,
  direction: 'inbound',
  fromAddress: 'a@b.com',
  timeoutMs: 30000,
});

await client.messages.updateLabels({
  inboxId: inbox.id,
  messageId: sent.id,
  labels: ['urgent'],
});
```

## Threads

```ts
const threads = await client.threads.list(inbox.id, { limit: 20 });
const thread = await client.threads.get(inbox.id, sent.thread_id);
```

## Webhooks

```ts
const webhook = await client.webhooks.create({
  url: 'https://example.com/webhooks/mailbot',
  events: ['delivered', 'opened', 'clicked', 'bounced'],
});

const webhooks = await client.webhooks.list();
await client.webhooks.delete(webhook.id);
```

## Events

```ts
const events = await client.events.list(sent.thread_id);
await client.events.replay(events.data[0].id, 'https://example.com/replay-target');
```

## Compliance

```ts
await client.compliance.check({ domain: 'example.com' });
await client.compliance.readiness(inbox.id);
```

## Audit

```ts
const auditEvents = await client.audit.list({ limit: 50 });
```

## Usage and engagement

```ts
await client.usage.get();
await client.usage.daily();
await client.engagement.summary({ period: '7d' });
```
