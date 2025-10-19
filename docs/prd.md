# AI-Powered Civic Voice Assistant Product Requirements Document (PRD) - v2.0

## 1. Goals and Background Context

### 1.1. Goals

*   **Core Goal 1 (Reporting):** Provide a simple, reliable channel for citizens to report civic issues and receive transparent feedback on their resolution.
*   **Core Goal 2 (Information):** Provide a real-time, accessible information service for citizens to get answers to common civic questions (e.g., traffic, service status).
*   Increase overall citizen engagement and public trust.
*   Improve the efficiency of city authorities.
*   Overcome language and technology barriers for all users.

### 1.2. Background Context

Citizens currently face two primary challenges: 1) inefficient and opaque channels for reporting local civic issues, and 2) a lack of accessible, real-time information about the status of city services and infrastructure. This leads to public frustration, erodes trust, and creates inefficiencies for city authorities.

This project aims to solve both problems with a unified, AI-powered mobile application. It will serve as a dual-purpose platform:

1.  **An Issue Reporting System:** A "Tap and Speak" interface will allow users to easily submit geo-tagged, photo-verified reports for issues like potholes or garbage, and track them to completion.
2.  **A Civic Information Agent:** An integrated AI agent will answer user queries about real-time conditions like traffic jams, road closures, and the status of civic services.

By combining these functionalities, the platform will create a comprehensive, trustworthy communication bridge between citizens and their city.

### 1.3. Change Log

| Date       | Version | Description                                                                          | Author    |
| :--------- | :------ | :----------------------------------------------------------------------------------- | :-------- |
| 2025-10-17 | 2.0     | Major revision to incorporate the Civic Information Agent and two-database architecture. | John (PM) |
| 2025-10-17 | 1.0     | Initial draft based on Project Brief.                                                | John (PM) |

### 2. Requirements

#### 2.1. Functional

**Issue Reporting System**
1.  **FR1:** Users must be able to submit a report with a geo-tagged photo to a secure **Complaints Database**.
2.  **FR2:** The primary interface for describing an issue will be voice-based.
3.  **FR3:** The system must automatically categorize and prioritize each report in the Complaints Database.
4.  **FR4:** An admin dashboard must display reports from the Complaints Database, sorted by urgency.
5.  **FR5:** Users must receive a unique tracking ID after submitting a report.
6.  **FR6:** Users must be able to check the status of their report using the tracking ID.

**Civic Information Agent**
7.  **FR7:** The application will feature an integrated map view for accessibility.
8.  **FR8:** Users must be able to ask the AI agent natural language questions (e.g., "Is the road to the station blocked?").
9.  **FR9:** The agent must answer queries by retrieving information from a separate **Live Database**.
10. **FR10:** The agent must answer queries about real-time traffic by accessing an external traffic API.
11. **FR11:** A secure interface must exist for authorities to update information in the Live Database.

#### 2.2. Non-Functional

1.  **NFR1:** The system must maintain two logically separate databases: a **Complaints Database** (restricted access) and a **Live Database** (public information).
2.  **NFR2:** The app must be lightweight and responsive on low-end smartphones.
3.  **NFR3:** The backend must use open-source frameworks to manage costs.
4.  **NFR4:** Both databases must be scalable and reliable.
5.  **NFR5:** A robust multilingual engine must support both issue reporting and agent queries.
6.  **NFR6:** The infrastructure will be hosted on a cloud platform.
7.  **NFR7:** Data in the Complaints Database must adhere to strict privacy and security standards.

### 3. User Interface Design Goals

#### 3.1. Overall UX Vision
The vision remains "Simplicity and Trust," but it now applies to two core user journeys: reporting an issue and getting information. The UI must provide a clear, intuitive way to access both functions without confusion.

#### 3.2. Key Interaction Paradigms
*   **For Reporting:** The "Tap and Speak" model remains the primary interaction.
*   **For Information:** A conversational, chat-based interface for the AI agent, integrated with a map for location-specific queries.

#### 3.3. Core Screens and Views
*   **Home Screen:** A new main screen to allow users to choose between "Report an Issue" and "Ask a Question."
*   **Report Submission Screen:** The original screen with a record button, text field, and camera button.
*   **Confirmation/Tracking Screen:** The original screen for displaying a report's tracking ID and status.
*   **Agent/Map Screen:** A new screen combining a map view with a chat interface to interact with the Civic Information Agent.

