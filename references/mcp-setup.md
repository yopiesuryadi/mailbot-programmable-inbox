# MCP Server Setup

Install:

```bash
npm install -g mailbot-mcp
```

Alternative:

```bash
npx mailbot-mcp
```

Environment:

- `MAILBOT_API_KEY` required
- `MAILBOT_API_URL` optional, defaults to `https://getmail.bot`

## Claude Desktop Config

```json
{
  "mcpServers": {
    "mailbot": {
      "command": "npx",
      "args": ["mailbot-mcp"],
      "env": {
        "MAILBOT_API_KEY": "mb_..."
      }
    }
  }
}
```

## Included Tools

12 tools, read from the package source. Parameters marked `?` are optional.

| Tool | What it does | Parameters |
|---|---|---|
| `create_inbox` | Create an inbox for sending and receiving | `username`, `display_name?`, `domain?` |
| `list_inboxes` | List inboxes in the account | `page?`, `limit?` |
| `get_inbox` | Get one inbox | `inbox_id` |
| `send_message` | Send an email from an inbox | `inbox_id`, `to[]`, `subject`, `body`, `cc[]?`, `bcc[]?` |
| `reply_to_message` | Reply in the same thread | `inbox_id`, `message_id`, `body` |
| `list_messages` | List messages in an inbox | `inbox_id`, `since?`, `limit?`, `page?` |
| `get_message` | Get one message with its state | `inbox_id`, `message_id` |
| `list_threads` | List conversations in an inbox | `inbox_id`, `limit?`, `page?` |
| `get_thread` | Get a thread with all its messages | `inbox_id`, `thread_id` |
| `replay_event` | Send a webhook event again | `event_id`, `target_url?` |
| `get_engagement_stats` | Opens, clicks and bounces | `inbox_id?`, `period?` |
| `get_usage` | Outbound emails used this month | none |

Rules for agents:

- Report an email as delivered only when `get_message` shows it delivered.
- If a call times out, check with `get_message` or `list_messages` before sending again.
- `get_engagement_stats` returns `no_data` when tracking is off. Do not read that as zero opens.

## Example Prompts

```text
Create an inbox named support-bot and send a welcome email to customer@example.com.
```

```text
List the latest messages in inbox inbox_123 and summarize any inbound replies.
```

```text
Replay the latest event from this thread to https://example.com/debug-webhook.
```

```text
Add my domain example.com, connect it to Cloudflare using my API token, wait for verification, then create an inbox support@example.com.
```

## Practical Note

Use MCP when the user wants direct tool execution inside Claude.

Use the Node or Python SDK when the workflow also needs:

- search
- wait-for polling
- label updates
- compliance and readiness checks
- API key management
- audit log inspection
