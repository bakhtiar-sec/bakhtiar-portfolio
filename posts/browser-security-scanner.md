---
title: How I Built a Live Browser Security Scanner in Vanilla 
summary: What checking your own browser taught me about fingerprinting, k-anonymity, and earning user trust — zero libraries, everything client-side.
tags: javascript, browser-security, privacy, learning-in-public
---
**The problem: security advice without feedback is noise**
"Check your app permissions." "Don't reuse passwords." "Use a VPN." Advice is everywhere — but almost none of it shows you the actual state of your own setup, right now. I wanted the opposite: a scanner that runs against your own browser, live, and shows you what a recon pass would see.

So I built one into my portfolio. No backend, no libraries, no account, nothing installed. These are the build notes.

**What it checks**
The scanner runs a dozen checks, grouped the way a real assessment would be:

Connection & transport — HTTPS state, cookie behavior, Do Not Track
Exposure — per-site permission state for camera, mic, location, clipboard
Fingerprinting surface — user agent, screen resolution, timezone: how identifiable is this browser, really?
WebRTC leak — can a site see your real IP even behind a VPN?
Password hygiene — breach check plus a crack-time estimate, calculated locally
**What it taught me**
1. k-anonymity means you can verify a password without ever sending it. The password is hashed locally, and only the first 5 characters of the hash are sent to the breach database. The server sees a fragment that matches millions of possible passwords — never yours. Privacy engineering is often just this: send less.

2. Reading state is not requesting permission. The Permissions API lets a page read permission state without firing a single prompt popup. It changed how I think about security UX — the sketchy sites ask you for things; the careful ones quietly read state. My scanner only reads. Nothing is triggered, nothing is requested.

3. Fingerprints are assembled, not stolen. No single value identifies you. Timezone narrows a little, screen size a little more, user agent more again. Privacy doesn't die from one catastrophic leak — it dies from correlation. That's the lesson the fingerprint section makes visible in ten seconds.

4. Trust is a design decision. Everything runs client-side, and that's not just architecture — it's the security claim itself. "Nothing leaves your browser except a 5-character hash fragment" is a statement anyone can verify in the DevTools network tab. A scanner about digital trust that itself demanded blind trust would be a bad joke.

**What it is not**
Honesty section, learning-in-public rules apply: this scans your own browser session only. It is not a network scanner, not a pentest tool, and it doesn't touch any target you don't own. The value was practicing the recon logic real assessments use — exposure, fingerprinting, leakage — and packaging it so a non-technical person can understand their own risk in two minutes.

**What's next**
A full emailed report with fixes for every finding is live now. Next on the list: third-party script inventory and a storage audit.

— Shaik Abdul Bakhtiar · CEH v13 · learning in public, one build at a time.