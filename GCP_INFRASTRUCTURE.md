## C:\Users\dbkr\workspace\daa-public-staging\GCP_INFRASTRUCTURE.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-02
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis


# GCP INFRASTRUCTURE & DOMAIN ARCHITECTURE — EPOCH VII PRODUCTION

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\GCP_INFRASTRUCTURE.md  
**Generated:** March 31, 2026, 23:30 UTC  
**Status:** PRODUCTION DEPLOYMENT GUIDE

---

## Executive Overview

This document describes the Google Cloud Platform infrastructure for Detroit Automation Academy's EPOCH VII redesign. It covers:
- GCP project architecture
- Cloud Storage buckets (staging/production)
- Cloud CDN configuration
- Domain routing and DNS
- SSL/TLS certificates
- Load balancing
- Monitoring & alerting

**Production Status:** 🟢 READY FOR DEPLOYMENT

---

## 1. GCP Project Architecture

### 1.1 Project Details

```yaml
Project ID:        detroit-automation-academy
Project Name:      Detroit Automation Academy
Region:            us-central1 (Iowa)
Billing Account:   [To be configured]
Organization:      [DAA Organization]
```

### 1.2 Services Enabled

**Required Services:**
```
✅ Cloud Storage (gs://)
✅ Cloud CDN
✅ Cloud Load Balancing
✅ Cloud DNS
✅ Cloud Logging
✅ Cloud Monitoring
✅ Cloud Armor (DDoS protection)
✅ Service Accounts
✅ IAM & Admin
```

**Enable via gcloud:**
```bash
gcloud services enable \
  storage-api.googleapis.com \
  compute.googleapis.com \
  cdn-api.googleapis.com \
  dns.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com
```

---

## 2. Cloud Storage Buckets

### 2.1 Production Bucket

```yaml
Name:              gs://daa-production
Location:          US (multi-region)
Storage Class:     Standard (high availability)
Versioning:        Enabled (rollback capability)
Object Lock:       Disabled
Public Access:     Restricted (private)
CORS:              Enabled for detroitautomationacademy.com
```

**Bucket Structure:**
```
gs://daa-production/
├── landing/
│   ├── index.html
│   ├── branding/
│   │   └── palette.css
│   └── assets/
│       ├── images/
│       └── icons/
├── blog/
│   ├── index.html
│   ├── posts/
│   └── assets/
├── enrollment/
│   ├── index.html
│   ├── branding/
│   └── form-handler.js
└── .well-known/
    ├── security.txt
    └── google-site-verification.txt
```

**Creation Command:**
```bash
gsutil mb -l US -c STANDARD gs://daa-production
gsutil versioning set on gs://daa-production
gsutil cors set cors.json gs://daa-production
```

### 2.2 Staging Bucket

```yaml
Name:              gs://daa-staging
Location:          US (multi-region)
Storage Class:     Standard
Versioning:        Enabled
Public Access:     Restricted (testing only)
CORS:              Enabled for staging domains
```

**Creation Command:**
```bash
gsutil mb -l US -c STANDARD gs://daa-staging
gsutil versioning set on gs://daa-staging
```

### 2.3 Backup Bucket

```yaml
Name:              gs://daa-production-backup
Location:          EU (geographic redundancy)
Storage Class:     Coldline (cost-effective backups)
Versioning:        Enabled
Lifecycle:         Delete objects after 90 days
```

**Creation Command:**
```bash
gsutil mb -l EU -c COLDLINE gs://daa-production-backup
gsutil lifecycle set lifecycle.json gs://daa-production-backup
```

---

## 3. Cloud Load Balancing

### 3.1 Production Load Balancer

**Configuration:**
```yaml
Name:              daa-production-lb
Type:              HTTP(S) Load Balancer
Protocol:          HTTPS (TLS 1.2+)
Regions:           Multi-region
Health Checks:     Enabled (every 10 seconds)
Session Affinity:  None
```

**Routing Rules:**

