import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';
import HeaderBrand from '../components/HeaderBrand';
import { colors } from '../constants/theme';
import AddExerciseScreen from '../pages/AddExerciseScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ExercisesScreen from '../pages/ExercisesScreen';
import SettingsScreen from '../pages/SettingsScreen';
import ShareScreen from '../pages/ShareScreen';
import WorkoutScheduleScreen from '../pages/WorkoutScheduleScreen';

const Tab = createBottomTabNavigator();

/** Header cho 5 màn hình chính: logo bên trái để quay về tab Tổng quan. */
function tabOptions(title) {
  return {
    title,
    headerLeft: () => <HeaderBrand />,
  };
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} insets={insets} />}
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen name="Schedule" component={WorkoutScheduleScreen} options={tabOptions('Lịch tập')} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} options={tabOptions('Bài tập')} />
      <Tab.Screen name="AddExercise" component={AddExerciseScreen} options={tabOptions('Thêm bài tập')} />
      <Tab.Screen name="Share" component={ShareScreen} options={tabOptions('Chia sẻ')} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={tabOptions('Cài đặt')} />
    </Tab.Navigator>
  );
}
