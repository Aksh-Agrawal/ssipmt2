# 12. Unified Project Structure

This section outlines the complete directory structure for the monorepo. This structure is designed using Turborepo to manage the frontend applications, the backend API, and all the shared code in a clean and scalable way.

```plaintext
civic-voice-assistant/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── ci.yaml
├── apps/                       # Deployable applications
│   ├── mobile/                 # React Native mobile app for citizens
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/       # Screens and feature-specific logic
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── stores/
│   │   └── package.json
│   ├── admin-web/              # Next.js admin dashboard
│   │   ├── src/
│   │   │   ├── app/            # Next.js 13+ app router
│   │   │   └── components/
│   │   └── package.json
│   └── api/                    # Hono backend API on Vercel
│       └── v1/
│           ├── reports/
│           │   ├── index.ts
│           │   └── [id].ts
│           ├── agent/
│           │   └── query.ts
│           └── admin/
│               └── _middleware.ts
├── packages/                   # Shared local packages
│   ├── shared-types/           # Shared TypeScript types (Report, User, etc.)
│   │   └── src/
│   ├── ui/                     # Shared React components (e.g., for admin-web)
│   │   └── src/
│   ├── config/                 # Shared configurations
│   │   ├── eslint/
│   │   └── typescript/
│   ├── services/               # Shared backend business logic (The "Microservices")
│   │   ├── reporting/          # Reporting service logic & repository
│   │   └── agent/              # Agent service logic & repository
│   └── hooks/                  # Shared React hooks (e.g., useAuth)
├── infrastructure/             # Infrastructure as Code (IaC)
│   └── terraform/              # Optional Terraform scripts for Supabase
├── docs/                       # Project documentation
│   ├── prd.md
│   └── architecture.md
├── .env.example                # Template for environment variables
├── turbo.json                  # Turborepo configuration
└── README.md
```
