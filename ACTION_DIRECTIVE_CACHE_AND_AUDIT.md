# ACTION DIRECTIVE: DAA Web Platform Maintenance

**To:** Admin Agent, CTO
**From:** COO Operations
**Date:** February 26, 2026
**Reference:** DAA_Platform_PRD.md

## ⚠️ Safety Protocol — Live Pipeline Protection
> **No changes may be merged to `main` until a replacement infrastructure is staged and verified.**
> All work must be done on a `staging` branch. Human sign-off from Justin Smith is required before any merge to `main` triggers a GitHub Pages deployment.

## Objective
Resolve the caching issue on `detroitautomationacademy.com` and conduct a complete text audit — **without disrupting the current live pipeline.**

## Agent Instructions:

### 1. Admin Agent
*   **Action:** Checkout a new `staging` branch. Execute a comprehensive audit of all public-facing text on the DAA website on that branch only.
*   **Constraint:** Identify and prepare PRs to remove all erroneous "non-profit" status claims. Do **not** merge — open PRs for human review.
*   **Deliverable:** Text audit report + open PRs targeting `staging`, not `main`.

### 2. CTO
*   **Action:** Document the cache invalidation strategy (GitHub Pages cache headers, CDN) for review. **Do not push** any cache-busting changes to `main` until Admin Agent's content PRs have been reviewed and staged end-to-end.
*   **Deliverable:** Cache resolution plan document + verification that `staging` branch builds cleanly before `main` is touched.

**Status:** ACTIVE — staging branch gate enforced. Proceed to: `/Users/jsmith34/Documents/gitHub/detroit-automation-academy-public`
