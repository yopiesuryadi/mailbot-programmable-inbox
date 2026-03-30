/**
 * ci-email-test.ts
 *
 * End-to-end email test for CI/CD pipelines.
 * Creates an inbox, sends an email, waits for the inbound reply,
 * and asserts the content matches expectations.
 *
 * Run: npx tsx examples/ci-email-test.ts
 *
 * Prerequisites:
 *   npm install @yopiesuryadi/mailbot-sdk
 *   Set MAILBOT_API_KEY in your environment
 *
 * Exits with code 0 on success, 1 on failure.
 */

import { MailBot } from '@yopiesuryadi/mailbot-sdk';

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});

async function runTest(): Promise<void> {
  const testId = `ci-${Date.now()}`;

  // Step 1: Create a disposable inbox for this test run
  console.log('Creating test inbox...');
  const inbox = await client.inboxes.create({
    username: `test-${testId}`,
    display_name: `CI Test ${testId}`,
  });
  console.log(`Inbox created: ${inbox.address}`);

  try {
    // Step 2: Send an email from the test inbox
    // In a real CI test, you would send to another mailbot inbox
    // or to a system-under-test that auto-replies.
    const targetInbox = await client.inboxes.create({
      username: `target-${testId}`,
      display_name: `CI Target ${testId}`,
    });

    console.log('Sending test email...');
    const sent = await client.messages.send({
      inboxId: inbox.id,
      to: [targetInbox.address],
      subject: `CI Test ${testId}`,
      bodyText: 'This is an automated CI test email.',
    });
    console.log(`Sent message: ${sent.id}`);

    // Step 3: Wait for the message to arrive in the target inbox
    console.log('Waiting for inbound message...');
    const received = await client.messages.waitFor({
      inboxId: targetInbox.id,
      direction: 'inbound',
      fromAddress: inbox.address,
      timeoutMs: 30000,
    });

    // Step 4: Assert message content
    console.log('Asserting content...');

    assert(
      received.subject === `CI Test ${testId}`,
      `Subject mismatch: expected "CI Test ${testId}", got "${received.subject}"`,
    );

    assert(
      received.body_text?.includes('automated CI test email'),
      `Body missing expected content: "${received.body_text}"`,
    );

    assert(
      received.from_address === inbox.address,
      `Sender mismatch: expected "${inbox.address}", got "${received.from_address}"`,
    );

    // Step 5: Verify thread was created
    const thread = await client.threads.get(targetInbox.id, received.thread_id);
    assert(
      thread.messages.length >= 1,
      `Expected at least 1 message in thread, got ${thread.messages.length}`,
    );

    console.log('All assertions passed.');

    // Step 6: Clean up test inboxes
    await client.inboxes.delete(inbox.id);
    await client.inboxes.delete(targetInbox.id);
    console.log('Test inboxes cleaned up.');

  } catch (error) {
    // Clean up even on failure
    await client.inboxes.delete(inbox.id).catch(() => {});
    throw error;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// --- Run ---

runTest()
  .then(() => {
    console.log('CI email test passed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('CI email test failed:', err.message);
    process.exit(1);
  });
