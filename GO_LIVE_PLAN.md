# EPOCH VII Go-Live Action Plan

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\GO_LIVE_PLAN.md  
**Created:** March 31, 2026, 23:21 UTC  
**Status:** READY FOR EXECUTION

---

## Timeline & Execution

### **PHASE 1: STAGING DEPLOYMENT** (April 1, 2026)

#### Pre-Deployment (6:00 AM)
- [ ] **Backup:** `git tag release-v1.0-epoch-vii && git push --tags`
- [ ] **Export baseline:** Screenshot current analytics dashboard
- [ ] **Notify team:** Send deployment window notification
- [ ] **Test all links:** Run link checker on staging
- [ ] **Verify credentials:** GCP auth, Netlify token, DNS access

#### Deployment (7:00 AM)
```bash
# Execute deployment script
cd C:\Users\dbkr\workspace\daa-public-staging
./scripts/deploy.sh staging all

# Verify upload
gsutil ls gs://daa-staging/
```

#### Post-Deployment Verification (7:30 AM)
- [ ] **Landing page:** https://staging.detroitautomationacademy.com → loads in <1s
- [ ] **Blog:** Check landing page blog link works
- [ ] **Enrollment:** https://enroll-staging.detroitautomationacademy.com → form loads
- [ ] **Forms test:** Submit test enrollment, verify Netlify receives submission
- [ ] **DNS check:** Staging domain resolves correctly
- [ ] **SSL/TLS:** Check certificate valid
- [ ] **Lighthouse audit:** Run on each page, target >90 scores
- [ ] **Mobile test:** Test on iPhone/Android simulators
- [ ] **Accessibility:** Run Wave or Axe accessibility audits

#### Staging Monitoring (April 1, Full Day)
- [ ] **Hourly:** Check error logs (Cloud Logging)
- [ ] **Every 2 hours:** Manual page load test from 3 geographic locations
- [ ] **End of day:** Collect metrics snapshot

---

### **PHASE 2: PRODUCTION DEPLOYMENT** (April 2, 2026)

#### Pre-Production (6:00 AM)
- [ ] **Code review:** Team reviews all changes
- [ ] **QA sign-off:** Staging deployment verified stable (24 hours)
- [ ] **Stakeholder sign-off:** CEO/leadership approves go-live
- [ ] **Rollback plan brief:** Ensure team knows rollback procedure
- [ ] **Monitor prep:** Set up PagerDuty alerts or similar

#### Deployment (9:00 AM)
```bash
# Production deployment
./scripts/deploy.sh production all

# Purge CDN
gsutil acl ch -d AllUsers gs://daa-production
gcloud compute backend-services update daa-api --global --enable-cdn
```

#### Immediate Post-Deployment (9:15 AM)
- [ ] **Production access:** Verify https://detroitautomationacademy.com loads
- [ ] **All subdomains:** Test blog.*, enroll.* DNS
- [ ] **Search Console:** Submit sitemap again
- [ ] **Twitter/LinkedIn:** Post launch announcement
- [ ] **Broadcast:** Email to waitlist about launch

#### Production Monitoring (April 2, Full Day)
```
🔴 CRITICAL MONITORING CHECKLIST:

Every 15 minutes (first 2 hours):
  ✓ Landing page loads (curl https://detroitautomationacademy.com)
  ✓ Enrollment form submits test entry
  ✓ Blog posts load
  ✓ No 5xx errors in logs

Every 30 minutes (hours 2-8):
  ✓ Google Analytics events firing
  ✓ Form submissions arriving in Netlify
  ✓ Core Web Vitals stable

Hourly (24 hours):
  ✓ Organic traffic growth
  ✓ Error rates stable
  ✓ Response times consistent
```

---

### **PHASE 3: SUSTAINED OPERATIONS** (April 3+)

#### Daily (First Week)
- [ ] **Morning:** Review overnight analytics
- [ ] **Midday:** Check form submissions + student signups
- [ ] **Evening:** Monitor error logs

#### Weekly (Ongoing)
- [ ] **Monday:** Analytics review + SEO ranking check
- [ ] **Wednesday:** Content performance review
- [ ] **Friday:** Prepare weekly metrics report

