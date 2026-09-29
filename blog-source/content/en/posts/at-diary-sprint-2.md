---
title: "@AT_Diary Sprint 2: Building a Privacy-First Diary on Apple Native Frameworks"
date: 2026-02-28T04:00:00-05:00
draft: false
author: "Justin Smith"
categories: ["@AT_Diary", "iOS"]
tags: ["swift", "ios", "musickit", "eventkit", "coredata", "privacy"]
description: "Sprint 2 of @AT_Diary is complete with a successful build. Our architecture approach: why we chose native Apple frameworks over third-party SDKs, and what privacy-first actually means in practice."
---

Sprint 2 of `@AT_Diary` is complete with a successful build. Here's what we shipped and how the architecture decisions are holding up.

## The Core Premise

Most journaling apps ask you to trust their servers with your most personal data. AT_Diary doesn't. Every piece of data it touches — your music history, your calendar events, your location context, your photos — is processed **on-device** and stored with iCloud encryption. Nothing phones home.

## The Framework Stack

| Framework | Data Domain | Privacy Approach |
|-----------|-------------|------------------|
| **MusicKit** | What you're listening to | Requests user permission; no data leaves device |
| **EventKit** | Calendar & reminders | Read-only access to authorized calendars |
| **Contacts** | Named entities in your day | Accessed by identifier only, never bulk imported |
| **CoreLocation** | Where you are | Significant location changes only, stored as geohash |
| **Photos** | Visual memory triggers | Thumbnails generated locally, originals never read |

## Sprint 2 Deliverables

### ✅ MusicKit Integration
Authorization flow complete. The app captures the current track at entry creation time. Album artwork is pulled from the MusicKit catalog and displayed as a contextual thumbnail.

### ✅ EventKit Read Pipeline
Calendar events for the current day are fetched and ranked by duration and proximity to the current time. The top 3 events populate the "Today's Context" section automatically.

### ✅ CoreData + CloudKit Persistence
All diary entries are stored in a `CoreData` stack with CloudKit sync enabled via `NSPersistentCloudKitContainer`. Your entries sync across all Apple devices without ever touching a third-party server.

### ✅ Successful Build
Clean build against iOS 18.0 target with zero warnings on all privacy-sensitive framework calls.

## What's Next: Sprint 3

- **Entry card design:** Rich contextual tiles with music, location, and event context
- **Timeline view:** Chronological scroll with ambient colors derived from album art
- **On-device ML:** Using `CreateML` to surface recurring patterns across your diary entries

---

*@AT_Diary is a private project under Automated Technologies. No App Store release is planned at this time.*