#### 3.4. Accessibility: WCAG AA
Adherence to WCAG 2.1 AA standards is critical, especially with the added complexity of a map and chat interface.

#### 3.5. Branding
*Assumption:* A clean, modern, and trustworthy aesthetic will be used to visually unify the two distinct features into a single, cohesive application.

#### 3.6. Target Device and Platforms: Android and iOS
The application will be developed for native deployment on both Android and iOS devices.

### 4. Technical Assumptions

#### 4.1. Repository Structure: Monorepo
*Assumption:* A monorepo remains the best choice to simplify dependency management across the multiple services we now require (reporting service, agent service, admin service).

#### 4.2. Service Architecture: Microservices
A microservices architecture is now essential. We will likely need, at a minimum:
*   A `reporting-service` for the Complaints DB.
*   An `agent-service` for querying the Live DB and external APIs.
*   An `admin-service` for viewing reports and managing Live DB content.

#### 4.3. Testing Requirements: Unit + Integration
The strategy remains a mix of unit tests for business logic and integration tests for our two primary end-to-end workflows: 1) submitting a report and 2) asking the agent a question.

#### 4.4. Additional Technical Assumptions and Requests
*   **Databases:**
    *   **Complaints DB:** Will be a relational database with strong geospatial support (e.g., PostgreSQL with PostGIS) to handle structured report data.
    *   **Live DB:** Will likely be a fast-reading NoSQL or document database (e.g., Redis, MongoDB) optimized for the agent's rapid query needs.
*   **AI/NLP Service:** A robust Natural Language Processing (NLP) service (e.g., Dialogflow, Rasa, or a direct LLM API) is a new core dependency for understanding the agent's queries.
*   **External APIs:** The system will depend on a reliable, real-time external API for traffic data. This is a key technical risk to investigate.

### 5. Epic List

1.  **Epic 1: Foundation & Core Reporting:** Establish the project's foundation and deliver the core feature for users to submit a verified civic issue report to the **Complaints DB**.
2.  **Epic 2: Admin Triage & Feedback Loop:** Empower authorities to manage reports in the **Complaints DB** and provide status updates back to citizens, completing the reporting-to-resolution loop.
3.  **Epic 3: Civic Information Agent (MVP):** Deliver a minimum viable version of the AI agent, allowing users to ask questions about initial topics (e.g., traffic) and receive answers from the **Live DB** and external APIs.
4.  **Epic 4: Live Data Management:** Build the necessary tools for administrators to populate and manage the content within the **Live DB**, ensuring the agent provides accurate, up-to-date information.

### 6. Epic 1: Foundation & Core Reporting

**Goal:** This epic sets up the project's infrastructure and delivers the core user-facing feature: submitting a verified civic issue report to the **Complaints DB**.

---

**Story 1.1: Project & Repo Setup**
*As a developer, I want to initialize the monorepo with separate packages for the mobile app and backend services, so that we have a clean, organized structure.*
*   **AC 1:** A monorepo is created in Git with placeholder packages for the mobile app, reporting service, agent service, and admin service.
*   **AC 2:** Basic linting and formatting configurations are in place.

---

**Story 1.2: Basic CI/CD Pipeline**
*As a developer, I want a basic CI/CD pipeline that runs on every commit to ensure code quality.*
*   **AC 1:** The pipeline is triggered on pushes, installs dependencies, and runs linter checks.

---

**Story 1.3: Home Screen & Navigation**
*As a user, I want a clear home screen to choose between "Report an Issue" and "Ask a Question," so I can easily access the function I need.*
*   **AC 1:** A home screen is implemented with two clear navigation options.
*   **AC 2:** Tapping "Report an Issue" navigates to the report submission screen.

---

**Story 1.4: Voice-to-Text Report Submission UI**
*As a citizen, I want a "Tap and Speak" button to easily describe my civic issue.*
*   **AC 1:** The report submission screen has a prominent record button that initiates voice recording and displays the transcribed text.

---

**Story 1.5: Photo Attachment**
*As a citizen, I want to attach a geo-tagged photo to my report to provide visual proof.*
*   **AC 1:** The user can attach a photo from their camera or gallery, which is then displayed on the submission screen.

