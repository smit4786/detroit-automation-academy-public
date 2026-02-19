# Documentation Index

Welcome to the Detroit Automation Academy documentation. This index maps all guides to curriculum phases and use cases.

**For a complete inventory of all documents and their purposes, see [MASTER_DOCUMENT_INDEX.md](../MASTER_DOCUMENT_INDEX.md).**

## 🌐 NEW: Program Landing Pages

Our website now features comprehensive role-based landing pages. Start here based on your interest:

| Role | Landing Page | Purpose |
|------|--------------|---------|
| **Everyone** | [landing.html](landing.html) | Main program overview with event success story |
| **Students** | [students.html](students.html) | Application, program details, FAQ, enrollment pathway |
| **Instructors** | [instructors.html](instructors.html) | Curriculum guides, teaching resources, assessment rubrics |
| **Partners/Donors** | [partners.html](partners.html) | Sponsorship opportunities, partnership tiers, ROI |

**All pages are responsive and mobile-friendly.** Links to these guides, curriculum, and GitHub are integrated throughout.

**UI Update (Feb 2026):** All main pages now feature a standardized navigation bar with gear logo branding, DAA text, navigation links, and a dark mode toggle. The semantic palette.css ensures accessible color themes for all users.


## Quick Navigation

### Getting Started
- **[quick_start.md](quick_start.md)** — First-time setup, installation, and running your first example
- **NEW:** [students.html](students.html) — Apply to the program (landing page version)

### Curriculum Guides (Phase-Based)

| Phase | Guide | Topics | Audience |
|-------|-------|--------|----------|
| **1** | [phase1_guide.md](phase1_guide.md) | Python fundamentals, GPIO control, LEDs, buttons | Students, instructors |
| **2** | [phase2_guide.md](phase2_guide.md) | CAD design, parametric modeling, 3D printing, laser cutting | Students, engineers |
| **3** | [phase3_guide.md](phase3_guide.md) | Autonomous systems, sensor fusion, navigation algorithms | Advanced students |

### API & Code Reference
- **[api_reference.md](api_reference.md)** — Complete API documentation for all classes and functions (Phase 1, 2, 3)

### Community Activation Events

**All three formats are consolidated in one guide:**
- **[bgc_event_guide.md](bgc_event_guide.md)** — Boys & Girls Club Grand Opening (Feb 3-4, 2026)
  - **Format A:** Physical Computing Showcase (general audiences, walk-through)
  - **Format B:** E-Commerce & AI Workshop (entrepreneurship focus)
  - **Format C:** Venture Showcase (donor and partner engagement)

### Design & Projects
- **[token_design_concepts.md](token_design_concepts.md)** — Design options for B&G Club commemorative tokens (gear, circuit coin, skyline keychain, robot head)
- **[../activations/README.md](../activations/README.md)** — Laser cutting workflows, materials, safety, G-code troubleshooting

### Strategic Documents
- **[PROJECT_PLAN.md](PROJECT_PLAN.md)** — High-level roadmap, milestones, scope, and dependencies

---

## By Use Case

### "I'm a Student" 👨‍🎓
1. **START HERE:** [students.html](students.html) — Full enrollment pathway with FAQ
2. Then: [quick_start.md](quick_start.md) — Setup instructions
3. Phase 1: [phase1_guide.md](phase1_guide.md)
4. Phase 2: [phase2_guide.md](phase2_guide.md)
5. Phase 3: [phase3_guide.md](phase3_guide.md)
6. Reference: [api_reference.md](api_reference.md)

### "I'm an Instructor" 👨‍🏫
1. **START HERE:** [instructors.html](instructors.html) — Teaching resources and curriculum guides
2. Then: [phase1_guide.md](phase1_guide.md), [phase2_guide.md](phase2_guide.md), [phase3_guide.md](phase3_guide.md)
3. Reference: [api_reference.md](api_reference.md)
4. Event setup: [bgc_event_guide.md](bgc_event_guide.md)
5. Hardware & safety: [../activations/README.md](../activations/README.md)

### "I'm Running an Event" 📅
1. Start: [bgc_event_guide.md](bgc_event_guide.md) (choose Format A, B, or C)
2. Design concepts: [token_design_concepts.md](token_design_concepts.md)
3. Laser workflows: [../activations/README.md](../activations/README.md)
4. Logistics: See event guide's checklists and staffing sections

