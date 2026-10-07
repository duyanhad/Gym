import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../pages/HomeScreen';
import WorkoutScreen from '../pages/WorkoutScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'GYM', headerShown: false }}
      />
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ title: 'Buổi tập hôm nay' }}
      />
    </Stack.Navigator>
  );
}
