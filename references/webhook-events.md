# Webhook Events Reference

What the server actually sends, read from the mailbot source on October 19, 2026.

## Register

```ts
const webhook = await client.webhooks.create({
  url: 'https://your-domain.com/webhooks/mailbot',
  events: ['message.sent', 'message.received'],
});
// webhook.secret is returned once. Keep it for signature checks.
```

## Events delivered to webhooks

| Event | When it fires |
|---|---|
| `message.sent` | An outbound message was accepted and handed to the sender, including scheduled sends when they go out |
| `message.received` | An inbound email arrived in one of your inboxes |

Delivery, open, click, bounce and complaint events exist, but today they go to the realtime stream (`GET /v1/realtime/stream`) and to the message's state, not to webhooks. Subscribing a webhook to `message.delivered` sends nothing. Use `get_message` (MCP) or `GET /v1/inboxes/{inbox_id}/messages/{id}` to read a message's state.

## Envelope

Headers: `X-Mailbot-Event`, `X-Mailbot-Signature` (hex HMAC-SHA256 of the raw body). With the Webhook Reliability add-on also `X-Mailbot-Event-Id`, `X-Mailbot-Delivery-Attempt`, `Idempotency-Key`.

```json
{
  "event": "message.received",
  "event_id": "b3f0d0a2-1c8e-4a7e-9d2b-7c1f5f0a9e11",
  "delivery_attempt": 1,
  "timestamp": "2026-10-19T03:15:06.262Z",
  "data": {
    "id": "msg-uuid",
    "inbox_id": "inbox-uuid",
    "thread_id": "thread-uuid",
    "from_address": "customer@example.com",
    "to_addresses": ["support@yourdomain.com"],
    "cc_addresses": [],
    "bcc_addresses": [],
    "subject": "Re: Your support request",
    "direction": "inbound",
    "received_at": "2026-10-19T03:15:05.000Z",
    "duplicate": false
  }
}
```

`message.sent` has the same shape with `direction: "outbound"`, plus `compliance_status`, `delivery_status`, and `scheduled_at` for scheduled sends. The body text is not in the payload; fetch the message by `data.id`.

## Verify the signature

HMAC-SHA256 over the raw request bytes with the webhook secret, hex encoded. No timestamp, no `sha256=` prefix. Compare in constant time. See `examples/webhook-handler.ts`.

## Timeouts and retries

Your endpoint has 30 seconds to return a 2xx.

| | Without add-on | With Webhook Reliability add-on |
|---|---|---|
| Attempts | 1 | 7 |
| Delays | none | 1s, 2s, 4s, 8s, 16s, 32s, 60s |
| Dead-letter queue and replay | no | yes |
| Idempotency headers | no | yes |

Each attempt is visible at `GET /v1/webhooks/{id}/deliveries` with status code and duration.

## Security

- URLs are checked against private and link-local address ranges before every request, including after a redirect. One redirect at most.
- Always verify the signature before parsing.
- Answer 200 first, process later. Treat `event_id` as your idempotency key.
