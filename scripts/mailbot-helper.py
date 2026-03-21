#!/usr/bin/env python3
"""Small helper CLI for common mailbot beta tasks."""

from __future__ import annotations

import argparse
import json
import os
import sys

try:
    from mailbot import MailBot
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "mailbot-sdk is required. Install it with: pip install mailbot-sdk"
    ) from exc


def make_client() -> MailBot:
    api_key = os.environ.get("MAILBOT_API_KEY")
    if not api_key:
        raise SystemExit("MAILBOT_API_KEY is required")

    base_url = os.environ.get("MAILBOT_BASE_URL", "https://getmail.bot/v1")
    return MailBot(api_key=api_key, base_url=base_url)


def print_json(value) -> None:
    print(json.dumps(value, indent=2, ensure_ascii=True))


def cmd_create_inbox(args: argparse.Namespace) -> int:
    client = make_client()
    result = client.inboxes.create(
        username=args.name,
        display_name=args.display_name,
    )
    print_json(result)
    return 0


def cmd_send(args: argparse.Namespace) -> int:
    client = make_client()
    result = client.messages.send(
        args.inbox_id,
        to=[args.to],
        subject=args.subject,
        body_text=args.body,
    )
    print_json(result)
    return 0


def cmd_list_messages(args: argparse.Namespace) -> int:
    client = make_client()
    result = client.messages.list(
        args.inbox_id,
        limit=args.limit,
        direction=args.direction,
    )
    print_json(result)
    return 0


def cmd_wait_for(args: argparse.Namespace) -> int:
    client = make_client()
    result = client.messages.wait_for(
        args.inbox_id,
        from_address=args.from_address,
        subject_contains=args.subject_contains,
        timeout_ms=args.timeout_ms,
        direction=args.direction,
    )
    print_json(result)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="mailbot helper CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_inbox = subparsers.add_parser("create-inbox", help="Create a sandbox inbox")
    create_inbox.add_argument("name", help="Inbox username, for example support-bot")
    create_inbox.add_argument(
        "--display-name",
        default=None,
        help="Optional display name",
    )
    create_inbox.set_defaults(func=cmd_create_inbox)

    send = subparsers.add_parser("send", help="Send an outbound email")
    send.add_argument("inbox_id", help="Inbox ID")
    send.add_argument("to", help="Recipient email address")
    send.add_argument("subject", help="Message subject")
    send.add_argument("body", help="Plain-text body")
    send.set_defaults(func=cmd_send)

    list_messages = subparsers.add_parser("list-messages", help="List inbox messages")
    list_messages.add_argument("inbox_id", help="Inbox ID")
    list_messages.add_argument("--limit", type=int, default=20, help="Max messages to return")
    list_messages.add_argument(
        "--direction",
        choices=["inbound", "outbound"],
        default=None,
        help="Optional direction filter",
    )
    list_messages.set_defaults(func=cmd_list_messages)

    wait_for = subparsers.add_parser("wait-for", help="Wait for a matching message")
    wait_for.add_argument("inbox_id", help="Inbox ID")
    wait_for.add_argument("--from", dest="from_address", default=None, help="Sender filter")
    wait_for.add_argument(
        "--subject-contains",
        default=None,
        help="Subject substring filter",
    )
    wait_for.add_argument(
        "--timeout-ms",
        type=int,
        default=30000,
        help="Max wait time in milliseconds",
    )
    wait_for.add_argument(
        "--direction",
        choices=["inbound", "outbound"],
        default="inbound",
        help="Message direction to wait for",
    )
    wait_for.set_defaults(func=cmd_wait_for)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
