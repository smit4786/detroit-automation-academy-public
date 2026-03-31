# Brand Guidelines — EPOCH VII Agentic Theme
## Detroit Automation Academy

**File Location:** C:\Users\dbkr\workspace\daa-public-staging\BRAND_GUIDELINES.md  
**Version:** 1.0 (EPOCH VII)  
**Last Updated:** March 31, 2026

---

## 1. Brand Identity

### Mission
Detroit Automation Academy synthesizes autonomous systems education with urban renewal. We transform Detroit youth into specialized agents capable of real-world impact through robotics, CAD design, and autonomous systems architecture.

### Vision
EPOCH VII: A fully orchestrated autonomous ecosystem where educational agents, alumni agents, and industry agents collaborate to advance Detroit's standing as a global automation hub.

### Core Values
- **Autonomy:** Self-directed, agent-based learning
- **Governance:** Responsible innovation with ethical frameworks
- **Community:** Built by Detroit, for Detroit
- **Excellence:** Enterprise-grade technical standards
- **Transparency:** Open-source and publicly accountable

---

## 2. Visual Identity

### Logo Usage
- **Primary:** DAA_Logo_Horizontal.svg (preferred for web)
- **Secondary:** DAA_Logo_Vertical.svg (for narrow spaces)
- **Minimum Size:** 120px width
- **Clear Space:** 20px minimum on all sides
- **Don't:** Distort, rotate, or modify colors

### Color Palette

#### Primary Colors (Agentic Systems)
```
Neon Cyan:     #00f0ff (Primary accents, links, glows)
Cyber Green:   #39ff14 (Secondary accents, success states)
Deep Charcoal: #050507 (Background, maximizes neon contrast)
Light Gray:    #f8fafc (Text, high contrast)
```

#### Secondary Colors (Specialized Agents)
```
Purple/Lavender: #BB6EE7 (Student-facing interactive elements)
Muted Gray:      #94a3b8 (Secondary text, descriptions)
Dark Panel:      #161b22 (Card backgrounds)
Border:          rgba(0, 240, 255, 0.2) (Subtle dividers)
```

#### Functional Colors
```
Success Green:   #52A300 (Confirmations, deployment success)
Warning Amber:   #ffcc00 (Caution, incomplete states)
Danger Red:      #ff3333 (Errors, critical alerts)
Info Blue:       #0066cc (Informational, neutral states)
```

### Color Usage Guidelines

**Do:**
- Use neon cyan for primary CTAs and focus states
- Use cyber green for secondary actions and notifications
- Use purple sparingly for special interactive elements
- Maintain high contrast for accessibility (WCAG AAA)

**Don't:**
- Use cyan and green together (creates visual noise)
- Apply colors to text body (limit to headings, accents)
- Use colors to convey information alone (add text labels)
- Mix with pastels or desaturated colors

---

## 3. Typography

### Font Stack
```css
/* Primary: Monospace Terminal Aesthetic */
font-family: 'Courier New', Courier, monospace;

/* Fallback: System monospace */
font-family: 'Courier New', 'Courier', monospace;
```

### Type Scale

| Element | Size | Weight | Usage |
|:--------|:----:|:------:|:------|
| **H1 (Hero)** | 3.8rem | 800 | Page headings, major sections |
| **H2 (Section)** | 2.2rem | 800 | Section headings, article titles |
| **H3 (Subsection)** | 1.5rem | 700 | Content subsections |
| **Body Text** | 16px | 400 | Main content |
| **Small Text** | 14px | 400 | Descriptions, captions |
| **Tiny Text** | 12px | 600 | Labels, metadata |
| **Code/Terminal** | 14px | 400 | Code blocks, terminal output |

### Type Guidelines

