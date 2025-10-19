# 4. Data Models

This section defines the core data entities for the project. These TypeScript interfaces will be placed in the `packages/shared-types` directory to ensure type consistency between the mobile client, the admin dashboard, and all backend microservices.

## 4.1. Report

**Purpose:** Represents a single civic issue submitted by a citizen. This is the core entity for the issue reporting system and will be stored in the PostgreSQL "Complaints DB".

**TypeScript Interface:**
```typescript
export enum ReportStatus {
  SUBMITTED = 'Submitted',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected',
}

export enum ReportPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Report {
  id: string; // Unique tracking ID (UUID)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  description: string;
  photoUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: ReportStatus;
  category: string | null; // e.g., 'Pothole', 'Garbage', set by AI
  priority: ReportPriority | null; // Set by AI
  citizenId: string; // Anonymous identifier for the user who submitted
}
```

**Relationships:**
*   A `Report` is submitted by a single (anonymous) citizen.
*   Each `Report` can have multiple `ReportUpdate` entries tracking its history (not modeled here for brevity).

## 4.2. AdminUser

**Purpose:** Represents an authenticated administrator with rights to manage the system. This model corresponds to the user object provided by Supabase Auth.

**TypeScript Interface:**
```typescript
export enum UserRole {
  ADMIN = 'admin',
  // CITIZEN = 'citizen' // Future role if we add citizen accounts
}

export interface AdminUser {
  id: string; // UUID from Supabase Auth
  email: string;
  role: UserRole;
  lastSignInAt: string; // ISO 8601 timestamp
}
```

**Relationships:**
*   An `AdminUser` can view and modify many `Report` entities.
*   An `AdminUser` can create and manage many `KnowledgeArticle` entities.

## 4.3. KnowledgeArticle

**Purpose:** Represents a piece of informational content managed by admins and served by the AI agent. This will be stored in the fast, "Live DB" (Redis/NoSQL) for quick retrieval.

**TypeScript Interface:**
```typescript
export interface KnowledgeArticle {
  id: string; // Unique ID (e.g., slug or UUID)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  title: string;
  content: string;
  tags: string[]; // Searchable keywords, e.g., ['garbage', 'schedule']
  authorId: string; // ID of the admin who created/edited it
}
```

**Relationships:**
*   Created and maintained by an `AdminUser`.
*   Queried by the `agent-service` to answer user questions.
