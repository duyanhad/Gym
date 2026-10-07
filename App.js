import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/contexts/AuthContext';
import { WorkoutProvider } from './src/contexts/WorkoutContext';
import AppNavigator from './src/routes';

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </WorkoutProvider>
    </AuthProvider>
  );
}
