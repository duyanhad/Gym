import { StyleSheet, View } from 'react-native';

import AppLayout from './AppLayout';

/**
 * Layout cho các màn hình trong nhóm 5 mục chính.
 * Phần nội dung co giãn; thanh điều hướng dưới cùng do Tab.Navigator đảm nhiệm.
 */
export default function TabScreenLayout({ children, style, testID }) {
  return (
    <AppLayout testID={testID} style={style}>
      <View style={styles.content}>{children}</View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
