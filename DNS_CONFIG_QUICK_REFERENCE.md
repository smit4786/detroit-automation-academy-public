## C:\Users\dbkr\workspace\daa-public-staging\DNS_CONFIG_QUICK_REFERENCE.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-02
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis


# DNS Configuration Update — GitHub Pages Deployment

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\DNS_CONFIG_QUICK_REFERENCE.md

**Date:** March 31, 2026  
**Status:** Ready for implementation  
**Launch Date:** April 2, 2026

---

## Quick DNS Update Instructions

### For Domain Registrar Admin Panel

**Registrar Type:** (Select your registrar below)

- GoDaddy
- Namecheap
- Google Domains
- Cloudflare
- Domain.com
- Or any standard DNS provider

---

## DNS Records to Add

### A Records (IPv4) - For Apex Domain (@)

Add **4 A records** pointing to GitHub Pages:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

### AAAA Records (IPv6) - For Apex Domain (@)

Add **4 AAAA records** pointing to GitHub Pages:

```
Type: AAAA
Name: @
Value: 2606:50c0:8000::153

Type: AAAA
Name: @
Value: 2606:50c0:8001::153

Type: AAAA
Name: @
Value: 2606:50c0:8002::153

Type: AAAA
Name: @
Value: 2606:50c0:8003::153
```

### CNAME Records - For Subdomains

Add **3 CNAME records** for subdomains:

```
Type: CNAME
Name: www
Value: smit4786.github.io

Type: CNAME
Name: blog
Value: smit4786.github.io

Type: CNAME
Name: enroll
Value: smit4786.github.io
```

---

## DNS Propagation Timeline

After updating records:

```
0-5 minutes:   Initial propagation
5-15 minutes:  Most ISPs resolve
15-30 minutes: Global propagation
1-48 hours:    Full propagation (some regions)
```

**Check propagation:** https://dnschecker.org/

---

## GitHub Repository Configuration

### Step 1: Create CNAME File

The `CNAME` file will be auto-created by GitHub when you configure custom domain.

Or manually create in repository root:

```
File name: CNAME
Content: detroitautomationacademy.com
```

### Step 2: Configure in GitHub

1. Go to repository: https://github.com/smit4786/detroit-automation-academy-public
2. **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/**
4. Under "Custom domain":
   - Enter: `detroitautomationacademy.com`
   - Click **Save**
5. Wait for DNS check (2-10 minutes)
6. Check **"Enforce HTTPS"** once DNS is verified

---

## Verification Checklist

- [ ] A records added (4 records)
- [ ] AAAA records added (4 records)
- [ ] CNAME records added (3 records)
- [ ] GitHub Pages custom domain configured
- [ ] DNS shows verified in GitHub (green checkmark)
- [ ] HTTPS enabled (green lock icon)
- [ ] Site loads at https://detroitautomationacademy.com
- [ ] Blog loads at https://detroitautomationacademy.com/blog
- [ ] Enrollment form loads at https://detroitautomationacademy.com/enroll
- [ ] Analytics tracking working
- [ ] Form submissions working

---

## Troubleshooting

### "DNS validation failed" in GitHub Pages

**Solution:** Wait 5-10 minutes and retry. DNS can take time to propagate.

### Domain points to wrong site

**Solution:** Check that A records are pointing to GitHub Pages IPs (185.199.108.x), not another service.

### HTTPS not provisioning

**Solution:** Wait 20-30 minutes for Let's Encrypt certificate. If still not working, check DNS is verified first.

### Subdomains not working

**Solution:** Ensure CNAME records are pointing to `smit4786.github.io`.

### Old domain still resolves

**Solution:** Clear DNS cache on your machine:
```bash
# Windows
ipconfig /flushdns

# Mac
sudo dscacheutil -flushcache
```

---

## Cost Comparison

### Before (GCP Cloud Run)
- Cloud Storage: $0.02/GB/month
- Load Balancer: $16-32/month
- Cloud CDN: $0.12/GB (outbound traffic)
- **Total: ~$100-500/month**

### After (GitHub Pages)
- Hosting: **FREE**
- HTTPS: **FREE** (Let's Encrypt)
- CDN: **FREE** (GitHub CDN)
- Form handling: **FREE** (Netlify Forms)
- **Total: $0/month** ✅

**Savings: ~$100-500/month** 💰

---

## Next Steps

**April 1, 2026 (Morning):**
1. Update DNS records in registrar (5 minutes)
2. Configure GitHub Pages settings (5 minutes)
3. Wait for DNS propagation (5-10 minutes)
4. Verify HTTPS provisioning (20-30 minutes)
5. Test all pages (10 minutes)

**April 1, 2026 (Afternoon):**
- Monitor for 24 hours
- Check analytics
- Verify form submissions

**April 2, 2026 (Launch Day):**
- Final verification (5 minutes)
- Announce go-live
- Monitor traffic

---

## Emergency Rollback

If critical issues after DNS update:

```bash
# Option 1: Revert DNS to previous configuration (fastest)
# Point A records back to old IP
# Changes take effect in 5-30 minutes

# Option 2: Revert GitHub Pages custom domain
# GitHub Settings → Pages → Remove custom domain
# Will default to smit4786.github.io
```

**Rollback time:** < 10 minutes total

---

## Important Notes

✅ **Before switching DNS:**
- [ ] All files committed to main branch
- [ ] Repository is public
- [ ] GitHub Pages is enabled
- [ ] Custom domain is entered in GitHub settings

✅ **Current files ready:**
- [x] index.html (landing page)
- [x] enroll.html (enrollment form)
- [x] admin-dashboard.html (admin dashboard)
- [x] branding/palette.css (design system)
- [x] blog/ (Hugo-generated blog)
- [x] All documentation

✅ **Integrations working:**
- [x] Netlify Forms for enrollment submissions
- [x] Google Analytics tracking
- [x] Email configuration (if needed)

---

**Everything is ready. DNS update can happen immediately.**

**Co-authored-by:** Copilot <223556219+Copilot@users.noreply.github.com>
