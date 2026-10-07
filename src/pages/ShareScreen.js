import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';
import { formatShortDate } from '../utils/date';

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);

  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function ShareScreen({ navigation }) {
  const { user } = useAuth();
  const {
    connections,
    plans,
    receivedShares,
    sentShares,
    notifications,
    notificationCount,
    inviteConnection,
    acceptConnection,
    shareWorkoutPlan,
    importSharedPlan,
    markNotificationsRead,
  } = useWorkout();

  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [openPickerFor, setOpenPickerFor] = useState(null);
  const [importedIds, setImportedIds] = useState([]);

  const clearMessages = () => {
    if (feedback) setFeedback('');
    if (error) setError('');
  };

  const handleInvite = async () => {
    if (!query.trim()) {
      setError('Nhập tên đăng nhập hoặc số điện thoại của người bạn muốn kết nối.');
      return;
    }

    setBusy(true);
    clearMessages();

    try {
      const created = await inviteConnection(query.trim());

      setFeedback(
        created?.status === 'ACCEPTED'
          ? `Đã kết nối với “${query.trim()}”.`
          : `Đã gửi lời mời kết nối tới “${query.trim()}”.`,
      );
      setQuery('');
    } catch (requestError) {
      setError(requestError.message ?? 'Không gửi được lời mời kết nối.');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (connection) => {
    setBusy(true);
    clearMessages();

    try {
      await acceptConnection(connection.id);
      setFeedback(`Đã kết nối với ${connection.name}.`);
    } catch (requestError) {
      setError(requestError.message ?? 'Không chấp nhận được lời mời.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async (connection, plan) => {
    setBusy(true);
    clearMessages();

    try {
      await shareWorkoutPlan({ planId: plan.id, connectionId: connection.id });
      setFeedback(`Đã chia sẻ giáo án “${plan.name}” cho ${connection.name}.`);
      setOpenPickerFor(null);
    } catch (requestError) {
      setError(requestError.message ?? 'Không chia sẻ được giáo án.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (share) => {
    setBusy(true);
    clearMessages();

    try {
      const imported = await importSharedPlan(share.workoutPlanShareId);

      setImportedIds((current) => [...current, share.workoutPlanShareId]);
      setFeedback(`Đã lưu giáo án “${share.planName}” vào danh sách của bạn (${imported?.items?.length ?? 0} bài).`);
    } catch (requestError) {
      setError(requestError.message ?? 'Không nhập được giáo án.');
    } finally {
      setBusy(false);
    }
  };

  const handleReadAll = async () => {
    setBusy(true);

    try {
      await markNotificationsRead();
      setFeedback('Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (requestError) {
      setError(requestError.message ?? 'Không cập nhật được thông báo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <TabScreenLayout testID="share-screen" style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card tone="accent" style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="people-outline" size={20} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Kết nối & chia sẻ giáo án</Text>
          <Text style={styles.heroText}>
            Mời huấn luyện viên hoặc người tập cùng phòng, sau đó chia sẻ nguyên một giáo án (buổi tập) để
            họ lưu vào danh sách của mình.
          </Text>
          <Text style={styles.heroAccount}>Tài khoản của bạn: {user?.username ?? '—'}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>MỜI KẾT NỐI</Text>

          <View style={styles.inviteRow}>
            <TextInput
              testID="connection-input"
              accessibilityLabel="Tên đăng nhập hoặc số điện thoại"
              autoCapitalize="none"
              onChangeText={(value) => {
                setQuery(value);
                clearMessages();
              }}
              onSubmitEditing={handleInvite}
              placeholder="username hoặc số điện thoại"
              placeholderTextColor="#5C6672"
              style={styles.inviteInput}
              value={query}
            />

            <Pressable
              testID="connection-invite"
              accessibilityRole="button"
              accessibilityLabel="Gửi lời mời kết nối"
              disabled={busy}
              onPress={handleInvite}
              style={({ pressed }) => [styles.inviteButton, (pressed || busy) && styles.pressed]}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.background} />
            </Pressable>
          </View>

          {feedback ? (
            <View testID="share-feedback" style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
              <Text style={styles.successText}>{feedback}</Text>
            </View>
          ) : null}

          {error ? (
            <View testID="share-error" style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#FF8F8F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionHeading}>DANH SÁCH KẾT NỐI ({connections.length})</Text>

        {connections.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.empty}>Bạn chưa có kết nối nào. Gửi lời mời ở ô phía trên nhé.</Text>
          </Card>
        ) : (
          connections.map((connection) => {
            const connected = connection.status === 'ACCEPTED';
            const pickerOpen = openPickerFor === connection.id;
            const canAccept = !connected && connection.direction === 'RECEIVED';

            return (
              <Card key={connection.id} style={styles.connectionCard} testID={`connection-${connection.id}`}>
                <View style={styles.connectionHeader}>
                  <View style={styles.connectionAvatar}>
                    <Text style={styles.connectionAvatarText}>{initialsOf(connection.name)}</Text>
                  </View>

                  <View style={styles.connectionInfo}>
                    <Text numberOfLines={1} style={styles.connectionName}>
                      {connection.name}
                    </Text>
                    <Text style={styles.connectionHandle}>@{connection.handle}</Text>
                  </View>

                  <View style={[styles.statusPill, connected ? styles.statusConnected : styles.statusPending]}>
                    <Text style={[styles.statusText, connected ? styles.statusTextConnected : styles.statusTextPending]}>
                      {connected
                        ? 'Đã kết nối'
                        : connection.direction === 'RECEIVED'
                          ? 'Chờ bạn xác nhận'
                          : 'Đã gửi lời mời'}
                    </Text>
                  </View>
                </View>

                {connected ? (
                  <Pressable
                    testID={`share-toggle-${connection.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Chia sẻ giáo án cho ${connection.name}`}
                    onPress={() => setOpenPickerFor(pickerOpen ? null : connection.id)}
                    style={({ pressed }) => [styles.connectionAction, pressed && styles.pressed]}
                  >
                    <Ionicons name="share-social-outline" size={16} color={colors.accent} />
                    <Text style={styles.connectionActionLabel}>
                      {pickerOpen ? 'Đóng danh sách giáo án' : 'Chia sẻ giáo án'}
                    </Text>
                  </Pressable>
                ) : canAccept ? (
                  <Pressable
                    testID={`accept-${connection.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Chấp nhận kết nối ${connection.name}`}
                    disabled={busy}
                    onPress={() => handleAccept(connection)}
                    style={({ pressed }) => [styles.connectionAction, pressed && styles.pressed]}
                  >
                    <Ionicons name="checkmark-outline" size={16} color={colors.accent} />
                    <Text style={styles.connectionActionLabel}>Chấp nhận kết nối</Text>
                  </Pressable>
                ) : null}

                {pickerOpen ? (
                  <View style={styles.pickerBlock}>
                    <Text style={styles.pickerLabel}>CHỌN GIÁO ÁN ĐỂ CHIA SẺ</Text>

                    {plans.length === 0 ? (
                      <Text style={styles.empty}>Bạn chưa có giáo án nào để chia sẻ.</Text>
                    ) : (
                      plans.map((plan) => (
                        <Pressable
                          key={plan.id}
                          testID={`share-${plan.id}-${connection.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Chia sẻ giáo án ${plan.name}`}
                          disabled={busy}
                          onPress={() => handleShare(connection, plan)}
                          style={({ pressed }) => [styles.pickerRow, pressed && styles.pressed]}
                        >
                          <Ionicons name="albums-outline" size={16} color={colors.accent} />
                          <Text style={styles.pickerExercise}>{plan.name}</Text>
                          <Text style={styles.pickerGroup}>{plan.items.length} bài</Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                ) : null}
              </Card>
            );
          })
        )}

        <Text style={styles.sectionHeading}>GIÁO ÁN ĐƯỢC CHIA SẺ CHO BẠN ({receivedShares.length})</Text>

        <Card testID="share-received" style={styles.card}>
          {receivedShares.length === 0 ? (
            <Text style={styles.empty}>Chưa nhận được giáo án nào.</Text>
          ) : (
            receivedShares.map((share) => (
              <View key={share.workoutPlanShareId} style={styles.historyRow}>
                <Ionicons name="download-outline" size={16} color={colors.accent} />

                <View style={styles.historyText}>
                  <Text style={styles.historyTitle}>{share.planName}</Text>
                  <Text style={styles.historyMeta}>
                    từ {share.fromUserName} · {formatTimestamp(share.sharedAt)}
                  </Text>
                  {share.message ? <Text style={styles.historyMessage}>“{share.message}”</Text> : null}
                </View>

                <Pressable
                  testID={`import-${share.workoutPlanShareId}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Lưu giáo án ${share.planName} vào danh sách của tôi`}
                  disabled={busy || importedIds.includes(share.workoutPlanShareId)}
                  onPress={() => handleImport(share)}
                  style={({ pressed }) => [
                    styles.importButton,
                    importedIds.includes(share.workoutPlanShareId) && styles.importedButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.importLabel}>
                    {importedIds.includes(share.workoutPlanShareId) ? 'ĐÃ LƯU' : 'LƯU VÀO'}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <Text style={styles.sectionHeading}>BẠN ĐÃ CHIA SẺ ({sentShares.length})</Text>

        <Card testID="share-sent" style={styles.card}>
          {sentShares.length === 0 ? (
            <Text style={styles.empty}>Chưa chia sẻ giáo án nào.</Text>
          ) : (
            sentShares.map((share) => (
              <View key={share.workoutPlanShareId} style={styles.historyRow}>
                <Ionicons name="paper-plane-outline" size={16} color={colors.accent} />
                <View style={styles.historyText}>
                  <Text style={styles.historyTitle}>{share.planName}</Text>
                  <Text style={styles.historyMeta}>
                    → {share.toUserName} · {formatTimestamp(share.sharedAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>THÔNG BÁO ({notificationCount} chưa đọc)</Text>

            {notificationCount > 0 ? (
              <Pressable
                testID="notifications-read"
                accessibilityRole="button"
                accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
                disabled={busy}
                onPress={handleReadAll}
                style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
              >
                <Text style={styles.linkLabel}>Đánh dấu đã đọc</Text>
              </Pressable>
            ) : null}
          </View>

          {notifications.length === 0 ? (
            <Text style={styles.empty}>Chưa có thông báo nào.</Text>
          ) : (
            notifications.slice(0, 6).map((item) => (
              <View key={item.userNotificationId} style={styles.notificationRow}>
                <Ionicons
                  name={item.isRead ? 'mail-open-outline' : 'mail-unread-outline'}
                  size={16}
                  color={item.isRead ? colors.icon : colors.accent}
                />
                <View style={styles.historyText}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyMeta}>
                    {item.message ? `${item.message} · ` : ''}
                    {formatShortDate(item.createdAt.slice(0, 10))}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        <Pressable
          testID="share-open-plans"
          accessibilityRole="button"
          accessibilityLabel="Mở mục lịch tuần để tạo giáo án"
          onPress={() => navigation.navigate('WeeklyPlan')}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Ionicons name="albums-outline" size={18} color={colors.accent} />
          <Text style={styles.ghostLabel}>TẠO / SỬA GIÁO ÁN CỦA BẠN</Text>
        </Pressable>

        <Text style={styles.footer}>CHIA SẺ ĐỂ TIẾN BỘ NHANH HƠN</Text>
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 32,
    paddingTop: 12,
  },
  heroCard: {
    marginBottom: 14,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  heroText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  heroAccount: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
  },
  card: {
    marginBottom: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  linkButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  linkLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 10,
    marginTop: 8,
  },
  inviteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inviteInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  inviteButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    width: 46,
  },
  pressed: {
    opacity: 0.75,
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.10)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    padding: 10,
  },
  successText: {
    color: colors.success,
    flex: 1,
    fontSize: 11,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(255, 91, 91, 0.35)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    padding: 10,
  },
  errorText: {
    color: '#FF8F8F',
    flex: 1,
    fontSize: 11,
  },
  connectionCard: {
    marginBottom: 12,
  },
  connectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  connectionAvatar: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  connectionAvatarText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  connectionHandle: {
    color: colors.dim,
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusConnected: {
    backgroundColor: 'rgba(74, 222, 128, 0.14)',
  },
  statusPending: {
    backgroundColor: colors.surfaceAlt,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  statusTextConnected: {
    color: colors.success,
  },
  statusTextPending: {
    color: colors.warning,
  },
  connectionAction: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
  },
  connectionActionLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  pickerBlock: {
    marginTop: 12,
  },
  pickerLabel: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  pickerRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  pickerExercise: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  pickerGroup: {
    color: colors.dim,
    fontSize: 10,
  },
  empty: {
    color: colors.dim,
    fontSize: 12,
    marginTop: 6,
  },
  historyRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  notificationRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  historyMessage: {
    color: colors.dim,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  importButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  importedButton: {
    backgroundColor: colors.surfaceAlt,
  },
  importLabel: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  ghostButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 12,
  },
  ghostLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    color: colors.dim,
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 18,
    textAlign: 'center',
  },
});
