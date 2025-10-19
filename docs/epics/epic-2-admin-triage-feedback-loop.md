## Epic: Admin Triage & Feedback Loop

### Goal

This epic delivers the complete management lifecycle for the issue reporting system. It provides a secure dashboard for authorities to manage reports from the **Complaints DB** and a way for citizens to see the status of those updates.

### Description

Building upon the core reporting functionality, this epic focuses on empowering city authorities to efficiently manage and respond to submitted civic issues. It addresses the problem of inefficient triage for authorities by providing an AI-powered prioritization system and a clear, organized view of incoming reports. Furthermore, it closes the feedback loop for citizens, ensuring transparency and accountability by allowing them to track the status of their reports.

**Existing System Context:**
*   **Current relevant functionality:** The system now has a mechanism for citizens to submit verified reports to a Complaints DB (from Epic 1).
*   **Technology stack:** Continues to leverage open-source backend frameworks and a scalable relational database (PostgreSQL with PostGIS) for the Complaints DB. A new web application for the admin dashboard will be introduced.
*   **Integration points:** Integrates with the existing Complaints DB and provides a new interface for city authorities. It also integrates with the mobile application to provide status updates to citizens.

**Enhancement Details:**
*   **What's being added/changed:** This epic introduces an admin dashboard for managing reports, AI-powered categorization and prioritization of reports, the ability for admins to update report statuses, and a mechanism for citizens to check report statuses.
*   **How it integrates:** The admin dashboard provides a secure web interface for authorities to interact with the Complaints DB. Status updates from the dashboard are then made accessible to citizens via the mobile app.
*   **Success criteria:** Reduce the average time-to-acknowledgement for critical issues by 50% through automated prioritization. Attain a 70% user satisfaction rate based on in-app feedback regarding the reporting process and transparency.

### Stories

1.  **Story 2.1: Admin Dashboard UI Shell & Auth**
    *   **As an admin,** I want a basic web application with a secure login, so that I have a protected place to view and manage reports.
    *   **Acceptance Criteria:**
        *   AC 1: A new web application for the admin dashboard is created.
        *   AC 2: A login page authenticates users against a list of authorized administrators.

2.  **Story 2.2: AI-Powered Categorization & Prioritization**
    *   **As a developer,** I want a service that automatically analyzes new reports in the **Complaints DB** to assign a category and priority, so that admins see an organized and triaged list.
    *   **Acceptance Criteria:**
        *   AC 1: When a new report is saved, a process is triggered to analyze its content using an AI service.
        *   AC 2: The determined category and urgency level are saved to the report's record in the **Complaints DB**.

3.  **Story 2.3: Prioritized Report List View**
    *   **As an admin,** I want to see a list of incoming reports, automatically sorted by urgency, so I can address the most critical issues first.
    *   **Acceptance Criteria:**
        *   AC 1: The admin dashboard fetches and displays a list of reports from the **Complaints DB**.
        *   AC 2: The list is sorted by urgency (High first) and then by date.

4.  **Story 2.4: Report Detail View**
    *   **As an admin,** I want to click on a report to see its full details, including the photo and map location, so that I can investigate the issue.
    *   **Acceptance Criteria:**
        *   AC 1: Clicking a report navigates to a detail view showing the full report text, photo, and a map of its location.

5.  **Story 2.5: Update Report Status**
    *   **As an admin,** I want to change a report's status (e.g., "In Progress," "Resolved") from the detail view, so I can track its lifecycle.
    *   **Acceptance Criteria:**
        *   AC 1: The detail view has UI controls to change the report's status in the **Complaints DB**.
        *   AC 2: The UI updates to reflect the new status.

6.  **Story 2.6: Citizen Status Check**
    *   **As a citizen,** I want to use my tracking ID to see the current status of my report, so I know if it's being addressed.
    *   **Acceptance Criteria:**
        *   AC 1: The mobile app allows a user to check a report's status using their tracking ID.
        *   AC 2: The app calls a public endpoint that returns the report's current status from the **Complaints DB**.

### Success Criteria

*   The admin dashboard effectively displays and prioritizes incoming reports.
*   City authorities can update report statuses, and these updates are reflected.
*   Citizens can successfully check the status of their submitted reports using their tracking ID.
*   The admin dashboard correctly prioritizes at least 90% of incoming critical issues (MVP success criteria from brief.md).

### Dependencies, Assumptions, and Risks

*   **Dependencies:** Completion of Epic 1 (Core Reporting) to provide reports to manage. An AI service for categorization and prioritization.
*   **Assumptions:** City authorities are willing to partner and integrate the system into their workflow.
*   **Key Risks:** Lack of authority buy-in; the system may be ineffective if city officials do not actively use the dashboard and respond to reports.
