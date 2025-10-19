# 14. Deployment Architecture

This section defines the strategy for deploying the applications and services to our chosen platforms, Vercel and Supabase. The goal is a fully automated, continuous deployment pipeline.

## 14.1. Deployment Strategy

Our deployment strategy is unified around Vercel, which will handle the hosting for our frontend applications and our backend serverless functions.

**Frontend Deployment (`admin-web`):**

- **Platform:** Vercel
- **Build Command:** `uv turbo build --filter=admin-web`
- **Output Directory:** Auto-detected by Vercel for Next.js (`.next`)
- **CDN/Edge:** Vercel Global Edge Network

**Backend Deployment (`api`):**

- **Platform:** Vercel
- **Build Command:** `uv turbo build --filter=api`
- **Deployment Method:** Vercel automatically detects the `/apps/api` directory and deploys each file as an individual Serverless Function, accessible via the same domain as the frontend.

_(Note: The React Native `mobile` app is not "deployed" in the same way. It is built into a binary and submitted to the Apple App Store and Google Play Store. The CI/CD pipeline can be extended to automate this build and submission process.)_

## 14.2. CI/CD Pipeline (GitHub Actions)

We will use GitHub Actions to automate our testing and deployment pipeline. The following workflow will be triggered on pushes and pull requests to the main branches.

```yaml
# .github/workflows/ci.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test_and_build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup uv
        uses: uv/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "uv"

      - name: Install dependencies
        run: uv install

      - name: Run linting
        run: uv turbo lint

      - name: Run tests
        run: uv turbo test

      - name: Run build
        run: uv turbo build

  deploy_staging:
    needs: test_and_build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      # ... steps to install Vercel CLI and deploy to staging
      - name: Deploy to Vercel (Staging)
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}

  deploy_production:
    needs: test_and_build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # ... steps to install Vercel CLI and deploy to production
      - name: Deploy to Vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 14.3. Environments

We will maintain three distinct environments, each with its own Supabase project to ensure data isolation.

| Environment     | Frontend URL             | Backend URL        | Purpose                                                                                    |
| :-------------- | :----------------------- | :----------------- | :----------------------------------------------------------------------------------------- |
| **Development** | `localhost:3000`         | `localhost:3001`   | Local development by engineers. Connects to a local or dev Supabase project.               |
| **Staging**     | `staging.app-domain.com` | (Same as Frontend) | Pre-production testing (QA). Mirrors production. Connects to the Staging Supabase project. |
| **Production**  | `app.app-domain.com`     | (Same as Frontend) | Live environment for end-users. Connects to the Production Supabase project.               |
