## C:\Users\dbkr\workspace\daa-public-staging\MIGRATION_GUIDE.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-02
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis


# Content Migration Guide — EPOCH VII Redesign

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\MIGRATION_GUIDE.md  
**Version:** 1.0  
**Last Updated:** March 31, 2026

---

## Purpose

This guide helps the DAA team migrate existing content to the new EPOCH VII agentic theme. It covers HTML pages, blog posts, images, and digital assets.

---

## 1. Pre-Migration Checklist

- [ ] Backup all existing content (git commit)
- [ ] Export analytics baseline (Google Analytics, SearchConsole)
- [ ] Document current URL structure
- [ ] List all internal links and redirects needed
- [ ] Review existing blog posts for updates
- [ ] Audit images and assets
- [ ] Prepare team for content updates

---

## 2. HTML Pages Migration

### 2.1 Existing HTML Pages to Migrate

| Page | Current Location | New Location | Status |
|:-----|:-----------------|:-------------|:-------|
| Landing | index.html | index.html (updated) | ✅ Complete |
| Dashboard | dashboard.html | dashboard.html | Review needed |
| Students | students.html | students.html | Review needed |
| Instructors | instructors.html | instructors.html | Review needed |
| Partners | partners.html | partners.html | Review needed |
| Admin | admin.html | admin.html | Review needed |

### 2.2 Template Updates

**For each page, apply these updates:**

1. **Head Section:**
   ```html
   <!-- Add file location comment -->
   <!-- File Location: [path]
        Purpose: [description]
        Last Modified: March 31, 2026
   -->
   
   <!-- Update meta tags for EPOCH VII -->
   <meta name="description" content="EPOCH VII: [Page description]">
   
   <!-- Add schema markup -->
   <script type="application/ld+json">
   { "@context": "schema.org", "@type": "WebPage", ... }
   </script>
   ```

2. **Navigation:**
   ```html
   <!-- Update nav links to match landing page style -->
   <li><a href="index.html">🏠 Home</a></li>
   <li><a href="https://blog.detroitautomationacademy.com">📝 Blog</a></li>
   ```

