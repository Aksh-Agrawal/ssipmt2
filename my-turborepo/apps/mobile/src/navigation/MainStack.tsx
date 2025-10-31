import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../features/home/HomeScreen';
import ReportSubmissionScreen from '../features/report/ReportSubmissionScreen';
import ConfirmationScreen from '../features/report/ConfirmationScreen';
import AgentChatScreen from '../features/agent/AgentChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Civic Voice Assistant' }}
      />
      <Stack.Screen 
        name="ReportSubmission" 
        component={ReportSubmissionScreen}
        options={{ title: 'Report an Issue' }}
      />
      <Stack.Screen 
        name="Confirmation" 
        component={ConfirmationScreen}
        options={{ title: 'Report Submitted' }}
      />
      <Stack.Screen 
        name="AgentChat" 
        component={AgentChatScreen}
        options={{ title: 'Ask a Question' }}
      />
    </Stack.Navigator>
  );
};

export default MainStack;