#### Monthly (Ongoing)
- [ ] **1st:** SEO audit + keyword rankings
- [ ] **15th:** Content calendar planning
- [ ] **28th:** Performance optimization pass

---

## Key Metrics to Track

### Launch Day Targets (April 2)
```
✅ Landing page pageviews: 100+
✅ Enrollment form starts: 15+
✅ Enrollment form completions: 5+
✅ Blog page visits: 30+
✅ Bounce rate: <50%
✅ Avg session duration: >1:30
✅ Zero 5xx errors
✅ 99.9% uptime
```

### First Week Targets (April 3-9)
```
✅ Total organic traffic: 300+ sessions
✅ Enrollment conversions: 25+ completed
✅ Google indexing: 50+ pages indexed
✅ Ranking keywords: 10+ keywords ranking top 50
✅ Blog average time on page: >1:00 per post
✅ Core Web Vitals: All green
```

### First Month Targets (April 2-30)
```
✅ Total organic sessions: 1,500+
✅ Total enrollments: 75+
✅ Average monthly pageviews: 5,000+
✅ Ranking keywords: 25+ keywords ranking top 50
✅ Avg. ranking position: <20
✅ Enrollment-to-inquiry ratio: 30%+
```

---

## Communication Plan

### Before Launch (March 31)
```
EMAIL TEMPLATE: "EPOCH VII Launch Coming Tomorrow"

Subject: 🚀 EPOCH VII Launch Tomorrow — Detroit Automation Academy Redesign

Hi [Name],

Tomorrow (April 2) at 9:00 AM ET, we're launching the complete 
EPOCH VII redesign of detroitautomationacademy.com.

What's new:
• New agentic-themed landing page with system status indicators
• 4 new technical blog posts about our autonomous training model
• Enhanced enrollment form with interest tracking
• Streamlined, faster experience

The site will remain fully functional during the launch. If you 
notice anything unusual, please report to [support email].

See you tomorrow!
—Team DAA
```

### Launch Day (April 2)
```
SOCIAL POSTS:

🚀 Tweet (8:30 AM):
"EPOCH VII is live. New @DAA website with agentic training model, 
technical deep-dives, and faster enrollment. Explore now → 
https://detroitautomationacademy.com #AutomationFuture"

📝 LinkedIn (10:00 AM):
"Introducing EPOCH VII: Our complete redesign is live. Autonomous 
systems training, specialized agents, and Michigan Central deployment. 
Read the technical breakdown → [blog link]"

📢 Discord/Slack:
"🚀 EPOCH VII launch successful! Check out the new site and blog posts."
```

### Post-Launch (April 3+)
```
• Daily: Update team Slack with metrics
• Weekly: Email stakeholders metrics summary
• Blog: Cross-post to Medium, Dev.to for reach
• Reddit: Share technical posts to r/education, r/robotics
```

---

## Rollback Procedures

### If Critical Issue Occurs

**Rollback Level 1 (5 minutes):** Serve previous version from backup bucket
```bash
gsutil rsync -r gs://daa-production-backup/* gs://daa-production/
gcloud compute backend-services update daa-api --purge-cdn
```

**Rollback Level 2 (15 minutes):** Restore from git tag
```bash
git revert v1.0-epoch-vii
git push production
./deploy.sh production all
```

**Rollback Level 3 (1 hour):** Full service restore from infrastructure snapshot
```bash
gcloud compute instances create daa-backup-restore --source-instance-template=daa-template-backup
```

### Rollback Checklist
- [ ] Notify stakeholders immediately (Slack + email)
- [ ] Execute rollback command
- [ ] Verify old version is live
- [ ] Post status update (status.detroitautomationacademy.com)
- [ ] Investigate root cause
- [ ] Fix issue in staging
- [ ] Wait 24 hours before re-deploying

---

## Crisis Response Plan

### Scenario 1: Site Completely Down
```
Impact: Complete service outage
Response time: <5 minutes

1. ✅ ACTIVATE: Declare incident in #incident Slack channel
2. ✅ NOTIFY: Page on-call engineer
3. ✅ COMMUNICATE: Post status.detroitautomationacademy.com
4. ✅ ASSESS: Check Cloud Logging, Cloud Console
5. ✅ ROLLBACK: Execute if needed
6. ✅ INVESTIGATE: Root cause analysis
7. ✅ COMMUNICATE: Update status page every 15 minutes
8. ✅ CLOSE: Post-incident review within 24 hours
```

