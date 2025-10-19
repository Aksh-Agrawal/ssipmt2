## Epic: Civic Information Agent (MVP)

### Goal

This epic delivers the minimum viable version of the AI agent, allowing users to ask questions about initial topics (e.g., traffic) and receive answers from the **Live DB** and external APIs.

### Description

This epic introduces the second core purpose of the AI-Powered Civic Voice Assistant: acting as a Civic Information Agent. It addresses the citizen's need for accessible, real-time information about city services and infrastructure, overcoming language and technology barriers. The MVP focuses on establishing the agent's core infrastructure, including a new, separate Live Database, and enabling it to answer queries about a single, high-value topic: live traffic, by integrating with an external API.

**Existing System Context:**
*   **Current relevant functionality:** The system now supports citizen reporting (from Epic 1) and admin triage (from Epic 2). This epic introduces a new, distinct functionality.
*   **Technology stack:** This epic introduces a new, separate **Live DB** (likely a fast-reading NoSQL or document database like Redis or MongoDB) optimized for rapid query needs. A new `agent-service` will be developed, integrated with an NLP service and external APIs.
*   **Integration points:** The `agent-service` will integrate with the mobile application's new "Ask a Question" interface, the Live DB, and external traffic APIs.

**Enhancement Details:**
*   **What's being added/changed:** This epic introduces the Civic Information Agent, including its dedicated Live DB, a new map and chat UI in the mobile app, integration with an external traffic API, and basic NLP for query processing.
*   **How it integrates:** Users will interact with the agent via a conversational, chat-based interface within the mobile app, which will query the Live DB and external APIs through the `agent-service`.
*   **Success criteria:** The agent successfully answers user queries about traffic by retrieving information from the Live DB and external APIs. Users can easily access and interact with the agent through the new UI.

### Stories

1.  **Story 3.1: Live DB and Agent Service Setup**
    *   **As a developer,** I want to set up the **Live DB** and the initial `agent-service`, so we have the foundation for the information agent.
    *   **Acceptance Criteria:**
        *   AC 1: A new database is provisioned for the **Live DB** (e.g., Redis, MongoDB).
        *   AC 2: The `agent-service` is initialized with configuration to connect to the Live DB.

2.  **Story 3.2: Agent UI Shell (Map & Chat)**
    *   **As a user,** I want to see a screen with a map and a chat input field, so I have an interface to interact with the agent.
    *   **Acceptance Criteria:**
        *   AC 1: An "Agent/Map Screen" is created in the mobile app, showing an interactive map.
        *   AC 2: A text input field and a "Send" button are present for chatting with the agent.

3.  **Story 3.3: External Traffic API Integration**
    *   **As a developer,** I want the `agent-service` to connect to a real-time traffic API, so the agent can answer questions about traffic.
    *   **Acceptance Criteria:**
        *   AC 1: The `agent-service` can successfully fetch and parse live traffic data from a chosen external API (e.g., Google Maps API).
        *   AC 2: API keys are securely managed.

4.  **Story 3.4: Basic Query Processing (NLP)**
    *   **As a developer,** I want the `agent-service` to use an NLP service to understand basic user questions about traffic.
    *   **Acceptance Criteria:**
        *   AC 1: The `agent-service` is integrated with an NLP service (e.g., Dialogflow).
        *   AC 2: The NLP service is trained to recognize user intents related to traffic (e.g., "check traffic," "is road blocked").

5.  **Story 3.5: Agent Responds with Traffic Info**
    *   **As a user,** when I ask "how is the traffic to the station?", I want to receive a text response describing the current traffic conditions.
    *   **Acceptance Criteria:**
        *   AC 1: When a traffic-related intent is detected, the `agent-service` fetches data from the traffic API.
        *   AC 2: The service formats the data into a human-readable string and sends it back to the user's chat interface.

### Success Criteria

*   The Civic Information Agent is successfully deployed and accessible via the mobile app.
*   Users can ask basic traffic-related questions and receive accurate, real-time responses.
*   The `agent-service` successfully integrates with the Live DB and an external traffic API.

### Dependencies, Assumptions, and Risks

*   **Dependencies:** Completion of Epic 1 (Foundation & Core Reporting) for the mobile app base. A robust Natural Language Processing (NLP) service. A reliable, real-time external API for traffic data.
*   **Assumptions:** Voice recognition technology is sufficiently mature to handle local dialects and accents effectively.
*   **Key Risks:** The reliability and performance of external traffic APIs. The accuracy and effectiveness of the chosen NLP service in understanding diverse user queries.
