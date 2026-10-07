import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Card from '../components/Card';
import { colors, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useWorkout } from '../contexts/WorkoutContext';
import TabScreenLayout from '../layouts/TabScreenLayout';

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

export default function ShareScreen() {
  const { user } = useAuth();
  const { connections, exercises, sharedWorkouts, inviteConnection, acceptConnection, shareExercise } = useWorkout();

  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [openPickerFor, setOpenPickerFor] = useState(null);

  const handleInvite = () => {
    if (!query.trim()) {
      setFeedback('Nhập tên đăng nhập hoặc email của người bạn muốn kết nối.');
      return;
    }

    const result = inviteConnection(query);

    if (result?.status === 'ALREADY_CONNECTED') {
      setFeedback('Bạn đã kết nối với tài khoản này rồi.');
    } else {
      setFeedback(`Đã gửi lời mời kết nối tới “${query.trim()}”.`);
      setQuery('');
    }
  };

  const handleShare = (connectionId, exerciseId) => {
    const share = shareExercise(exerciseId, connectionId);

    if (share) {
      setFeedback(`Đã chia sẻ bài tập “${share.exerciseName}” cho ${share.connectionName}.`);
      setOpenPickerFor(null);
    } else {
      setFeedback('Chưa thể chia sẻ, vui lòng thử lại.');
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
            Mời huấn luyện viên hoặc người tập cùng phòng để chia sẻ các bài tập và cùng theo dõi tiến độ.
          </Text>
          <Text style={styles.heroAccount}>Tài khoản của bạn: {user?.username ?? '—'}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>MỜI KẾT NỐI</Text>

          <View style={styles.inviteRow}>
            <TextInput
              testID="connection-input"
              accessibilityLabel="Tên đăng nhập hoặc email"
              autoCapitalize="none"
              onChangeText={(value) => {
                setQuery(value);
                if (feedback) setFeedback('');
              }}
              onSubmitEditing={handleInvite}
              placeholder="username hoặc email"
              placeholderTextColor="#5C6672"
              style={styles.inviteInput}
              value={query}
            />

            <Pressable
              testID="connection-invite"
              accessibilityRole="button"
              accessibilityLabel="Gửi lời mời kết nối"
              onPress={handleInvite}
              style={({ pressed }) => [styles.inviteButton, pressed && styles.pressed]}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.background} />
            </Pressable>
          </View>

          {feedback ? (
            <Text testID="share-feedback" style={styles.feedback}>
              {feedback}
            </Text>
          ) : null}
        </Card>

        <Text style={styles.sectionHeading}>DANH SÁCH KẾT NỐI ({connections.length})</Text>

        {connections.map((connection) => {
          const connected = connection.status === 'CONNECTED';
          const pickerOpen = openPickerFor === connection.id;

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
                    {connected ? 'Đã kết nối' : 'Chờ xác nhận'}
                  </Text>
                </View>
              </View>

              {connected ? (
                <Pressable
                  testID={`share-toggle-${connection.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Chia sẻ bài tập cho ${connection.name}`}
                  onPress={() => setOpenPickerFor(pickerOpen ? null : connection.id)}
                  style={({ pressed }) => [styles.connectionAction, pressed && styles.pressed]}
                >
                  <Ionicons name="share-social-outline" size={16} color={colors.accent} />
                  <Text style={styles.connectionActionLabel}>
                    {pickerOpen ? 'Đóng danh sách bài tập' : 'Chia sẻ bài tập'}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  testID={`accept-${connection.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Chấp nhận kết nối ${connection.name}`}
                  onPress={() => {
                    acceptConnection(connection.id);
                    setFeedback(`Đã kết nối với ${connection.name}.`);
                  }}
                  style={({ pressed }) => [styles.connectionAction, pressed && styles.pressed]}
                >
                  <Ionicons name="checkmark-outline" size={16} color={colors.accent} />
                  <Text style={styles.connectionActionLabel}>Chấp nhận kết nối</Text>
                </Pressable>
              )}

              {pickerOpen ? (
                <View style={styles.pickerBlock}>
                  <Text style={styles.pickerLabel}>CHỌN BÀI TẬP ĐỂ CHIA SẺ</Text>

                  {exercises.map((exercise) => (
                    <Pressable
                      key={exercise.id}
                      testID={`share-${exercise.id}-${connection.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Chia sẻ ${exercise.name}`}
                      onPress={() => handleShare(connection.id, exercise.id)}
                      style={({ pressed }) => [styles.pickerRow, pressed && styles.pressed]}
                    >
                      <Ionicons name="barbell-outline" size={16} color={colors.accent} />
                      <Text style={styles.pickerExercise}>{exercise.name}</Text>
                      <Text style={styles.pickerGroup}>{exercise.group}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Card>
          );
        })}

        <Text style={styles.sectionHeading}>ĐÃ CHIA SẺ ({sharedWorkouts.length})</Text>

        <Card testID="share-history" style={styles.card}>
          {sharedWorkouts.length === 0 ? (
            <Text style={styles.empty}>Chưa chia sẻ bài tập nào.</Text>
          ) : (
            sharedWorkouts.map((share) => (
              <View key={share.id} style={styles.historyRow}>
                <Ionicons name="paper-plane-outline" size={16} color={colors.accent} />
                <View style={styles.historyText}>
                  <Text style={styles.historyTitle}>{share.exerciseName}</Text>
                  <Text style={styles.historyMeta}>
                    → {share.connectionName} · {formatTimestamp(share.sharedAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: spacing.page,
  },
  content: {
    paddingBottom: 24,
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
  sectionTitle: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  inviteRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  inviteInput: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    outlineStyle: 'none',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  inviteButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  pressed: {
    opacity: 0.78,
  },
  feedback: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  sectionHeading: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 10,
    marginTop: 6,
  },
  connectionCard: {
    marginBottom: 12,
  },
  connectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  connectionAvatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.inputBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
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
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusConnected: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
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
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
  },
  connectionActionLabel: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  pickerBlock: {
    borderTopColor: '#232A34',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  pickerLabel: {
    color: colors.dim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  pickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  pickerExercise: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  pickerGroup: {
    color: colors.muted,
    fontSize: 11,
  },
  empty: {
    color: colors.muted,
    fontSize: 13,
  },
  historyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  historyMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
});