3. **Styling:**
   - Use `branding/palette.css` variables
   - Neon cyan for primary accents
   - Terminal monospace typography
   - Dark mode (--daa-bg: #050507)

4. **Content:**
   - Replace "Phase" with "Module"
   - Update to "Agent" terminology
   - Add EPOCH VII context
   - Include system status indicators

5. **Footer:**
   ```html
   <p>© 2026 Detroit Automation Academy. 
      Powered by Automated Technologies.
      <a href="https://status.detroitautomationacademy.com">System Status</a></p>
   ```

### 2.3 Migration Script

```bash
#!/bin/bash
# Migrate HTML files to EPOCH VII theme

for file in students.html instructors.html partners.html admin.html; do
    echo "Migrating $file..."
    
    # Add file location comment
    sed -i '1s/^/<!-- File Location: C:\\Users\\dbkr\\workspace\\daa-public-staging\\'"$file"' -->\n/' "$file"
    
    # Update CSS link
    sed -i 's|<link.*palette.css.*>|<link rel="stylesheet" href="branding/palette.css">|' "$file"
    
    # Update terminology
    sed -i 's/Phase /MODULE_/g' "$file"
    sed -i 's/Student/STUDENT_AGENT/g' "$file"
    
    echo "✓ $file migrated"
done
```

---

## 3. Blog Content Migration (Hugo)

### 3.1 Current Blog Structure

```
blog-source/
├── content/
│   └── en/posts/          # Existing markdown files
├── layouts/
├── static/
└── themes/
```

### 3.2 Existing Posts to Review

**Posts to Refresh:**

1. **pause-and-pivot-protocol.md**
   - Add EPOCH VII context
   - Update "Digital Stoicism" to agent framework
   - Add link to new posts

2. **infrastructure-evolution-2026-02-28.md**
   - Update to reference EPOCH VII deployment
   - Add system status metrics
   - Link to Michigan Central deep dive

3. **ecosystem-synergy-update.md**
   - ✅ Already refreshed → `ecosystem-synergy-epoch-vii.md`

4. **introducing-project-sonic.md**
   - Review relevance to EPOCH VII
   - Update terminology if needed
   - Consider archiving if outdated

### 3.3 New Posts Added

```
✅ epoch-vii-agentic-orchestration.md
✅ specialized-agent-architecture.md
✅ michigan-central-infrastructure-deep-dive.md
✅ ecosystem-synergy-epoch-vii.md
```

### 3.4 Post Template Updates

**Frontmatter (YAML):**
```yaml
---
title: "[EPOCH VII]: [Post Title]"
date: 2026-03-31T12:00:00-05:00
draft: false
tags: ["EPOCH-VII", "Agentic-Systems", "Technical"]
categories: ["Technical", "Educational-Framework"]
author: "Justin Smith"
featured_image: "/images/daa-logo.svg"
description: "EPOCH VII context. Technical summary."
---
```

**Content Style:**
- Lead with system status ("> // [STATUS]")
- Use markdown tables for metrics
- Include code blocks for technical details
- End with enrollment CTA
- Add "Powered by Automated Technologies" footer

### 3.5 Hugo Build & Test

```bash
# Navigate to blog source
cd blog-source

# Build locally to verify
hugo server -D

# Check output at http://localhost:1313

# Build for production
hugo -d ../dist/blog --minify

# Verify output
ls -la ../dist/blog/index.html
```

---

## 4. Image & Asset Migration

### 4.1 Asset Inventory

**Required Assets:**

```
assets/
├── DAA_Logo_Horizontal.svg       ✓ Exists
├── DAA_Logo_Vertical.svg         ✓ Exists
├── favicon.ico                   ☐ Create if missing
├── og-image.png                  ☐ Create (1200x630)
├── circuit-pattern.svg           ✓ In CSS
└── brand-images/
    ├── michigan-central.jpg      ☐ Optimize
    ├── students-training.jpg     ☐ Optimize
    └── hardware-setup.jpg        ☐ Optimize
```

### 4.2 Image Optimization

```bash
#!/bin/bash
# Optimize images for web

for file in assets/*.jpg; do
    echo "Optimizing $file..."
    
    # Resize to 1920x1080 max
    convert "$file" -resize 1920x1080 "$file"
    
    # Reduce quality to 85%
    convert "$file" -quality 85 "$file"
    
    # Create WebP version
    convert "$file" "${file%.jpg}.webp"
    
    echo "✓ $file optimized"
done
```

### 4.3 Asset File Locations

```
branding/
├── palette.css                   ✓ EPOCH VII colors
├── DAA_Logo_Horizontal.svg       ✓ Navigation logo
└── DAA_Logo_Vertical.svg         ✓ Footer logo

assets/
├── images/                       (store web images)
│   └── daa-logo.svg             ✓ Blog featured image
└── downloads/                    (for PDFs, resources)
```

---

## 5. URL Redirects & SEO

### 5.1 301 Redirects (if URLs change)

**`.htaccess` Example:**

```apache
# EPOCH VII Redesign Redirects

# Old blog posts to new locations (if applicable)
Redirect 301 /old-post/ /blog/new-post/
Redirect 301 /phase-guides/ /blog/modules/

# Maintain blog domain structure
Redirect 301 /blog/index.html https://blog.detroitautomationacademy.com/

# Enroll page redirect
Redirect 301 /enroll/ https://enroll.detroitautomationacademy.com/
```

**Or in `netlify.toml`:**

```toml
[[redirects]]
from = "/old-post/*"
to = "/blog/new-post/:splat"
status = 301

[[redirects]]
from = "/blog"
to = "https://blog.detroitautomationacademy.com/"
status = 301
```

### 5.2 Canonical Tags

Ensure all pages have canonical tags:

```html
<link rel="canonical" href="https://detroitautomationacademy.com/students">
```

### 5.3 Submit Updated Sitemap

```bash
# Generate new sitemap
hugo -d dist --minify
# Then manually add to sitemap.xml

# Submit to Google Search Console
curl "https://www.google.com/ping?sitemap=https://detroitautomationacademy.com/sitemap.xml"

# Submit to Bing
curl "https://www.bing.com/ping?sitemap=https://detroitautomationacademy.com/sitemap.xml"
```

---

## 6. Form & Data Migration

### 6.1 Existing Forms

| Form | Current Location | Action |
|:-----|:---------------:|:-------|
| Enrollment | /enroll | ✅ Updated (enroll.html) |
| Newsletter | Mailchimp | Update template |
| Contact | /contact | Review for EPOCH VII theme |

### 6.2 Netlify Forms Integration

**Enrollment Form** (already configured):

```html
<!-- enroll.html -->
<form name="enrollment" method="POST" netlify>
    <!-- Fields already set up -->
</form>
```

**Verification Steps:**

```bash
# Check Netlify has form endpoints
# In Netlify dashboard:
# Forms → Submissions → Verify "enrollment" form appears

# Test submission in staging
curl -X POST https://[staging-url]/enroll.html \
  -d "firstName=Test&lastName=User&email=test@example.com"
```

---

## 7. Database & Content Management

### 7.1 Student/Alumni Data

**Consider Creating:**
- Student progress tracking database
- Alumni network registry
- Project portfolio storage

**Setup:**

```bash
# Use Cloud Firestore (recommended for Firebase integration)
gcloud firestore databases create \
  --location=us-central1 \
  --type=datastore-mode

# Collections to create:
# - students (enrollment records)
# - alumni (post-graduation)
# - projects (student work)
# - partners (institutional)
```

### 7.2 CMS Alternative (Optional)

Consider Contentful, Strapi, or Netlify CMS for content management:

```yaml
# netlify.toml (for Netlify CMS)
[build]
  command = "npm run build"
  functions = "functions"
  publish = "dist"

[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
```

---

## 8. Testing Checklist

### 8.1 Pre-Launch Testing

- [ ] All links functional (internal & external)
- [ ] Images load correctly
- [ ] Forms submit successfully
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] CSS loads (no broken styling)
- [ ] Analytics events fire
- [ ] 301 redirects work
- [ ] Canonical tags present
- [ ] Meta tags updated

