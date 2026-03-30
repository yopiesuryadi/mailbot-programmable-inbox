# Changelog

## v0.4.0

- Cloudflare DNS auto-connect: provide an API token and mailbot creates SPF/DKIM/DMARC records automatically (zone auto-detected from domain name).
- Pricing enforcement live: daily send limits, attachment size limits, webhook endpoint limits, and data retention per plan.
- 3-tier abuse scanning with PhishTank integration, content scoring, and spray detection.

## v0.3.0

- Custom domain management via API: add, verify SPF/DKIM/DMARC, delete.
- New `/connect` integration guide in dashboard with step-by-step setup for cURL, Node.js, Python, and MCP Server.

## v0.2.0

- Skill published on [Agent Skills](https://agentskills.io) open standard. One-command install for 40+ agents.
- MCP Server with 16 tools for direct Claude integration.
- Node.js SDK (`@yopiesuryadi/mailbot-sdk`) and Python SDK (`mailbot-sdk`) released.

## v0.1.0

- Initial release: programmable inboxes, send/receive/reply, thread tracking, webhooks, engagement tracking, audit log, usage API.
- Sandbox domain `@mailbot.id` for instant onboarding.
- Email OTP signup with API key authentication.
