# 10. Frontend Architecture

This section details the internal architecture of the React Native mobile application. The goal is to create a codebase that is maintainable, scalable, and easy for developers to work in.

## 10.1. Component Architecture

### Component Organization
We will follow a hybrid approach, combining atomic design principles with feature-based organization.

```
/src/components/
├── ui/               # Reusable, universal UI elements (e.g., Button, Input, Card)
│   ├── Button.tsx
│   └── Card.tsx
├── domain/           # Components tied to specific data models (e.g., ReportList, ReportCard)
│   ├── ReportCard.tsx
│   └── ReportList.tsx
└── layout/           # Screen layout and structure (e.g., ScreenWrapper, Header)
    └── ScreenWrapper.tsx

/src/features/        # Feature-specific screens and their components
├── report-submission/
│   ├── components/
│   └── ReportSubmissionScreen.tsx
└── agent-chat/
    ├── components/
    └── AgentChatScreen.tsx
```

### Component Template
All components will be typed functional components using TypeScript.

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Component styles
  },
});

export default MyComponent;
```

## 10.2. State Management Architecture

We will use Zustand for its simplicity and minimal boilerplate. State will be organized into logical stores.

### State Structure (Zustand)

```typescript
import { create } from 'zustand';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user, token) => set({ user, token, isAuthenticated: true }),
  clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
}));
```

### State Management Patterns
- **Separate Stores:** Create different stores for different domains (e.g., `useAuthStore`, `useReportStore`, `useAgentStore`).
- **Selectors:** Use selectors to subscribe components only to the state slices they need, preventing unnecessary re-renders.
- **Async Actions:** Async operations (like API calls) will be handled in service files and their results will be set in the store.

## 10.3. Routing Architecture

We will use `React Navigation` as the standard for routing in the React Native app.

### Route Organization

```
/src/navigation/
├── AppNavigator.tsx      # Main navigator, decides between Auth and Main stacks
├── AuthStack.tsx         # Login, Register screens
└── MainStack.tsx         # The main app experience (Tabs, Modals, etc.)
```

### Protected Route Pattern
The main `AppNavigator` will act as a gatekeeper, showing the `AuthStack` if the user is not authenticated, and the `MainStack` if they are.

```typescript
// AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/useAuthStore';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
```

## 10.4. Frontend Services Layer

This layer will abstract all API communication, providing a clean interface to the rest of the application.

### API Client Setup
We will use `axios` to create a centralized API client instance.

```typescript
// /src/services/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const apiClient = axios.create({
  baseURL: '/api/v1', // This will be the production URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to automatically add the auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### Service Example

```typescript
// /src/services/reportService.ts
import apiClient from './apiClient';
import { Report } from '../types'; // Assuming shared types

interface SubmitReportPayload {
  description: string;
  photoUrl: string;
  location: { latitude: number; longitude: number };
}

export const reportService = {
  submitReport: async (payload: SubmitReportPayload): Promise<{ trackingId: string }> => {
    const response = await apiClient.post('/reports', payload);
    return response.data;
  },
};
```
