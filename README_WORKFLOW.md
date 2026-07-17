# MINDScall Platform Workflow Guide

This document provides a comprehensive, step-by-step breakdown of how ideas and proposals progress through the MINDScall (Cube Highways Innovation Management Platform) system.

---

## 1. Dynamic Forms Engine & Submission Phase
* **Dynamic Form Builder (Single Source of Truth):** The platform features a completely rebuilt Forms Module where administrators use a drag-and-drop Form Builder to create comprehensive templates. This builder synchronizes seamlessly with the public renderer.
* **Accessing the Portal:** Employees open the public, dynamically generated enterprise form using a shared URL slug (e.g., `/form/proposal-idea-submission`). 
* **Dynamic Rendering (Idea vs Proposal):** Submitters select a "Submission Type" which dynamically routes the UI fields without needing separate pages:
  * **Idea:** Displays essential sections (`Basic Information`, `Organization Details`). In the `Submission Details` section, only "Project Title" and "Abstract" are shown. Word limits (e.g., max 200 words) are strictly validated live on the client side. `Classification` and `Management Information` sections are dynamically hidden.
  * **Proposal:** Renders the complete template, surfacing all enterprise fields dynamically (e.g., Problem Statement, Budgets, Deliverables, Expected Benefits, Management Information) as configured by the admin.
* **Auto WBS Coding:** As the submitter fills in fields, the system computes and assigns a unique **WBS (Work Breakdown Structure) Code**. (Note: WBS codes are kept internal and are hidden from user-facing email notifications to avoid confusion).
* **Sequential ID Generation:** Upon a successful submission, the database generates a sequential ID for tracking:
  * `MCI-XXXX` (Minds Call Idea)
  * `MCP-XXXX` (Minds Call Proposal)
* **Status Tracking:** The user is immediately emailed a Public Tracking Portal link to monitor their submission's real-time status.

---

## 2. Reporting Manager (RM) & HOD Review Phase
* **Notification Email:** The system automatically notifies the employee's Reporting Manager (RM) and Head of Department (HOD) with secure, tokenized review URLs. (Emails include the Public Tracking Portal link, omitting internal WBS codes).
* **Review Access:** Managers do not need to sign in to the administrative panel; they access a secure, public-facing portal via single tokens (`/public-review/:token`) or batch links (`/rm-batch-review/:masterToken`).
* **Decision Paths:** The RM/HOD reviews the submission details and chooses one of the following decisions:
  * **Approve:** The submission status is updated to `EVALUATION`, and it moves to the Committee Review queue.
  * **Clarification:** The status is reset to `REVIEWING` (returned to the submitter for revision).
  * **Reject:** The status is updated to `REJECTED`, stopping the workflow progression.

---

## 3. R&D Team Screening & Committee Assignment
* **Central R&D Review:** Members of the R&D team access the admin dashboard to inspect all incoming submissions, filter them by type/status, and perform initial quality verification.
* **Committee Grouping:** Admins group submissions into evaluation batches.
* **Expert Allocation:** Batches are assigned to dedicated **Evaluation Committees** whose members receive email notifications containing specific evaluation forms.
* **Structured Evaluation:** Committee members evaluate technical feasibility, scoring each proposal based on predefined rubrics, and submitting qualitative review remarks.

---

## 4. Finance Committee Review Phase
* **Financial Viability Analysis:** Proposals with positive committee feedback advance to the Finance Review stage.
* **Finance Batch Review:** Finance team members review the requested budget vs. the expected return on investment (ROI).
* **Finance Decision Paths:**
  * **Approve:** The finance team allocates an approved budget, and the status changes to `APPROVAL_COMMITTEE`.
  * **Clarification:** Status is reset to `REVIEWING` and automated emails are dispatched requesting details/budget revisions.
  * **Reject:** Status changes to `REJECTED`.

---

## 5. Approval Committee Final Gate
* **Approval Committee Assignment:** Submissions resting in the `APPROVAL_COMMITTEE` state are batched and assigned to senior executives using the "Auto Assign Email" Approval Committee workflow tool.
* **Executive Decision:** The senior executive committee inspects the fully approved and budget-allocated proposals via secure tokenized links.
* **Final Ruling:** The executive committee issues the final binary decision:
  * **Approved:** Transitions the proposal to the R&D Ongoing Projects tracker.
  * **Rejected:** Permanently closes the tracking lifecycle as Rejected.

---

## 6. R&D Ongoing Projects Execution
* **Project Owner Assignment:** Approved proposals are formally designated a Project Owner/Lead.
* **Kanban & Phase Tracking:** Projects proceed through implementation milestones:
  * `Approved` ➔ `Planning` ➔ `In Progress` ➔ `Near Completion` ➔ `Completed`
* **Progress Logging:** Project Owners log milestones, post status text updates, and upload document evidence (e.g., test reports, phase logs).
* **Benefits Auditing:** Post-completion, actual benefits realized are recorded and compared directly against original estimated benefits to calculate true innovation ROI.

---

## 7. Governance, Audit Trails, and System Operations
* **Audit Logging:** Every critical action (login, form updates, reviews, deletes, batch creation, CSV exports) generates an immutable entry in the `AuditLog` collection.
* **Role-Based Access Control (RBAC):** Users are restricted to their specific roles (SUPER_ADMIN, ADMIN, COMMITTEE, RM, HOD, FINANCE, APPROVAL_COMMITTEE, etc.).
* **Hard Deletion (Admin Purge):** Administrators can delete submissions. Doing so:
  * Removes the record from the MongoDB `Submissions` collection.
  * Purges all file uploads from the server filesystem.
  * Pulls the submission ID from all assigned Evaluation Batches, Finance Batches, and Approval Batches.
  * Adjusts the sequentials in the `Counter` collection to avoid gap conflicts on subsequent submissions.
