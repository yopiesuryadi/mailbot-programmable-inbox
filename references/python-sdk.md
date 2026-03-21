# Python SDK Reference

Install:

```bash
pip install mailbot-sdk
```

Base URL:

- default base: `https://getmail.bot/v1`

## Setup

```python
import os
from mailbot import MailBot

client = MailBot(
    api_key=os.environ["MAILBOT_API_KEY"],
    base_url="https://getmail.bot/v1",
)
```

## Account

```python
account = client.account.get()
client.account.update(name="New Name")
```

## API Keys

```python
new_key = client.api_keys.create(name="ci-pipeline")
print(new_key["key"])  # mb_... — only shown once
keys = client.api_keys.list()
client.api_keys.delete(keys["data"][0]["id"])
```

## Inboxes

```python
inbox = client.inboxes.create(
    username="support",
    display_name="Support",
)

inboxes = client.inboxes.list()
one_inbox = client.inboxes.get(inbox["id"])
client.inboxes.update(inbox["id"], display_name="Support v2")
client.inboxes.delete(inbox["id"])
```

## Messages

```python
sent = client.messages.send(
    inbox["id"],
    to=["a@b.com"],
    subject="Hello",
    body_text="Hi there",
    body_html="<p>Hi there</p>",
)

messages = client.messages.list(inbox["id"], direction="inbound", limit=20)
message = client.messages.get(inbox["id"], sent["id"])

client.messages.reply(
    inbox["id"],
    sent["id"],
    body_text="Following up.",
)

client.messages.search(inbox["id"], query="invoice", limit=10)

client.messages.wait_for(
    inbox["id"],
    direction="inbound",
    from_address="a@b.com",
    timeout_ms=30000,
)

client.messages.update_labels(
    inbox["id"],
    sent["id"],
    ["urgent"],
)
```

## Threads

```python
threads = client.threads.list(inbox["id"], limit=20)
thread = client.threads.get(inbox["id"], sent["thread_id"])
```

## Webhooks

```python
webhook = client.webhooks.create(
    url="https://example.com/webhooks/mailbot",
    events=["delivered", "opened", "clicked", "bounced"],
)

webhooks = client.webhooks.list()
client.webhooks.delete(webhook["id"])
```

## Compliance

```python
client.compliance.check("example.com")
client.compliance.readiness(inbox["id"])
```

## Audit

```python
audit_events = client.audit.list(limit=50)
```

## Usage and engagement

```python
client.usage.get()
client.usage.daily()
client.engagement.summary(period="7d")
```
