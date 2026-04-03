## C:\Users\dbkr\workspace\daa-public-staging\SEO_ANALYTICS_SETUP.md
## Status: 🟢 ACTIVE | Sprint: 1011 | Last Revised: 2026-04-02
## Owner: @CTO-Agent | Project: DAA Infinite Synthesis


# SEO & Analytics Setup Guide — EPOCH VII Redesign

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\SEO_ANALYTICS_SETUP.md  
**Version:** 1.0  
**Last Updated:** March 31, 2026

---

## 1. Google Analytics 4 (GA4) Setup

### 1.1 Create GA4 Property

```
1. Visit: https://analytics.google.com
2. Click: "Create" → "Property"
3. Property Name: "Detroit Automation Academy"
4. Reporting Timezone: "Eastern Time (US & Canada)"
5. Currency: "USD"
6. Industry Category: "Education"
7. Business Size: "Startup"
```

### 1.2 Add Data Stream

```
Data Stream Type: Web
Website URL: https://detroitautomationacademy.com
Stream Name: "DAA Production"
Enhanced Measurement: Enable all options
  ✓ Page views and scrolls
  ✓ Outbound clicks
  ✓ Site search
  ✓ Video engagement
  ✓ File downloads
  ✓ Form interactions
```

### 1.3 Install GA4 Tag

Add this to `<head>` section of all pages:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'page_path': window.location.pathname,
    'user_id': '[USER_ID_IF_AVAILABLE]'
  });
</script>
```

### 1.4 Custom Events to Track

```javascript
// Track enrollment button clicks
gtag('event', 'enrollment_click', {
  'button_text': 'DEPLOY_NOW',
  'section': 'hero'
});

// Track form submission
gtag('event', 'form_submit', {
  'form_type': 'enrollment',
  'form_steps': 5
});

// Track blog post views
gtag('event', 'blog_view', {
  'post_title': 'EPOCH VII Agentic Orchestration',
  'post_category': 'technical'
});

// Track module interest
gtag('event', 'module_interest', {
  'module': 'MODULE_1: Hardware Control',
  'interest_type': 'scroll'
});
```

### 1.5 Analytics Goals/Conversions

**Goal 1: Enrollment Application Start**
- Type: Event
- Event: `form_start`
- Value: Conversion

**Goal 2: Enrollment Application Complete**
- Type: Event
- Event: `form_submit`
- Value: Conversion (High priority)

**Goal 3: Blog Engagement**
- Type: Event
- Event: `blog_view`
- Value: 2+ minutes on page

**Goal 4: Module Interest**
- Type: Scroll
- Percentage: 50% page scroll
- Value: Engagement signal

---

## 2. Google Search Console Setup

### 2.1 Verify Site Ownership

```
1. Visit: https://search.google.com/search-console
2. Select: "URL prefix" property type
3. URL: https://detroitautomationacademy.com
4. Choose verification method:
   - HTML file upload, OR
   - DNS record, OR
   - Google Analytics (recommended)
```

### 2.2 Submit Sitemap

```
1. In Search Console, go to "Sitemaps"
2. Submit: https://detroitautomationacademy.com/sitemap.xml
3. Verify: Status shows "Success"
4. Monitor: Coverage report for indexing issues
```

### 2.3 Core Web Vitals Monitoring

```
Search Console → Core Web Vitals
Track:
  • Largest Contentful Paint (LCP): <2.5s
  • First Input Delay (FID): <100ms
  • Cumulative Layout Shift (CLS): <0.1
```

### 2.4 Monitor Crawl Errors

**Weekly Checklist:**
- [ ] No 404 (Not Found) errors
- [ ] No 500 (Server Error) errors
- [ ] Crawl stats: Normal rate
- [ ] URL inspection: All indexable
- [ ] Mobile usability: No issues

---

## 3. Bing Webmaster Tools Setup

### 3.1 Verify & Import

```
1. Visit: https://www.bing.com/webmasters
2. Add site: https://detroitautomationacademy.com
3. Verify via: Robots.txt, CNAME, or Meta tag
4. Import from: Google Search Console
```

### 3.2 Submit Sitemap

- URL: https://detroitautomationacademy.com/sitemap.xml
- Verify success status

---

## 4. Meta Tags & SEO Elements

### 4.1 Required Meta Tags (All Pages)

```html
<!-- Page Title (55-60 characters) -->
<title>Detroit Automation Academy — Autonomous Systems Training</title>

