# ToolUp — Cebu City Home Services Marketplace & Web Application

A fully functional, responsive, and secure web application with integrated user authentication, role-based workflows, scheduling, verification, and PostgreSQL relational data architecture.

Built for **CSIT327: Information Management 2** at Cebu Institute of Technology - University (CIT-U) by **Godinez, Henry James Molde**.

---

## 🚀 Live Deployment to Vercel

This repository is pre-configured for 1-click deployment on **Vercel**:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete ToolUp web application with auth and relational model"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will automatically detect **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**!

---

## 🛠️ Features

- **F-01: Multi-Role Authentication** (Homeowners / `CLIENT`, Tradesmen / `TECHNICIAN`, Platform Officers / `ADMIN`).
  - Strict enforcement of **BR-01** (`UNIQUE (email)`) and **BR-02** (`CHECK (role IN ('CLIENT', 'TECHNICIAN', 'ADMIN'))`).
  - Includes instant 1-click demo persona quick-login for evaluation and grading.
- **F-02: Categorized Cebu City Service Directory** (Plumbing, Electrical, Aircon/HVAC, Carpentry, Appliance/IT).
  - Strict enforcement of **BR-03**: unverified technicians are gated from the public directory until credentials are approved.
  - Location filtering across Cebu City barangays (Lahug, Talamban, Guadalupe, Mabolo, Banilad, Tisa, etc.).
- **F-03: Interactive Booking & Scheduling Engine** (Date/time slot picker).
  - Strict enforcement of **BR-04** (`CHECK (scheduled_at > created_at)`) and **BR-05** (`PENDING`, `ACCEPTED`, `COMPLETED`, `CANCELLED`).
  - External settlement preferences (Cash on completion, GCash, Maya).
- **F-04: Administrative Verification Module**
  - Review and approve/reject uploaded trade licenses (TESDA NC II, PRC) and barangay clearances.
  - Directory visibility toggling.
- **F-05: Operational Dashboards & History**
  - Client repair request tracking and status updates.
  - Technician job queue management, trade skills editing, and credential submission.
- **F-06: Post-Job Ratings & Reviews**
  - Strict enforcement of **BR-06** (only completed jobs, 1:1 unique booking link) and **BR-07** (1–5 integer rating score).
- **PostgreSQL Relational Schema Explorer & Business Rules Audit**
  - Live inspection of all 6 3NF normalized tables.
  - Live constraint execution audit log.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