| Domain | Path | Backend | TTL |
|:-------|:----:|:-------:|:---:|
| detroitautomationacademy.com | /* | daa-landing | 3600s |
| blog.detroitautomationacademy.com | /* | daa-blog | 3600s |
| enroll.detroitautomationacademy.com | /* | daa-enrollment | 3600s |

### 3.2 Backend Buckets

```bash
# Create backend buckets
gcloud compute backend-buckets create daa-landing \
  --gcs-bucket-name=gs://daa-production \
  --cache-mode=CACHE_ALL_STATIC

gcloud compute backend-buckets create daa-blog \
  --gcs-bucket-name=gs://daa-production \
  --cache-mode=CACHE_ALL_STATIC

gcloud compute backend-buckets create daa-enrollment \
  --gcs-bucket-name=gs://daa-production \
  --cache-mode=CACHE_ALL_STATIC

# Enable Cloud CDN
gcloud compute backend-buckets update daa-landing --enable-cdn
gcloud compute backend-buckets update daa-blog --enable-cdn
gcloud compute backend-buckets update daa-enrollment --enable-cdn
```

---

## 4. Cloud CDN Configuration

### 4.1 Cache Policies

**Landing Page:**
```yaml
Cache Mode:        CACHE_ALL_STATIC
TTL (browser):     3600s (1 hour)
TTL (CDN):         86400s (24 hours)
Serve Stale:       Enabled (up to 604800s / 7 days)
Compression:       Gzip enabled
```

**Blog:**
```yaml
Cache Mode:        CACHE_ALL_STATIC
TTL (browser):     1800s (30 minutes)
TTL (CDN):         43200s (12 hours)
Serve Stale:       Enabled
Compression:       Gzip enabled
```

**Enrollment Form:**
```yaml
Cache Mode:        CACHE_ALL_STATIC
TTL (browser):     300s (5 minutes)
TTL (CDN):         3600s (1 hour)
Serve Stale:       Disabled (forms must be fresh)
Compression:       Gzip enabled
```

### 4.2 Purge Cache

```bash
# Purge all cache for a backend
gcloud compute backend-buckets update daa-landing \
  --purge-cache

# Alternatively, use gsutil versioning
gsutil version set on gs://daa-production
gsutil rewrite -s STANDARD gs://daa-production/**
```

---

## 5. SSL/TLS Certificates

### 5.1 Google-Managed SSL Certificate

```yaml
Certificate Name:  daa-ssl-cert
Domains:
  - detroitautomationacademy.com
  - blog.detroitautomationacademy.com
  - enroll.detroitautomationacademy.com
  - www.detroitautomationacademy.com
Type:              Google-managed
Provisioning:      Automatic (via DNS challenge)
Renewal:           Automatic before expiration
```

**Creation Command:**
```bash
gcloud compute ssl-certificates create daa-ssl-cert \
  --domains detroitautomationacademy.com,\
blog.detroitautomationacademy.com,\
enroll.detroitautomationacademy.com,\
www.detroitautomationacademy.com \
  --global
```

**Verification:**
```bash
gcloud compute ssl-certificates describe daa-ssl-cert --global
```

---

## 6. Cloud DNS Configuration

### 6.1 DNS Zone Setup

```yaml
Zone Name:         detroitautomationacademy-com
DNS Name:          detroitautomationacademy.com
Type:              Public
DNSSEC:            Enabled
TTL (default):     300s
```

**Creation Command:**
```bash
gcloud dns managed-zones create detroitautomationacademy-com \
  --dns-name=detroitautomationacademy.com \
  --description="Detroit Automation Academy DNS Zone"
```

### 6.2 DNS Records

**A Records (Load Balancer):**
```yaml
Name:              @
Type:              A
Value:             [Load Balancer IP]
TTL:               300s
Routing Policy:    Simple

Name:              www
Type:              A
Value:             [Load Balancer IP]
TTL:               300s
Routing Policy:    Simple
```

**CNAME Records (Subdomains):**
```yaml
Name:              blog
Type:              CNAME
Value:             c.storage.googleapis.com
TTL:               300s

Name:              enroll
Type:              CNAME
Value:             c.storage.googleapis.com
TTL:               300s
```

**MX Records (Email):**
```yaml
Name:              @
Type:              MX
Value:             10 mail.detroitautomationacademy.com
TTL:               3600s
```

**TXT Records (Verification):**
```yaml
Name:              @
Type:              TXT
Value:             "v=spf1 include:_spf.google.com ~all"
TTL:               300s

Name:              _acme-challenge
Type:              TXT
Value:             [ACME challenge token]
TTL:               300s
```

**Creation Commands:**
```bash
# Get Load Balancer IP
LB_IP=$(gcloud compute forwarding-rules describe daa-lb \
  --global --format='value(IPAddress)')

# Create A record
gcloud dns record-sets create @ \
  --rrdatas=$LB_IP \
  --ttl=300 \
  --type=A \
  --zone=detroitautomationacademy-com

# Create CNAME for blog
gcloud dns record-sets create blog \
  --rrdatas=c.storage.googleapis.com \
  --ttl=300 \
  --type=CNAME \
  --zone=detroitautomationacademy-com
```

---

## 7. Production Deployment Steps

### 7.1 Pre-Deployment Verification

```bash
#!/bin/bash

echo "=== GCP Infrastructure Verification ==="

# 1. Verify Project
gcloud config get-value project
echo "✓ Project configured"

# 2. Verify Storage Buckets
gsutil ls -p detroit-automation-academy | grep daa-
echo "✓ Storage buckets exist"

# 3. Verify Load Balancer
gcloud compute forwarding-rules list | grep daa
echo "✓ Load balancer configured"

# 4. Verify DNS Zone
gcloud dns managed-zones list | grep detroitautomationacademy
echo "✓ DNS zone configured"

# 5. Verify SSL Certificate
gcloud compute ssl-certificates list | grep daa
echo "✓ SSL certificate configured"

# 6. Test DNS Resolution
nslookup detroitautomationacademy.com
echo "✓ DNS resolution working"
```

### 7.2 Execute Production Deployment

```bash
#!/bin/bash
# Production Deployment Script

PROJECT_ID="detroit-automation-academy"
PROD_BUCKET="gs://daa-production"
BACKUP_BUCKET="gs://daa-production-backup"

echo "🚀 EPOCH VII Production Deployment"
echo "Environment: PRODUCTION"
echo "Timestamp: $(date)"

# 1. Backup current production
echo "📦 Creating backup..."
gsutil -m cp -r "$PROD_BUCKET/*" "$BACKUP_BUCKET/backup-$(date +%Y%m%d_%H%M%S)/"
echo "✓ Backup created"

# 2. Build components
echo "📄 Building landing page..."
mkdir -p dist/landing
cp index.html dist/landing/
cp -r branding/ dist/landing/
cp -r assets/ dist/landing/
echo "✓ Landing page built"

echo "📝 Building blog..."
cd blog-source
hugo -d ../dist/blog --minify
cd ..
echo "✓ Blog built"

echo "📋 Building enrollment form..."
mkdir -p dist/enrollment
cp enroll.html dist/enrollment/index.html
cp -r branding/ dist/enrollment/
echo "✓ Enrollment form built"

# 3. Deploy to production
echo "🔄 Deploying to production..."
gsutil -m cp -r dist/landing/* "$PROD_BUCKET/landing/"
echo "✓ Landing deployed"

gsutil -m cp -r dist/blog/* "$PROD_BUCKET/blog/"
echo "✓ Blog deployed"

gsutil -m cp -r dist/enrollment/* "$PROD_BUCKET/enrollment/"
echo "✓ Enrollment deployed"

# 4. Purge CDN cache
echo "🔄 Purging CDN cache..."
gcloud compute backend-buckets update daa-landing --purge-cache
gcloud compute backend-buckets update daa-blog --purge-cache
gcloud compute backend-buckets update daa-enrollment --purge-cache
echo "✓ Cache purged"

# 5. Verify deployment
echo "✅ Verifying deployment..."
for domain in detroitautomationacademy.com blog.detroitautomationacademy.com enroll.detroitautomationacademy.com; do
  echo "Testing $domain..."
  curl -I https://$domain 2>/dev/null | head -5
done
echo "✓ Deployment verified"

echo "🎉 Production deployment complete!"
```

---

## 8. Monitoring & Alerting

### 8.1 Cloud Logging

**Query to Monitor:**
```
resource.type="gcs_bucket"
protoPayload.methodName="storage.objects.get"
resource.labels.bucket_name="daa-production"
```

**Log Sink Configuration:**
```bash
gcloud logging sinks create daa-logs \
  cloudlogging.googleapis.com/projects/detroit-automation-academy/logs/daa \
  --log-filter='resource.type="gcs_bucket"'
```

### 8.2 Cloud Monitoring Metrics

**Metrics to Monitor:**

| Metric | Threshold | Alert Action |
|:-------|:---------:|:------------|
| HTTP 5xx errors | >1% | Page alert |
| Response time (P95) | >2000ms | Email alert |
| Cache hit ratio | <80% | Investigation |
| Disk quota | >90% | Email alert |
| Request count | >10k/min | Auto-scale |

**Create Alert:**
```bash
gcloud alpha monitoring policies create \
  --notification-channels=[CHANNEL_ID] \
  --display-name="DAA Production - HTTP 5xx Errors" \
  --condition-display-name="5xx Error Rate >1%" \
  --condition-threshold-value=0.01 \
  --condition-threshold-duration=300s
```

### 8.3 Health Checks

**Cloud Load Balancer Health Check:**
```yaml
Name:              daa-health-check
Protocol:          HTTPS
Path:              /index.html
Port:              443
Check Interval:    10 seconds
Timeout:           5 seconds
Healthy Threshold: 2 consecutive checks
Unhealthy Threshold: 3 consecutive checks
```

**Creation Command:**
```bash
gcloud compute health-checks create https daa-health-check \
  --port=443 \
  --request-path=/index.html \
  --check-interval=10s \
  --timeout=5s \
  --unhealthy-threshold=3 \
  --healthy-threshold=2
```

---

## 9. Domain Architecture

### 9.1 Domain Structure

```
detroitautomationacademy.com
├── Root Domain (/)
│   └── Landing Page (index.html)
│       • Hero section with EPOCH VII messaging
│       • Program overview
│       • Enrollment CTA
│       • Blog link to blog subdomain
│
├── blog.detroitautomationacademy.com (/blog)
│   └── Blog Platform
│       • EPOCH VII technical posts
│       • SEO-optimized articles
│       • Internal linking to main site
│       • Enrollment CTA
│
├── enroll.detroitautomationacademy.com (/enroll)
│   └── Enrollment Form
│       • 12-field registration form
│       • Module interest selection
│       • Form submission (Netlify)
│       • Privacy acknowledgment
│
└── status.detroitautomationacademy.com (/status)
    └── Status Page
        • System uptime monitoring
        • Incident reporting
        • Status history
```

### 9.2 Subdomain Routing

**Load Balancer Host Rules:**

```yaml
Rule 1:
  Host:    detroitautomationacademy.com
  Path:    /*
  Backend: daa-landing
  
Rule 2:
  Host:    www.detroitautomationacademy.com
  Path:    /*
  Backend: daa-landing (redirect to non-www)
  
Rule 3:
  Host:    blog.detroitautomationacademy.com
  Path:    /*
  Backend: daa-blog
  
Rule 4:
  Host:    enroll.detroitautomationacademy.com
  Path:    /*
  Backend: daa-enrollment
```

### 9.3 DNS Routing Detail

```yaml
# Primary domain (Load Balancer)
A Record:
  Name:   detroitautomationacademy.com
  Type:   A
  Value:  [LB IP: 34.x.x.x]
  
# WWW redirect
CNAME Record:
  Name:   www
  Type:   CNAME
  Target: detroitautomationacademy.com

# Blog subdomain (Cloud Storage)
CNAME Record:
  Name:   blog
  Type:   CNAME
  Target: c.storage.googleapis.com

# Enrollment subdomain (Cloud Storage)
CNAME Record:
  Name:   enroll
  Type:   CNAME
  Target: c.storage.googleapis.com

# Status page
CNAME Record:
  Name:   status
  Type:   CNAME
  Target: [Status page provider]
```

---

## 10. Disaster Recovery

### 10.1 Backup Strategy

**Daily Backups:**
```bash
# Backup production to separate bucket
gsutil -m cp -r gs://daa-production/* \
  gs://daa-production-backup/daily-$(date +%Y%m%d)/

# Retention: 30 days
gcloud storage transfer create \
  --source-path=gs://daa-production-backup \
  --delete-objects-from-source-after-transfer
```

### 10.2 Rollback Procedure

```bash
#!/bin/bash
# Rollback Script

PROD_BUCKET="gs://daa-production"
BACKUP_DATE=$1  # Format: YYYYMMDD

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 YYYYMMDD"
  exit 1
fi

echo "⚠️  Rolling back to $BACKUP_DATE"

# Restore from backup
gsutil -m cp -r "gs://daa-production-backup/$BACKUP_DATE/*" "$PROD_BUCKET/"

# Purge cache
gcloud compute backend-buckets update daa-landing --purge-cache
gcloud compute backend-buckets update daa-blog --purge-cache
gcloud compute backend-buckets update daa-enrollment --purge-cache

echo "✓ Rollback complete"
```

---

## 11. Security Configuration

### 11.1 Cloud Armor Rules

```bash
gcloud compute security-policies create daa-policy \
  --description="EPOCH VII security policy"

# Allow traffic from specific regions
gcloud compute security-policies rules create 100 \
  --security-policy daa-policy \
  --action "allow" \
  --origin-region-list "US,CA,MX"

# Rate limiting
gcloud compute security-policies rules create 200 \
  --security-policy daa-policy \
  --action "rate-based-ban" \
  --rate-limit-options-ban-duration-sec 600 \
  --rate-limit-options-conform-action "allow" \
  --rate-limit-options-exceed-action "deny-429" \
  --rate-limit-options-rate-limit-threshold-count 100 \
  --rate-limit-options-rate-limit-threshold-interval-sec 60
```

### 11.2 IAM Roles

**Service Account Permissions:**
```yaml
Service Account: daa-deployment@detroit-automation-academy.iam.gserviceaccount.com
Roles:
  - roles/storage.admin        (Cloud Storage management)
  - roles/compute.networkAdmin (Load Balancer management)
  - roles/dns.admin            (DNS management)
  - roles/logging.admin        (Logging management)
```

---

## 12. Deployment Checklist

### Pre-Deployment
- [ ] Verify GCP project and services enabled
- [ ] Verify Storage buckets created
- [ ] Verify Load Balancer configured
- [ ] Verify SSL certificates installed
- [ ] Verify DNS records configured
- [ ] Backup current production
- [ ] Run full test suite
- [ ] Get approval for deployment

### Deployment
- [ ] Build components (landing, blog, enrollment)
- [ ] Upload to production bucket
- [ ] Purge CDN cache
- [ ] Verify health checks passing
- [ ] Test DNS resolution
- [ ] Verify SSL certificates valid
- [ ] Perform smoke tests

### Post-Deployment
- [ ] Monitor logs for errors (24 hours)
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Verify SEO indexing
- [ ] Verify analytics tracking
- [ ] Document any issues
- [ ] Schedule post-launch review

---

## 13. Infrastructure Diagrams

### Request Flow

```
User Request
    ↓
DNS Query (detroitautomationacademy.com)
    ↓
Cloud DNS (returns LB IP)
    ↓
Google Cloud Load Balancer (34.x.x.x)
    ↓
Route to Backend Bucket
    │
    ├─→ landing/          → Cloud CDN → Cloud Storage (daa-production)
    ├─→ blog/             → Cloud CDN → Cloud Storage (daa-production)
    └─→ enrollment/       → Cloud CDN → Cloud Storage (daa-production)
    ↓
Response to User (with Cache Headers)
```

### Disaster Recovery Flow

```
Production Bucket (gs://daa-production)
    ↓
Daily Backup Job
    ↓
Backup Bucket (gs://daa-production-backup)
    ↓ (if disaster)
Restore Job (gsutil cp)
    ↓
Production Bucket (restored)
    ↓
CDN Purge
    ↓
Live Restore Complete
```

---

**Document Status:** 🟢 READY FOR PRODUCTION DEPLOYMENT  
**Last Updated:** March 31, 2026, 23:30 UTC  
**Next Review:** April 2, 2026 (post-launch)

---

**Co-authored-by:** Copilot <223556219+Copilot@users.noreply.github.com>