**Headings:**
- Transform: UPPERCASE
- Letter-spacing: 1-2px (wider for visual impact)
- Color: Neon cyan (#00f0ff) or light gray
- Avoid: Multiple heading styles on same page

**Body Text:**
- Line-height: 1.6–1.8 (readability)
- Max width: 600–800px (column width)
- Color: Light gray (#f8fafc)
- Avoid: All caps body text, excessive letter-spacing

**Terminal/Code:**
- Font-family: 'Courier New' (consistent with theme)
- Background: Slightly darker panel (#0a0a0c)
- Border: Subtle cyan border or glow
- Line-height: 1.5 (code readability)

---

## 4. Messaging Framework

### Voice & Tone

**Brand Voice:**
- Authoritative (we know autonomous systems)
- Futuristic (EPOCH VII language)
- Technical (but accessible to students)
- Optimistic (Detroit innovation)

**Tone by Context:**

| Context | Tone | Example |
|:--------|:-----|:--------|
| **CTAs** | Command-style, urgent | "DEPLOY_NOW()" |
| **Technical** | Precise, detailed | "GPIO Protocol Orchestration" |
| **Student-facing** | Encouraging, clear | "Join 500+ agents" |
| **Status** | System-level, metrics | "SYS_STATUS: ACTIVE" |

### Messaging Pillars

#### 1. Autonomy
*"Specialized agent architecture for real-world impact"*
- Student agents synthesize skills through hardware-in-the-loop learning
- Autonomous systems architecture beyond traditional robotics
- Self-directed learning with adaptive curriculum

#### 2. Innovation
*"Built by Detroit, for Detroit"*
- Local manufacturing integration
- Community partnership focus
- Enterprise-grade technical standards

#### 3. Impact
*"500+ alumni nodes in the autonomous ecosystem"*
- Measurable outcomes (100% deployment success)
- Career readiness and advancement
- Industry relevance and scaling

### Terminology Guidelines

**Use:**
- "Autonomous systems" (not just "robotics")
- "Specialized agents" (not "students")
- "EPOCH VII" (not "Phase 7")
- "Module" (not "Phase" or "Unit")
- "Deployment" (not "launch" or "rollout")
- "Protocol" (for processes)
- "Nodes" (for alumni/participants)

**Avoid:**
- Generic tech buzzwords
- Corporate-speak
- Overly casual slang
- Jargon without explanation

---

## 5. Design System

### Layout & Spacing

**Grid System:**
- Max-width: 1200px (desktop)
- Responsive breakpoints: 1200px, 900px, 768px, 640px
- Padding: 32px (desktop), 20px (mobile)
- Gap/margins: Multiples of 8px (8, 16, 24, 32, 40, 48, 56, 64)

**Card Styling:**
- Background: rgba(22, 22, 26, 0.65) (semi-transparent panels)
- Border: 1px solid rgba(0, 240, 255, 0.2)
- Border-radius: 16px (generous curves)
- Padding: 32px (interior spacing)
- Backdrop-filter: blur(12px) (frosted glass effect)

### Button Styles

**Primary Button:**
```css
background: linear-gradient(135deg, #00f0ff 0%, #39ff14 100%);
color: #050507 (dark text on bright gradient);
padding: 14px 40px;
border-radius: 10px;
box-shadow: 0 4px 20px rgba(0, 240, 255, 0.35);
text-transform: uppercase;
font-weight: 700;
```

**Secondary Button:**
```css
background: transparent;
color: #f8fafc;
border: 1px solid rgba(0, 240, 255, 0.2);
padding: 14px 40px;
border-radius: 10px;
hover: border-color → #00f0ff, background → rgba(0, 240, 255, 0.05);
```

### Focus & Hover States

**Link Hover:**
```css
color: #00f0ff;
text-shadow: 0 0 5px rgba(0, 240, 255, 0.35);
transition: all 0.2s ease;
```

**Input Focus:**
```css
outline: none;
border-color: #00f0ff;
background: rgba(0, 240, 255, 0.05);
box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
```

---

## 6. Photography & Imagery

### Style Guidelines
- **Primary:** SVG logos and vector graphics
- **Secondary:** High-contrast, dark backgrounds
- **Tertiary:** Real hardware photos (robotics, fabrication equipment)

### Requirements
- Neon glow effects on avatars/icons
- Dark backgrounds to showcase bright accents
- High contrast (WCAG AAA minimum)
- No gradients unless blue-to-green spectrum

### Usage
- Hero sections: Abstract tech/circuit visuals
- Content cards: Monochromatic with neon accents
- Blog posts: Technical diagrams and system architecture
- Avoid: Stock photos, soft pastels, low-contrast imagery

---

## 7. Content Standards

### Writing for EPOCH VII

**Blog Posts:**
- Headline: Terminal-style prefixes ("> //") for tech pieces
- Intro: Establish system status or epoch context
- Body: Technical accuracy with accessible language
- Metrics: Include deployment success rates, node counts
- Footer: Reference system status or next epoch

**Landing Page:**
- Lead: Action-oriented, system language
- Benefits: Quantified (100%, 500+, 12 weeks)
- Proof: Alumni nodes, deployment success
- CTA: Command-style buttons (DEPLOY_NOW())

**Forms:**
- Labels: UPPERCASE, system-style ("PERSONAL_AGENT_CONFIGURATION")
- Placeholders: Specific examples
- Help text: Brief, security-first
- Confirmation: System status language

---

## 8. Accessibility Standards

### Contrast
- **WCAG AAA:** All text 7:1+ contrast ratio
- **Neon cyan on black:** 16:1 (excellent)
- **Light gray on charcoal:** 14:1 (excellent)
- Test with tools: WebAIM, WAVE, Lighthouse

### Typography
- **Minimum size:** 14px body text
- **Line height:** 1.6–1.8 for readability
- **Letter spacing:** Normal (0) for body, 1–2px for headers
- **Avoid:** All caps for body text (use for headers only)

### Interactive
- **Focus indicators:** Visible, high contrast
- **Keyboard navigation:** Tab order logical and complete
- **Touch targets:** Minimum 44×44px
- **Form labels:** Always present, not placeholder-only

---

## 9. Usage Examples

### Email Templates
```html
Subject: >> // EPOCH_VII: New Agent Opportunities

Dear [Student Name],

SYS_STATUS: ACTIVE // ENROLLMENT_AVAILABLE

Your autonomous learning journey awaits...
[CTA: ACTIVATE_ENROLLMENT() →]
```

### Social Media
```
Twitter: "🤖 SYS_STATUS: ACTIVE | 500+ Nodes Strong
Join EPOCH VII. Master autonomous systems. Detroit-powered. 
Apply now → [link] #AutomationFuture #Detroit"

LinkedIn: "Introducing EPOCH VII: Full-Scale Agentic Orchestration
Learn how DAA is training the next generation of autonomous 
systems specialists. [Read the technical breakdown]"
```

### Internal Communications
```
Subject: PHASE_II_DEPLOYMENT_COMPLETE

Engineering Team,

All EPOCH VII components have been deployed to staging.
System Status: READY_FOR_PRODUCTION

Next: Monitor metrics for 24h, then go-live decision.
Status: >> // VERIFY_SYSTEMS | ENGAGE_COMMS_TEAM
```

---

## 10. Brand Compliance Checklist

### Visual
- [ ] Colors match palette exactly (#00f0ff, #39ff14, #050507)
- [ ] Typography is monospace (Courier New)
- [ ] Contrast is WCAG AAA (7:1+)
- [ ] Spacing follows 8px grid
- [ ] Cards use frosted glass style (blur + transparency)

### Messaging
- [ ] Use "Autonomous systems" not "robotics"
- [ ] Use "EPOCH VII" for current period
- [ ] Use "Agents" or "Nodes" not "students"
- [ ] Include metrics (100%, 500+, 12 weeks)
- [ ] Terminal-style CTAs (DEPLOY_NOW())

### Content
- [ ] File location comments on all files
- [ ] SEO meta tags present
- [ ] Accessibility tested (WCAG AAA)
- [ ] Links/CTAs functional
- [ ] Mobile responsive tested

---

## Questions?

For brand compliance, design issues, or messaging questions:
- Email: brand@detroitautomationacademy.com
- Slack: #brand-guidelines
- Issue Tracker: GitHub (detroit-automation-academy-public)

---

**Built by Detroit, for Detroit. Powered by Automated Technologies.**
