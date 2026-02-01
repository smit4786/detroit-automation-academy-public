# AT-Infrastructure Compliance Framework

## Overview

This document outlines how AT-Infrastructure aligns with major regulatory and security frameworks. All repositories created from this template inherit these compliance controls.

## Compliance Standards Supported

| Framework | Focus | Status | Evidence |
|-----------|-------|--------|----------|
| **HIPAA** | Healthcare data protection | ✅ Supported | Encryption, audit logging, access controls |
| **PCI-DSS** | Payment card security | ✅ Supported | Secrets scanning, network isolation, monitoring |
| **SOX** | Financial reporting integrity | ⚠️ Conditional | Change tracking, audit trails, segregation of duties (applies when used by SOX-subject entities) |
| **GDPR** | EU data privacy | ✅ Supported | Data handling, consent, right to erasure |
| **NIST** | Cybersecurity standards | ✅ Supported | Identity & access, supply chain, incident response |
| **CIS** | Control implementation | ✅ Supported | Security baselines, vulnerability management |

---

## 1. HIPAA (Healthcare Portability & Accountability Act)

### Requirements

HIPAA applies to healthcare organizations handling Protected Health Information (PHI).

### Implementation in AT-Infrastructure

#### Encryption
- **At Rest:** Repository secrets encrypted (GitHub encrypted secrets)
- **In Transit:** All GitHub API calls use HTTPS/TLS 1.3
- **Code:** No hardcoded credentials (Bandit scanning enforces)

#### Access Control
- **Branch Protection:** Requires 2+ reviews before merge
- **Team Permissions:** GitHub teams for RBAC
- **Audit Logging:** All changes tracked in git commit history

#### Monitoring & Logging
- **GitHub Actions Logs:** Retained for 90 days
- **Workflow Status:** All CI/CD jobs logged
- **Change Tracking:** Complete git history preserved

#### Data Handling
- `.env` files never committed (in `.gitignore`)
- Sensitive data in GitHub Secrets (not code)
- Bandit scans for hardcoded secrets

### Compliance Checklist

- ✅ Encryption of credentials in transit & at rest
- ✅ Access control via branch protection & team permissions
- ✅ Audit trail via git history
- ✅ No PHI in code repositories
- ✅ Automatic secret scanning (Bandit)

---

## 2. PCI-DSS (Payment Card Industry Data Security Standard)

### Requirements

PCI-DSS applies to organizations processing credit card data.

### Implementation in AT-Infrastructure

#### Secure Development
- **Static Analysis:** Bandit scanning for security issues
- **Dependency Management:** Dependabot checks for vulnerabilities
- **Code Review:** 2-review requirement before merge
- **Testing:** Automated test pipeline (if tests included)

#### Secrets Management
- **API Keys:** Never stored in code (Bandit prevents this)
- **Credentials:** GitHub Secrets for sensitive data
- **Environment Variables:** `.env.example` templates (no real values)

#### Monitoring
- **Security Alerts:** GitHub Dependabot alerts for vulnerable packages
- **Code Scanning:** Automatic security scanning
- **Audit Logs:** Full change history in git

#### Change Management
- **Version Control:** All changes tracked with commit messages
- **Approval Process:** Pull requests require 2 reviews
- **Testing:** Automated CI/CD pipeline validates changes

### Compliance Checklist

- ✅ Secure code development practices
- ✅ No hardcoded API keys or credentials
- ✅ Vulnerability scanning (Dependabot + Bandit)
- ✅ Change approval process (2 reviews required)
- ✅ Audit trail of all changes

---

## 3. SOX (Sarbanes-Oxley Act)

### Requirements

SOX applies to public companies and requires financial reporting integrity. **Note:** This applies only when AT-Infrastructure is used by organizations subject to SOX regulations.

### Implementation in AT-Infrastructure

#### Change Management
- **Git History:** Every change tracked with author, timestamp, message
- **Code Review:** 2-review approval before deployment
- **Traceability:** Links between commits, PRs, and tickets (recommended)

#### Segregation of Duties
- **Branch Protection:** Developers cannot merge their own code
- **Review Requirement:** 2 different people must approve
- **Admin Separation:** Infrastructure admins separate from developers

