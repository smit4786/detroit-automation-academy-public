---
title: "Detroit Automation Academy Registration Live: From Zero to Cloud Run in One Session"
date: 2026-02-28T05:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["Detroit Automation Academy", "Engineering"]
tags: ["gcp", "cloud-run", "react", "golang", "crm", "devops"]
description: "How we built and deployed a fully functional multi-tenant CRM for Detroit Automation Academy — from broken Go string literals to a live React registration portal on Google Cloud Run."
---

Tonight we shipped the Detroit Automation Academy Registration from a broken build to a fully deployed, publicly accessible system in a single engineering session. Here's what that actually looked like.

## Starting Point: Five Consecutive Build Failures

The `deploy.sh` script existed. The Docker images existed. What didn't exist: a working build.

The first failure was a Go syntax error in `backend/main.go` — a raw newline embedded inside a string literal:

```go
// Broken
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...
", port)

// Fixed
fmt.Printf("Detroit Automation Academy Registration Backend starting on port %s...\n", port)
```

Go doesn't allow unescaped newlines inside string literals. The fix was one character.

## IAM Permission Cascade

With the backend building, the push to GCR failed:

```
denied: gcr.io repo does not exist. Creating on push requires the
artifactregistry.repositories.createOnPush permission
```

The Compute service account had `artifactregistry.admin` but the Cloud Build service account didn't have `roles/editor`. We granted it to both SAs and the build cleared.

## The Missing Frontend Scaffold

The React frontend had `App.tsx` and `EnrollmentForm.tsx` — but no `public/index.html`, no `src/index.tsx`, and an invalid `tsconfig.json`. `react-scripts build` requires all three.

We also caught a TypeScript error: inside an `if (view === 'enroll')` early-return block, TypeScript narrowed `view` to the literal type `'enroll'`, making `view === 'admin'` a dead comparison (TS2367). Fixed by refactoring to a single `return` with conditional rendering.

## Replacing Terraform with Direct Deployment

The `deploy.sh` script ended with `terraform init && terraform apply` — but Terraform wasn't installed and the infra directory didn't exist. Rather than block, we replaced it with direct `gcloud run deploy` calls. Both backend and frontend were live in 60 seconds.

## Firestore Persistence

The original backend stored students in memory — wiped on every cold start. We rewrote `handlers/students.go` to use Firestore with a graceful in-memory fallback:

- Collections are tenant-namespaced: `students_DAA-CORE`, `students_BGC-METRO`
- If Firestore is unreachable, the handler falls back to thread-safe in-memory storage
- The `/health` endpoint now reports `"storage":"firestore"` or `"storage":"memory"` so you can tell which is active at a glance

## What's Running Now

| Service | URL |
|---------|-----|
| Backend API (Go + Firestore) | `daa-crm-backend-87748455115.us-central1.run.app` |
| Registration Portal (React) | `enroll.detroitautomationacademy.com` |

The admin dashboard is now protected by a PIN gate — staff enter the passcode once per session, stored in `sessionStorage`. The registration form remains fully public.

---

*The Detroit Automation Academy cohort begins March 8, 2026 at The Station @ Michigan Central.*
