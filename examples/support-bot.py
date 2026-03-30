"""
support-bot.py

A complete support bot that receives inbound email via webhook,
classifies intent with simple keyword logic, and auto-replies
in the same thread.

Run: python examples/support-bot.py

Prerequisites:
    pip install mailbot-sdk flask
    Set MAILBOT_API_KEY in your environment
"""

import os
from flask import Flask, request, jsonify
from mailbot import MailBot

app = Flask(__name__)

# --- Setup ---

client = MailBot(
    api_key=os.environ["MAILBOT_API_KEY"],
    base_url="https://getmail.bot/v1",
)

# The inbox ID your support bot listens on.
# Create one first: client.inboxes.create(username="support-bot", display_name="Support Bot")
INBOX_ID = os.environ["MAILBOT_INBOX_ID"]


# --- Intent classification ---


def classify_intent(subject: str, body: str) -> dict:
    """Classify email intent using keyword matching."""
    text = f"{subject} {body}".lower()

    if any(word in text for word in ("invoice", "billing", "charge", "refund")):
        return {
            "intent": "billing",
            "reply": (
                "Thanks for reaching out about billing. "
                "We have forwarded your request to the billing team. "
                "You should hear back within 1 business day."
            ),
        }

    if any(word in text for word in ("bug", "error", "broken", "crash")):
        return {
            "intent": "bug_report",
            "reply": (
                "Thanks for reporting this issue. "
                "Our engineering team has been notified and will investigate. "
                "We will follow up in this thread with updates."
            ),
        }

    return {
        "intent": "general",
        "reply": (
            "Thanks for your email. "
            "A team member will review your message and reply shortly."
        ),
    }


# --- Webhook handler ---


@app.route("/webhooks/mailbot", methods=["POST"])
def handle_webhook():
    event = request.get_json()

    # Only process inbound messages
    if event.get("type") != "message.inbound":
        return "", 200

    data = event["data"]
    message_id = data["message_id"]
    from_address = data["from_address"]
    subject = data.get("subject", "")
    body_text = data.get("body_text", "")

    print(f"Inbound from {from_address}: {subject}")

    # Step 1: Classify the intent
    result = classify_intent(subject, body_text)
    intent = result["intent"]
    reply_text = result["reply"]
    print(f"Classified as: {intent}")

    # Step 2: Label the message with the detected intent
    client.messages.update_labels(INBOX_ID, message_id, [intent])

    # Step 3: Reply in the same thread (threading is automatic)
    client.messages.reply(
        INBOX_ID,
        message_id,
        body_text=reply_text,
        body_html=f"<p>{reply_text}</p>",
    )

    print(f"Replied to {from_address} with {intent} response")
    return "", 200


# --- Start server ---

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"Support bot listening on port {port}")
    print("Webhook URL: https://your-domain.com/webhooks/mailbot")
    print('Register this URL with: client.webhooks.create(url=..., events=["message.inbound"])')
    app.run(host="0.0.0.0", port=port)
