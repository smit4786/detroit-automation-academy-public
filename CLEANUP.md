# Documentation Cleanup & File Organization

This file documents the consolidation of documentation and cleanup of code files that were in the `docs/` folder.

## Background

The `docs/` folder previously contained a mix of documentation and Python code files. This created organizational confusion and violated the separation of concerns principle. This document outlines the migration and explains what files should be used going forward.

## Old Event Plans (Now Consolidated)

The following three files have been **merged into a single authoritative guide**:

| Old File | Status | Content Moved To |
|----------|--------|------------------|
| `bgc_activation_plan.md` | Deprecated | [bgc_event_guide.md](bgc_event_guide.md) — Format A |
| `bgc_ecommerce_activation.md` | Deprecated | [bgc_event_guide.md](bgc_event_guide.md) — Format B |
| `bgc_venture_creation_showcase.md` | Deprecated | [bgc_event_guide.md](bgc_event_guide.md) — Format C |

**Action:** These files can be archived or deleted. All event planning should reference [bgc_event_guide.md](bgc_event_guide.md) instead.

---

## Code Files in Docs/ (Should Not Be Here)

The following Python files are in `docs/` but **should not remain** in a documentation folder. They are either stubs or duplicates:

### docs/cad_design.py
- **Status:** Empty file (0 lines)
- **Correct Location:** [../phase2/cad_design.py](../phase2/cad_design.py)
- **Action:** Delete from docs/; use the real implementation in phase2/

### docs/github_example.py
- **Status:** Example of GitHub API usage (not part of curriculum)
- **Correct Location:** Not essential to the academy; can be archived or placed in a separate `examples/` folder
- **Action:** Delete from docs/ or move to a new `examples/` folder

### docs/test_examples.py
- **Status:** Test file that imports from phase2/cad_design and phase3/autonomous_rover
- **Correct Location:** [../test_examples.py](../test_examples.py) (root level)
- **Action:** Delete from docs/; test at root level to avoid import path confusion

### docs/program_info.py
- **Status:** Contains program metadata (name, acronyms, outcomes)
- **Correct Location:** Either at root level or docs/program_info.md (as documentation)
- **Action:** Review usage; if used for event dashboards, leave in place. Otherwise, document as metadata reference.

---

## Documentation Files (Keep and Use)

These files remain in `docs/` and are the authoritative sources:

### Reference & Setup
- ✅ [quick_start.md](quick_start.md)
- ✅ [api_reference.md](api_reference.md)

### Curriculum Guides
- ✅ [phase1_guide.md](phase1_guide.md)
- ✅ [phase2_guide.md](phase2_guide.md)
- ✅ [phase3_guide.md](phase3_guide.md)

### Strategic & Event Planning
- ✅ [PROJECT_PLAN.md](PROJECT_PLAN.md)
- ✅ [bgc_event_guide.md](bgc_event_guide.md) — **NEW: Consolidated event guide**
- ✅ [token_design_concepts.md](token_design_concepts.md)
- ✅ [INDEX.md](INDEX.md) — **NEW: Documentation index & navigation**

### To Archive or Delete
- ⚠️ [bgc_activation_plan.md](bgc_activation_plan.md) — See consolidated guide
- ⚠️ [bgc_ecommerce_activation.md](bgc_ecommerce_activation.md) — See consolidated guide
- ⚠️ [bgc_venture_creation_showcase.md](bgc_venture_creation_showcase.md) — See consolidated guide
- ⚠️ [cad_design.py](cad_design.py) — Empty; use [../phase2/cad_design.py](../phase2/cad_design.py)
- ⚠️ [github_example.py](github_example.py) — Not curriculum-related; archive
- ⚠️ [test_examples.py](test_examples.py) — Use [../test_examples.py](../test_examples.py) instead

---

## How to Use This Directory Going Forward

### For Students
- Start: [quick_start.md](quick_start.md)
- By phase: [phase1_guide.md](phase1_guide.md), [phase2_guide.md](phase2_guide.md), [phase3_guide.md](phase3_guide.md)
- Code examples: See `/phase1/`, `/phase2/`, `/phase3/` directories
- Lost? Check [INDEX.md](INDEX.md)

### For Instructors & Event Planners
- Event setup: [bgc_event_guide.md](bgc_event_guide.md)
- Curriculum: Phase guides above
- Token designs: [token_design_concepts.md](token_design_concepts.md)
- Laser workflows: [../activations/README.md](../activations/README.md)

### For Developers
- API reference: [api_reference.md](api_reference.md)
- Architecture guidance: [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- Code examples: `/phase1/`, `/phase2/`, `/phase3/` directories

---

## Cleanup Checklist

If you have access to delete files, perform the following:

- [ ] Archive or delete `bgc_activation_plan.md` (use bgc_event_guide.md instead)
- [ ] Archive or delete `bgc_ecommerce_activation.md` (use bgc_event_guide.md instead)
- [ ] Archive or delete `bgc_venture_creation_showcase.md` (use bgc_event_guide.md instead)
- [ ] Delete `cad_design.py` (empty file; real code in phase2/)
- [ ] Delete or archive `github_example.py` (not curriculum-related)
- [ ] Delete `test_examples.py` (use root-level version instead)
- [ ] Update any internal links from old event plans to [bgc_event_guide.md](bgc_event_guide.md)
- [ ] Update any scripts that import test_examples from docs/ to use root-level version

---

## Consolidated Event Guide

All three event formats are now in **[bgc_event_guide.md](bgc_event_guide.md)**:

1. **Format A: Physical Computing Showcase** — 3 zones, walk-through experience for families
2. **Format B: E-Commerce & AI Workshop** — 3-step workflow, entrepreneurship focus
3. **Format C: Venture Showcase** — 4 stations, donor engagement

Choose one format or mix them for different time slots. Full staffing, logistics, and troubleshooting guidance included.

---

## New Documentation Index

A new **[INDEX.md](INDEX.md)** file has been created to help users navigate all documentation by use case (student, instructor, event planner, developer, donor).
