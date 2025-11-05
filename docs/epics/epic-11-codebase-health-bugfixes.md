# Epic 11: Codebase Health & Critical Bug Fixes - Brownfield Enhancement

## Epic Goal

Improve codebase quality, fix critical bugs, and ensure system stability by resolving TypeScript compilation errors, port conflicts, unresolved imports, and correcting misleading UI terminology to align with the civic information agent functionality rather than chatbot behavior.

## Epic Description

### Existing System Context

**Current relevant functionality:**

- Turborepo monorepo structure with multiple apps (api, admin-web, mobile, web-platform)
- AI-Powered Civic Voice Assistant with dual functionality:
  - Issue Reporting System (complaints database)
  - Civic Information Agent (live database queries)
- Voice interface for agent queries in mobile app
- Web platform interface for civic agent queries
- Hono-based API service with WebSocket support

**Technology stack:**

- **Frontend:** React Native (mobile), Next.js (web-platform, admin-web)
- **Backend:** Hono framework, Node.js
- **Infrastructure:** Supabase, Vercel
- **Monorepo:** Turborepo
- **Language:** TypeScript

**Integration points:**

- API server (`apps/api/src/index.ts`) - central routing for all services
- Voice service integration via WebSocket
- Mobile app agent chat screen with voice toggle
- Web platform chat interface

### Enhancement Details

**What's being added/changed:**

1. **Agent vs Chatbot Terminology** (Critical - User Experience)

   - Web platform currently uses "chatbot" terminology and "bot" message types
   - System is actually a "Civic Information Agent" that queries live databases and APIs
   - UI must reflect agent behavior (information retrieval) not chatbot behavior (conversational AI)

2. **Voice Toggle Button Missing** (Critical - Feature Completion)

   - Mobile `AgentChatScreen` has voice chat functionality implemented
   - Voice toggle button exists in code but may not be rendering properly
   - WebSocket integration for voice chat needs verification

3. **Import Resolution & Port Conflicts** (Critical - Build & Runtime)

   - Multiple TypeScript compilation errors in `apps/api/src/index.ts`
   - Unused imports (`jwt`, `injectWebSocket`)
   - Type mismatches in HTTP server creation
   - Environment variable dependencies not declared in `turbo.json`
   - Port conflicts when multiple services run simultaneously

4. **Additional Code Quality Issues** (Major/Minor)
   - Identify and fix remaining TypeScript errors across the codebase
   - Resolve any duplicate code or inconsistent patterns
   - Fix linting issues
   - Ensure proper error handling

**How it integrates:**

- Fixes apply to existing API, mobile, and web-platform apps
- No architectural changes required
- Maintains existing service communication patterns
- Preserves all current functionality while improving code quality

**Success criteria:**

- ✅ All TypeScript compilation errors resolved
- ✅ All apps can build successfully
- ✅ No port conflicts when running development servers
- ✅ Web platform uses "agent" terminology instead of "chatbot"
- ✅ Voice toggle button visible and functional in mobile AgentChatScreen
- ✅ All imports properly resolved
- ✅ turbo.json properly configured for environment variables
- ✅ Zero linting errors in critical paths
- ✅ Existing tests continue to pass

## Stories

### 1. **Story 11.1: Fix API Server TypeScript Errors and Port Configuration**

**Description:** Resolve all TypeScript compilation errors in `apps/api/src/index.ts`, fix HTTP server initialization, remove unused imports, declare environment variables in `turbo.json`, and ensure port configuration doesn't conflict with other services.

**Key Tasks:**

- Fix Hono server creation with proper Node.js adapter
- Remove unused imports (`jwt`, `injectWebSocket`)
- Declare `PORT` and `SUPABASE_JWT_SECRET` in `turbo.json`
- Verify port assignments across all apps (api: 3001, web-platform: 3000, admin-web: 3002, etc.)
- Test API server starts without errors

**Acceptance Criteria:**

- No TypeScript errors in `apps/api/src/index.ts`
- Server starts successfully on port 3001
- All environment variables properly declared
- WebSocket functionality remains operational

---

### 2. **Story 11.2: Update Web Platform Terminology from Chatbot to Agent**

**Description:** Update the web-platform application to use "Civic Information Agent" terminology instead of "chatbot" to accurately reflect the system's purpose of querying live civic data rather than engaging in conversational AI.

**Key Tasks:**

- Update `ChatInterface.tsx` message types from `'bot'` to `'agent'`
- Update UI labels and text references from "bot" to "agent"
- Update placeholder responses to reflect agent behavior
- Update component documentation/comments
- Ensure consistent terminology across all web-platform files

**Acceptance Criteria:**

- No references to "bot" or "chatbot" in user-facing UI
- Message sender types use 'user' | 'agent' instead of 'user' | 'bot'
- UI clearly indicates agent is retrieving civic information
- All existing tests updated and passing

---

### 3. **Story 11.3: Verify and Fix Voice Toggle Button in Mobile Agent Screen**

**Description:** Ensure the voice toggle button is properly visible and functional in the mobile `AgentChatScreen`, verify WebSocket connection, and ensure voice chat integration works end-to-end.

