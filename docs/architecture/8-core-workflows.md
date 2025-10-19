# 8. Core Workflows

This section provides sequence diagrams to illustrate the step-by-step interactions between components for the system's most critical user journeys. These diagrams are essential for understanding how data flows through the system to fulfill a user's request.

## 8.1. Workflow 1: New Issue Submission

This diagram shows the flow of a citizen submitting a new issue report, from the mobile app to the database, including the asynchronous AI-powered analysis.

```mermaid
sequenceDiagram
    participant Citizen
    participant Mobile App
    participant API Gateway
    participant Reporting Service
    participant Complaints DB (PostgreSQL)
    participant AI Analysis Service

    Citizen->>Mobile App: Fills out and submits report
    Mobile App->>API Gateway: POST /api/v1/reports
    API Gateway->>Reporting Service: Forward request
    Reporting Service->>Complaints DB (PostgreSQL): INSERT new report
    Complaints DB (PostgreSQL)-->>Reporting Service: Return report with ID
    Reporting Service-->>API Gateway: Respond with { trackingId }
    API Gateway-->>Mobile App: Respond with { trackingId }
    Mobile App-->>Citizen: Display confirmation screen

    par Asynchronous AI Analysis
        Reporting Service->>AI Analysis Service: Analyze report description
        AI Analysis Service-->>Reporting Service: Return category & priority
        Reporting Service->>Complaints DB (PostgreSQL): UPDATE report with analysis
    end
```

## 8.2. Workflow 2: Agent Traffic Query

This diagram illustrates how the AI agent processes a user's question about traffic, involving the NLP service and the external traffic data provider.

```mermaid
sequenceDiagram
    participant Citizen
    participant Mobile App
    participant API Gateway
    participant Agent Service
    participant NLP Service
    participant External Traffic API

    Citizen->>Mobile App: Asks "How is traffic to the station?"
    Mobile App->>API Gateway: POST /api/v1/agent/query
    API Gateway->>Agent Service: Forward query

    Agent Service->>NLP Service: Process query text
    NLP Service-->>Agent Service: Return intent: 'check_traffic', entity: 'station'

    Agent Service->>External Traffic API: Request traffic data for 'station'
    External Traffic API-->>Agent Service: Return live traffic data

    Agent Service->>Agent Service: Format data into a human-readable response
    Agent Service-->>API Gateway: Return formatted response
    API Gateway-->>Mobile App: Return response
    Mobile App-->>Citizen: Display answer: "Traffic to the station is currently slow."
```
