---
title: Building SEC-FRAME — Recon, Scan and Report in One Pipeline
date: 2025-09-10
summary: What building the v0.1 pipeline taught me about parsing, failure modes and designing for what comes next.
tags: security-automation, python, secframe, learning-in-public
---
**The problem: security checks lived outside my automation**

In my day job, I'm an automation engineer — when something runs twice, it becomes a test. But my security practice was the opposite: manual scans, terminal output in one window, notes in another. DAST tools ran on demand and nobody, including me, could prove what was checked last week.

SEC-FRAME is my fix: a security-testing framework where every check is a versioned, repeatable scenario — built on the stack I already know deeply, Playwright and TypeScript.

**The design: security as BDD scenarios**

Each security check is a Gherkin scenario. A simplified idea of what that looks like:

Given a registered target
When the scan runner executes the active scanner
Then findings are collected, deduplicated, and reported

The scenario format forces a useful kind of honesty: every check has an explicit precondition, action, and expected outcome. Non-security reviewers can read the feature files and understand exactly what the pipeline verifies — no translation layer needed.

**Under the hood**

- ScannerRunner and ZapRunner orchestrate OWASP ZAP, the open-source DAST scanner, against the configured target
- An ApiClient layer handles API-level checks alongside browser-driven flows
- A GitHub Actions workflow runs the suite on every push — the scan happens whether or not I remember to run it

**Four things v0.1 taught me**

1. Wrapping a scanner is easy. Normalizing its output is the real work. ZAP's alerts needed to become structured data before anything downstream — reports, thresholds, deduplication — could exist.

2. A pipeline must fail loudly. An early version could finish "green" while the scanner silently produced zero findings. A security pipeline that hides empty results is worse than no pipeline: confident nonsense. Every stage now returns explicit status, and missing findings block the build.

3. BDD is a communication tool, not just syntax. Writing security intent as scenarios exposed gaps in my own thinking — checks that sounded complete until I had to state the expected outcome precisely.

4. CI is the actual product. The framework's value isn't the scan itself; it's that the scan runs on every push, unattended, forever. Automation only counts when nobody has to remember to trigger it.

**What SEC-FRAME is not**

Honesty section, because this is learning-in-public: v0.1 is a small framework built for my own lab practice. It is not a replacement for mature scanning products, and it doesn't try to be. The value is in the construction — pipeline design, output normalization, failure handling — and those skills transfer directly to real security-automation work.

**What's next**

v0.2 (in development): CVSS scoring and structured report generation. v0.3 (planned): scheduled scans and alerting from CI.

Source lives on GitHub — feedback and "you did this the hard way, try X" comments are all welcome. That's the point of building in public.

— Shaik Abdul Bakhtiar · CEH v13 · learning in public, one pipeline at a time.