### "I'm a Developer/Contributor" 👨‍💻
1. Setup: [quick_start.md](quick_start.md)
2. Code reference: [api_reference.md](api_reference.md)
3. Project scope: [PROJECT_PLAN.md](PROJECT_PLAN.md)
4. Deployment: [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
5. Dev environment: [../DEV_ENVIRONMENT_SETUP.md](../DEV_ENVIRONMENT_SETUP.md)
6. See also: [../.github/copilot-instructions.md](../.github/copilot-instructions.md) for architectural patterns

### "I'm a Donor/Partner" 💰
1. **START HERE:** [partners.html](partners.html) — Sponsorship tiers, ROI, partnership types
2. **Event:** [bgc_event_guide.md](bgc_event_guide.md) (Format C: Venture Showcase)
3. **Program overview:** [landing.html](landing.html) — Event success story and impact metrics
4. **Financial info:** [../DAA_FINANCIAL_INDEX.md](../DAA_FINANCIAL_INDEX.md)

### "I Just Want to Learn About DAA" 🌐
1. **START HERE:** [landing.html](landing.html) — Main program overview with event success metrics
2. Then choose your interest above and follow the pathway

---

## File Organization

### `/docs/`
- `quick_start.md` — Onboarding
- `phase1_guide.md`, `phase2_guide.md`, `phase3_guide.md` — Curriculum
- `api_reference.md` — Code API
- `bgc_event_guide.md` — Event planning (consolidated from three separate files)
- `token_design_concepts.md` — Design reference
- `PROJECT_PLAN.md` — Strategic roadmap

### `/phase1/`
- `led_blink.py` — GPIO output example
- `button_press.py` — GPIO input example
- `README.md` — Phase 1 overview

### `/phase2/`
- `cad_design.py` — Parametric CAD generation
- `challenge_1_rover_debug.py` — Debugging challenge

### `/phase3/`
- `autonomous_rover.py` — Rover simulation

### `/activations/`
- `laser_cut_circle.gcode`, `laser_cut_square.gcode`, `laser_cut_triangle.gcode` — G-code files
- `README.md` — Materials, safety, troubleshooting, workflow integration

### `/.github/`
- `copilot-instructions.md` — AI agent guidance for developers

### `/docs/` - New Website Pages
- `landing.html` — Main program landing page (event success story, 3-phase curriculum overview)
- `students.html` — Student enrollment pathway (application process, FAQ, important dates)
- `instructors.html` — Instructor resource hub (curriculum guides, teaching tools, assessment)
- `partners.html` — Partnership & sponsorship information (tiers, ROI, contact pathways)

---

## Glossary & Abbreviations

- **CAD** — Computer-Aided Design
- **FDM** — Fused Deposition Modeling (3D printing technology)
- **G-code** — Machine code for CNC equipment (laser cutters, 3D printers)
- **GPIO** — General-Purpose Input/Output (Raspberry Pi pins)
- **STL** — STereoLithography (3D model file format)
- **Phase 1** — Python Fundamentals & Microcontrollers
- **Phase 2** — CAD Design & Rapid Prototyping
- **Phase 3** — Autonomous Systems & Sensor Fusion

---

## Document Status

| Document | Type | Status | Last Updated |
|----------|------|--------|--------------|
| **landing.html** | 🌐 Website | ✅ Live | Feb 2026 |
| **students.html** | 🌐 Website | ✅ Live | Feb 2026 |
| **instructors.html** | 🌐 Website | ✅ Live | Feb 2026 |
| **partners.html** | 🌐 Website | ✅ Live | Feb 2026 |
| quick_start.md | 📘 Guide | ✅ Current | Jan 2026 |
| phase1_guide.md | 📘 Guide | ✅ Current | Jan 2026 |
| phase2_guide.md | 📘 Guide | ✅ Current | Jan 2026 |
| phase3_guide.md | 📘 Guide | ✅ Current | Jan 2026 |
| api_reference.md | 📘 Guide | ✅ Complete | Jan 2026 |
| bgc_event_guide.md | 📘 Guide | ✅ Consolidated | Jan 2026 |
| token_design_concepts.md | 📘 Guide | ✅ Current | Jan 2026 |
| PROJECT_PLAN.md | 📘 Guide | ✅ Current | Jan 2026 |
| ../activations/README.md | 📘 Guide | ✅ Enhanced | Jan 2026 |

---

## Contributing

To update documentation:
1. Edit the relevant `.md` file
2. Keep links relative to current directory (e.g., `../activations/README.md`)
3. Update this index if adding new documents
4. Use consistent heading levels and formatting

For questions or corrections, open an issue on GitHub.
