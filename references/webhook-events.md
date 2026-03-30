# Webhook Events Reference

mailbot delivers real-time webhook events when email activity occurs. Register a webhook URL to receive these events:

```ts
await client.webhooks.create({
  url: 'https://your-domain.com/webhooks/mailbot',
  events: ['message.inbound', 'message.delivered', 'message.bounced',
           'message.opened', 'message.clicked', 'message.complained'],
});
```

All webhook payloads share this envelope:

```json
{
  "id": "evt_abc123",
  "type": "message.inbound",
  "timestamp": "2026-03-29T10:15:30Z",
  "data": { ... }
}
```

Respond with a `2xx` status within 10 seconds. Non-2xx responses trigger retries with exponential backoff.

---

## message.inbound

**When it fires:** A new email is received in one of your inboxes.

**Example payload:**

```json
{
  "id": "evt_inb_001",
  "type": "message.inbound",
  "timestamp": "2026-03-29T10:15:30Z",
  "data": {
    "message_id": "msg_abc123",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "from_address": "customer@example.com",
    "to_address": "support-bot--a1b2c3@mailbot.id",
    "subject": "Need help with my order",
    "body_text": "Hi, I placed an order yesterday but haven't received confirmation...",
    "body_html": "<p>Hi, I placed an order yesterday but haven't received confirmation...</p>",
    "received_at": "2026-03-29T10:15:29Z"
  }
}
```

**Common use cases:**
- Auto-reply or triage inbound support emails
- Trigger workflows from email (operational intake)
- Parse structured data from incoming messages
- Forward to internal systems (Slack, CRM, etc.)

---

## message.delivered

**When it fires:** Your outbound email was accepted by the recipient's mail server.

**Example payload:**

```json
{
  "id": "evt_del_002",
  "type": "message.delivered",
  "timestamp": "2026-03-29T10:16:05Z",
  "data": {
    "message_id": "msg_out456",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "to_address": "customer@example.com",
    "delivered_at": "2026-03-29T10:16:04Z"
  }
}
```

**Common use cases:**
- Confirm delivery in your application UI
- Update message status in your database
- Start a timer for expected reply (e.g., SLA tracking)

---

## message.bounced

**When it fires:** Delivery failed. Could be a hard bounce (invalid address) or soft bounce (mailbox full, temporary failure) after retries are exhausted.

**Example payload:**

```json
{
  "id": "evt_bnc_003",
  "type": "message.bounced",
  "timestamp": "2026-03-29T10:16:10Z",
  "data": {
    "message_id": "msg_out456",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "to_address": "invalid@nonexistent-domain.com",
    "bounce_type": "hard",
    "bounce_reason": "550 5.1.1 The email account does not exist",
    "bounced_at": "2026-03-29T10:16:09Z"
  }
}
```

**Common use cases:**
- Remove invalid addresses from your contact list
- Alert your team about delivery failures
- Retry with an alternate address for soft bounces
- Track bounce rate for sender reputation monitoring

---

## message.opened

**When it fires:** The recipient opened the email. Tracked via a transparent pixel. May fire multiple times for the same message (each open is counted).

**Example payload:**

```json
{
  "id": "evt_opn_004",
  "type": "message.opened",
  "timestamp": "2026-03-29T11:30:00Z",
  "data": {
    "message_id": "msg_out456",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "to_address": "customer@example.com",
    "opened_at": "2026-03-29T11:29:58Z",
    "opened_count": 1
  }
}
```

**Common use cases:**
- Trigger a follow-up if the email was opened but not replied to
- Track engagement metrics for outreach campaigns
- Prioritize leads based on open activity

---

## message.clicked

**When it fires:** The recipient clicked a tracked link in the email.

**Example payload:**

```json
{
  "id": "evt_clk_005",
  "type": "message.clicked",
  "timestamp": "2026-03-29T11:35:00Z",
  "data": {
    "message_id": "msg_out456",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "to_address": "customer@example.com",
    "clicked_url": "https://example.com/docs/getting-started",
    "clicked_at": "2026-03-29T11:34:58Z"
  }
}
```

**Common use cases:**
- Track which content resonates with recipients
- Personalize follow-ups based on clicked links
- Measure call-to-action effectiveness

---

## message.complained

**When it fires:** The recipient marked your email as spam. This is reported via a feedback loop from the recipient's email provider.

**Example payload:**

```json
{
  "id": "evt_cmp_006",
  "type": "message.complained",
  "timestamp": "2026-03-29T12:00:00Z",
  "data": {
    "message_id": "msg_out456",
    "inbox_id": "inb_xyz789",
    "thread_id": "thr_def456",
    "to_address": "customer@example.com",
    "complained_at": "2026-03-29T11:59:50Z"
  }
}
```

**Common use cases:**
- Immediately suppress the complaining address from future sends
- Review your sending patterns and content
- Monitor complaint rate to protect sender reputation

---

## webhook.failed

**When it fires:** A webhook delivery attempt to your endpoint failed and all retries have been exhausted.

**Example payload:**

```json
{
  "id": "evt_wf_007",
  "type": "webhook.failed",
  "timestamp": "2026-03-29T12:10:00Z",
  "data": {
    "webhook_id": "whk_abc123",
    "original_event_id": "evt_inb_001",
    "original_event_type": "message.inbound",
    "target_url": "https://your-domain.com/webhooks/mailbot",
    "failure_reason": "Connection timeout after 10s",
    "attempts": 5,
    "first_attempted_at": "2026-03-29T10:15:31Z",
    "last_attempted_at": "2026-03-29T12:09:55Z"
  }
}
```

**Common use cases:**
- Alert your ops team about endpoint downtime
- Replay the original event once your endpoint is back up
- Monitor webhook reliability

To replay a failed event:

```ts
await client.events.replay(originalEventId, 'https://your-domain.com/webhooks/mailbot');
```

---

## Registering webhooks

```ts
// Subscribe to specific events
const webhook = await client.webhooks.create({
  url: 'https://your-domain.com/webhooks/mailbot',
  events: ['message.inbound', 'message.delivered', 'message.bounced'],
});

// List registered webhooks
const webhooks = await client.webhooks.list();

// Delete a webhook
await client.webhooks.delete(webhook.id);
```

## Security

- Webhook URLs are validated against SSRF (private IP ranges are blocked).
- Redirect following is limited to 1 hop with re-validation.
- Always respond with `2xx` quickly and process events asynchronously.