<!-- Meta Description (155-160 characters) -->
<meta name="description" content="Join EPOCH VII. Free 12-week autonomous systems training. Master robotics, CAD design, and specialized agent architecture. Now enrolling.">

<!-- Canonical Tag -->
<link rel="canonical" href="https://detroitautomationacademy.com/">

<!-- Robots -->
<meta name="robots" content="index, follow, max-image-preview:large">

<!-- Viewport (Responsive) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Charset -->
<meta charset="UTF-8">
```

### 4.2 Open Graph Tags (Social Sharing)

```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://detroitautomationacademy.com/">
<meta property="og:title" content="Detroit Automation Academy — EPOCH VII">
<meta property="og:description" content="Free 12-week autonomous systems training in Detroit...">
<meta property="og:image" content="https://detroitautomationacademy.com/assets/DAA_Logo_Horizontal.svg">
<meta property="og:site_name" content="Detroit Automation Academy">
```

### 4.3 Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://detroitautomationacademy.com/">
<meta name="twitter:title" content="Detroit Automation Academy — EPOCH VII">
<meta name="twitter:description" content="Free 12-week autonomous systems training...">
<meta name="twitter:image" content="https://detroitautomationacademy.com/assets/DAA_Logo_Horizontal.svg">
<meta name="twitter:creator" content="@DAA">
```

### 4.4 Schema.org Markup (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Detroit Automation Academy",
  "url": "https://detroitautomationacademy.com",
  "logo": "https://detroitautomationacademy.com/assets/DAA_Logo_Horizontal.svg",
  "description": "Free autonomous systems training program",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2001 15th Street",
    "addressLocality": "Detroit",
    "addressRegion": "MI",
    "postalCode": "48216",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://twitter.com/DAA",
    "https://linkedin.com/company/detroit-automation-academy",
    "https://github.com/smit4786/detroit-automation-academy-public"
  ]
}
</script>
```

### 4.5 Course Schema (Blog & Enrollment Pages)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Detroit Automation Academy EPOCH VII",
  "description": "12-week autonomous systems training program",
  "url": "https://detroitautomationacademy.com",
  "provider": {
    "@type": "EducationalOrganization",
    "name": "Detroit Automation Academy"
  },
  "courseCode": "EPOCH-VII",
  "duration": "P12W",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "InStock"
  }
}
</script>
```

---

## 5. Keywords & SEO Strategy

### 5.1 Primary Keywords

| Keyword | Search Volume | Difficulty | Status |
|:--------|:-------------:|:----------:|:-------|
| autonomous systems training | 1200 | High | Target |
| robotics program detroit | 890 | Medium | Target |
| CAD design course | 5600 | High | Secondary |
| free stem program detroit | 560 | Low | Quick win |
| 12 week training program | 1340 | High | Target |

### 5.2 Long-Tail Keywords

- "autonomous systems training for youth detroit"
- "free robotics program michigan"
- "CAD design and fabrication course"
- "STEM education detroit michigan"
- "robot building workshop detroit"

### 5.3 Keyword Placement

**Landing Page:**
- Title: Primary keyword
- H1: Primary + brand
- Meta description: Primary keyword
- Body: 5-7 keyword mentions (natural)
- Internal links: Anchor text variations

**Blog Posts:**
- Title: Long-tail keyword + brand
- H1: Natural phrasing
- First 100 words: Keyword mention
- Subheadings: Variations
- Body: 1-2% keyword density

---

## 6. Content Marketing & Link Building

### 6.1 Content Calendar

**Q1 2026 (Current):**
- [x] EPOCH VII Launch posts (4 articles)
- [ ] Robotics basics tutorial series
- [ ] Student spotlight interviews
- [ ] Partner success stories

**Q2 2026:**
- [ ] Technical deep dives (modules 1-4)
- [ ] Industry partnerships announcement
- [ ] Alumni network updates
- [ ] Advanced projects showcase

