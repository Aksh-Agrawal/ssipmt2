import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainStack from './navigation/MainStack';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
