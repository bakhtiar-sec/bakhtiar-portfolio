---
title: "Coding in the Age of AI: What Nobody Tells You (and What to Do About It)"
date: 2026-09-29
summary: "AI made writing code cheap. Verifying it is the new bottleneck. Five under-discussed risks, and the practices that hold up for developers and QA automation engineers."
tags: ai, software-development, qa-automation, testing, security
---

# Coding in the Age of AI: What Nobody Tells You (and What to Do About It)

*AI made writing code cheap. Knowing whether it's right is now the expensive part.*

Most advice about AI and coding stops at "review the output." That's true but not enough. Here are five things that rarely make the headlines, and the habits that actually protect you, whether you write features or write tests.

## Five things that rarely make the headlines

**1. More AI means more speed, and more instability.**
Google's DORA 2025 report (nearly 5,000 professionals, about 90% using AI) found that AI adoption now goes with higher delivery throughput, but it still goes with higher delivery instability: more change failures and more rework. AI speeds up shipping faster than it speeds up *safe* shipping. That gap is exactly where testing lives.

**2. Your AI assistant's config files are an attack surface.**
Files like `.cursorrules`, `.github/copilot-instructions.md`, and `AGENTS.md` quietly steer your coding agent. Pillar Security showed that invisible Unicode characters in a shared rules file can hide instructions that push the assistant to insert malicious code, and human reviewers can't see them. GitHub responded by adding a hidden-Unicode warning, and researchers have since reported more prompt-injection flaws in major AI coding tools. Most teams still treat these files as harmless settings.

**3. Hallucinated packages are predictable, so attackers can pre-register them.**
A USENIX study of 576,000 code samples from 16 models found that about 20% of recommended packages didn't exist, and 43% of those fake names came back every time the same prompt was repeated. That repeatability lets an attacker register the fake name and wait. It's called *slopsquatting*.

**4. AI-written tests tend to defend the code you have, not the code you meant.**
Research on LLM-generated test oracles suggests that when the model is shown faulty code, its assertions lean toward what the code *currently does* rather than what it *should* do. Give an AI a buggy function and ask for tests, and it may cheerfully assert the bug.

**5. "Self-healing" can turn a red test green without fixing anything.**
Playwright 1.56 (October 2025) shipped Planner, Generator, and Healer agents. The Healer inspects a failing test, patches it, and re-runs it, and it can skip a test it believes is correct. That's great for locator drift. It's dangerous when the failure was a *real bug*, because healing the test around the bug hides it, and a skipped test is a silent hole. One hands-on review found the Healer the most useful of the three and the Generator's assertions rough, so treat all three as assistants, not authorities.

## Best practices for developers

1. **Explain it before you merge it.** If you can't explain a block line by line, it doesn't ship. Passing tests aren't understanding.
2. **Keep changes small.** One function or bug per prompt. Small diffs get reviewed; giant generated diffs get skimmed.
3. **Ask for security explicitly, then scan.** Large studies keep finding known flaws in nearly half of generated code samples. Request input validation and parameterized queries, and run static analysis in CI.
4. **Verify every dependency.** Check that it exists, has real history and maintainers, and that the name is exact. Commit lockfiles and scan them.
5. **Treat AI config files like code.** Review changes, scan for invisible characters, and never copy rules files from strangers without reading them.
6. **Keep secrets and customer data out of prompts.** Keys, tokens, production logs, and client data stay on your side.

## Best practices for QA and test automation

- **Give the AI the requirement, not just the code.** Tests written from the spec catch bugs. Tests written from the code only prove the code does what it does.
- **Make every generated test fail first.** Break the code on purpose, or use mutation testing, and confirm the test notices. A test that can't fail proves nothing.
- **Review every heal and every skip.** Treat them like diffs that need a human decision: was the *test* wrong, or was the *product*?
- **Prefer stable locators.** Roles, labels, and test IDs beat brittle CSS or XPath chains, so there is less to "heal" in the first place.
- **Don't let one prompt write both the code and its tests.** They'll share the same blind spots.
- **Watch for masking.** Blind sleeps, extra retries, and broad `try/catch` blocks make flaky tests look fixed.
- **Use AI for coverage ideas, not the final call.** It's excellent at brainstorming edge cases and test data. A human decides what matters.
- **Use synthetic test data.** Production data has no place in a prompt.

## For teams

- **Review AI code like a new junior's code**: polite, thorough, never on autopilot.
- **Add automated gates**: static analysis, dependency scanning, and secret scanning in CI, so unsafe output is caught even when the reviewer is tired.
- **Say when AI was used in a PR**, so reviewers know where to look harder.
- **Measure stability, not just speed**: change failure rate, rework, and incidents.

## Five questions before you merge AI code

1. Can I explain every line?
2. Do the dependencies exist and look trustworthy?
3. Would this survive a security scan?
4. Did the tests fail when I broke the code?
5. Did any secret or real data leave my machine?

Five yeses, ship it.

---

## Sources

- DORA, [Balancing AI tensions](https://dora.dev/insights/balancing-ai-tensions/) and Google, [Inside the 2025 DORA report](https://blog.google/innovation-and-ai/technology/developers-tools/dora-report-2025/)
- Pillar Security, [Rules File Backdoor](https://www.pillar.security/blog/new-vulnerability-in-github-copilot-and-cursor-how-hackers-can-weaponize-code-agents)
- Help Net Security, [Package hallucination and slopsquatting](https://www.helpnetsecurity.com/2025/04/14/package-hallucination-slopsquatting-malicious-code/)
- Veracode, [2025 GenAI Code Security Report](https://www.veracode.com/blog/genai-code-security-report/)
- TestDino, [Playwright test agents guide](https://testdino.com/blog/playwright-test-agents) and Bondar Academy, [Playwright AI agents review](https://bondaracademy.com/blog/playwright-ai-agents-review)
- Research on LLM test oracles: [arXiv 2609.09315](https://arxiv.org/pdf/2609.09315)