---

**Story 1.6: Report Submission Service**
*As a developer, I want a backend endpoint that saves report data to the **Complaints DB**.*
*   **AC 1:** A `/reports` POST endpoint in the `reporting-service` accepts the report data.
*   **AC 2:** The service saves the data specifically to the **Complaints DB** (e.g., PostgreSQL) and returns a unique tracking ID.

---

**Story 1.7: Confirmation Screen**
*As a citizen, I want a confirmation screen with a tracking ID so I have confidence my report was received.*
*   **AC 1:** After submission, the user is shown a confirmation screen with the tracking ID.

### 7. Epic 2: Admin Triage & Feedback Loop

**Goal:** This epic delivers the complete management lifecycle for the issue reporting system. It provides a secure dashboard for authorities to manage reports from the **Complaints DB** and a way for citizens to see the status of those updates.

---

**Story 2.1: Admin Dashboard UI Shell & Auth**
*As an admin, I want a basic web application with a secure login, so that I have a protected place to view and manage reports.*
*   **AC 1:** A new web application for the admin dashboard is created.
*   **AC 2:** A login page authenticates users against a list of authorized administrators.

---

**Story 2.2: AI-Powered Categorization & Prioritization**
*As a developer, I want a service that automatically analyzes new reports in the **Complaints DB** to assign a category and priority, so that admins see an organized and triaged list.*
*   **AC 1:** When a new report is saved, a process is triggered to analyze its content using an AI service.
*   **AC 2:** The determined category and urgency level are saved to the report's record in the **Complaints DB**.

---

**Story 2.3: Prioritized Report List View**
*As an admin, I want to see a list of incoming reports, automatically sorted by urgency, so I can address the most critical issues first.*
*   **AC 1:** The admin dashboard fetches and displays a list of reports from the **Complaints DB**.
*   **AC 2:** The list is sorted by urgency (High first) and then by date.

---

**Story 2.4: Report Detail View**
*As an admin, I want to click on a report to see its full details, including the photo and map location, so that I can investigate the issue.*
*   **AC 1:** Clicking a report navigates to a detail view showing the full report text, photo, and a map of its location.

---

**Story 2.5: Update Report Status**
*As an admin, I want to change a report's status (e.g., "In Progress," "Resolved") from the detail view, so I can track its lifecycle.*
*   **AC 1:** The detail view has UI controls to change the report's status in the **Complaints DB**.
*   **AC 2:** The UI updates to reflect the new status.

---

**Story 2.6: Citizen Status Check**
*As a citizen, I want to use my tracking ID to see the current status of my report, so I know if it's being addressed.*
*   **AC 1:** The mobile app allows a user to check a report's status using their tracking ID.
*   **AC 2:** The app calls a public endpoint that returns the report's current status from the **Complaints DB**.

### 8. Epic 3: Civic Information Agent (MVP)

**Goal:** This epic delivers the minimum viable version of the Civic Information Agent. It focuses on setting up the agent's core infrastructure, including the new **Live DB**, and enabling it to answer queries about a single topic (live traffic) by integrating with an external API.

---

**Story 3.1: Live DB and Agent Service Setup**
*As a developer, I want to set up the **Live DB** and the initial `agent-service`, so we have the foundation for the information agent.*
*   **AC 1:** A new database is provisioned for the **Live DB** (e.g., Redis, MongoDB).
*   **AC 2:** The `agent-service` is initialized with configuration to connect to the Live DB.

---

**Story 3.2: Agent UI Shell (Map & Chat)**
*As a user, I want to see a screen with a map and a chat input field, so I have an interface to interact with the agent.*
*   **AC 1:** An "Agent/Map Screen" is created in the mobile app, showing an interactive map.
*   **AC 2:** A text input field and a "Send" button are present for chatting with the agent.

---

**Story 3.3: External Traffic API Integration**
*As a developer, I want the `agent-service` to connect to a real-time traffic API, so the agent can answer questions about traffic.*
*   **AC 1:** The `agent-service` can successfully fetch and parse live traffic data from a chosen external API (e.g., Google Maps API).
*   **AC 2:** API keys are securely managed.

---

