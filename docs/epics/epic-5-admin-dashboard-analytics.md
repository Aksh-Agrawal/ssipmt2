# Epic 5: Admin Dashboard Analytics - Brownfield Enhancement

## Epic Goal

This epic will add a new analytics section to the admin dashboard to provide insights into the submitted reports. This will help administrators understand the volume and trends of civic issues.

## Epic Description

**Existing System Context:**

-   **Current relevant functionality:** The admin dashboard allows viewing and managing individual reports.
-   **Technology stack:** Next.js for the admin dashboard, Node.js/Express for the backend API, and PostgreSQL for the database.
-   **Integration points:** The new analytics features will read data from the existing `reports` table in the database via a new API endpoint.

**Enhancement Details:**

-   **What's being added/changed:** A new analytics section will be added to the admin dashboard. This section will display report statistics and charts.
-   **How it integrates:** A new API endpoint will be created to provide the analytics data. The admin dashboard will be updated to display this data.
-   **Success criteria:** The admin dashboard displays accurate report statistics and charts, providing a clear overview of the report data.

## Stories

1.  **Story 5.1: Display Report Statistics:** As an admin, I want to see key statistics about the reports (e.g., total reports, open reports, closed reports), so that I can get a quick overview of the system's health.
2.  **Story 5.2: Reports Over Time Chart:** As an admin, I want to see a chart of the number of reports created over time, so that I can identify trends.
3.  **Story 5.3: Filter Reports by Date:** As an admin, I want to filter the reports by a date range, so that I can focus on a specific period.

## Compatibility Requirements

-   [x] Existing APIs remain unchanged.
-   [x] Database schema changes are backward compatible (no schema changes are expected for this epic).
-   [x] UI changes follow existing patterns.
-   [x] Performance impact is minimal.

## Risk Mitigation

-   **Primary Risk:** The new analytics queries could impact the performance of the database.
-   **Mitigation:** The analytics queries will be optimized to minimize their impact. The new API endpoint will be tested for performance.
-   **Rollback Plan:** The new analytics section can be hidden behind a feature flag. The new API endpoint can be disabled.

## Definition of Done

-   [ ] All stories completed with acceptance criteria met.
-   [ ] Existing functionality verified through testing.
-   [ ] Integration points working correctly.
-   [ ] Documentation updated appropriately.
-   [ ] No regression in existing features.
