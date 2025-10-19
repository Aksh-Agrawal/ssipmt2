## Epic: Foundation & Core Reporting

### Goal

This epic sets up the project's infrastructure and delivers the core user-facing feature: submitting a verified civic issue report to the **Complaints DB**.

### Description

This project aims to address the significant challenges citizens face in reporting local civic issues, such as inefficient, inaccessible, and opaque reporting mechanisms. The "AI-Powered Civic Voice Assistant" will provide a simple, reliable channel for citizens to report issues and receive transparent feedback.

The core concept involves a voice-first mobile application with a "Tap and Speak" interface, enabling users to report issues in their natural language. Key differentiators include a verification system (geo-tagged photo proof), extreme accessibility (intuitive UI, multilingual engine), AI-powered prioritization, and closed-loop accountability (immediate confirmation and tracking reference).

This epic focuses on establishing the foundational infrastructure and delivering the initial user-facing capability for submitting these verified reports.

**Existing System Context:**
*   **Current relevant functionality:** The project aims to replace existing cumbersome, inaccessible, or opaque civic reporting methods.
*   **Technology stack:** The solution will leverage open-source frameworks for the backend, a scalable database capable of handling geospatial data (specifically a relational database like PostgreSQL with PostGIS for the Complaints DB), and a robust multilingual engine.
*   **Integration points:** The new work connects to existing civic reporting needs and is designed for future integration with municipal work order management systems.

**Enhancement Details:**
*   **What's being added/changed:** This epic introduces the core functionality for citizens to submit verified civic issue reports, including geo-tagged photos and voice-to-text input. It also establishes the foundational project setup and CI/CD pipeline.
*   **How it integrates:** The mobile application will serve as a single, reliable point of contact, directly feeding verified reports into a dedicated Complaints Database for city authorities.
*   **Success criteria:** The success of this foundational epic will be measured by the successful setup of the project infrastructure, the deployment of a functional core reporting mechanism, and the ability for users to reliably submit verified reports.

### Stories

1.  **Story 1.1: Project & Repo Setup**
    *   **As a developer,** I want to initialize the monorepo with separate packages for the mobile app and backend services, so that we have a clean, organized structure.
    *   **Acceptance Criteria:**
        *   AC 1: A monorepo is created in Git with placeholder packages for the mobile app, reporting service, agent service, and admin service.
        *   AC 2: Basic linting and formatting configurations are in place.

2.  **Story 1.2: Basic CI/CD Pipeline**
    *   **As a developer,** I want a basic CI/CD pipeline that runs on every commit to ensure code quality.
    *   **Acceptance Criteria:**
        *   AC 1: The pipeline is triggered on pushes, installs dependencies, and runs linter checks.

3.  **Story 1.3: Home Screen & Navigation**
    *   **As a user,** I want a clear home screen to choose between "Report an Issue" and "Ask a Question," so I can easily access the function I need.
    *   **Acceptance Criteria:**
        *   AC 1: A home screen is implemented with two clear navigation options.
        *   AC 2: Tapping "Report an Issue" navigates to the report submission screen.

4.  **Story 1.4: Voice-to-Text Report Submission UI**
    *   **As a citizen,** I want a "Tap and Speak" button to easily describe my civic issue.
    *   **Acceptance Criteria:**
        *   AC 1: The report submission screen has a prominent record button that initiates voice recording and displays the transcribed text.

5.  **Story 1.5: Photo Attachment**
    *   **As a citizen,** I want to attach a geo-tagged photo to my report to provide visual proof.
    *   **Acceptance Criteria:**
        *   AC 1: The user can attach a photo from their camera or gallery, which is then displayed on the submission screen.

6.  **Story 1.6: Report Submission Service**
    *   **As a developer,** I want a backend endpoint that saves report data to the **Complaints DB**.
    *   **Acceptance Criteria:**
        *   AC 1: A `/reports` POST endpoint in the `reporting-service` accepts the report data.
        *   AC 2: The service saves the data specifically to the **Complaints DB** (e.g., PostgreSQL) and returns a unique tracking ID.

7.  **Story 1.7: Confirmation Screen**
    *   **As a citizen,** I want a confirmation screen with a tracking ID so I have confidence my report was received.
    *   **Acceptance Criteria:**
        *   AC 1: After submission, the user is shown a confirmation screen with the tracking ID.

### Success Criteria

*   A user successfully submits a verified report in under 60 seconds.
*   A user can track the status of their submitted report (initial tracking ID provided).
*   A user feels confident that their report has been received and will be reviewed.
*   The project's foundational infrastructure (monorepo, basic CI/CD) is established.

### Dependencies, Assumptions, and Risks

*   **Dependencies:** Reliable external APIs for maps (e.g., Google Maps) for geo-tagging.
*   **Assumptions:** Citizens are willing to grant camera and location permissions.
*   **Key Risks:** Low user adoption if the app is not marketed effectively or if citizens remain skeptical. Poor data quality even with photo verification.
