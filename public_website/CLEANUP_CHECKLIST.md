# File Cleanup Checklist

This checklist identifies files in the `docs/` folder that should be deleted or archived as part of the documentation consolidation.

## Files to Delete (Safe to Remove)

These files are empty, duplicated elsewhere, or have been consolidated into better versions.

### ✂️ Deprecated Event Plan Files

These three files have been **consolidated into** [docs/bgc_event_guide.md](docs/bgc_event_guide.md) with three formats:
- Format A: Physical Computing Showcase (from bgc_activation_plan.md)
- Format B: E-Commerce & AI Workshop (from bgc_ecommerce_activation.md)
- Format C: Venture Showcase (from bgc_venture_creation_showcase.md)

**Safe to delete:**
- [ ] `docs/bgc_activation_plan.md` — Consolidated into bgc_event_guide.md Format A
- [ ] `docs/bgc_ecommerce_activation.md` — Consolidated into bgc_event_guide.md Format B
- [ ] `docs/bgc_venture_creation_showcase.md` — Consolidated into bgc_event_guide.md Format C

**Verification before deletion:**
```bash
grep -r "bgc_activation_plan" .                    # Check for references
grep -r "bgc_ecommerce_activation" .
grep -r "bgc_venture_creation_showcase" .
```
If no results, safe to delete.

---

### ✂️ Duplicate/Empty Python Code Files

These files should not be in `docs/` folder (docs is for documentation, not code).

**Safe to delete:**
- [ ] `docs/cad_design.py` — Empty file (0 bytes); real code is in [phase2/cad_design.py](phase2/cad_design.py)
- [ ] `docs/github_example.py` — Example code not part of curriculum
- [ ] `docs/test_examples.py` — Duplicate; use root-level [test_examples.py](../test_examples.py) instead

**Verification before deletion:**
```bash
wc -l docs/cad_design.py docs/github_example.py docs/test_examples.py
# Should see small or zero counts

diff -u docs/test_examples.py test_examples.py  # Check if they're identical
```

---

### ❓ Review Required (May Still Be Used)

These files should be reviewed before deletion to confirm they're not referenced elsewhere.

- [ ] `docs/program_info.py` — Check if referenced in event dashboards or automation
  ```bash
  grep -r "program_info" .
  ```

---

## Recommended Deletion Order

1. **Delete event plan files first** (safest, definitely consolidated)
   ```bash
   rm docs/bgc_activation_plan.md
   rm docs/bgc_ecommerce_activation.md
   rm docs/bgc_venture_creation_showcase.md
   ```

2. **Delete empty code files** (safe, clearly empty)
   ```bash
   rm docs/cad_design.py docs/github_example.py docs/test_examples.py
   ```

3. **Review program_info.py usage**
   ```bash
   grep -r "program_info" .
   # If no results, safe to delete
   rm docs/program_info.py
   ```

---

## After Deletion: Update References

Search for any remaining references to deleted files:

```bash
# Search entire repo for references
grep -r "bgc_activation_plan\|bgc_ecommerce_activation\|bgc_venture_creation_showcase" .

# These should be empty. If they find anything, update those links to:
# - Use docs/bgc_event_guide.md instead, with Format A/B/C references
```

---

## Git Cleanup Command

Once verified safe, use this to delete and commit:

```bash
cd /Users/jsmith34/Desktop/gitHub/DetroitAutomationAcademy

# Delete the files
rm docs/bgc_activation_plan.md
rm docs/bgc_ecommerce_activation.md
rm docs/bgc_venture_creation_showcase.md
rm docs/cad_design.py
rm docs/github_example.py
rm docs/test_examples.py

# Optionally delete program_info.py if not used
# rm docs/program_info.py

# Stage deletions
git add -A

# Commit
git commit -m "refactor: consolidate event plans and remove duplicate code from docs/"

# Push
git push origin main
```

---

## Verification Checklist

After deletion, verify the repository is still complete:

- [ ] `docs/INDEX.md` still exists (navigation hub)
- [ ] `docs/bgc_event_guide.md` still exists (consolidated event guide with Format A/B/C)
- [ ] `docs/quick_start.md` still exists
- [ ] `docs/phase1_guide.md`, `phase2_guide.md`, `phase3_guide.md` still exist
- [ ] `docs/api_reference.md` still exists
- [ ] `docs/token_design_concepts.md` still exists
- [ ] `docs/PROJECT_PLAN.md` still exists
- [ ] Root-level `test_examples.py` still exists (new comprehensive test suite)
- [ ] `.github/workflows/ci.yml` still exists (GitHub Actions)

---

## Why This Cleanup Matters

### Before Cleanup
```
docs/
├── bgc_activation_plan.md          ← Outdated
├── bgc_ecommerce_activation.md     ← Outdated
├── bgc_venture_creation_showcase.md ← Outdated
├── bgc_event_guide.md              ← Current (replaces all 3 above)
├── cad_design.py                   ← Empty!
├── github_example.py               ← Not curriculum
├── test_examples.py                ← Duplicate (use root level)
├── program_info.py                 ← To review
├── ... (other good files)
```

### After Cleanup
```
docs/
├── INDEX.md                         ← Navigation hub
├── bgc_event_guide.md              ← One source of truth
├── api_reference.md
├── phase1_guide.md
├── phase2_guide.md
├── phase3_guide.md
├── quick_start.md
├── token_design_concepts.md
├── PROJECT_PLAN.md
└── ... (other reference docs)
```

**Benefits:**
- ✅ Cleaner directory structure
- ✅ No confusion about which event plan to use
- ✅ Code in code folders, docs in docs folder
- ✅ Single source of truth for each topic
- ✅ Easier for new contributors to navigate

---

## Linting Rule (Optional Future Enhancement)

To prevent future `.py` files in `docs/`, consider adding to `.flake8`:

```ini
[flake8]
# ... existing config ...

# Reject Python files in documentation folder
exclude = docs/*.py
```

Or use a pre-commit hook:

```yaml
- repo: https://github.com/pre-commit/pre-commit-hooks
  rev: v4.0.0
  hooks:
    - id: check-added-large-files
    - id: check-merge-conflict
    - id: end-of-file-fixer
      exclude: docs/*.py  # Prevent .py files in docs/
```

---

**Status:** Ready to execute. This cleanup is safe and improves repository organization.
