# Functional Requirements Specification (FRS) & Architecture Blueprint
**System Name:** Next.js Delivery & Task Management Platform  
**Target Architecture:** Multi-Project Workspace (Single-Tenant / Private Company)  
**Document Version:** 1.0.0  
**Date:** October 10, 2026  

---

## 1. System Overview & Core Domain Hierarchy

This application manages functional requirements, task lifecycles, and verification criteria for software projects. It models an organizational workspace with isolated projects, strictly enforcing a 4-tier domain hierarchy derived from user story mapping:

$$\text{Project} \longrightarrow \text{Activity} \longrightarrow \text{Step} \longrightarrow \text{Functional Requirement (FR)} \longrightarrow \text{Acceptance Criteria (AC)}$$

### Technology Stack
* **Framework:** Next.js (App Router, Server Actions, React 19)
* **Styling & Components:** Tailwind CSS, Radix UI / Shadcn UI
* **Database & ORM:** PostgreSQL, Drizzle ORM
* **Real-Time Engine:** Pusher Channels (live WebSocket broadcasting)
* **State Management & Caching:** TanStack Query (React Query v5) with optimistic updates
* **Authentication:** NextAuth.js (Auth.js v5) with Credentials Provider (`username` & `password`)

---

## 2. Role-Based Access Control (RBAC)

The system enforces four distinct roles: `ADMIN`, `PO` (Product Owner), `DEVELOPER`, and `QA`.

| Capability / Action | Admin / PO | Developer | QA Engineer |
| :--- | :---: | :---: | :---: |
| Provision / deactivate user accounts | Allowed | Denied | Denied |
| Create / soft-delete projects, activities, and steps | Allowed | Denied | Denied |
| Create / edit FR scope, descriptions, and AC text | Allowed | Denied | Denied |
| Assign engineers or QA to FRs | Allowed | Denied | Denied |
| Update specification metadata (`Spec status`, `Priority`) | Allowed | Denied | Denied |
| Update dev status (`Not started`, `In progress`, `Blocked`) | Allowed | Allowed | Denied |
| Mark requirement as `Dev status: Done` | Allowed (Can override) | Conditional (100% AC dev-done) | Denied |
| Check off Acceptance Criteria development (`AC: Dev done`) | Allowed | Allowed | Denied |
| Update testing lifecycle (`QA status: Passed, Failed, Not tested`) | Allowed | Denied | Allowed |
| Check off Acceptance Criteria testing (`AC: QA passed`) | Allowed | Denied | Allowed |
| Add / update notes, PR links, and comments | Allowed | Allowed | Allowed |

---

## 3. Functional Requirements (FRs)

### 3.1 Identity & Access Management (IAM)
* **FR-IAM-001 (Admin Provisioning):** User accounts shall be provisioned exclusively by administrators via the admin settings panel. The admin defines `username`, initial `password`, assigned `role`, and optional profile fields (`full_name`, `email`). Public self-registration is permanently disabled.
* **FR-IAM-002 (Credentials Authentication):** The system shall authenticate registered users using secure credentials sessions, protecting against credential brute-forcing and unauthorized route access.
* **FR-IAM-003 (Soft Deactivation):** Disabling a user account shall preserve referential integrity across audit logs, historical task assignments, and activity history.

### 3.2 Projects & Domain Hierarchy
* **FR-PRJ-001 (Multi-Project Workspace):** The system shall support multiple isolated projects. Users can be assigned to one or multiple projects simultaneously.
* **FR-PRJ-002 (4-Tier Domain Hierarchy):** Every project organizes deliverables strictly into:
  1. **Activity:** Top-level user journey stage (e.g., *Get started*, *Find a car*).
  2. **Step:** Sequential procedural step under an activity (e.g., *sign-in / sign-up*, *view car details*).
  3. **Functional Requirement (FR):** Discrete trackable deliverable item with a unique code (e.g., `FR-EU-001`).
  4. **Acceptance Criteria (AC):** Verifiable Given/When/Then scenarios (e.g., `AC1`, `AC2`).
* **FR-PRJ-003 (Global Soft-Delete Policy):** All deletions across projects, activities, steps, requirements, and acceptance criteria shall execute as soft deletes (`deleted_at IS NOT NULL`) to preserve audit trails and reporting integrity.

### 3.3 Status Workflow, Automations & Business Rules
* **FR-WKF-001 (Dev Done Gating & Override Rule - UPDATED):**
  * **Developer Restriction:** The system shall strictly block a Developer from setting `Dev status = Done` unless 100% of child Acceptance Criteria have `dev_done = true`. Dragging a card to `Done` or selecting `Done` via dropdown shall be rejected at both UI and Server Action levels with an explicit validation error.
  * **Admin / PO Privileged Override:** Administrators and Product Owners shall have permission to bypass the gating restriction. If an Admin/PO transitions an FR to `Done` while incomplete ACs remain, the system shall display an **Override Confirmation Dialog** detailing all pending ACs. The Admin/PO must select one of two actions:
    1. *Force Done Only:* Updates FR `dev_status` to `Done` while preserving individual AC states.
    2. *Force Done & Mark All ACs:* Updates FR `dev_status` to `Done` and batch-updates all linked child ACs to `dev_done = true`.
  * Every bypass event must be explicitly captured in `audit_logs` with the action code `OVERRIDE_DEV_DONE`.
