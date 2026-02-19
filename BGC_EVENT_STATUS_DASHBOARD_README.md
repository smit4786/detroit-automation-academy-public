# ✅ BGC Event Dashboard — Go-Live README
**Go-Live Target:** 7:00 AM (Tomorrow)
**Domain:** detroitautomationacademy.com
## 🚀 Publish Priority: BGC Event Dashboard
---
# 🟦 Dashboard Tile Layout & Privacy (Feb 7, 2026)

## Tile-Based Dashboard Organization
- All dashboard elements are organized as responsive tiles:
	- Enrollment Tile: Shows total and today's enrollments (anonymized counts only)
	- Event Status Tile: Live event metrics (aggregate, no personal info)
	- Program Interest Tile: Breakdown by program (no participant names)
	- Agent Highlight Tile: Current active project agents (role/status only)
	- Admin Tile: Staff-only metrics (requires authentication)

## Privacy & Anonymization
- No full names, emails, or sensitive identifiers displayed
- All participant data is anonymized (counts, initials, or cohort numbers)
- Admin/staff tiles require secure authentication
- All tiles reviewed for privacy compliance before publishing
- Data sources (GitHub Issues, Google Sheets, Calendar) filtered to exclude personal info

## Example Tile Format
| Tile Name           | Data Shown                | Privacy Level   |
|---------------------|--------------------------|-----------------|
| Enrollment          | Total count, hourly rate | Public, anonymized |
| Event Status        | Aggregate metrics         | Public, anonymized |
| Program Interest    | Program breakdown         | Public, anonymized |
| Agent Highlight     | Role/status only          | Public, anonymized |
| Admin               | Staff metrics             | Restricted, authenticated |

## Implementation Notes
- Move dashboard files to dashboard/ folder for clarity
- Ensure all dashboard code and HTML use tile layout and anonymized data
- Reference [BGC_DASHBOARD_VISUAL_GUIDE.md](dashboard/BGC_DASHBOARD_VISUAL_GUIDE.md) for visual standards
- Reference [ADMINISTRATIVE_COORDINATION_PLAN.md](../ADMINISTRATIVE_COORDINATION_PLAN.md) for privacy workflow

---
This file is the **operational go-live checklist** for the BGC Event Dashboard and public launch.

### 1) Hosting & DNS (Complete by 5:30 AM)
- [ ] Confirm hosting provider and upload destination (web root).
- [ ] Place `BGC_EVENT_STATUS_DASHBOARD.html` at the public web root.
- [ ] Configure DNS for detroitautomationacademy.com:
	- [ ] A/AAAA records point to hosting IP(s)
	- [ ] `www` CNAME to apex domain
- [ ] Enable HTTPS (auto-cert or manual certificate).
- [ ] Verify HTTP → HTTPS redirect.

### 2) Dashboard Readiness (Complete by 6:00 AM)
- [ ] Validate enrollment data source (GitHub issues access).
- [ ] Confirm dashboard refresh interval and data pipeline.
- [ ] Run `test_event_dashboard.py` and verify success.
- [ ] Ensure `event_status_monitor.py` runs with `--continuous --notify`.

### 3) Launch Validation (Complete by 6:30 AM)
- [ ] Open https://detroitautomationacademy.com in a browser.
- [ ] Confirm dashboard loads quickly (under 2 seconds).
- [ ] Confirm styles match DAA branding.
- [ ] Confirm live enrollment data updates.


# 🏢 Detroit Automation Academy — Permanent Residency Dashboard

**Status:** ✅ Permanent Residency Established (Boys & Girls Club of Greater Detroit, in partnership with Michigan Central)
**Domain:** detroitautomationacademy.com
**Last Updated:** February 7, 2026

---

## 🎉 Residency & Partnership Announcement

Detroit Automation Academy is now the permanent resident STEM and robotics program at the Boys & Girls Club of Greater Detroit, in partnership with Michigan Central. This milestone marks a new era of long-term community impact, advanced automation education, and collaborative innovation.

### Partnership Highlights
- **Permanent Residency:** Detroit Automation Academy is now a core fixture at BGC Detroit
- **Michigan Central Partnership:** Joint programming, mentorship, and technology access
- **Community Impact:** Expanded access, year-round programming, and workforce development
- **Brand Maturity:** Unified branding, co-branded events, and integrated visual identity

---

## 🖼️ Mature Visual Identity & Site Updates

### Refined Tile Structure
- **Enrollment Tile:** Total, daily, and cohort enrollments (anonymized, trend graphs)
- **Event Status Tile:** Live metrics, upcoming events, and historical stats
- **Program Interest Tile:** Breakdown by program, age group, and engagement (aggregate only)
- **Agent Highlight Tile:** Current project agents (role/status, partnership logos)
- **Admin Tile:** Staff metrics, secure login, and partnership management
- **News Tile:** Daily news, partnership updates, student achievements, and event recaps

### Visual Updates
- **Co-Branded Header:** Boys & Girls Club + Detroit Automation Academy + Michigan Central logos
- **Color Palette:** Electric Blue (#0066CC), Rust (#CC5522), Michigan Central Gold (#FFD700), BGC Navy (#003366)
- **Typography:** Poppins Bold (headings), Inter Regular (body)
- **Tile Accents:** Partnership badges, mature gradients, and subtle shadow depth
- **Footer:** Permanent residency statement, partnership credits, and contact info

---

## 📰 News & Community Updates

- Daily news tile features partnership milestones, student spotlights, and event recaps
- News workflow: Staff submit via GitHub Issue (label: "news"), auto-sync to dashboard tile
- Partnership events and achievements highlighted in news tile and event status tile
- All news reviewed for privacy and branding compliance

---

## 🔒 Privacy & Data Protection

- No public display of full names, emails, or sensitive identifiers
- All participant and staff data anonymized (counts, initials, cohort numbers)
- Admin/staff tiles require secure authentication
- Partnership management features restricted to authorized staff
- All tiles and news elements reviewed for privacy compliance before publishing
- Data sources (GitHub Issues, Google Sheets, Calendar) filtered to exclude personal info
- Reference: [ADMINISTRATIVE_COORDINATION_PLAN.md](../ADMINISTRATIVE_COORDINATION_PLAN.md) for privacy workflow

---

## 🧩 Example Tile Layout

| Tile Name           | Data Shown                | Privacy Level   | Visual Accent |
|---------------------|--------------------------|-----------------|--------------|
| Enrollment          | Total, daily, cohort, trends | Public, anonymized | BGC + DAA logo |
| Event Status        | Live metrics, history, upcoming | Public, anonymized | Michigan Central badge |
| Program Interest    | Program, age, engagement breakdown | Public, anonymized | Rust accent |
| Agent Highlight     | Role/status, partnership logos | Public, anonymized | Partnership badge |
| Admin               | Staff metrics, management | Restricted, authenticated | Secure login |
| News                | Daily news, achievements, recaps | Public, anonymized | Gold accent |

---

## 🛠️ Implementation Notes

- All dashboard files reside in dashboard/ for clarity
- All code and HTML use refined tile layout and mature branding
- Visual standards: [dashboard/BGC_DASHBOARD_VISUAL_GUIDE.md](dashboard/BGC_DASHBOARD_VISUAL_GUIDE.md)
- Privacy workflow: [ADMINISTRATIVE_COORDINATION_PLAN.md](../ADMINISTRATIVE_COORDINATION_PLAN.md)
- Partnership management: Secure admin tile, co-branded header/footer
- News workflow: GitHub Issues (label: "news") → dashboard tile

---

**Owner:** CTO — Automated Technologies
**Status:** ✅ Permanent Residency, Partnership Active
