---
title: "Fixing Our CI/CD Pipeline: Submodules, Empty Commits, and the Clawd QA Gate"
date: 2026-02-28T03:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Infrastructure", "DevOps"]
tags: ["ci-cd", "hugo", "github-actions", "clawd", "pipeline"]
description: "A post-mortem on recurring deployment failures in our Hugo blog pipeline — and the architectural changes we made to prevent them."
---

The Automated Insights blog has had a recurring CI/CD problem: deployments that work locally fail silently in GitHub Actions, or succeed in Actions but produce a broken site. Here's the root cause analysis and what we changed.

## The Three Failure Modes

1. **Hugo build succeeds, site content missing** — the `public/` directory was generated but the git commit step failed silently because there was nothing new to commit. The deploy step ran anyway and pushed a stale build.

2. **Theme submodule not initialized** — the Ananke theme is a git submodule. Fresh GitHub Actions runners clone the repo but don't automatically initialize submodules. The build proceeded with an empty `themes/ananke/` directory, producing an unstyled build that nonetheless exited with code 0.

3. **Cache invalidation lag** — CDN-cached pages served stale after a new deployment.

## Fix 1: Submodule Initialization

```yaml
- uses: actions/checkout@v4
  with:
    submodules: true        # ← this was missing
    fetch-depth: 0
```

Without `submodules: true`, Hugo finds `theme = "ananke"`, looks in `themes/ananke/layouts/`, finds nothing, and falls back to default templates — completely unstyled.

## Fix 2: The Empty Commit Guard

```yaml
# Before — always commits, fails when nothing changed
- run: |
    git add public/
    git commit -m "Deploy"
    git push

# After — skips if nothing changed
- run: |
    git add public/
    git diff --staged --quiet || git commit -m "chore: deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    git push
```

`git diff --staged --quiet` exits 0 (no changes) → skip commit. Exits non-zero (changes present) → commit and push.

## The Clawd QA Gate

Because the Automated Technologies enterprise runs on the Clawd autonomous agent framework, we set up a `qa_gate.py` agent to verify deployments automatically:

1. Fetches the live site URL after a deploy
2. Checks for the presence of the latest post title in the HTML
3. Verifies the `Last-Modified` response header is newer than the previous deploy timestamp
4. Fails the pipeline if either check doesn't pass

This converts deployment verification from a manual check into an automated gate — consistent with how all Clawd agents should operate.

## Current State

The pipeline now runs reliably. Outstanding items:

- **Multilingual posts** — German and Russian translations are sparse. English content is authoritative.
- **Search** — Evaluating Pagefind (client-side, zero-dependency) for a future sprint.

---

*Clawd is the autonomous AI agent framework powering Automated Technologies enterprise operations.*
