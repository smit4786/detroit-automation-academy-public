# AT-Infrastructure: Production-Grade DevOps Blueprint

**Industry-standard CI/CD, security, and compliance automation for all AutomatedTechnologies projects.**

[![CI/CD](https://github.com/AutomatedTechnologies/AT-Infrastructure/actions/workflows/ci.yml/badge.svg)](https://github.com/AutomatedTechnologies/AT-Infrastructure/actions)
[![Code Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](#)
[![Python 3.8-3.11](https://img.shields.io/badge/python-3.8%20%7C%203.9%20%7C%203.10%20%7C%203.11-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

---

## 🎯 **Quick Start**

Use this repository as a **template for new AT projects**:

```bash
# 1. Go to https://github.com/AutomatedTechnologies/AT-Infrastructure
# 2. Click "Use this template" button
# 3. Create new repository from template
git clone https://github.com/AutomatedTechnologies/your-project.git
cd your-project

# 4. Initialize development environment
pip install -r requirements.txt
pre-commit install

# 5. Run tests
pytest

# 6. Push to GitHub (CI/CD triggers automatically)
git add .
git commit -m "init: project setup from AT-Infrastructure template"
git push
```

---

## 🏗️ **What's Included**

### **CI/CD Pipeline (7 Jobs)**
- ✅ Black code formatting (Python 3.9)
- ✅ Flake8 linting with extended checks
- ✅ Multi-version testing (Python 3.8-3.11)
- ✅ Code coverage tracking
- ✅ Security scanning (Bandit)
- ✅ Code quality analysis (Radon)
- ✅ Documentation validation

### **Pre-Commit Hooks (8 Checks)**
- Black formatting on commit
- Flake8 linting
- Security scanning (Bandit)
- Import sorting (isort)
- YAML/JSON/TOML validation
- Docstring style checking (pydocstyle)
- Merge conflict detection
- Trailing whitespace cleanup

### **Compliance & Security**
- HIPAA-ready patterns (PHI handling guidelines)
- PCI-DSS compliance (payment data security)
- SOX compatibility (audit logging)
- GDPR support (data handling templates)
- NIST framework alignment
- CIS security controls

### **Documentation**
- Architecture overview
- Setup guide
- Development workflow
- Deployment procedures
- Compliance checklists
- GitHub Actions configuration

---

## 📋 **Repository Structure**

```
AT-Infrastructure/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # 7-job CI/CD pipeline
│   └── agents/
│       └── instructions.md     # AI agent guidelines
├── .pre-commit-config.yaml     # 8 pre-commit hooks
├── pyproject.toml              # Python project config
├── requirements.txt            # Dependencies
├── README.md                   # This file
├── LICENSE                     # MIT License
├── docs/
│   ├── SETUP.md               # Development setup
│   ├── COMPLIANCE.md          # Regulatory requirements
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── ARCHITECTURE.md        # System design
└── src/                        # Your project code here
```

---

## 🔧 **Core Features**

### **1. Automated Code Quality**

Every commit triggers:
```bash
→ Black formatting
→ Flake8 linting
→ Import sorting (isort)
→ Docstring validation (pydocstyle)
→ YAML/JSON checks
```

### **2. Multi-Version Testing**

Automatically test on Python 3.8, 3.9, 3.10, and 3.11:
```bash
→ Tests pass on all versions
→ Coverage tracked
→ Results reported
```

### **3. Security Scanning**

Real-time vulnerability detection:
```bash
→ Bandit (code security)
→ Dependency checks
→ CWE-level reporting
```

### **4. Compliance Automation**

Built-in regulatory support:
- HIPAA data handling checklist
- PCI-DSS security requirements
- SOX audit logging template
- GDPR data processing agreement
- NIST framework mapping
- CIS control alignment

---

## 📦 **Installation & Setup**

### **Prerequisites**
- Python 3.8+
- Git
- pip

### **Installation**

1. **Clone the repository:**
```bash
git clone https://github.com/AutomatedTechnologies/your-project.git
cd your-project
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
pip install pre-commit
```

4. **Setup pre-commit hooks:**
```bash
pre-commit install
```

5. **Run tests:**
```bash
pytest
```

---

## 🧪 **Testing**

### **Run all tests:**
```bash
pytest -v
```

### **Run with coverage:**
```bash
pytest --cov --cov-report=html
```

### **Run specific test file:**
```bash
pytest tests/test_specific.py -v
```

---

## 📊 **Code Quality Standards**

| Metric | Target | Tool |
|--------|--------|------|
| Code Style | 88-char lines | Black |
| Linting | E/W errors only | Flake8 |
| Imports | Sorted alphabetically | isort |
| Docstrings | Valid style | pydocstyle |
| Security | Zero critical issues | Bandit |
| Coverage | 85%+ | pytest-cov |

---

## 🔒 **Compliance & Security**

### **HIPAA Compliance**
- Protected Health Information (PHI) handling patterns
- Access control templates
- Audit logging requirements
- Data encryption guidelines

### **PCI-DSS Compliance**
- Payment card data security
- Network segmentation
- Access control lists
- Vulnerability management

### **SOX Compliance**
- Financial data integrity
- Audit trail logging
- Change management
- Segregation of duties

### **GDPR Compliance**
- Data processing agreements
- Right-to-be-forgotten procedures
- Data portability support
- Privacy by design patterns

### **NIST Framework**
- Risk management
- Security controls
- Incident response
- Recovery procedures

### **CIS Controls**
- Asset management
- Access control
- Malware defense
- Data protection

See [docs/COMPLIANCE.md](docs/COMPLIANCE.md) for detailed requirements.

---

## 🚀 **Deployment**

### **Development**
```bash
git checkout -b feature/my-feature
# Make changes
pre-commit run --all-files
pytest
git push origin feature/my-feature
```

### **Staging**
```bash
# Merge to develop branch
# CI/CD runs all tests
# Automated deployment to staging
```

### **Production**
```bash
# Merge to main branch
# CI/CD runs full test suite
# Manual approval for production deploy
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed procedures.

---

## 📚 **Documentation**

- **[Setup Guide](docs/SETUP.md)** — Development environment configuration
- **[Compliance Guide](docs/COMPLIANCE.md)** — Regulatory requirements
- **[Deployment Guide](docs/DEPLOYMENT.md)** — Release procedures
- **[Architecture](docs/ARCHITECTURE.md)** — System design overview

---

## 👥 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes and commit: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/name`
5. Submit pull request

### **Code Standards**
- All code must pass pre-commit hooks
- Tests required for new features
- Documentation must be updated
- Commits should reference issues

---

## 🤝 **Support & Questions**

- **GitHub Issues** — Bug reports and feature requests
- **Discussions** — Questions and ideas
- **Documentation** — See `docs/` folder

---

## 📄 **License**

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

---

## 🏢 **About AutomatedTechnologies**

**Automated Technologies** delivers enterprise automation, compliance, and infrastructure solutions for regulated industries.

- **LinkedIn:** https://www.linkedin.com/company/automatedtechnologies/
- **GitHub Organization:** https://github.com/AutomatedTechnologies
- **Repository:** https://github.com/AutomatedTechnologies/AT-Infrastructure
- **Contact:** GitHub Issues or Discussions in the repository

---

**Last Updated:** January 27, 2026  
**Template Version:** 1.0.0  
**Maintained by:** AT DevOps Team