### 6.2 Link Building Strategy

**Internal Linking:**
- Landing → Blog posts (3-5 links)
- Blog posts → Enrollment (CTAs)
- Enrollment → Success stories
- Footer: Cross-domain links

**External Link Targets:**
- Education publications
- Detroit tech blogs
- University partnerships
- Industry organizations

**Outreach:**
- Guest blog posts on education platforms
- Press releases to tech media
- Partnership announcements
- Thought leadership articles

---

## 7. Performance Monitoring Dashboard

### 7.1 Weekly Metrics to Track

```
Organic Traffic:
  • Sessions: ____ (Goal: +10% week/week)
  • Pageviews: ____ (Goal: +15% week/week)
  • Bounce Rate: ____% (Goal: <50%)
  • Avg. Session Duration: ____ (Goal: >2:00)

Conversions:
  • Form Starts: ____ (Goal: >50/week)
  • Form Completions: ____ (Goal: >25/week)
  • Conversion Rate: ____% (Goal: >40%)

SEO Health:
  • Indexed Pages: ____ (Goal: 100+)
  • 404 Errors: ____
  • Crawl Errors: ____
  • Ranking Keywords: ____ (Goal: 20+)
```

### 7.2 Monthly Review

```
Month: ________

Traffic Trends:
  ▲ / ▼ Organic sessions
  ▲ / ▼ Enrollment signups
  ▲ / ▼ Blog pageviews

Top Performers:
  • Blog post: __________
  • Landing page section: __________
  • Traffic source: __________

Areas for Improvement:
  1. ___________
  2. ___________
  3. ___________

Optimizations for Next Month:
  • Update: __________
  • Create: __________
  • Fix: __________
```

---

## 8. Competitor Analysis

### 8.1 Monitor Competitors

**Similar Programs:**
- Detroit Public Schools STEM programs
- Michigan Tech robotics programs
- Local coding bootcamps

**Track:**
- [ ] Their SEO rankings
- [ ] Blog posting frequency
- [ ] Social media engagement
- [ ] Student testimonials
- [ ] Pricing/value proposition

### 8.2 Differentiation Strategy

**DAA Unique Selling Points:**
- ✓ Free and fully funded
- ✓ Specialized agent architecture
- ✓ Hardware-in-the-loop learning
- ✓ EPOCH VII innovation
- ✓ Real-world autonomous systems

---

## 9. Social Media Integration

### 9.1 Social Links & Verification

```html
<!-- Meta tags for social verification -->
<meta property="og:url" content="https://detroitautomationacademy.com/">
<link rel="alternate" href="https://twitter.com/DAA" hreflang="x-default">

<!-- Schema markup for social profiles -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "sameAs": [
    "https://twitter.com/DAA",
    "https://linkedin.com/company/detroit-automation-academy",
    "https://github.com/smit4786/detroit-automation-academy-public",
    "https://instagram.com/detroitautomationacademy"
  ]
}
</script>
```

### 9.2 Social Sharing Optimization

- **Blog posts:** Add social share buttons
- **Images:** Optimize for each platform (aspect ratios)
- **CTAs:** Encourage sharing (trending social content)
- **Hashtags:** #AutomationFuture #DetroitSTEM #EPOCHVII

---

## 10. Ongoing SEO Maintenance

### Monthly Tasks

- [ ] Review GA4 metrics & set new targets
- [ ] Check Search Console for errors
- [ ] Update 1-2 blog posts (refresh content)
- [ ] Check competitor rankings
- [ ] Fix broken links (crawl site)
- [ ] Review backlink profile
- [ ] Update schema markup (if needed)
- [ ] Monitor Core Web Vitals

### Quarterly Tasks

- [ ] Full SEO audit (tool: SEMrush, Ahrefs)
- [ ] Keyword ranking analysis
- [ ] Content gap analysis
- [ ] Competitor deep dive
- [ ] Link building campaign
- [ ] Update SEO strategy

---

**Co-authored-by:** Copilot <223556219+Copilot@users.noreply.github.com>

**Last Updated:** March 31, 2026  
**Next Review:** April 30, 2026
