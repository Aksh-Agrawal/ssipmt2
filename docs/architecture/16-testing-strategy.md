# 16. Testing Strategy

This section outlines our comprehensive, multi-layered testing strategy. The goal is to ensure application quality, prevent regressions, and enable developers to ship features with confidence. We will follow the principles of the testing pyramid.

## 16.1. Testing Pyramid

```
      /------------------\ 
     /   E2E Tests      \   (Maestro)
    /  (User Journeys)   \ 
   /----------------------\ 
  /  Integration Tests   \  (RNTL, Supertest)
 / (Component & API)      \ 
/--------------------------\ 
/      Unit Tests          \ (Jest)
/(Functions & Logic)        \ 
----------------------------
```

## 16.2. Test Organization

Tests will be co-located with the code they are testing to make them easy to find and run.

### Frontend Tests (`apps/mobile`, `apps/admin-web`)
```
/src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx  # Component unit test
└── features/
    └── report-submission/
        ├── ReportSubmissionScreen.tsx
        └── ReportSubmissionScreen.integration.test.tsx # Component integration test
```

### Backend Tests (`packages/services`, `apps/api`)
```
/packages/services/reporting/
├── logic.ts
└── logic.test.ts            # Business logic unit test

/apps/api/v1/reports/
├── index.ts
└── index.integration.test.ts # API endpoint integration test
```

### E2E Tests
End-to-end tests will live in a dedicated top-level directory.
```
/e2e/
├── report-submission.yaml   # Maestro flow for submitting a report
└── agent-query.yaml         # Maestro flow for querying the agent
```

## 16.3. Test Examples

### Frontend Component Test (React Native Testing Library)
```typescript
// Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

it('calls onPress when pressed', () => {
  const onPressMock = jest.fn();
  const { getByText } = render(<Button title="Submit" onPress={onPressMock} />);

  fireEvent.press(getByText('Submit'));

  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

### Backend API Test (Supertest)
```typescript
// index.integration.test.ts
import request from 'supertest';
import { app } from './index'; // Assuming app is exportable for tests

describe('POST /api/v1/reports', () => {
  it('should create a new report and return a trackingId', async () => {
    const response = await request(app.fetch)
      .post('/api/v1/reports')
      .send({ description: 'Test', photoUrl: '...', location: '...' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('trackingId');
  });
});
```

### E2E Test (Maestro)
```yaml
# report-submission.yaml
appId: com.civicvoice
---
- launchApp
- tapOn: "Report an Issue"
- tapOn: "Description"
- inputText: "There is a large pothole on Main Street."
- tapOn: "Attach Photo"
- # ... steps to select a photo
- tapOn: "Submit Report"
- assertVisible: "Report Submitted Successfully!"
- assertVisible: "Your tracking ID is: *"
```
