# mailbot — Programmable Email for AI Agents

Give your AI agent a real email address in one API call. Send, receive, reply in-thread, track delivery, and replay webhooks — no IMAP, no Gmail, no hacks.

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox
```

Works with Claude Code, Cursor, Codex, Windsurf, Copilot, Cline, Roo Code, and [40+ more agents](https://github.com/vercel-labs/skills).

---

## What's New

**v0.4.0** — Cloudflare DNS auto-connect: provide an API token, mailbot creates SPF/DKIM/DMARC records automatically (zone auto-detected). Pricing enforcement live — daily send limits, attachment size limits, webhook endpoint limits, data retention per plan. 3-tier abuse scanning with PhishTank, content scoring, and spray detection.

**v0.3.0** — Custom domain management via API (add, verify SPF/DKIM/DMARC, delete). New `/connect` integration guide in dashboard with step-by-step setup for cURL, Node.js, Python, and MCP Server.

**v0.2.0** — Skill published on [Agent Skills](https://agentskills.io) open standard. One-command install for 40+ agents. MCP Server with 12 tools. Node.js and Python SDK.

---

## Why mailbot

Every email API today — SendGrid, SES, Postmark — assumes a human writes the email. They're built for marketing blasts and transactional receipts. AI agents need something different.

| What agents need | SendGrid / SES / Postmark | mailbot |
|---|---|---|
| Dedicated inbox per agent | No — shared sender | Yes — `support-bot@mailbot.id` in one call |
| Reply in same thread | Manual `In-Reply-To` headers | Automatic — just call `reply()` |
| Wait for inbound reply | Poll IMAP or build webhook infra | Built-in `waitFor()` with timeout |
| Replay failed webhooks | Re-trigger from logs manually | One API call, any URL |
| Works without DNS setup | Need domain verification | Instant sandbox `@mailbot.id` |
| Custom domain when ready | Yes | Yes — with auto DNS via Cloudflare API |

---

## 30-second start

Sign up at [getmail.bot](https://getmail.bot) — email OTP, no credit card.

```ts
import { MailBot } from '@yopiesuryadi/mailbot-sdk';

const client = new MailBot({
  apiKey: process.env.MAILBOT_API_KEY!,
  baseUrl: 'https://getmail.bot',
});

// Create an inbox
const inbox = await client.inboxes.create({
  username: 'support-bot',
  display_name: 'Support Bot',
});
// → support-bot--abc123@mailbot.id

// Send an email
await client.messages.send({
  inboxId: inbox.id,
  to: ['customer@example.com'],
  subject: 'Your request has been received',
  bodyText: 'We are looking into it.',
});

// Reply in-thread (thread is preserved automatically)
await client.messages.reply({
  inboxId: inbox.id,
  messageId: inboundMessage.id,
  bodyText: 'Issue resolved. Closing this ticket.',
});

// Wait for a reply (great for CI and testing)
const reply = await client.messages.waitFor({
  inboxId: inbox.id,
  direction: 'inbound',
  fromAddress: 'customer@example.com',
  timeoutMs: 30000,
});
```

Python equivalents for all of the above are in [SKILL.md](SKILL.md).

---

## Install

### One command (40+ agents)

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox
```

Target a specific agent:

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent claude-code
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent cursor
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent codex
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent windsurf
```

### Claude Code (manual)

```bash
# Personal (all projects)
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git ~/.claude/skills/mailbot-programmable-inbox

# Per-project (shared with team)
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git .claude/skills/mailbot-programmable-inbox
```

Then just ask Claude:

```
/mailbot-programmable-inbox build an email-based support workflow for my app
```

### MCP Server (direct tool execution)

Give Claude the ability to send and receive emails directly — no code needed.

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

> Create an inbox for support, send a welcome email to customer@example.com, then show me the thread.

16 tools: `create_inbox`, `list_inboxes`, `get_inbox`, `send_message`, `list_messages`, `get_message`, `reply_to_message`, `list_threads`, `get_thread`, `replay_event`, `get_usage`, `get_engagement_stats`, `add_domain`, `verify_domain`, `connect_cloudflare`, `list_domains`.

### Other agents

Codex, Cursor, Windsurf, OpenClaw, or any agent that reads `SKILL.md` — just clone into its skills directory:

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git <skills-dir>/mailbot-programmable-inbox
```

