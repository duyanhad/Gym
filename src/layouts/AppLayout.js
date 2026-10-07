import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';

export default function AppLayout({ children, style }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}
