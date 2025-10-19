# 17. Coding Standards

This section defines a small but non-negotiable set of coding standards. These rules are designed to ensure consistency, prevent common errors, and make the codebase easy for both human and AI developers to navigate and modify. These will be enforced by linting rules where possible.

## 17.1. Critical Fullstack Rules

- **Single Source of Truth for Types:** All shared data structures (e.g., `Report`, `AdminUser`) MUST be defined in the `packages/shared-types` package. Never redefine these types in an application or service.
- **Use the Service Layer:** Frontend applications MUST NOT make direct API calls (e.g., using `fetch` or `axios` in a component). All data fetching and mutation must be done through the dedicated service layer (e.g., `reportService.submitReport`).
- **Isolate Business Logic:** API route handlers in `apps/api` should be lean. They are responsible for request/response handling ONLY. All core business logic MUST be implemented in functions within the `packages/services` directory.
- **Centralized Environment Variables:** Never access environment variables directly via `process.env` within application code. Create a single, validated config object at application startup and import from it.
- **Immutable State:** Never mutate frontend state directly. Always use the actions and setters provided by the Zustand store to ensure predictable state transitions.

## 17.2. Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| Components (React) | `PascalCase` | `ReportCard.tsx` |
| Hooks (React) | `camelCase` with `use` prefix | `useAuth.ts` |
| API URL Paths | `kebab-case` | `/api/v1/user-profiles` |
| Database Tables/Columns | `snake_case` | `user_profiles`, `created_at` |
| Functions / Variables | `camelCase` | `getUserProfile()` |
| TypeScript Interfaces | `PascalCase` | `interface Report { ... }` |