**Key Tasks:**

- Verify voice button rendering in `AgentChatScreen.tsx`
- Check IconButton visibility and styling
- Test voice chat start/stop functionality
- Verify WebSocket URL configuration
- Test integration with VoiceService
- Ensure proper state management for `isVoiceChatActive`
- Add visual testing to confirm button visibility

**Acceptance Criteria:**

- Voice toggle button visible in AgentChatScreen
- Button changes icon/color when voice chat is active
- WebSocket connection establishes successfully
- Voice chat can be started and stopped
- Existing AgentChatScreen tests pass
- No regression in text chat functionality

## Compatibility Requirements

- ✅ Existing APIs remain unchanged
- ✅ Database schema changes are not required
- ✅ UI changes follow existing Material Design patterns (React Native Paper, MUI)
- ✅ Performance impact is minimal (code quality improvements)
- ✅ All existing functionality preserved
- ✅ Backward compatible with current Supabase setup

## Risk Mitigation

**Primary Risk:** Changes to API server initialization could break WebSocket functionality or service routing

**Mitigation:**

- Test all API endpoints after changes
- Verify WebSocket connections still work
- Run existing integration tests
- Test voice chat functionality end-to-end
- Deploy to development environment first

**Rollback Plan:**

- Git revert commits if issues arise
- Changes are isolated to specific files
- No database migrations required
- Can rollback individual stories independently

## Definition of Done

- ✅ All stories completed with acceptance criteria met
- ✅ All TypeScript compilation errors resolved
- ✅ All apps build successfully (`turbo build`)
- ✅ All development servers start without port conflicts
- ✅ Existing test suites pass
- ✅ No regression in existing features:
  - Issue reporting (mobile)
  - Agent queries (mobile & web)
  - Admin dashboard
  - Voice chat (mobile)
- ✅ Code review completed
- ✅ Documentation updated in README files if needed
- ✅ Changes deployed to development environment and verified

---

## Technical Notes

### Current Errors Identified

**API Server (`apps/api/src/index.ts`):**

```typescript
// Line 36 - Type mismatch
const server = createServer(app.fetch);
// Fix: Use @hono/node-server adapter

// Line 11 - Unused import
import { jwt, verify } from "hono/jwt";
// Fix: Remove 'jwt' or use it

// Line 39 - Unused variable
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
// Fix: Remove 'injectWebSocket'

// Lines 33, 118 - Environment variables not declared
SUPABASE_JWT_SECRET, PORT;
// Fix: Add to turbo.json
```

### Port Assignments

- API: 3001
- Web Platform: 3000 (assumed, verify)
- Admin Web: 3002 (assumed, verify)
- Mobile: Metro bundler default

### Files Requiring Changes

**Story 11.1:**

- `apps/api/src/index.ts`
- `apps/api/package.json` (potentially add @hono/node-server)
- `turbo.json` (env var declarations)

**Story 11.2:**

- `apps/web-platform/app/components/ChatInterface.tsx`
- `apps/web-platform/app/page.tsx`
- `apps/web-platform/__tests__/ChatInterface.test.tsx`

**Story 11.3:**

- `apps/mobile/src/features/agent/AgentChatScreen.tsx`
- `apps/mobile/src/features/agent/AgentChatScreen.test.tsx`
- `apps/mobile/src/services/VoiceService.ts`

---

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing **Turborepo monorepo** running **TypeScript, React Native, Next.js, and Hono**
- Integration points:
  - API server routes and WebSocket connections
  - Mobile AgentChatScreen UI and VoiceService
  - Web platform ChatInterface component
- Existing patterns to follow:
  - React Native Paper for mobile UI components
  - Material-UI for web platform
  - Existing service architecture (reporting, agent, knowledge services)
  - Existing test patterns with Jest
- Critical compatibility requirements:
  - Must not break existing WebSocket voice chat
  - Must not break API routing
  - Must preserve all current functionality
  - Must maintain existing test coverage
- Each story must include verification that existing functionality remains intact, particularly:
  - Issue reporting flow (mobile)
  - Agent query functionality (mobile & web)
  - Voice chat integration (mobile)
  - Admin dashboard functionality

The epic should maintain system integrity while delivering **improved code quality, proper terminology, and complete feature visibility (voice toggle button)**."

---

## Priority & Sequencing

**Recommended Story Order:**

1. **Story 11.1** (FIRST) - Fix API errors and port conflicts
   - Blocks: Development workflow, testing
   - Risk: High (central service)
   - Effort: Medium
2. **Story 11.3** (SECOND) - Fix voice toggle button
   - Blocks: User-facing feature completion
   - Risk: Low (isolated to mobile UI)
   - Effort: Small
3. **Story 11.2** (THIRD) - Update terminology
   - Blocks: UX alignment with product vision
   - Risk: Low (UI labels)
   - Effort: Small

**Total Estimated Effort:** 2-3 developer days

---

## Epic Status

- **Created:** 2025-11-05
- **Status:** Planning
- **Target Sprint:** Current
- **Priority:** High (blocking development workflow)
