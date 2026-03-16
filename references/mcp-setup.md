# MCP Server Setup

Install:

```bash
npm install -g @yopiesuryadi/mailbot-mcp
```

Alternative:

```bash
npx @yopiesuryadi/mailbot-mcp
```

Environment:

- `MAILBOT_API_KEY` required
- `MAILBOT_API_URL` optional, defaults to `https://beta.mailbot.id`

## Claude Desktop Config

```json
{
  "mcpServers": {
    "mailbot": {
      "command": "npx",
      "args": ["@yopiesuryadi/mailbot-mcp"],
      "env": {
        "MAILBOT_API_KEY": "mb_..."
      }
    }
  }
}
```

## Included Tools

- `create_inbox`: create a new inbox
- `list_inboxes`: list inboxes for the account
- `get_inbox`: fetch one inbox
- `send_message`: send an outbound message
- `list_messages`: list inbox messages
- `get_message`: fetch one message
- `reply_to_message`: reply while preserving thread continuity
- `list_threads`: list inbox threads
- `get_thread`: fetch a thread and its messages
- `replay_event`: replay an event notification to a target URL
- `get_usage`: inspect usage data for the account
- `get_engagement_stats`: inspect delivery and engagement summaries

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

## Practical Note

Use MCP when the user wants direct tool execution inside Claude.

Use the Node or Python SDK when the workflow also needs:

- search
- wait-for polling
- label updates
- compliance and readiness checks