#### Audit Trail
- **Commit History:** All changes permanently logged
- **GitHub Actions Logs:** Workflow execution captured
- **Access Logs:** GitHub audit log for all user actions

#### Configuration Management
- **Version Control:** All configuration as code
- **Backup:** GitHub replication provides backup
- **Disaster Recovery:** Code always recoverable from git

### Compliance Checklist

- ✅ Complete change history (git commits)
- ✅ Segregation of duties (2-review requirement)
- ✅ Audit trail (GitHub logs + git history)
- ✅ Change approval process
- ✅ Configuration management as code

---

## 4. GDPR (General Data Protection Regulation)

### Requirements

GDPR applies to organizations processing personal data of EU residents.

### Implementation in AT-Infrastructure

#### Data Protection
- **No PII in Code:** .gitignore prevents accidental commits
- **Encryption:** Secrets encrypted in GitHub
- **Access Control:** Team-based permissions

#### Right to Erasure
- **Commit History:** Can be cleaned with git filter-repo
- **Secrets Rotation:** GitHub Secrets can be updated immediately
- **Access Revocation:** Team/user removal revokes immediately

#### Privacy by Design
- **Minimal Data:** Only necessary credentials in `.env`
- **Data Classification:** Comments document data sensitivity
- **Consent:** Code includes consent markers in comments

#### Data Processing Agreement
- **GitHub DPA:** GitHub signed Microsoft's Data Processing Addendum
- **Processors:** Vendors (CI/CD, monitoring) named in docs
- **Sub-processors:** GitHub Dependabot, GitHub Actions

### Compliance Checklist

- ✅ No personal data in code repositories
- ✅ Encrypted secrets management
- ✅ Access control mechanisms
- ✅ Data handling documentation
- ✅ Right to erasure capability (git history cleaning)

---

## 5. NIST (National Institute of Standards & Technology)

### Cybersecurity Framework

NIST SP 800-53 provides baseline security controls. AT-Infrastructure implements:

#### Identification & Authentication

**Control: IA-2 (Authentication)**
- Multi-factor authentication encouraged for GitHub
- SSH keys required for git operations
- Personal access tokens with scope limitations

**Control: IA-4 (Identifier Management)**
- Git commits require authenticated user identity
- GitHub accounts tied to real identities
- Teams manage access based on roles

#### Access Control

**Control: AC-2 (Account Management)**
- GitHub teams for role-based access
- Least privilege principle enforced
- Branch protection prevents unauthorized merges

**Control: AC-3 (Access Enforcement)**
- Branch protection enforces 2-review requirement
- Status checks must pass before merge
- Admin actions separate from developer actions

#### Audit & Accountability

**Control: AU-2 (Audit Events)**
- All commits logged with author/timestamp
- GitHub Actions logs capture execution
- Webhooks enable external logging (recommended)

**Control: AU-3 (Content of Audit Records)**
- Commit history includes what/who/when/why
- GitHub audit log captures access events
- Status checks log validation results

#### Configuration Management

**Control: CM-3 (Configuration Change Control)**
- All changes in pull requests
- 2-review approval required
- Automated testing validates changes

**Control: CM-5 (Configuration Boundary Protection)**
- Branch protection prevents direct commits
- Secrets in GitHub not code
- `.gitignore` prevents sensitive files

#### Incident Response

**Control: IR-1 (Incident Response Policy)**
- GitHub security alerts trigger on vulnerabilities
- Dependabot creates automated PRs for patches
- Workflow logs enable post-incident analysis

### Compliance Checklist

- ✅ Identification & authentication controls
- ✅ Access control enforcement
- ✅ Audit & accountability logging
- ✅ Configuration management
- ✅ Incident response capabilities

---

## 6. CIS (Center for Internet Security)

### Critical Security Controls

CIS Controls v8 provides 18 critical controls. AT-Infrastructure implements:

#### Control 2: Inventory & Control of Software Assets

- **Version Control:** All code in git with version history
- **Dependency Tracking:** `pyproject.toml` lists all dependencies
- **Vulnerability Scanning:** Dependabot monitors for issues

