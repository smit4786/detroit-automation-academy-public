## C:\Users\dbkr\workspace\daa-public-staging\site_structure.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-02
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis


﻿## C:\Users\dbkr\workspace\daa-public-staging\site_structure.md
# ðŸ“ Detroit Automation Academy Site Structure Guide

## Purpose
This guide documents the folder and file conventions for the Detroit Automation Academy repository, supporting clarity, maintainability, and deployment.

---

## Folder Structure

```
DetroitAutomationAcademy/
â”œâ”€â”€ web/                  # All main public-facing HTML pages (dashboard, landing, students, instructors, partners, docs_index)
â”œâ”€â”€ docs/                 # Documentation, curriculum guides, API reference, event guides
â”œâ”€â”€ branding/             # Brand assets, color palettes, typography, logo concepts
â”œâ”€â”€ activations/          # Hardware workflows, G-code, STL files, laser cutting guides
â”œâ”€â”€ .github/workflows/    # GitHub Actions workflows for CI/CD and Pages deployment
â”œâ”€â”€ ...                   # Administrative, financial, and strategic documents
```

---

## File Naming Conventions
- Use descriptive names (e.g., `dashboard.html`, `phase1_guide.md`, `LOGO_CONCEPT_FRAMEWORK.md`)
- Status indicators: âœ… COMPLETE, ðŸ”„ IN PROGRESS, âŒ BLOCKED
- Markdown headers: Use emoji for visual scanning
- Color codes: Always specify as `Color Name, #HEX, RGB`
- Avoid generic names (e.g., `doc1.md`)

---

## HTML Pages
- All main HTML pages are in `web/` for clarity and deployment continuity
- Originals are preserved in root for live site stability
- Navigation bar, branding, and dark mode toggle are standardized

---

## Documentation
- `docs/INDEX.md`: Role-based navigation hub
- `MASTER_DOCUMENT_INDEX.md`: Complete doc inventory
- Cross-reference between docs/INDEX.md and MASTER_DOCUMENT_INDEX.md

---

## Branding
- `branding/`: Logo concepts, color palettes, typography
- Follow production-quality standards in `PRODUCTION_DESIGN_STANDARDS.md`

---

## Administrative & Strategic
- Administrative, financial, and event documents are at the root for easy access
- Use suffixes: SUMMARY.md, REPORT.md, PLAN.md
- Remove or archive `.bak` files regularly

---

## Accessibility & Theme
- All HTML pages use `branding/palette.css` for semantic color themes
- Dark mode toggle is present and functional
- Add ARIA attributes, alt text, and keyboard navigation for accessibility

---

## Deployment
- `.github/workflows/deploy-pages.yml`: GitHub Pages deployment
- `web/` folder supports future deployment flexibility

---

## Update Process
- Update this guide when adding new folders, changing conventions, or restructuring
- Reference this guide in onboarding and documentation

---

*Last updated: February 11, 2026*
