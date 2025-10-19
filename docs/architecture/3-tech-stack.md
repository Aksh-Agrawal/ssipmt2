# 3. Tech Stack

This section outlines the specific technologies, frameworks, and services that will be used to build the AI-Powered Civic Voice Assistant. These choices are based on the architectural decisions made previously and are optimized for developer productivity, scalability, and cost-effectiveness.

## 3.1. Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| Frontend Language | TypeScript | 5.x | Type safety for mobile app | Reduces bugs and improves developer experience. |
| Frontend Framework | React Native | Latest | Cross-platform mobile app (iOS/Android) | Build for both platforms from a single codebase, saving time. |
| UI Component Library | React Native Paper | Latest | Material Design components for UI | High-quality, accessible components for a consistent look and feel. |
| State Management | Zustand | 4.x | Lightweight global state management | Simple, unopinionated, and avoids boilerplate compared to Redux. |
| Backend Language | TypeScript | 5.x | Type safety for backend services | Consistency with the frontend and robust error checking. |
| Backend Framework | Hono | 4.x | Performant API framework for serverless | Lightweight, extremely fast, and ideal for edge function environments like Vercel. |
| API Style | REST API | N/A | Client-server communication | Simple, well-understood, and perfectly suited for the required interactions. |
| Database | PostgreSQL | 15.x | Primary "Complaints DB" | Provided by Supabase; powerful, relational, with PostGIS for geo-data. |
| Cache / Live DB | Redis (Upstash) | N/A | "Live DB" for agent & caching | Blazing fast key-value store for real-time data retrieval. Upstash integrates well. |
| File Storage | Supabase Storage | N/A | Storing user-uploaded photos | Integrated with the BaaS, provides a simple and secure S3-compatible API. |
| Authentication | Supabase Auth | N/A | User and admin authentication | Handles JWTs, secure login, and session management out-of-the-box. |
| Frontend Testing | Jest & RNTL | Latest | Unit & component testing | Standard testing stack for React Native. |
| Backend Testing | Jest & Supertest | Latest | Unit & integration testing for API | Test business logic and API endpoints effectively. |
| E2E Testing | Maestro | Latest | End-to-end mobile app testing | Simpler and more reliable than alternatives for E2E flows. |
| Build Tool | Turborepo | Latest | Monorepo management | Manages dependencies and runs tasks efficiently across the monorepo. |
| Bundler | Metro | Latest | React Native bundler | Default and optimized for React Native development. |
| IaC Tool | Terraform | Latest | Infrastructure as Code (Optional) | Can be used to codify Supabase/Vercel setup for disaster recovery. |
| CI/CD | GitHub Actions | N/A | Continuous Integration/Deployment | Native to GitHub, excellent for automating tests and deployments. |
| Monitoring | Vercel Analytics | N/A | Frontend performance monitoring | Built-in to the Vercel platform for easy monitoring. |
| Logging | Pino | 8.x | Structured logging for backend | Lightweight, fast, and produces structured logs for easier analysis. |
| CSS Framework | N/A | N/A | React Native uses its own styling system | Styling will be handled via `StyleSheet` or a CSS-in-JS library. |
