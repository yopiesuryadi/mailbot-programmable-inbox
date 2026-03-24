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

## What's New

### v0.3.0 — March 24, 2026

- **Domain Management API** — Add custom domains, verify SPF/DKIM/DMARC, and delete domains via API. Agents can now fully onboard users without touching the dashboard.
- **Cloudflare DNS Auto-Connect** — Provide a Cloudflare API token and mailbot auto-provisions all 3 DNS records (SPF, DKIM, DMARC). Zone ID is auto-detected from domain name. One credential, zero manual DNS.
- **Agent-First Onboarding** — Full setup in 4 API calls: add domain → connect Cloudflare → wait for verification → create inbox. No dashboard needed.
- **3-Tier Abuse Scanning** — Upgraded from basic regex to weighted scoring system: PhishTank URL database (Redis-cached, hourly sync), 7-signal content scoring (regex, URL shortener, href mismatch, homoglyphs, etc.), and spray pattern detection for identical body sent to many recipients.
- **16 MCP Tools** — Added `add_domain`, `verify_domain`, `connect_cloudflare`, `list_domains` to the MCP server.
- **Integration Guide** — New `/connect` page in dashboard with step-by-step guides for cURL, Node.js, Python, and MCP Server.
- **Dashboard UX Cleanup** — Merged Dashboard + Usage into tabbed page, merged Compliance into Domains page, reduced sidebar from 11 to 10 items, added DNS provider quick links (Cloudflare, GoDaddy, Namecheap, etc.).

---

## Install as a skill

This repo follows the [Agent Skills](https://agentskills.io) open standard. One `SKILL.md`, works across 40+ agentic platforms.

### npx skills (universal — 40+ agents)

The fastest way. Supports Claude Code, Cursor, Windsurf, Codex, Copilot, Cline, Roo Code, and [40+ more](https://github.com/vercel-labs/skills).

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox
```

Install to a specific agent:

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent claude-code
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent cursor
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent codex
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent windsurf
```

Global install (available in all projects):

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --global
```

### Claude Code

Personal skill (all your projects):

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git ~/.claude/skills/mailbot-programmable-inbox
```

Project skill (shared with team via git):

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git .claude/skills/mailbot-programmable-inbox
```

Then ask Claude anything about email, or invoke directly:

```
/mailbot-programmable-inbox build an email-based support workflow for my app
```

Works with `/batch` for parallel tasks:

```
/batch add mailbot email notifications to all user-facing endpoints
```

### Codex (OpenAI)

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent codex
```

Or manual:

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git .codex/skills/mailbot-programmable-inbox
```

### Cursor

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent cursor
```

Or manual — add to `.cursor/skills/`:

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git .cursor/skills/mailbot-programmable-inbox
```

### Windsurf

```bash
npx skills add yopiesuryadi/mailbot-programmable-inbox --agent windsurf
```

### OpenClaw

```bash
clawhub install mailbot-programmable-inbox
```

Or manual:

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git ./skills/mailbot-programmable-inbox
```

### Cowork (Claude Desktop)

Works out of the box via Cowork skills directory. Use dispatch from your phone — Claude runs the email task on your desktop.

### Any other agent

If your agent reads `SKILL.md` files, just clone this repo into its skills directory:

```bash
git clone https://github.com/yopiesuryadi/mailbot-programmable-inbox.git <your-agent-skills-dir>/mailbot-programmable-inbox
```

The `SKILL.md` is self-contained. References in `references/` are loaded on demand.

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

Three ways to give Claude email capabilities:

### Option A: Install the skill (recommended)

Clone this repo into your Claude Code skills directory (see [Install as a skill](#install-as-a-skill) above). Claude automatically knows the full mailbot API and can write integration code, debug email flows, and build workflows.

### Option B: MCP Server (direct tool execution)

The MCP server gives Claude direct tool access — it can create inboxes and send email without writing code.

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

16 tools included: `create_inbox`, `list_inboxes`, `get_inbox`, `send_message`, `list_messages`, `get_message`, `reply_to_message`, `list_threads`, `get_thread`, `replay_event`, `get_usage`, `get_engagement_stats`, `add_domain`, `verify_domain`, `connect_cloudflare`, `list_domains`.

### Option C: Both

Install the skill AND the MCP server. Claude uses the skill for knowledge (API patterns, SDK usage, security best practices) and the MCP server for direct execution (actually sending emails). This is the most powerful setup.

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
| **Domains** | Create, list, get, verify, delete, Cloudflare auto-connect |
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
SKILL.md              → Skill entrypoint (frontmatter + full integration guide)
agents/openai.yaml    → OpenAI-compatible agent config
references/
  node-sdk.md         → Node.js SDK reference (loaded on demand)
  python-sdk.md       → Python SDK reference (loaded on demand)
  mcp-setup.md        → MCP Server setup for Claude Desktop
scripts/
  mailbot-helper.py   → CLI helper for common tasks
```

The `SKILL.md` is the entrypoint. Reference files in `references/` are loaded by the agent only when needed — they don't bloat the context window on every invocation.

## Links

[API Docs](https://getmail.bot/docs) · [Dashboard](https://getmail.bot/dashboard) · [npm](https://www.npmjs.com/package/@yopiesuryadi/mailbot-sdk) · [PyPI](https://pypi.org/project/mailbot-sdk/) · [MCP Server](https://www.npmjs.com/package/@yopiesuryadi/mailbot-mcp)
