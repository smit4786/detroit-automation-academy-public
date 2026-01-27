#!/bin/bash
# AT-Infrastructure Pre-Launch Verification Script
# Run this before pushing to production

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  AT-INFRASTRUCTURE PRE-LAUNCH VERIFICATION SUITE          ║"
echo "║  Status: $(date +%Y-%m-%d\ %H:%M:%S)                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

FAILED=0
PASSED=0

# Function to run check
run_check() {
    local check_name=$1
    local command=$2
    local expected=$3
    
    echo "▶ Checking: $check_name..."
    if eval "$command" > /dev/null 2>&1; then
        echo "  ✅ PASS: $expected"
        ((PASSED++))
    else
        echo "  ❌ FAIL: $check_name"
        ((FAILED++))
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "SECTION 1: Code Quality Checks"
echo "═══════════════════════════════════════════════════════════"

run_check "Git status clean" "git status --porcelain | wc -l | grep -q '^0$'" "No uncommitted changes"
run_check "Black formatting" "black --check . 2>/dev/null" "All files properly formatted"
run_check "Flake8 linting" "flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics" "Linting compliant"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SECTION 2: Security Checks"
echo "═══════════════════════════════════════════════════════════"

run_check "No hardcoded passwords" "! grep -r \"password.*=\" --include='*.py' . 2>/dev/null" "No hardcoded secrets"
run_check "No API keys" "! grep -r \"api_key\\|apikey\\|API_KEY\" --include='*.py' . 2>/dev/null" "No API keys in code"
run_check ".env excluded" "grep -q '.env' .gitignore" ".env in .gitignore"
run_check ".env.example present" "test -f .env.example" ".env.example documentation"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SECTION 3: File Integrity Checks"
echo "═══════════════════════════════════════════════════════════"

run_check "README.md exists" "test -f README.md" "README.md found"
run_check "SETUP.md exists" "test -f SETUP.md" "SETUP.md found"
run_check "COMPLIANCE.md exists" "test -f COMPLIANCE.md" "COMPLIANCE.md found"
run_check "LICENSE exists" "test -f LICENSE" "LICENSE found"
run_check "pyproject.toml exists" "test -f pyproject.toml" "pyproject.toml found"
run_check "CI/CD workflow exists" "test -f .github/workflows/ci.yml" "GitHub Actions configured"
run_check "Pre-commit config exists" "test -f .pre-commit-config.yaml" "Pre-commit hooks configured"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SECTION 4: Documentation Quality"
echo "═══════════════════════════════════════════════════════════"

run_check "README has content" "test -s README.md && wc -l README.md | awk '{print \$1}' | grep -qE '[0-9]{2,}'" "README.md substantial"
run_check "Setup guide complete" "test -s SETUP.md && wc -l SETUP.md | awk '{print \$1}' | grep -qE '[0-9]{2,}'" "SETUP.md substantial"
run_check "Compliance documented" "test -s COMPLIANCE.md && wc -l COMPLIANCE.md | awk '{print \$1}' | grep -qE '[0-9]{2,}'" "COMPLIANCE.md substantial"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "SECTION 5: Git Repository Health"
echo "═══════════════════════════════════════════════════════════"

run_check "Main branch exists" "git branch | grep -q main" "Main branch present"
run_check "Commit history" "git log --oneline | wc -l | grep -qE '[0-9]{1,}'" "Commits present"
run_check "No large files" "! find . -type f -size +10M 2>/dev/null" "No files > 10MB"
run_check "Git remote configured" "git remote -v | grep -q 'origin\\|github'" "Remote repository configured"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "VERIFICATION SUMMARY"
echo "═══════════════════════════════════════════════════════════"

TOTAL=$((PASSED + FAILED))
echo ""
echo "✅ PASSED: $PASSED/$TOTAL checks"
echo "❌ FAILED: $FAILED/$TOTAL checks"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🟢 STATUS: ALL CHECKS PASSED - READY FOR DEPLOYMENT"
    echo ""
    echo "Next steps:"
    echo "  1. Review GO_LIVE_ACTION_PLAN.md"
    echo "  2. Ensure GitHub organization exists"
    echo "  3. Execute push to GitHub"
    echo "  4. Enable template repository"
    echo "  5. Configure branch protection"
    echo ""
    exit 0
else
    echo "🔴 STATUS: ISSUES FOUND - RESOLVE BEFORE DEPLOYMENT"
    echo ""
    echo "Please fix the $FAILED failing check(s) before proceeding."
    echo ""
    exit 1
fi
