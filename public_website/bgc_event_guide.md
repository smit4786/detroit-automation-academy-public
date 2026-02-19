# Boys & Girls Club Grand Opening: Event Guide

**Dates:** February 3rd & 4th, 2026  
**Location:** Boys & Girls Club (Grand Opening Event)  
**Objective:** Showcase student "Physical Computing" skills through interactive, hands-on stations that demonstrate curriculum phases 1-3 and introduce real-world product development workflows.

---

## Event Overview

This guide consolidates three complementary event formats into a flexible framework. **Choose one primary format** based on audience and timing, or **mix formats** for different time slots (e.g., "Visual Mode" Tuesday evening, "Full Workshop" Wednesday morning).

### Format Comparison

| Format | Duration | Audience | Focus | Stations |
|--------|----------|----------|-------|----------|
| **Physical Computing Showcase** | 60-90 min | General visitors, families | Hands-on demos, interactive stations | 3 zones |
| **E-Commerce & AI Workshop** | 90 min | Students, entrepreneurs | Full product lifecycle (design → CAD → market) | 3 steps |
| **Venture Showcase** (Donor-Facing) | 120+ min | Donors, partners, school officials | Business model, career pathway, ROI | 4 stations |

---

## FORMAT A: Physical Computing Showcase (Most Accessible)

**Best for:** Tuesday evening (high foot traffic), families, broad audiences

### Zone 1: The "Design Lab" (Software & Git)

*Curriculum Link: Phase 2 — CAD Design*

**Activity: "Git the Gear"**
- Guests clone the repository or pull latest changes (interactive terminal demo)
- Run `python3 phase2/cad_design.py --shape gear` to generate a custom gear token STL file
- Students explain how Python code defines physical geometry

**Hardware:** Laptops/Tablets with terminal, Git, and Python installed

**Student Role:** "CAD Designer"
- Guide guests through terminal commands
- Explain parametric modeling (how changing parameters alters the design)
- Show live STL generation

**Talking Points:**
- "This Python script replaces expensive CAD software—students learn industrial design fundamentals"
- "Parametric design means changing one number changes the entire design"

---

### Zone 2: The "Body" (Rapid Prototyping)

*Curriculum Link: Phase 2 — Rapid Prototyping*

**Activity: "Fabrication Station"**
- Live 3D printing of B&G Club commemorative tokens (designed in Zone 1)
- Showcase speed difference: Bambu Lab A1 (fast, affordable) vs. X1 Carbon (speed + advanced materials)
- Guests watch 10-15 minute print time (full cycle)
- Optional: Laser-cut a pre-designed token on Epilog Fusion Maker (2-minute demonstration)

**Hardware:**
- Bambu Lab A1 (Bed Slinger FDM)
- Bambu Lab X1 Carbon (CoreXY FDM, fastest)
- Epilog Fusion Maker (30-40W CO2 laser)

**Student Role:** "Manufacturing Lead"
- Manage print queue and laser queue
- Explain FDM (Fused Deposition Modeling) vs. laser cutting
- Hand out finished tokens and explain slicing software

**Talking Points:**
- "From design to finished part in 15 minutes—this is rapid prototyping"
- "The X1 Carbon prints 60% faster than traditional printers"
- "Laser cutting can engrave fine details that 3D printers can't achieve"

**Design Reference:** See [token_design_concepts.md](token_design_concepts.md) for token options (gear, circuit coin, skyline keychain, robot head)

---

### Zone 3: The "Future" (Autonomous Systems)

*Curriculum Link: Phase 3 — Autonomous Systems*

**Activity: "The Maze Run"**
- Rover navigates a taped-out grid on the floor autonomously
- Uses obstacle avoidance logic from Phase 3 curriculum
- **Interactive Element:** Guests place cardboard obstacles in the path to test the rover's sensor-driven decision-making
- Alternative: Large display screen running continuous simulation of `phase3/autonomous_rover.py`

**Hardware:** Physical rover kit OR laptop with simulation screen

**Student Role:** "Systems Engineer"
- Reset the rover between runs
- Explain obstacle detection and pathfinding algorithms
- Answer questions about "autonomy" and sensor fusion

