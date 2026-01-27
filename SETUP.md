# AT-Infrastructure Setup Guide

## Overview

AT-Infrastructure is a **GitHub template repository** that enables teams to quickly create new repositories with production-ready CI/CD pipelines, security scanning, and compliance frameworks.

## Prerequisites

- Git 2.30+
- GitHub account with organization access
- Python 3.8+ (optional, for local testing)

## Quick Start

### 1. Use This Template

Click the **"Use this template"** button on the [AT-Infrastructure repository](https://github.com/AutomatedTechnologies/AT-Infrastructure) and create your new repository.

### 2. Clone Your New Repository

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
```

### 3. Install Pre-Commit Hooks

```bash
pip install pre-commit
pre-commit install
```

Pre-commit hooks automatically:
- Format code with Black (88 char line length)
- Check style with Flake8
- Sort imports with isort
- Validate docstrings with pydocstyle
- Scan for secrets with Bandit
- And more...

### 4. Verify Setup

```bash
# Test pre-commit hooks
pre-commit run --all-files

# Verify GitHub Actions workflow
git push
# Check https://github.com/your-org/your-repo/actions
```

## Configuration

### GitHub Repository Settings

Enable these security features:

1. **Branch Protection (main)**
   - Require pull request reviews: 2
   - Require status checks to pass
   - Require code signing
   - Restrict who can push

2. **Security & Analysis**
   - Dependabot alerts: ✅ Enable
   - Secret scanning: ✅ Enable
   - Code scanning: ✅ Enable

3. **Code Security**
   - Add CODEOWNERS file for approvals
   - Enable vulnerability alerts
   - Require branch up-to-date before merge

### CI/CD Pipeline

The repository includes a 7-job GitHub Actions workflow that runs on every push:

1. **Code Quality** — Black formatting check
2. **Linting** — Flake8 style validation
3. **Import Sorting** — isort validation
4. **Docstrings** — pydocstyle checking
5. **Security Scan** — Bandit vulnerability scan
6. **Dependency Check** — Dependabot integration
7. **Tests** — pytest (if tests exist)

All jobs must **PASS** before merging to main.

## Development Workflow

### Adding New Code

```bash
# Create feature branch
git checkout -b feature/my-feature

# Write code (pre-commit hooks run automatically on commit)
git add .
git commit -m "feat: add new feature"

# Create pull request
git push origin feature/my-feature
```

### Pre-Commit Hooks

The following tools run automatically before each commit:

| Tool | Purpose | Config |
|------|---------|--------|
| Black | Code formatting | 88 char line length |
| Flake8 | Style checking | PEP 8 compliance |
| isort | Import sorting | 3-line groups |
| pydocstyle | Docstring validation | Google style |
| Bandit | Security scanning | High/medium severity |

To skip hooks (not recommended):
```bash
git commit --no-verify
```

To run hooks manually:
```bash
pre-commit run --all-files
```

## File Structure

```
your-repo/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline (7 jobs)
├── .pre-commit-config.yaml      # Pre-commit hook configuration
├── .gitignore                   # Git ignore rules
├── .flake8                      # Flake8 configuration
├── pyproject.toml               # Python project configuration
├── README.md                    # Project overview
├── SETUP.md                     # This file
├── COMPLIANCE.md                # Regulatory frameworks
└── LICENSE                      # MIT License
```

## Common Tasks

### Run Code Quality Checks Locally

```bash
# Format with Black
black .

# Check with Flake8
flake8 .

# Sort imports
isort .

# Check docstrings
pydocstyle .

# Security scan
bandit -r . -ll
```

### View CI/CD Status

```bash
# After pushing to GitHub
open https://github.com/your-org/your-repo/actions
```

### Fix Formatting Issues

```bash
# Black automatically fixes most formatting
black .

# isort automatically fixes import order
isort .

# Flake8 reports issues (fix manually)
flake8 .
```

### Skip a CI Job (Emergency Only)

Add to commit message:
```
[skip ci]
```

This is a **LAST RESORT ONLY** — use sparingly. The CI pipeline exists to catch issues before production.

## Compliance Frameworks

This repository supports the following compliance standards:

- **HIPAA** — Healthcare data protection
- **PCI-DSS** — Payment card security
- **SOX** — Financial reporting integrity
- **GDPR** — EU data privacy
- **NIST** — Cybersecurity framework
- **CIS** — Control implementation

See [COMPLIANCE.md](COMPLIANCE.md) for detailed mapping.

## Support

### Debugging CI Failures

1. Check the GitHub Actions log: `https://github.com/your-org/your-repo/actions`
2. Review the job output for specific errors
3. Run the same checks locally: `pre-commit run --all-files`
4. Fix issues and push again

### Common Issues

**"Pre-commit hook failed"**
- Run `pre-commit run --all-files` to see all issues
- Run `black .` to auto-fix formatting
- Commit again

**"CI job failed"**
- Click the job in GitHub Actions to see logs
- Run same tool locally (black, flake8, etc.)
- Fix and push again

**"Branch protection requires 2 reviews"**
- Create a pull request
- Request 2+ reviewers
- Wait for approval
- Merge when ready

## Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Make changes and commit (pre-commit checks run automatically)
3. Push: `git push origin feature/name`
4. Create pull request on GitHub
5. Wait for CI/CD to pass (all 7 jobs)
6. Get 2 code reviews
7. Merge to main

## Next Steps

- Review [COMPLIANCE.md](COMPLIANCE.md) for regulatory requirements
- Configure [GitHub branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- Set up [codeowners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- Add team members with appropriate access levels
- Begin development with confidence in CI/CD pipeline

## Questions?

Refer to the main [README.md](README.md) or contact your infrastructure team.
