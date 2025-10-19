# 13. Development Workflow

This section outlines the standardized process for setting up and running the project locally. A smooth and consistent development workflow is essential for developer productivity.

## 13.1. Local Development Setup

### Prerequisites

Before starting, ensure you have the following installed:

```bash
# Node.js (v18 or later)
# uv (for package management)
# Docker (for running local database instances if not using cloud-based dev environments)
# Turborepo CLI (globally installed: uv add -g turbo)
```

### Initial Setup

To set up the project for the first time:

```bash
# 1. Clone the repository
git clone <repository_url>
cd civic-voice-assistant

# 2. Install all dependencies using uv
uv install

# 3. Set up your local environment variables
cp .env.example .env
# ... then fill in the .env file with your local secrets
```

### Development Commands

We will leverage Turborepo to manage our development scripts.

```bash
# Start all applications (mobile, admin-web, api) in parallel
uv turbo dev

# Start only the mobile application
uv turbo dev --filter=mobile

# Start only the admin web dashboard
uv turbo dev --filter=admin-web

# Run all tests across the entire monorepo
uv turbo test

# Run linting across the entire monorepo
uv turbo lint
```

## 13.2. Environment Configuration

The `.env` file at the root of the project will contain all necessary environment variables.

### Required Environment Variables

```bash
# .env

# Frontend (React Native & Next.js - must be prefixed)
# These are public and will be exposed to the client
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-public-anon-key>

# Backend (Server-side only)
# These are secret and must not be exposed to the client
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
REDIS_URL=redis://...
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
GOOGLE_NLP_API_KEY=<your-google-nlp-api-key>

# No shared variables are expected, as frontend and backend variables
# should be kept separate for security.
```
