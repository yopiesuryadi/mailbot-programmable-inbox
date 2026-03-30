/**
 * webhook-handler.ts
 *
 * An Express server that receives and processes mailbot webhook events.
 * Handles different event types with appropriate logic for each.
 *
 * Run: npx tsx examples/webhook-handler.ts
 *
 * Prerequisites:
 *   npm install express
 *   npm install -D @types/express
 *
 * Register your webhook URL with mailbot:
 *   client.webhooks.create({
 *     url: 'https://your-domain.com/webhooks/mailbot',
 *     events: ['message.inbound', 'message.delivered', 'message.bounced',
 *              'message.opened', 'message.clicked', 'message.complained'],
 *   });
 *
 * Webhook event types:
 *
 *   message.inbound     — A new email was received in your inbox.
 *   message.delivered    — Your outbound email was delivered to the recipient's mail server.
 *   message.bounced      — Delivery failed (hard bounce or soft bounce after retries).
 *   message.opened       — The recipient opened the email (via tracking pixel).
 *   message.clicked      — The recipient clicked a link in the email.
 *   message.complained   — The recipient marked the email as spam.
 *   webhook.failed       — A previous webhook delivery attempt failed (retry exhausted).
 */

import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// --- Event handlers ---

function handleInbound(data: Record<string, unknown>): void {
  console.log(`New inbound email from ${data.from_address}`);
  console.log(`  Subject: ${data.subject}`);
  console.log(`  Message ID: ${data.message_id}`);
  console.log(`  Thread ID: ${data.thread_id}`);
  // Add your logic here: classify, auto-reply, forward, etc.
}

function handleDelivered(data: Record<string, unknown>): void {
  console.log(`Email delivered: ${data.message_id}`);
  console.log(`  To: ${data.to_address}`);
  console.log(`  Delivered at: ${data.delivered_at}`);
  // Update your delivery tracking, mark as delivered in your DB, etc.
}

function handleBounced(data: Record<string, unknown>): void {
  console.error(`Email bounced: ${data.message_id}`);
  console.error(`  To: ${data.to_address}`);
  console.error(`  Bounce type: ${data.bounce_type}`);
  console.error(`  Reason: ${data.bounce_reason}`);
  // Remove bad addresses, alert your team, retry with alternate address, etc.
}

function handleOpened(data: Record<string, unknown>): void {
  console.log(`Email opened: ${data.message_id}`);
  console.log(`  Opened at: ${data.opened_at}`);
  console.log(`  Open count: ${data.opened_count}`);
  // Track engagement, trigger follow-up if first open, etc.
}

function handleClicked(data: Record<string, unknown>): void {
  console.log(`Link clicked: ${data.message_id}`);
  console.log(`  URL: ${data.clicked_url}`);
  console.log(`  Clicked at: ${data.clicked_at}`);
  // Track link engagement, personalize follow-up based on interest, etc.
}

function handleComplained(data: Record<string, unknown>): void {
  console.warn(`Spam complaint: ${data.message_id}`);
  console.warn(`  From: ${data.to_address}`);
  // Immediately suppress this address, review sending patterns, etc.
}

function handleWebhookFailed(data: Record<string, unknown>): void {
  console.error(`Webhook delivery failed`);
  console.error(`  Original event: ${data.original_event_type}`);
  console.error(`  Target URL: ${data.target_url}`);
  console.error(`  Failure reason: ${data.failure_reason}`);
  // Alert ops team, check endpoint health, etc.
}

// --- Webhook endpoint ---

app.post('/webhooks/mailbot', (req: Request, res: Response) => {
  const event = req.body;
  const { type, data, timestamp } = event;

  console.log(`[${timestamp}] Event: ${type}`);

  switch (type) {
    case 'message.inbound':
      handleInbound(data);
      break;
    case 'message.delivered':
      handleDelivered(data);
      break;
    case 'message.bounced':
      handleBounced(data);
      break;
    case 'message.opened':
      handleOpened(data);
      break;
    case 'message.clicked':
      handleClicked(data);
      break;
    case 'message.complained':
      handleComplained(data);
      break;
    case 'webhook.failed':
      handleWebhookFailed(data);
      break;
    default:
      console.log(`Unhandled event type: ${type}`);
  }

  // Always respond 200 quickly to acknowledge receipt.
  // If you return a non-2xx, mailbot will retry the webhook.
  res.sendStatus(200);
});

// --- Health check ---

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// --- Start server ---

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  console.log(`Webhook handler listening on port ${PORT}`);
});