**Story 3.4: Basic Query Processing (NLP)**
*As a developer, I want the `agent-service` to use an NLP service to understand basic user questions about traffic.*
*   **AC 1:** The `agent-service` is integrated with an NLP service (e.g., Dialogflow).
*   **AC 2:** The NLP service is trained to recognize user intents related to traffic (e.g., "check traffic," "is road blocked").

---

**Story 3.5: Agent Responds with Traffic Info**
*As a user, when I ask "how is the traffic to the station?", I want to receive a text response describing the current traffic conditions.*
*   **AC 1:** When a traffic-related intent is detected, the `agent-service` fetches data from the traffic API.
*   **AC 2:** The service formats the data into a human-readable string and sends it back to the user's chat interface.

### 9. Epic 4: Live Data Management

**Goal:** This epic delivers the essential tools for administrators to manage the non-live content within the **Live DB**. This ensures the Civic Information Agent can answer questions that aren't covered by live APIs, such as "Why wasn't garbage picked up today?".

---

**Story 4.1: Basic Content Management UI**
*As an admin, I want a new section in the admin dashboard for managing the agent's knowledge, so I have a central place to update its information.*
*   **AC 1:** A new "Agent Content" section is added to the admin dashboard's navigation.
*   **AC 2:** This section has a simple interface for viewing, adding, and editing informational content.

---

**Story 4.2: Create & Edit Informational Content**
*As an admin, I want a form to create and edit informational content with a title, body, and relevant tags, so I can add new knowledge for the agent.*
*   **AC 1:** The "Agent Content" section has a form with fields for a title, body text, and searchable tags (e.g., "garbage," "waste").
*   **AC 2:** Submitting the form saves the content as a new document in the **Live DB**.

---

**Story 4.3: Agent Knowledge Retrieval**
*As a developer, I want the `agent-service` to search the **Live DB** for content based on keywords from a user's query.*
*   **AC 1:** The `agent-service` can search the **Live DB** for documents matching keywords.
*   **AC 2:** The search function returns the most relevant document(s).

---

**Story 4.4: Agent Responds with Stored Knowledge**
*As a user, when I ask "why was garbage not picked up?", I want to receive a relevant explanation from the agent.*
*   **AC 1:** The NLP service is updated to identify informational queries.
*   **AC 2:** When this intent is detected, the `agent-service` searches the **Live DB** using keywords from the query.
*   **AC 3:** If a relevant document is found, its content is sent back to the user. If not, a "Sorry, I don't have information on that" message is sent.

### 10. Checklist Results Report (v2.0)

**Executive Summary**
*   **Overall PRD Completeness:** 95%
*   **MVP Scope Appropriateness:** Just Right (for the new, expanded MVP).
*   **Readiness for Architecture Phase:** Ready.
*   **Critical Gaps or Concerns:** The primary risk is the increased project complexity and the dependencies on external APIs (for Traffic and NLP), which require investigation.

**Category Analysis**

| Category                         | Status | Critical Issues |
| -------------------------------- | ------ | --------------- |
| 1. Problem Definition & Context  | PASS   | None            |
| 2. MVP Scope Definition          | PASS   | None            |
| 3. User Experience Requirements  | PASS   | None            |
| 4. Functional Requirements       | PASS   | None            |
| 5. Non-Functional Requirements   | PASS   | None            |
| 6. Epic & Story Structure        | PASS   | None            |
| 7. Technical Guidance            | PASS   | None            |
| 8. Cross-Functional Requirements | PASS   | None            |
| 9. Clarity & Communication       | PASS   | None            |

**Final Decision: READY FOR ARCHITECT**
The revised PRD is comprehensive and ready for architectural design.

### 11. Next Steps (v2.0)

#### 11.1. UX Expert Prompt
> The revised Product Requirements Document (PRD v2.0) for the AI-Powered Civic Voice Assistant is complete. Please review the updated 'User Interface Design Goals' (Section 3) and the new epic structure to create the high-level front-end architecture and UI specifications for both the reporting and agent features.

#### 11.2. Architect Prompt
> The revised Product Requirements Document (PRD v2.0) is complete and includes a major scope expansion. Please review the full document, especially the 'Technical Assumptions' (Section 4) and the new four-epic structure. Your first priority is to investigate and de-risk the key new dependencies: the external traffic API and the NLP service.




