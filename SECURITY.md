# Security Policy

## Supported versions

The `main` branch is the supported version. Bug fixes land there first.

## Reporting a vulnerability

**Please do not open public GitHub issues for security vulnerabilities.**

Email the maintainer privately at **Contact@dicecodes.com** with:

- A description of the issue
- Steps to reproduce
- Affected versions / commits if known
- Your assessment of severity

We aim to acknowledge within 48 hours and ship a fix within 14 days for high-severity issues.

## Scope

In-scope:
- Code execution / arbitrary file access via the BlogPilot application
- Bypass of share-link expiry or token validation
- SQL injection or data exfiltration
- Server-side request forgery via the crawler or rank tracker
- Leakage of AI API keys

Out-of-scope:
- Vulnerabilities requiring physical access to a self-hosted machine
- Third-party AI provider security (report to the provider)
- Best-practice suggestions without a working exploit

## Disclosure

After a fix ships, we credit the reporter (with permission) in the release notes.
