import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabs from './MainTabs';
import { colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../pages/LoginScreen';
import WeeklyPlanScreen from '../pages/WeeklyPlanScreen';
import WorkoutSessionScreen from '../pages/WorkoutSessionScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="WorkoutSession"
            component={WorkoutSessionScreen}
            options={({ route }) => ({ title: route.params?.title ?? 'Chi tiết buổi tập' })}
          />
          <Stack.Screen
            name="WeeklyPlan"
            component={WeeklyPlanScreen}
            options={{ title: 'Thiết lập lịch tuần' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