### Scenario 2: Form Submissions Not Working
```
Impact: Users can't enroll
Response time: <15 minutes

1. ✅ VERIFY: Test form manually
2. ✅ CHECK: Netlify form submissions dashboard
3. ✅ TEST: Send test email from form
4. ✅ NOTIFY: Netlify support if needed
5. ✅ WORKAROUND: Post fallback email enrollment on site
6. ✅ MONITOR: Check every 5 minutes until resolved
7. ✅ COMMUNICATE: "Enrollment form temporarily online, email alternative available"
8. ✅ RESTORE: Confirm form working, remove workaround message
```

### Scenario 3: High Error Rate (4xx/5xx errors)
```
Impact: Pages failing to load for 10%+ of users
Response time: <10 minutes

1. ✅ ASSESS: Check error logs in Cloud Logging
2. ✅ IDENTIFY: Most common error (404, 503, etc.)
3. ✅ TRIAGE: Page or service issue?
4. ✅ FIX: Either redeploy or rollback
5. ✅ VERIFY: Error rate drops below 1%
6. ✅ INVESTIGATE: Why did this happen?
```

---

## Team Responsibilities

### Deployment Lead (Justin Smith / CTO)
- [ ] Approve final go-live decision
- [ ] Execute deployment commands
- [ ] Monitor first 2 hours actively
- [ ] Be on-call for 48 hours post-launch

### DevOps Engineer
- [ ] Verify GCP infrastructure
- [ ] Configure DNS/CDN
- [ ] Set up monitoring alerts
- [ ] Execute rollback if needed

### QA Lead
- [ ] Final staging verification
- [ ] Run accessibility audit
- [ ] Performance testing
- [ ] Sign-off on go-live

### Marketing/Communications
- [ ] Send pre-launch emails
- [ ] Post social media announcements
- [ ] Update website status page
- [ ] Respond to user inquiries

---

## Success Criteria

**Launch is successful if:**
- ✅ Zero 5xx errors in first 24 hours
- ✅ 99.9%+ uptime in first 24 hours
- ✅ All pages load in <2 seconds average
- ✅ Form submissions working 100%
- ✅ Analytics tracking correctly
- ✅ Positive user feedback on social media
- ✅ No critical issues requiring rollback

**Launch is NOT successful if:**
- ❌ More than 2 critical bugs found
- ❌ Uptime falls below 99% in first 24 hours
- ❌ Form functionality broken for >1 hour
- ❌ Multiple rollback attempts needed
- ❌ Security issues discovered
- ❌ Data loss or corruption

---

## Post-Launch Review (April 10)

### All-Hands Retrospective
```
Meeting: 3:00 PM ET, April 10, 2026

Agenda:
1. Launch metrics review (30 min)
   - Traffic stats
   - Conversion metrics
   - Performance data
   - User feedback

2. What went well (15 min)
   - Highlight successes
   - Recognize team effort

3. What could improve (15 min)
   - Issues encountered
   - Lessons learned
   - Process improvements

4. Next steps (10 min)
   - Phase 3 priorities
   - Ongoing optimization
   - Timeline for Phase 3

Decision: Proceed with Phase 3 or stabilize current version?
```

---

## Approvals & Sign-Off

| Role | Name | Signature | Date |
|:-----|:----:|:---------:|:----:|
| CEO | Justin Smith | _____ | 3/31/26 |
| CTO | [CTO Name] | _____ | 3/31/26 |
| DevOps Lead | [DevOps] | _____ | 3/31/26 |
| QA Lead | [QA] | _____ | 3/31/26 |

---

**Approved for Production Deployment: ✅ YES**

**Target Go-Live Date: April 2, 2026, 9:00 AM ET**

---

**Co-authored-by:** Copilot <223556219+Copilot@users.noreply.github.com>

**Contact:** support@detroitautomationacademy.com  
**Status Page:** https://status.detroitautomationacademy.com
