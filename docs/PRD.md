# Product Requirements Document (PRD): Detroit Automation Academy (DAA)

## 1. Overview
The Detroit Automation Academy (DAA) is a STEM education initiative focused on providing hands-on automation and technology training to youth in Detroit, particularly through partnerships with organizations like the Boys & Girls Clubs of Greater Detroit (Michigan Central Club).

## 2. Mission & Goals
- **Mission:** Empower Detroit youth with future-ready STEM skills through automation and technology education.
- **Goals:**
  - Execute high-impact STEM sessions for cohorts of 50+ participants.
  - Establish a robust infrastructure for curriculum delivery and student tracking.
  - Launch a functional CRM for managing enrollments and stakeholder engagement.
  - Maintain a high-quality public presence via the DAA website.

## 3. Target Audience
- **Primary:** Detroit youth (BGC members).
- **Secondary:** Parents, educators, community partners (Michigan Central, BGC), and potential sponsors.

## 4. Functional Requirements
- **Curriculum Delivery:** Modular STEM sessions (e.g., Robotics, Coding, Automation).
- **Registration System:** Google Forms-based registration integrated with the DAA website.
- **CRM Integration:** MVP CRM to track participant progress, attendance, and stakeholder communications.
- **Public Website:** Informational site with a blog for project updates and community engagement.
- **Event Management:** Procedures for equipment testing, onsite facilitation, and media publication.

## 5. Technical Requirements
- **Website Framework:** Hugo (Static Site Generator) with the Ananke theme.
- **CRM Frontend:** React with TypeScript for enrollment and progress management dashboards.
- **CRM Backend:** Golang-based microservices for data processing and API integration.
- **Hosting/Deployment:**
    - **GitHub Pages:** Static site hosting for the public blog.
    - **GCP:** Cloud Run for CRM backend; Firestore for student data; BigQuery for cohort analytics.
    - **Cloudflare:** Edge security, DNS, and Workers for lightweight integrations.
- **Data Layer:** Clickhouse for high-performance session telemetry; Spanner for global relational data.
- **Build Tools:** Node.js (PostCSS), Terraform for infrastructure management, Nix for local development.
- **Repository:** `detroit-automation-academy-public`.
- **Integrations:** Google Workspace (Forms, Sheets) for legacy data; OpenTelemetry for system observability.

## 6. Roadmap & Milestones (2026)
- **Feb 4:** BGC Event (50 participants, 5 STEM sessions).
- **Feb 4-10:** P4-P7 Infrastructure and Financial framework setup.
- **Feb 10 - Mar 15:** CRM Phase 1 development (MVP launch).
- **Mar 15:** CRM Go-Live.

## 7. Agent Coordination & Roles
- **@CTO:** Oversees technical architecture, GitHub Pages deployment, and Hugo site maintenance.
- **@COO:** Manages project timelines, daily operations, and coordination between DAA and @AutomatedTechnologies.
- **@ADMIN:** Handles registration coordination, communication templates, and administrative support.
- **@Documentation-Auditor:** Ensures all project documentation meets quality standards.

## 8. Constraints & Risks
- **Privacy:** Adherence to strict privacy constraints within the Justin Smith ecosystem.
- **Logistics:** Coordination with external partners (BGC) requires timely communication and approval.
- **Build Integrity:** Strict adherence to Hugo/GitHub Pages deployment rules (e.g., PostCSS location, `.nojekyll`).