**Talking Points:**
- "This rover uses the same algorithms that will power self-driving cars"
- "Phase 1 teaches basic programming, Phase 2 teaches design, Phase 3 puts it all together"

---

### Schedule: Physical Computing Showcase

**Tuesday, Feb 3rd (60-Minute Slots)**
- **4:00–5:00 PM: Visual Mode** (High foot traffic expected)
  - 3D printers running continuously
  - Rovers in demo mode (looping autonomous path)
  - Students greet guests and explain what they're seeing
  
- **6:00–7:00 PM: Interactive Mode** (More time per guest)
  - Students invite guests to generate custom token files at Zone 1
  - Guests can submit their STL for printing at Zone 2

**Wednesday, Feb 4th (90-Minute Slots)**
- **9:00 AM & 11:00 AM: Mini-Workshops**
  - Zone 1: 10-minute "Code to CAD" session
  - Zone 3: "Robot Race" — students explain logic, then run timed course
  
- **4:30 PM: Community Challenge**
  - "Human vs. Machine": Guest drives remote-control rover through maze vs. autonomous rover (timed race)

### Staffing: Physical Computing Showcase

- **Total:** 4–6 students per shift
- **Zone 1 (Design Lab):** 1 student (terminal guidance)
- **Zone 2 (Fabrication):** 2 students (1 on 3D printers, 1 on laser cutter)
- **Zone 3 (Autonomous Systems):** 1–2 students (rover operation, crowd management)
- **Floater:** 1 student (photos, breaks, guest direction)

### Swag Distribution: Physical Computing Showcase

**"Token Economy" Passport System**
1. Guests receive a card upon entry
2. Complete a micro-activity at Zone 1 (generate token) OR Zone 3 (pass obstacle course) to earn a stamp
3. Stamped passport redeems a fresh 3D-printed token at Zone 2

**Inventory:**
- Pre-print 50 tokens before the event on Bambu Lab
- Live printing capacity: ~4 tokens/hour
- Expected guests: ~100 (token economy ensures deep engagement)

---

## FORMAT B: E-Commerce & AI Workshop (Entrepreneurship Focus)

**Best for:** Wednesday 90-minute slots, student groups, aspiring entrepreneurs

### Step 1: The AI Design Studio (Concept to CAD)

*Curriculum Link: Phase 2 — CAD Design, AI-augmented*

**Activity: "Prompt Your Product"**
- Guests use text-to-3D AI tools (e.g., Meshy.ai, Bambu Lab PrintMon Maker) to design a custom keychain
- Students teach AI prompting: how specificity in language alters the final design
- Output: 3D-printable STL file

**Hardware:** Laptops or tablets with bookmarks to AI design tools

**Student Role:** "AI Design Consultant"
- Help guests brainstorm and refine product concepts
- Translate ideas into effective AI prompts
- Evaluate designs for printability (thickness, overhangs, etc.)

**Talking Points:**
- "AI is a tool for rapid ideation, but human creativity drives the process"
- "Your core Phase 2 training is parametric CAD—AI is just one input method"

---

### Step 2: The Micro-Factory (CAD to Product)

*Curriculum Link: Phase 2 — Manufacturing & G-code Generation*

**Activity: "On-Demand Manufacturing"**
- Guest's STL file is sliced into G-code (machine instructions) on a central computer
- Design is printed live on Bambu Lab A1 or X1 Carbon (print time: 8–20 minutes)
- Students manage queue and explain quality control

**Hardware:**
- Central computer with Bambu Studio slicing software
- Bambu Lab A1 & X1 Carbon printers with filament loaded
- Print bed with proper bed adhesion setup

**Student Role:** "Production Operator"
- Manage print queue to prevent bottlenecks
- Explain slicing process (how STL becomes G-code)
- Monitor print quality and handle any mechanical issues
- Estimate print time and material cost for guests

**Talking Points:**
- "Slicing software converts your 3D design into commands for the printer"
- "Material cost for this keychain is about $0.50; selling price might be $8–12"

---

