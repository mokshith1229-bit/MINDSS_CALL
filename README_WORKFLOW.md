# MINDScall Platform Workflow Guide

This document provides a comprehensive, step-by-step breakdown of how ideas and proposals progress through the MINDScall (Cube Highways Innovation Management Platform) system.

---

## 1. Submission Phase (Public Form Entry)
* **Accessing the Portal:** Employees open the public, dynamically generated enterprise form (designed with Microsoft-style clean aesthetics) using a shared URL slug (e.g., `/form/innovation-campaign`).
* **Selecting the Submission Type:** Submitters choose between two tracks:
  * **Idea:** A preliminary concept/suggestion that requires less initial documentation and simpler details.
  * **Proposal:** A structured, fully documented business case involving methodology, milestones, and estimations.
* **Auto WBS Coding:** As the submitter fills in fields (such as Category, Sub-Category, and Innovation Type), the system auto-computes and maps a unique **WBS (Work Breakdown Structure) Code** (e.g., `TPC-001` - Technology, Process, Continuous Improvement).
* **Sequential ID Generation:** Upon a successful submission, the database generates a sequential and permanent business ID for tracking:
  * `MCI-XXXX` (Minds Call Idea)
  * `MCP-XXXX` (Minds Call Proposal)
* **Attachments:** Uploaded documents (PDFs, templates, docx) are saved securely to server uploads using Multer middleware.

---

## 2. Reporting Manager (RM) & HOD Review Phase
* **Notification Email:** The system automatically notifies the employee's Reporting Manager (RM) and Head of Department (HOD) with secure, tokenized review URLs.
* **Review Access:** Managers do not need to sign in to the administrative panel; they access a secure, public-facing portal via single tokens (`/public-review/:token`) or batch links (`/rm-batch-review/:masterToken`).
* **Decision Paths:** The RM/HOD reviews the submission details and chooses one of the following decisions:
  * **Approve:** The submission status is updated to `EVALUATION`, and it moves to the Committee Review queue.
  * **Clarification:** The status is reset to `REVIEWING` (returned to the submitter for revision).
  * **Reject:** The status is updated to `REJECTED`, stopping the workflow progression.

---

## 3. R&D Team Screening & Committee Assignment
* **Central R&D Review:** Members of the R&D team access the admin dashboard to inspect all incoming submissions, filter them by type/status, and perform initial quality verification.
* **Committee Grouping:** Admins group submissions into evaluation batches.
* **Expert Allocation:** Batches are assigned to dedicated **Evaluation Committees** (e.g. Civil Engineering, IT, Safety, Operations) whose members receive email notifications containing specific evaluation forms.
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
* **Executive Decision:** The senior executive committee inspects the fully approved and budget-allocated proposals waiting in `APPROVAL_COMMITTEE` queue.
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
* **Role-Based Access Control (RBAC):** Users are restricted to their specific actions (SUPER_ADMIN, ADMIN, COMMITTEE, RM, HOD, FINANCE, etc.).
* **Hard Deletion (Admin Purge):** Administrators can delete submissions. Doing so:
  * Removes the record from the MongoDB `Submissions` collection.
  * Purges all file uploads from the server filesystem.
  * Pulls the submission ID from all assigned R&D Evaluation Batches and Finance Batches.
  * Adjusts the sequentials in the `Counter` collection to avoid gap conflicts on subsequent submissions.