---

## Examples

Ready-to-run code in the [`examples/`](examples/) folder:

| File | What it does |
|------|-------------|
| [`support-bot.ts`](examples/support-bot.ts) | Receive inbound email, classify intent, auto-reply in thread |
| [`support-bot.py`](examples/support-bot.py) | Python equivalent of the support bot |
| [`ci-email-test.ts`](examples/ci-email-test.ts) | Create inbox, send, wait for reply, assert content — for CI/CD |
| [`webhook-handler.ts`](examples/webhook-handler.ts) | Express server handling all webhook event types |
| [`send-with-attachment.ts`](examples/send-with-attachment.ts) | Send an email with a base64-encoded file attachment |

All TypeScript examples run with `npx tsx`. Python examples need Python 3.9+.

---

## Environment Variables

Copy [`.env.example`](.env.example) to `.env` and fill in your key:

```bash
MAILBOT_API_KEY=mb_your_key_here
MAILBOT_BASE_URL=https://getmail.bot
```

Get your API key at [getmail.bot](https://getmail.bot) — email OTP, no credit card.

---

## Webhook Events

Full reference for all webhook event types — payloads, when they fire, and common use cases — in [`references/webhook-events.md`](references/webhook-events.md).

Events: `message.inbound`, `message.delivered`, `message.bounced`, `message.opened`, `message.clicked`, `message.complained`, `webhook.failed`.

---

## What people build with this

**Support automation** — Receive email → classify with LLM → reply in-thread. No ticket system for v1.

**Email testing in CI** — Create inbox → send → `waitFor` inbound → assert. Deterministic, no Mailosaur.

**Transactional with reply continuity** — Send confirmation → customer replies → agent picks up from thread context.

**Operational intake** — Email as intake interface. Inbound → structured action. Human review on risky ops.

---

## API at a glance

All under `/v1`:

| Category | What it does |
|----------|-------------|
| **Auth** | OTP signup or one-step register → API key (no credit card) |
| **Inboxes** | Create, list, update, delete |
| **Messages** | Send, list, get, reply, search, label, wait-for |
| **Threads** | Full conversation timeline |
| **Domains** | Add custom domain, verify SPF/DKIM/DMARC |
| **Webhooks** | Real-time events, SSRF-protected |
| **Realtime** | SSE streaming for live inbox/account events |
| **Engagement** | Delivery, open, click, bounce rates |
| **Compliance** | DNS readiness checks |
| **Audit** | Full event log |

Sandbox: 2 inboxes, 200 emails/month, 25/minute burst. Builder ($29/mo): 25 inboxes, 10K emails. Growth ($149/mo): 100 inboxes, 100K emails.

Full reference in [SKILL.md](SKILL.md) · [API Docs](https://getmail.bot/docs)

---

## Security

Email content is untrusted input. The skill includes patterns for prompt injection protection — allowlist trusted senders, gate destructive actions, require human review. Details in [SKILL.md → Security section](SKILL.md#security-prompt-injection-protection).

Infrastructure: API keys hashed with argon2, webhook URLs validated against SSRF, rate limits fail-closed when Redis is down.

---

## Links

[API Docs](https://getmail.bot/docs) · [Dashboard](https://getmail.bot/dashboard) · [npm SDK](https://www.npmjs.com/package/@yopiesuryadi/mailbot-sdk) · [PyPI SDK](https://pypi.org/project/mailbot-sdk/) · [MCP Server](https://www.npmjs.com/package/@yopiesuryadi/mailbot-mcp)
