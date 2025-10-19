# 5. API Specification

This section defines the REST API that will serve as the interface between the clients (mobile app, admin dashboard) and the backend microservices. We will use the OpenAPI 3.0 standard to ensure a clear, language-agnostic contract. The API will be divided into three main sections: public-facing endpoints for citizens, agent endpoints for queries, and protected admin endpoints.

## 5.1. REST API Specification (OpenAPI 3.0)

Here is a condensed version of the OpenAPI specification, highlighting the most critical endpoints. The full `openapi.yaml` file will be generated and maintained in the repository.

```yaml
openapi: 3.0.3
info:
  title: AI-Powered Civic Voice Assistant API
  version: 1.0.0
  description: API for submitting civic reports and querying the information agent.

servers:
  - url: /api/v1
    description: API Gateway

paths:
  /reports:
    post:
      summary: Submit a new civic issue report
      tags: [Reports]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                description: { type: string }
                photoUrl: { type: string, format: uri }
                location: { $ref: '#/components/schemas/Location' }
                citizenId: { type: string, format: uuid }
      responses:
        '201':
          description: Report successfully submitted
          content:
            application/json:
              schema:
                type: object
                properties:
                  trackingId: { type: string, format: uuid }

  /reports/{id}:
    get:
      summary: Get the status of a specific report
      tags: [Reports]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: Report status
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string, format: uuid }
                  status: { $ref: '#/components/schemas/ReportStatus' }
                  updatedAt: { type: string, format: date-time }

  /agent/query:
    post:
      summary: Ask a question to the Civic Information Agent
      tags: [Agent]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string }
      responses:
        '200':
          description: Agent's response
          content:
            application/json:
              schema:
                type: object
                properties:
                  response: { type: string }

  /admin/reports:
    get:
      summary: Get a list of all reports (Admin only)
      tags: [Admin]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: A list of reports
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Report'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Report: 
      $ref: '../packages/shared-types/schemas/Report.json' # Placeholder for real path
    Location:
      type: object
      properties:
        latitude: { type: number }
        longitude: { type: number }
    ReportStatus:
      type: string
      enum: [Submitted, In Progress, Resolved, Rejected]

```