### Step 3: The E-Commerce Launchpad (Product to Market)

*Curriculum Link: Business Model, Product Marketing*

**Activity: "Launch Your Store"**
- Once printed and cooled, guests photograph their product in a photo lightbox
- Create a product listing on a demo e-commerce site (Shopify or Etsy sandbox)
- Write a compelling product description and set a price
- Receive a shareable link to their product page

**Hardware:**
- Photo lightbox with smartphone/camera
- Laptop with pre-configured demo e-commerce storefront
- Payment processing setup (optional: allow simulated purchases)

**Student Role:** "E-Commerce Strategist"
- Guide guests on product photography best practices
- Help write engaging product descriptions
- Suggest pricing based on materials and market research
- Track popular designs on a leaderboard

**Talking Points:**
- "Good product photos increase conversion rates by 40%"
- "Your description should focus on benefits, not just features"
- "Pricing strategy: cover COGS, add margin for operations and profit"

### Schedule: E-Commerce & AI Workshop

**Wednesday, Feb 4th (90-Minute Slots)**
- **9:00 AM, 11:00 AM, 4:30 PM:** Full-Stack Founder Workshops
  - Small groups (8–12 people) move through all three steps
  - Total runtime: ~90 minutes (design ~20 min, manufacturing ~20 min + printing, e-commerce listing ~20 min)

**Bonus Activity: "Best Product Page" Competition**
- Most creative product listing wins a small prize
- Tracks which designs are most popular (simulates market research)

### Staffing: E-Commerce & AI Workshop

- **Total:** 4–6 students per shift
- **AI Design Studio:** 2 students (ideation, prompt refinement)
- **Micro-Factory:** 2 students (slicing, print management, quality control)
- **E-Commerce Launchpad:** 2 students (photography, product listing, pricing guidance)

### Business Model Integration

**Unit Economics for Guests:**
- Cost of materials (filament): ~$0.50
- Suggested retail price: $8–12
- Guests can purchase their own keychain for nominal cost (~$3) to cover operations

**Market Validation:**
- Leaderboard displays: Most popular designs, average price point, simulated sales
- Teaches business analytics in real time

---

## FORMAT C: Venture Showcase (Donor & Partner Engagement)

**Best for:** Wednesday longer slots, donor visits, school officials, press

### Station 1: The R&D Lab (AI & Parametric Design)

*Curriculum Link: [phase2_guide.md](phase2_guide.md)*

**Activity:** Guests use AI or parametric Python tools to design a custom concept

**Student Role:** "Product Designer"
- Explain that while AI is useful, the core Phase 2 curriculum teaches **parametric CAD using Python**
- Show the code in `phase2/cad_design.py` that generates geometry

**Donor Talking Point:**
> "While AI generates rapid concepts, our students learn the fundamental engineering principles behind CAD. They understand how to think parametrically, design for manufacturability, and iterate on geometry. That's the skillset that prepares them for careers in automotive, aerospace, and advanced manufacturing."

---

### Station 2: The Digital Factory (Advanced Manufacturing)

*Curriculum Link: [phase2_guide.md](phase2_guide.md)*

**Activity:** AI design is manufactured on-demand using industry-grade equipment

**Hardware:**
- Bambu Lab X1 Carbon (CoreXY — fastest consumer 3D printer)
- Epilog Fusion Maker (30-40W CO2 laser, professional engraving)

**Student Role:** "Manufacturing Lead"
- Explain FDM technology and the X1's CoreXY design
- Demonstrate laser engraving precision
- Discuss material selection and manufacturing constraints

**Donor Talking Point:**
> "These students work with the same equipment used by professional product development teams. The Bambu Lab X1 prints 50% faster than competing systems, and the Epilog laser represents industrial-grade precision. We're not teaching in a simulation—this is real manufacturing."

---

### Station 3: Go-to-Market Hub (E-Commerce & Analytics)

*Curriculum Link: Business Model, Entrepreneurship*

**Activity:** Guests create a product listing; live dashboard tracks event metrics

