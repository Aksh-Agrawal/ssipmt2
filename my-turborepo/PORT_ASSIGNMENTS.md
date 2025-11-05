# Port Assignments

This document defines the port assignments for all applications in the monorepo to prevent conflicts during development.

## Application Ports

| Application      | Port | Purpose                              |
| ---------------- | ---- | ------------------------------------ |
| **web-platform** | 3000 | Main citizen-facing web platform     |
| **api**          | 3001 | Backend API service (Hono server)    |
| **admin-web**    | 3002 | Admin dashboard interface            |
| **docs**         | 3003 | Documentation site (if needed)       |
| **mobile**       | 8081 | Metro bundler (React Native default) |

## Running Multiple Services

All services can run concurrently without port conflicts:

```bash
# From the monorepo root
npm run dev
```

Or run individual services:

```bash
# Web Platform (port 3000)
npm run dev --workspace=web-platform

# API Server (port 3001)
npm run dev --workspace=api

# Admin Dashboard (port 3002)
npm run dev --workspace=admin-web

# Mobile App (Metro bundler on 8081)
cd apps/mobile && npm run android
# or
cd apps/mobile && npm run ios
```

## Environment Variables

The API server uses the `PORT` environment variable which defaults to 3001 if not set:

```bash
# Optional: Override API port
PORT=3001 npm run dev --workspace=api
```

## Notes

- All Next.js applications (web-platform, admin-web, docs) are configured with explicit `--port` flags in their `dev` scripts
- The API server port is managed via the `PORT` environment variable (declared in `turbo.json`)
- Metro bundler for the mobile app uses the React Native default port (8081)
