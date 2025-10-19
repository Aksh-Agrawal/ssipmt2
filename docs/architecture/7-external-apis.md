# 7. External APIs

This section documents the critical external services the project will integrate with. Properly identifying and understanding these dependencies is crucial for risk management, as we are reliant on these third-party systems for core functionality.

## 7.1. NLP Service (Google Cloud Natural Language)

- **Purpose:** To process natural language queries from users for the AI Agent and to perform sentiment/category analysis on incoming issue reports.
- **Documentation:** `https://cloud.google.com/natural-language/docs`
- **Base URL(s):** `https://language.googleapis.com`
- **Authentication:** API Key or OAuth 2.0 Service Account.
- **Rate Limits:** Standard Google Cloud quotas apply. Must be reviewed during implementation to ensure they align with expected user load.
- **Integration Notes:** This service is fundamental for both the agent's ability to understand questions and the backend's ability to auto-triage reports. The specific methods used will be `analyzeEntities`, `analyzeSyntax`, and potentially `classifyText`.

## 7.2. Traffic API (Google Maps Routes API)

- **Purpose:** To provide real-time traffic data, enabling the AI Agent to answer user questions about road conditions and travel times.
- **Documentation:** `https://developers.google.com/maps/documentation/routes`
- **Base URL(s):** `https://routes.googleapis.com`
- **Authentication:** API Key.
- **Rate Limits:** This is a critical consideration. The free tier is limited, and costs can scale with usage. Caching strategies will be essential to manage costs and stay within limits.
- **Integration Notes:** The `computeRoutes` method will be the primary endpoint used. The response provides real-time traffic conditions, which will be parsed and formatted by the `Agent Service` before being sent to the user. This is identified as a key technical and financial risk in the PRD.
