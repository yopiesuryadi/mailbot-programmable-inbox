/**
 * webhook-handler.ts
 *
 * An Express server that verifies and handles mailbot webhook events.
 * Matches what the server sends as of October 2026: two events,
 * an `event` field in the envelope, and an HMAC-SHA256 hex signature
 * over the raw body in `X-Mailbot-Signature`.
 *
 * Run: MAILBOT_WEBHOOK_SECRET=... npx tsx examples/webhook-handler.ts
 *
 * Prerequisites:
 *   npm install express
 *   npm install -D @types/express
 *
 * Register your webhook URL with mailbot:
 *   const wh = await client.webhooks.create({
 *     url: 'https://your-domain.com/webhooks/mailbot',
 *     events: ['message.sent', 'message.received'],
 *   });
 *   // wh.secret is shown once. Put it in MAILBOT_WEBHOOK_SECRET.
 *
 * Events delivered to webhooks today:
 *   message.received   An inbound email arrived in one of your inboxes.
 *   message.sent       An outbound message was accepted and handed to the sender.
 *
 * Delivery, open, click and bounce are on the realtime stream and on the
 * message itself (get_message), not on webhooks.
 */

import crypto from 'crypto';
import express, { Request, Response } from 'express';

const SECRET = process.env.MAILBOT_WEBHOOK_SECRET ?? '';
const app = express();

type Envelope = {
  event: 'message.sent' | 'message.received' | string;
  event_id: string;
  delivery_attempt: number;
  timestamp: string;
  data: Record<string, unknown>;
};

const seen = new Set<string>(); // replace with your store; event_id is the idempotency key

function verify(rawBody: Buffer, signature: string): boolean {
  const expected = crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function handleReceived(data: Record<string, unknown>): void {
  console.log(`Inbound from ${data.from_address}: ${data.subject}`);
  console.log(`  message ${data.id} in thread ${data.thread_id}`);
  // Classify, reply in thread with client.messages.reply(...), forward, etc.
}

function handleSent(data: Record<string, unknown>): void {
  console.log(`Outbound ${data.id} handed to sender, delivery_status=${data.delivery_status}`);
  // Mark as sent on your side. Delivery is a separate state: read it with get_message.
}

app.post('/webhooks/mailbot', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
  const signature = req.get('X-Mailbot-Signature') ?? '';
  if (!verify(req.body as Buffer, signature)) {
    res.status(401).send('bad signature');
    return;
  }

  // Answer first, work after. The server waits at most 30 seconds.
  res.sendStatus(200);

  const envelope = JSON.parse((req.body as Buffer).toString('utf8')) as Envelope;
  if (seen.has(envelope.event_id)) return; // a retry of something we already handled
  seen.add(envelope.event_id);

  switch (envelope.event) {
    case 'message.received':
      handleReceived(envelope.data);
      break;
    case 'message.sent':
      handleSent(envelope.data);
      break;
    default:
      console.log(`Unhandled event: ${envelope.event}`);
  }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000/webhooks/mailbot'));
