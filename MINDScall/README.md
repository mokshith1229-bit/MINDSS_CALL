# MINDScall — CubeTech Innovation Portal

**MINDScall** (also referenced as **CubeTech Innovation Portal**) is a premium, feature-rich Enterprise Innovation Management and Proposal Vetting Platform. It provides organizations with a complete, end-to-end pipeline to capture, evaluate, align, and approve employee ideas, CAPEX/OPEX budgets, and process improvement proposals.

Built on a modern frontend architecture, the platform features high-fidelity, interactive Material-UI (MUI) components, rich analytical visualizations, and customizable multi-stage vetting workflows.

---

## 🚀 Key Modules & Capabilities

### 1. 📊 Interactive Dashboard
- **Innovation Overview:** Real-time KPI counters tracking total submissions, items under evaluation, approval rates, and pending reviews.
- **Activity & Trends:** Responsive Recharts bar charts showing monthly innovation activity (submissions vs. evaluations vs. approvals).
- **Pipeline Progress:** Visual indicator cards tracking current quarter performance, implementation rates, and risk factors.
- **Activity Feed:** Live audit log and table listing the latest pipeline updates and status changes.

### 2. 🛠️ Form Builder & Upload Center
- **Custom Form Creator:** Admins can configure custom sections (Basic Info, Organization Details, Proposal Methodology, Budget Needs, etc.).
- **Category & Taxonomy Management:** Create custom categories (e.g., Process Improvement, Automation, Cost Saving, R&D) with dedicated HSL color tags and icon associations.
- **Version Control:** Full version history logs allowing admins to review past form configurations and restore previous versions.
- **Settings & Link Parameters:** Manage form expiry dates, one-response-per-user constraints, maximum response caps, and automated slug regeneration.
- **Data Export:** Export form submission data instantly to CSV.

### 3. 📝 Public Submission Portal
- Clean, focused interface for employees or stakeholders to submit ideas.
- Integration with file-upload widgets (`react-dropzone`) for submitting supportive PDFs, documents, or slides.
- Smart validation rules including word count limitations and dependent dropdown fields (e.g., Department $\rightarrow$ Sub-department $\rightarrow$ Sub-sub-department).

### 4. 🔀 Automated Assignment & Notifications
- **Routing Rules:** Configurable logic to auto-assign submitted proposals to specific evaluators or business units based on the submission category.
- **Email System:** Templates and trigger settings for automated notification dispatches during status transitions (e.g., submission confirmation, evaluation alerts).

### 5. ⚖️ Multi-stage Evaluation
- Scorecard screens allowing evaluation committees to grade ideas across multiple parameters (feasibility, impact, cost, alignment).
- Log notes, query requests, and request revisions from submitters.

### 6. 📅 Meeting & Discussion Scheduler
- Dedicated alignment space to coordinate review sessions, schedule committee discussions, and log meeting outcomes directly against proposals.

### 7. 💳 Strategic & Financial Approvals
- **HOD & L1 Approvals:** Visual tracking of the strategic approval chain.
- **Finance Queue:** Comprehensive CAPEX/OPEX evaluation module.
- **Financial Details:** Cost assessment against departmental budgets (e.g., CAPEX Q2/Q3 allocation).
- **Audit Trails:** Complete change log detailing who submitted, approved, rejected, or sent proposals back for rework.

---

## 🛠️ Technology Stack
- **Framework:** React 19 & Vite (Fast HMR development server)
- **Styling:** Material-UI (MUI v9) for rich, polished component styling
- **Charts & Data Viz:** Recharts (Area, Bar, Pie, and Line charts)
- **Routing:** React Router v7
- **Utilities:** React Dropzone (file upload handling)

---

## 📥 Getting Started

Follow these steps to set up the project locally:

1. **Clone & Navigate:**
   ```bash
   cd MINDScall
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local address displayed in the terminal (usually `http://localhost:5173`).

4. **Production Build:**
   ```bash
   npm run build
   ```