**Key Feature: Founder's Dashboard** (Large Monitor Display)
- **Designs Created:** Real-time count of guest submissions
- **Units Produced:** Count of finished parts
- **Products Listed:** Count of active listings on demo e-commerce site
- **Total Potential Revenue:** Sum of listing prices × units produced

**Student Role:** "Go-to-Market Specialist"
- Assist with product photography and descriptions
- Update dashboard metrics (or automate if possible)
- Explain unit economics and pricing strategy

**Donor Talking Point:**
> "This isn't just about making keychains. It's about teaching **business acumen**. Our students understand market validation, cost of goods sold, customer acquisition, and profitability. They're learning to think like entrepreneurs while developing technical skills. That combination creates job-ready graduates."

---

### Station 4: The Horizon (Autonomous Systems Showcase)

*Curriculum Link: [phase3_guide.md](phase3_guide.md), [phase3/autonomous_rover.py](../phase3/autonomous_rover.py)*

**Activity:** Large screen displays continuous simulation of autonomous rover navigating obstacles

**Student Role:** "Systems Engineer"
- Explain obstacle avoidance algorithms (from Phase 3 curriculum)
- Discuss pathfinding and sensor fusion
- Connect to future autonomous mobility (self-driving vehicles, delivery robots)

**Donor Talking Point:**
> "The rover simulation demonstrates our Phase 3 capstone project. The skills students learn in Phases 1 (Python fundamentals) and 2 (CAD and manufacturing) are the foundation for advanced robotics and autonomous systems. We're creating a pipeline of talent for Detroit's future in **autonomous mobility, industrial robotics, and next-generation manufacturing**. This is where the jobs of tomorrow are."

---

### Schedule: Venture Showcase

**Wednesday, Feb 4th (120+ Minutes)**
- **9:00 AM & 11:00 AM:** Guided tour groups (20–30 people each)
  - 30 min per station
  - 8 students (2 per station) with professional, defined roles
  
- **4:30 PM:** **"Shark Tank" Pitch Competition**
  - Student teams give 3-minute pitches for their keychain "business"
  - Panel of donors/judges asks questions
  - Winner receives prize or recognition
  - Simulates investment pitch culture (engaging for donor audience)

### Staffing: Venture Showcase

- **Total:** 8 students per shift (2 dedicated per station)
- Professional titles (Designer, Manufacturing Lead, Go-to-Market Specialist, Systems Engineer)
- Clear, scripted talking points for each role
- Floater for guest flow and photos

### Donor Engagement Extras

1. **One-Page Handout** — Program mission, three curriculum phases, outcomes (FAA Part 107 prep, career pathways)
2. **Metrics Poster** — Display student outcomes: graduation rate, job placement, scholarship recipients
3. **"Ask Me Anything" Corner** — Board where donors can post questions for students to answer (demonstrated on next visit)

---

## Shared Logistics & Setup

### Pre-Event (One Week Prior)

**Hardware Prep:**
- [ ] 3D printers: calibrate bed, load filament, test print
- [ ] Laser cutter: clean lenses/mirrors, verify exhaust, test cut
- [ ] Laptops: install Python 3.8+, Git, Bambu Studio slicing software, AI tool bookmarks
- [ ] WiFi: test strength in all zones (ensure Git cloning and AI tools work)

**Material Prep:**
- [ ] Pre-print 50 tokens (all formats) on Bambu Lab
- [ ] Prepare 10–15 example STL files (if running AI workshop)
- [ ] Cut wood/acrylic blanks for laser demonstrations
- [ ] Load filament into both 3D printers

**Student Training:**
- [ ] Assign roles and run 1–2 practice sessions
- [ ] Write scripts for each station (talking points, demo sequence)
- [ ] Train on safety (laser cutter, hot plastic, electrical hazards)
- [ ] Practice guest flow and timing

### During Event

**Power & Infrastructure:**
- [ ] Multiple extension cords (printers + laptops + monitors draw significant power)
- [ ] Tape down all cables to prevent tripping
- [ ] WiFi stability monitoring (Git clones and AI tools require strong connection)

