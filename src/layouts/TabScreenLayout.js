import { StyleSheet, View } from 'react-native';

import SessionActionBar from '../components/SessionActionBar';
import AppLayout from './AppLayout';

/**
 * Layout cho các màn hình trong nhóm 5 mục chính.
 * Phần nội dung co giãn; dưới cùng là thanh "Buổi tập hôm nay" (trừ màn Dashboard)
 * và thanh điều hướng do Tab.Navigator đảm nhiệm.
 */
export default function TabScreenLayout({ children, style, testID, showSessionBar = true }) {
  return (
    <AppLayout testID={testID} style={style}>
      <View style={styles.content}>{children}</View>
      {showSessionBar ? (
        <SessionActionBar testID={testID ? `${testID}-session-bar` : 'session-action-bar'} />
      ) : null}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
});