#### Control 3: Data Protection

- **Secret Management:** GitHub Secrets for sensitive data
- **No Hardcoding:** Bandit prevents credential storage
- **Encryption:** TLS for all communications

#### Control 4: Secure Configuration Management

- **Infrastructure as Code:** Workflows defined in YAML
- **Version Control:** All configs committed and reviewed
- **Automated Deployment:** GitHub Actions enforces consistent setup

#### Control 5: Access Control

- **Least Privilege:** Teams grant minimum needed access
- **Branch Protection:** Prevents unauthorized changes
- **Review Process:** 2+ approvals required

#### Control 6: Account Management

- **Team-Based Access:** GitHub teams for role management
- **Least Privilege:** Access granted to teams, not individuals
- **Regular Review:** Teams reviewed for appropriateness

#### Control 8: Vulnerability Management

- **Dependency Scanning:** Dependabot scans dependencies
- **Code Scanning:** Bandit identifies security issues
- **Automated Updates:** Dependabot creates PRs for patches

### Compliance Checklist

- ✅ Software inventory (git + pyproject.toml)
- ✅ Data protection (secrets management)
- ✅ Secure configuration (infrastructure as code)
- ✅ Access control (branch protection + teams)
- ✅ Account management (team-based access)
- ✅ Vulnerability management (Dependabot + Bandit)

---

## Implementation Checklist

When creating a new repository from AT-Infrastructure template:

### Configuration (First Time)

- ✅ Enable branch protection on main
- ✅ Require 2+ pull request reviews
- ✅ Require status checks to pass
- ✅ Enable GitHub Dependabot alerts
- ✅ Enable code scanning
- ✅ Set up CODEOWNERS file
- ✅ Configure team access levels
- ✅ Enable secret scanning

### Ongoing

- ✅ Review Dependabot alerts within 24 hours
- ✅ Merge security patches immediately
- ✅ Monitor GitHub Actions for failures
- ✅ Review code changes in pull requests
- ✅ Update team permissions as roles change
- ✅ Rotate secrets annually (minimum)

### Documentation

- ✅ Document data handling in README
- ✅ Note compliance requirements
- ✅ List team members & roles
- ✅ Document incident response process
- ✅ Update COMPLIANCE.md with specific mappings

---

## Compliance Validation

### Automated Checks (Every Commit)

The GitHub Actions pipeline validates:
- ✅ Code formatting (Black)
- ✅ Code style (Flake8)
- ✅ Import organization (isort)
- ✅ Docstring completeness (pydocstyle)
- ✅ Security scan (Bandit)
- ✅ Dependency vulnerabilities (Dependabot)

### Manual Reviews (Each Pull Request)

Code reviewers validate:
- ✅ Compliance with standards
- ✅ No hardcoded secrets
- ✅ Proper error handling
- ✅ Documentation completeness
- ✅ Test coverage
- ✅ Security best practices

### Regular Audits (Monthly)

Teams should:
- ✅ Review access controls
- ✅ Check for unpatched dependencies
- ✅ Analyze security alerts
- ✅ Verify branch protection settings
- ✅ Update compliance documentation

---

## Resources

- [HIPAA Compliance](https://www.hhs.gov/hipaa/) — U.S. Department of Health & Human Services
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/) — Payment Card Industry
- [SOX Compliance](https://www.sec.gov/cgi-bin/viewer?action=view&cik=0&accession_number=0000000000000001&xbrl_type=v) — SEC Sarbanes-Oxley Information
- [GDPR Compliance](https://gdpr-info.eu/) — EU Data Protection Regulation
- [NIST Framework](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) — NIST Cybersecurity Framework
- [CIS Controls](https://www.cisecurity.org/cis-controls/) — Center for Internet Security
- [GitHub Security](https://github.com/security) — GitHub Security Features
- [GitHub Compliance](https://github.com/features/security) — GitHub Compliance Programs

---

## Questions?

Contact your compliance or security team for framework-specific requirements. See the main [README.md](README.md) for general information.

**Last Updated:** January 27, 2026  
**Maintained By:** Infrastructure Team  
**Review Cycle:** Quarterly
