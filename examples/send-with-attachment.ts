/**
 * send-with-attachment.ts
 *
 * Send an email with a file attachment using the mailbot SDK.
 * Reads a local file, base64-encodes it, and includes it as an attachment.
 *
 * Run: npx tsx examples/send-with-attachment.ts
 *
 * Prerequisites:
 *   npm install @yopiesuryadi/mailbot-sdk
 *   Set MAILBOT_API_KEY in your environment
 */

import { MailBot } from '@yopiesuryadi/mailbot-sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});

async function sendWithAttachment(): Promise<void> {
  // The inbox to send from
  const INBOX_ID = process.env.MAILBOT_INBOX_ID!;

  // Read the file and encode as base64
  const filePath = path.resolve(process.argv[2] ?? './report.pdf');
  const fileBuffer = fs.readFileSync(filePath);
  const base64Content = fileBuffer.toString('base64');
  const fileName = path.basename(filePath);

  // Determine MIME type from extension
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.csv': 'text/csv',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] ?? 'application/octet-stream';

  console.log(`Attaching: ${fileName} (${contentType}, ${fileBuffer.length} bytes)`);

  // Send the email with the attachment
  const sent = await client.messages.send({
    inboxId: INBOX_ID,
    to: ['recipient@example.com'],
    subject: 'Monthly Report',
    bodyText: 'Hi,\n\nPlease find the monthly report attached.\n\nBest regards',
    bodyHtml: '<p>Hi,</p><p>Please find the monthly report attached.</p><p>Best regards</p>',
    attachments: [
      {
        filename: fileName,
        content: base64Content,
        content_type: contentType,
      },
    ],
  });

  console.log(`Sent message ${sent.id} with attachment "${fileName}"`);
  console.log(`Thread: ${sent.thread_id}`);
}

// --- Run ---

sendWithAttachment()
  .then(() => console.log('Done.'))
  .catch((err) => {
    console.error('Failed to send:', err.message);
    process.exit(1);
  });
