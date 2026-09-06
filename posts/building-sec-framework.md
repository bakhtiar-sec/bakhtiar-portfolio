---
title: Building SEC-FRAME — Recon, Scan and Report in One Pipeline
date: 2025-09-10
summary: What building the v0.1 pipeline taught me about parsing, failure modes and designing for what comes next.
tags: security-automation, python, secframe, learning-in-public
---
**The problem: recon is repetitive**

Every vulnerability assessment I practice in my lab starts the same way. Enumerate subdomains. Validate which hosts are alive. Scan the ports. Take notes. Repeat for the next target.

As an automation engineer, this bothered me in a specific way. In my day job, when a manual step gets repeated more than twice, we automate it — declarative inputs, chained stages, machine-readable output, a report at the end. But my security workflow was a pile of terminal commands, copy-pasted output, and notes in a text file.

So I applied my day-job discipline to my night-job interest, and SEC-FRAME was born: a small framework that chains recon → scanning → parsing → reporting into one unattended pipeline.

**What v0.1 actually does**

The design goal was simple: each stage is a wrapper around a proven tool, and every stage emits structured output that the next stage can consume. A run looks like this: python secframe.py --target example.com --stages recon,validate,scan,report — with the pipeline handling the glue: passing discovered subdomains into host validation, feeding live hosts into the scanner, and collecting everything into a single structured result instead of scattered terminal output.

**Four things v0.1 taught me**

1. Wrapping a tool is easy. Parsing its output is the real work. Normalizing each tool's output into structured data (JSON) was 80% of the effort — and 100% worth it, because it's what makes chaining possible at all.

2. A pipeline must fail loudly. Early on, a failed stage silently passed empty results forward, and the final report looked plausible while being wrong. That's the worst failure mode in security tooling: confident nonsense. Now every stage returns an explicit status, and a failed stage halts the pipeline with context.

3. Structured intermediate formats pay for themselves. The temptation is to pass raw text between stages. Resist it. When v0.2 needed CVSS scoring, I was glad every stage already spoke JSON — adding a stage became an afternoon, not a rewrite.

4. Be a polite scanner. Rate limits, built-in delays, and scope checks aren't optional extras. A framework that automates scanning must make it easy to stay within authorized targets — that's a design requirement, not a nice-to-have.

**What SEC-FRAME is not**

Honesty section, because this is learning-in-public: v0.1 is a small framework built for my own lab practice. It is not a replacement for mature professional tooling, and it doesn't try to be. The value is in the construction — designing pipelines, handling edge cases, and thinking about how automation changes a workflow. Those skills transfer directly to real security-automation work.

**What's next**

v0.2 (in development): CVSS scoring and HTML/PDF report generation. v0.3 (planned): CI/CD integration, so scans run as part of a DevSecOps pipeline.

Source lives on GitHub — feedback and "you did this the hard way, try X" comments are all welcome. That's the point of building in public.

— Shaik Abdul Bakhtiar · CEH v13 · learning in public, one pipeline at a time.