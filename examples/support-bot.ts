/**
 * support-bot.ts
 *
 * A complete support bot that receives inbound email via webhook,
 * classifies intent with simple keyword logic, and auto-replies
 * in the same thread.
 *
 * Run: npx tsx examples/support-bot.ts
 *
 * Prerequisites:
 *   npm install @yopiesuryadi/mailbot-sdk express
 *   Set MAILBOT_API_KEY in your environment
 */

import { MailBot } from '@yopiesuryadi/mailbot-sdk';
import express from 'express';

const app = express();
app.use(express.json());

// --- Setup ---

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});

// The inbox ID your support bot listens on.
// Create one first: client.inboxes.create({ username: 'support-bot', display_name: 'Support Bot' })
const INBOX_ID = process.env.MAILBOT_INBOX_ID!;

// --- Intent classification ---

interface ClassifiedIntent {
  intent: 'billing' | 'bug_report' | 'general';
  reply: string;
}

function classifyIntent(subject: string, body: string): ClassifiedIntent {
  const text = `${subject} ${body}`.toLowerCase();

  if (text.includes('invoice') || text.includes('billing') || text.includes('charge') || text.includes('refund')) {
    return {
      intent: 'billing',
      reply:
        'Thanks for reaching out about billing. ' +
        'We have forwarded your request to the billing team. ' +
        'You should hear back within 1 business day.',
    };
  }

  if (text.includes('bug') || text.includes('error') || text.includes('broken') || text.includes('crash')) {
    return {
      intent: 'bug_report',
      reply:
        'Thanks for reporting this issue. ' +
        'Our engineering team has been notified and will investigate. ' +
        'We will follow up in this thread with updates.',
    };
  }

  return {
    intent: 'general',
    reply:
      'Thanks for your email. ' +
      'A team member will review your message and reply shortly.',
  };
}

// --- Webhook handler ---

app.post('/webhooks/mailbot', async (req, res) => {
  const event = req.body;

  // Only process inbound messages
  if (event.type !== 'message.inbound') {
    res.sendStatus(200);
    return;
  }

  const { message_id, from_address, subject, body_text } = event.data;

  console.log(`Inbound from ${from_address}: ${subject}`);

  // Step 1: Classify the intent
  const { intent, reply } = classifyIntent(subject, body_text ?? '');
  console.log(`Classified as: ${intent}`);

  // Step 2: Label the message with the detected intent
  await client.messages.updateLabels({
    inboxId: INBOX_ID,
    messageId: message_id,
    labels: [intent],
  });

  // Step 3: Reply in the same thread (threading is automatic)
  await client.messages.reply({
    inboxId: INBOX_ID,
    messageId: message_id,
    bodyText: reply,
    bodyHtml: `<p>${reply}</p>`,
  });

  console.log(`Replied to ${from_address} with ${intent} response`);

  res.sendStatus(200);
});

// --- Start server ---

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Support bot listening on port ${PORT}`);
  console.log(`Webhook URL: https://your-domain.com/webhooks/mailbot`);
  console.log(`Register this URL with: client.webhooks.create({ url, events: ['message.inbound'] })`);
});
