# mailbot — Programmable Email for AI Agents

**mailbot** gives your AI agent a real email address. Create inboxes, send and receive emails, track every delivery event, and replay webhooks — one API, one line to install.

Built for the world where agents don't just chat — they email.

```bash
npm install @yopiesuryadi/mailbot-sdk    # Node.js
pip install mailbot-sdk                   # Python
npm install -g @yopiesuryadi/mailbot-mcp  # MCP Server for Claude
```

Base URL: `https://getmail.bot/v1` · Sandbox domain: `@mailbot.id` · [API Docs](https://getmail.bot/docs) · [Dashboard](https://getmail.bot/dashboard)

---

## Why this exists

Every email API today — SendGrid, SES, Postmark — assumes a human writes the email. They're built for marketing blasts and transactional receipts.

But AI agents need email as a first-class interface. A support bot needs its own inbox. A scheduling agent needs to reply in-thread. A CI pipeline needs to send, wait for a reply, and assert. None of that works well when you're bolting agent logic onto a human email service.

**mailbot is email infrastructure purpose-built for agents:**

- **One inbox per agent.** Create `support-bot@mailbot.id` in one API call. Each agent gets its own address, its own threads, its own engagement data.
- **Inbound without polling.** Replies arrive via webhook, not IMAP polling. Your agent reacts in real time.
- **Thread continuity by default.** Reply to a message and mailbot preserves the thread. Your agent never loses conversational context.
- **Event replay for recovery.** Webhook consumer went down? Replay any event to any URL. Deterministic recovery, not prayer.
- **Security-first.** SSRF protection on webhook URLs, rate-limit fail-closed when Redis is down, API keys hashed with argon2.
- **Compliance built in.** SPF, DKIM, DMARC readiness checks. Inbox verification before you send from a custom domain.

## Five-minute start

### 1. Get an API key

Sign up at [getmail.bot](https://getmail.bot) — email OTP, no credit card. You get an `mb_` prefixed API key.

### 2. Create an inbox

```ts
import { MailBot } from '@yopiesuryadi/mailbot-sdk';

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});

const inbox = await client.inboxes.create({
  username: 'support-bot',
  display_name: 'Support Bot',
});

console.log(inbox.address);
// → support-bot--abc123@mailbot.id
```

### 3. Send an email

```ts
const sent = await client.messages.send({
  inboxId: inbox.id,
  to: ['customer@example.com'],
  subject: 'Your request has been received',
  bodyText: 'We are looking into it.',
  bodyHtml: '<p>We are looking into it.</p>',
});
```

### 4. Reply in-thread

```ts
await client.messages.reply({
  inboxId: inbox.id,
  messageId: inboundMessage.id,
  bodyText: 'Issue resolved. Closing this ticket.',
});
```

### 5. Wait for inbound (great for CI)

```ts
const reply = await client.messages.waitFor({
  inboxId: inbox.id,
  direction: 'inbound',
  fromAddress: 'customer@example.com',
  timeoutMs: 30000,
});
```

Python equivalents for all of the above are in [SKILL.md](SKILL.md).

## Use with Claude

mailbot ships an MCP server. Install it, add the config, and Claude can send email directly.

```json
{
  "mcpServers": {
    "mailbot": {
      "command": "npx",
      "args": ["@yopiesuryadi/mailbot-mcp"],
      "env": { "MAILBOT_API_KEY": "mb_..." }
    }
  }
}
```

Then tell Claude:

> Create an inbox for support, send a welcome email to customer@example.com, then show me the thread and engagement stats.

12 tools included: `create_inbox`, `list_inboxes`, `get_inbox`, `send_message`, `list_messages`, `get_message`, `reply_to_message`, `list_threads`, `get_thread`, `replay_event`, `get_usage`, `get_engagement_stats`.

## What agents build with this

**Support automation** — Receive email → classify with LLM → reply in-thread. No ticket system for v1.

**Email testing in CI** — Create inbox → send → `waitFor` inbound → assert. Deterministic, no Mailosaur.

**Transactional with reply continuity** — Send confirmation → customer replies → agent picks up from thread context.

**Operational intake** — Email as intake interface. Inbound → structured action. Human review on risky ops.

## API surface

12 endpoint categories, all under `/v1`:

| Category | Key endpoints |
|----------|--------------|
| **Auth** | OTP signup + verify → API key |
| **Account** | Get, update, delete |
| **API Keys** | Create, list, revoke (argon2 hashed) |
| **Inboxes** | CRUD + display name update |
| **Domains** | List, get (sandbox auto-provisioned) |
| **Messages** | Send, list, get, reply, search, labels, wait-for |
| **Threads** | List, get (full conversation timeline) |
| **Webhooks** | Create, list, delete (SSRF-protected) |
| **Engagement** | Delivery/open/click/bounce stats |
| **Compliance** | SPF/DKIM/DMARC check, inbox readiness |
| **Audit** | Full event log |
| **Usage** | Volume summary + daily breakdown |

Sandbox: 250 messages/day, 25/minute burst. Production: custom domain, higher limits.

## Security for agent developers

Email content is untrusted input. Always:

1. Allowlist trusted senders before parsing commands from email body
2. Never let arbitrary senders trigger destructive actions
3. Require human-in-the-loop for high-impact operations

Code patterns in [SKILL.md → Security section](SKILL.md#security-prompt-injection-protection).

## Repo contents

```
SKILL.md              → Full integration guide (Node.js + Python for every operation)
agents/openai.yaml    → OpenAI-compatible agent config
references/
  node-sdk.md         → Node.js SDK reference
  python-sdk.md       → Python SDK reference
  mcp-setup.md        → MCP Server setup for Claude Desktop
scripts/
  mailbot-helper.py   → CLI helper for common tasks
```

## Links

[API Docs](https://getmail.bot/docs) · [Dashboard](https://getmail.bot/dashboard) · [npm](https://www.npmjs.com/package/@yopiesuryadi/mailbot-sdk) · [PyPI](https://pypi.org/project/mailbot-sdk/) · [MCP Server](https://www.npmjs.com/package/@yopiesuryadi/mailbot-mcp)