**Crowd Management:**
- [ ] Floater student guides guests between zones
- [ ] Time gates per zone to prevent bottlenecks
- [ ] Queue management (first-come, first-served for printing)

**Safety:**
- [ ] Tape off laser cutter zone; only students operate
- [ ] Safety glasses available at laser station
- [ ] "Hot plastic — do not touch" signs on cooling area
- [ ] Emergency stop button accessible and tested
- [ ] First aid kit on site

### Post-Event

- [ ] Collect all printed tokens and gather feedback
- [ ] Clean printer nozzles and check for jams
- [ ] Verify laser cutter mirrors/lenses are clean
- [ ] Thank-you notes/photos to students
- [ ] Compile event metrics (guests served, prints completed, products listed)

---

## Resource Checklists by Format

### Format A: Physical Computing Showcase

**Hardware:**
- [ ] 2+ Laptops with terminal/Git/Python
- [ ] Bambu Lab A1 + X1 Carbon printers
- [ ] Epilog Fusion Maker (optional but recommended)
- [ ] Rover kit or simulation screen

**Materials:**
- [ ] 50 pre-printed tokens
- [ ] PLA filament (500g minimum)
- [ ] Wood/acrylic blanks for laser demos
- [ ] Electrical tape, cardboard for obstacles

**Staffing:** 4–6 students per shift

---

### Format B: E-Commerce & AI Workshop

**Hardware:**
- [ ] 3+ Laptops (design station + slicing computer + e-commerce station)
- [ ] Bambu Lab A1 + X1 Carbon printers
- [ ] Photo lightbox + camera/smartphone
- [ ] Large monitor for demo e-commerce site

**Software:**
- [ ] AI design tool bookmarks (Meshy.ai, PrintMon Maker, etc.)
- [ ] Bambu Studio slicing software
- [ ] Shopify or Etsy sandbox account for product listings

**Staffing:** 4–6 students per shift

---

### Format C: Venture Showcase

**Hardware:**
- [ ] All of Format A + setup for Founder's Dashboard
- [ ] Large monitor/projector for rover simulation
- [ ] Audio system for "Shark Tank" pitch panel (optional)

**Materials:**
- [ ] Professional one-page donor handout (printed, color)
- [ ] Metrics poster or digital display

**Staffing:** 8 students per shift (2 per station)

---

## FAQ & Troubleshooting

**Q: What if a 3D print fails mid-way?**  
A: Have backup pre-printed tokens available. Remove failed print, clean nozzle, restart with new filament spool.

**Q: What if WiFi drops during Git cloning?**  
A: Pre-load the repository on each laptop as a backup; or have students copy-paste key files.

**Q: How long should guests spend at each zone?**  
A: Format A (showcase): 10–15 min per zone. Format B (workshop): 20–25 min per zone. Format C (donor): 30 min per station.

**Q: Can we run multiple formats simultaneously?**  
A: Yes, if you have separate zones/rooms. E.g., Tuesday evening = Format A (walk-through), Wednesday = Formats B & C (workshops + donor tour).

**Q: What's the cost breakdown per keychain?**  
A: Materials (~$0.50) + overhead (labor, utilities, equipment depreciation = ~$1–2) → sell for $5–10.

---

## Success Metrics

- **Attendance:** # of guests served
- **Engagement:** # of unique tokens designed and printed
- **Conversion:** # of tokens successfully fabricated and distributed
- **E-Commerce (if running Format B):** # of product listings created, avg. price point
- **Feedback:** Guest survey scores (ease of use, learning, fun factor)

---

## References

- [phase1_guide.md](phase1_guide.md) — Python & GPIO fundamentals
- [phase2_guide.md](phase2_guide.md) — CAD design & rapid prototyping
- [phase3_guide.md](phase3_guide.md) — Autonomous systems & sensor fusion
- [token_design_concepts.md](token_design_concepts.md) — Design options for tokens
- [../activations/README.md](../activations/README.md) — G-code generation workflows
- [../phase2/cad_design.py](../phase2/cad_design.py) — Parametric CAD code examples
- [../phase3/autonomous_rover.py](../phase3/autonomous_rover.py) — Rover simulation