* **FR-WKF-002 (Decoupled QA Workflow & Assisted Suggestions):**
  * `QA status` (`Not tested`, `Passed`, `Failed`) shall remain independent from developer actions and can only be set by QA or Admin/PO.
  * When a QA tester checks off the final remaining AC as `qa_passed = true`, the UI shall trigger an assisted prompt: *"All criteria verified. Mark requirement as Passed?"* with confirmation actions.
  * Marking an AC with defect comments or unchecking a pass shall prompt the tester: *"Defect detected. Update requirement QA status to Failed?"*.
  * If a QA tester manually selects `QA status = Passed` while unpassed ACs remain, the UI shall display a confirmation warning before committing.
* **FR-WKF-003 (Permissive In-Progress):** The system shall allow requirements to transition to `In progress` regardless of open issues (`Open issues`) or review states (`Spec status = Pending review`).
* **FR-WKF-004 (Real-Time Pusher Synchronization):** Every state change, assignment update, and AC toggle shall dispatch an event over Pusher Channels to sync the state instantly across all active project sessions.

### 3.4 User Views & Interaction
* **FR-UI-001 (Interactive Table / Tree Grid):**
  * Grouped data table categorized hierarchically by Activity and Step.
  * Displays: `FR ID`, `Requirement`, `Priority`, `Spec status`, `Assignee`, `Dev status`, `QA status`, AC ratio badge (e.g., `3/4 ACs`), `Target date`, and `Notes`.
  * Expandable rows / slide-over drawers display child Given/When/Then acceptance criteria with individual `Dev done` and `QA passed` toggles and comments.
* **FR-UI-002 (Interactive Kanban Board):**
  * Columns mapped to development states: `Not started` $\rightarrow$ `In progress` $\rightarrow$ `Blocked` $\rightarrow$ `Done`.
  * Drag-and-drop card movements enforcing the `FR-WKF-001` gating and override validation rules.
* **FR-UI-003 (Executive Progress Dashboard):**
  * Visual metrics for total requirement count, dev completion rate (% Done), and QA pass rate (% Passed).
  * Rollup progress breakdown by Backbone Activity.
* **FR-UI-004 (Cross-Project "My Tasks" View):**
  * A dedicated dashboard consolidating all requirements assigned to the authenticated user across all assigned projects.

### 3.5 Notifications & Audit Logging
* **FR-NOT-001 (In-App Notification Center):**
  * Top navigation bell icon with live badge counter and unread list powered by Pusher.
  * Dispatches notifications for: task assignment, QA failure reports (`QA status = Failed`), and full AC dev completion.
* **FR-AUD-001 (Audit Trail / Activity Log):**
  * Tracks every mutation: `user_id`, timestamp, entity type, entity ID, previous value, and new value.
  * Exposes an "Activity History" tab inside the requirement detail drawer.

---

## 4. PostgreSQL Relational Schema (Drizzle ORM Compatible)

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'PO', 'DEVELOPER', 'QA');
CREATE TYPE priority_level AS ENUM ('Must', 'Should', 'Could', 'Wont');
CREATE TYPE spec_status AS ENUM ('Agreed', 'Pending_review');
CREATE TYPE dev_status AS ENUM ('Not_started', 'In_progress', 'Done', 'Blocked');
CREATE TYPE qa_status AS ENUM ('Not_tested', 'Passed', 'Failed');

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'DEVELOPER',
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Project Members
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- Hierarchy
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE functional_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID REFERENCES steps(id) ON DELETE CASCADE NOT NULL,
    fr_code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority priority_level NOT NULL DEFAULT 'Must',
    spec_status spec_status NOT NULL DEFAULT 'Agreed',
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    open_issues TEXT,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    dev_status dev_status NOT NULL DEFAULT 'Not_started',
    qa_status qa_status NOT NULL DEFAULT 'Not_tested',
    target_date DATE,
    notes TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fr_id UUID REFERENCES functional_requirements(id) ON DELETE CASCADE NOT NULL,
    ac_code VARCHAR(10) NOT NULL,
    criteria_text TEXT NOT NULL,
    dev_done BOOLEAN NOT NULL DEFAULT FALSE,
    qa_passed BOOLEAN NOT NULL DEFAULT FALSE,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Seed Migration Strategy from Checklist File

To initialize Project 1 from `AutoWay_EU_Requirements_Checklist.xlsx`:
1. **Activity & Step Extraction:** Parse unique combinations of `Activity` and `Step` from the `Checklist` sheet, maintaining appearance order for `sort_order`.
2. **FR Ingestion:** Map columns directly:
   * `FR ID` $\rightarrow$ `fr_code`
   * `Requirement` $\rightarrow$ `title`
   * `What it must do` $\rightarrow$ `description`
   * `Priority` $\rightarrow$ `priority`
   * `Spec status` $\rightarrow$ `spec_status`
   * `AI == 'Yes'` $\rightarrow$ `is_ai`
   * `Open issues` $\rightarrow$ `open_issues`
3. **AC Ingestion:** From the `Acceptance criteria` sheet:
   * Match rows by `FR ID`.
   * `AC #` $\rightarrow$ `ac_code`.
   * `Acceptance criterion` $\rightarrow$ `criteria_text`.