### 8.2 Performance Testing

```bash
# Lighthouse
lighthouse https://detroitautomationacademy.com --view

# PageSpeed Insights
# https://pagespeed.web.dev/

# WebPageTest
# https://www.webpagetest.org/
```

### 8.3 SEO Testing

- [ ] Google Search Console: No errors
- [ ] Bing Webmaster Tools: No errors
- [ ] Structured data: Valid JSON-LD
- [ ] Mobile-friendly: Passes test
- [ ] Core Web Vitals: All green

---

## 9. Content Calendar for Post-Migration

### Week 1 (April 1-7)
- [ ] Monitor analytics post-launch
- [ ] Fix any migration issues
- [ ] Publish success announcement
- [ ] Social media campaign

### Week 2-4 (April 8-30)
- [ ] Refresh 2 older blog posts
- [ ] Student spotlight interview
- [ ] Partner success story
- [ ] Technical tutorial

### Month 2 (May)
- [ ] Advanced module guides
- [ ] Industry partnership update
- [ ] Performance optimization pass
- [ ] SEO improvement push

---

## 10. Rollback Plan

**If issues occur post-migration:**

1. **Immediate rollback:**
   ```bash
   git revert [commit-hash]
   git push production
   ```

2. **Restore from backup:**
   ```bash
   gsutil -m cp -r gs://backup/daa-prod/* .
   ./deploy.sh production all
   ```

3. **Communicate:**
   - Notify team
   - Update status page
   - Send user communication

---

## 11. Team Checklist

**Content Team:**
- [ ] Review all HTML page updates
- [ ] Update blog post terminology
- [ ] Create new featured images
- [ ] Proofread all content

**Technical Team:**
- [ ] Build Hugo site locally
- [ ] Test all forms
- [ ] Verify redirects
- [ ] Deploy to staging

**Marketing/Comms:**
- [ ] Update email templates
- [ ] Create launch announcement
- [ ] Plan social media posts
- [ ] Brief support team

**QA:**
- [ ] Full regression testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility audit

---

**Co-authored-by:** Copilot <223556219+Copilot@users.noreply.github.com>

**Last Updated:** March 31, 2026  
**Migration Window:** April 1-7, 2026
