## Epic: Live Data Management

### Goal

This epic delivers the essential tools for administrators to populate and manage the content within the **Live DB**, ensuring the agent provides accurate, up-to-date information for non-real-time queries.

### Description

While Epic 3 established the Civic Information Agent's ability to handle real-time data (like traffic), this epic focuses on enabling the agent to answer questions that are not covered by live APIs. This addresses the need for city authorities to proactively provide information to citizens on various civic topics (e.g., garbage collection schedules, public service announcements, common FAQs). By providing a content management interface for the Live DB, this epic ensures the agent can offer comprehensive and accurate information, further enhancing its value as a civic information resource.

**Existing System Context:**
*   **Current relevant functionality:** The Civic Information Agent (from Epic 3) can answer real-time queries using external APIs and has a dedicated Live DB. This epic builds upon that Live DB.
*   **Technology stack:** Leverages the existing admin dashboard (from Epic 2) for a new content management section. The `agent-service` (from Epic 3) will be enhanced to retrieve information from the Live DB. The Live DB (NoSQL/document database) will store this informational content.
*   **Integration points:** Integrates with the admin dashboard for content input and with the `agent-service` for content retrieval.

**Enhancement Details:**
*   **What's being added/changed:** This epic introduces a new section within the admin dashboard for managing the agent's knowledge base. It includes features for creating, editing, and tagging informational content, and enhances the `agent-service` to retrieve and respond with this stored knowledge.
*   **How it integrates:** Administrators will use the secure admin dashboard to update the Live DB. The `agent-service` will then query this Live DB to answer user questions that match the stored content.
*   **Success criteria:** Administrators can easily add and manage informational content in the Live DB. The Civic Information Agent can accurately retrieve and present stored knowledge from the Live DB in response to user queries.

### Stories

1.  **Story 4.1: Basic Content Management UI**
    *   **As an admin,** I want a new section in the admin dashboard for managing the agent's knowledge, so I have a central place to update its information.
    *   **Acceptance Criteria:**
        *   AC 1: A new "Agent Content" section is added to the admin dashboard's navigation.
        *   AC 2: This section has a simple interface for viewing, adding, and editing informational content.

2.  **Story 4.2: Create & Edit Informational Content**
    *   **As an admin,** I want a form to create and edit informational content with a title, body, and relevant tags, so I can add new knowledge for the agent.
    *   **Acceptance Criteria:**
        *   AC 1: The "Agent Content" section has a form with fields for a title, body text, and searchable tags (e.g., "garbage," "waste").
        *   AC 2: Submitting the form saves the content as a new document in the **Live DB**.

3.  **Story 4.3: Agent Knowledge Retrieval**
    *   **As a developer,** I want the `agent-service` to search the **Live DB** for content based on keywords from a user's query.
    *   **Acceptance Criteria:**
        *   AC 1: The `agent-service` can search the **Live DB** for documents matching keywords.
        *   AC 2: The search function returns the most relevant document(s).

4.  **Story 4.4: Agent Responds with Stored Knowledge**
    *   **As a user,** when I ask "why was garbage not picked up?", I want to receive a relevant explanation from the agent.
    *   **Acceptance Criteria:**
        *   AC 1: The NLP service is updated to identify informational queries.
        *   AC 2: When this intent is detected, the `agent-service` searches the **Live DB** using keywords from the query.
        *   AC 3: If a relevant document is found, its content is sent back to the user. If not, a "Sorry, I don't have information on that" message is sent.

### Success Criteria

*   Administrators can successfully add, edit, and manage informational content for the Civic Information Agent.
*   The Civic Information Agent can accurately retrieve and present stored knowledge from the Live DB in response to user queries.
*   The agent provides comprehensive answers to non-real-time civic questions.

### Dependencies, Assumptions, and Risks

*   **Dependencies:** Completion of Epic 3 (Civic Information Agent MVP) for the `agent-service` and Live DB infrastructure. Completion of Epic 2 (Admin Triage & Feedback Loop) for the admin dashboard base.
*   **Assumptions:** City authorities are willing to dedicate resources to populate and maintain the Live DB content.
*   **Key Risks:** Poor data quality or outdated information in the Live DB could lead to inaccurate agent responses and erode user trust.
