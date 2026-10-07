import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { toDateKey } from '../utils/date';

export const MUSCLE_GROUPS = ['Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng', 'Cardio'];

const DEFAULT_EXERCISES = [
  { id: 'ex-1', name: 'Bench Press', group: 'Ngực', sets: 4, reps: 10, restSeconds: 90, note: 'Giữ vai cố định, hạ tạ chậm 2 giây.' },
  { id: 'ex-2', name: 'Squat', group: 'Chân', sets: 4, reps: 12, restSeconds: 120, note: 'Lưng thẳng, xuống tới đùi song song sàn.' },
  { id: 'ex-3', name: 'Deadlift', group: 'Lưng', sets: 3, reps: 8, restSeconds: 150, note: 'Siết core, không gù lưng.' },
  { id: 'ex-4', name: 'Kéo xà', group: 'Lưng', sets: 3, reps: 8, restSeconds: 90, note: 'Kéo bằng lưng, không đung đưa.' },
  { id: 'ex-5', name: 'Đẩy vai tạ đôi', group: 'Vai', sets: 3, reps: 12, restSeconds: 75, note: '' },
  { id: 'ex-6', name: 'Curl tạ tay', group: 'Tay', sets: 3, reps: 15, restSeconds: 60, note: 'Không dùng đà.' },
  { id: 'ex-7', name: 'Plank', group: 'Bụng', sets: 3, reps: 1, restSeconds: 45, note: 'Giữ 45 giây mỗi hiệp.' },
  { id: 'ex-8', name: 'Chạy bộ 3km', group: 'Cardio', sets: 1, reps: 1, restSeconds: 0, note: 'Pace 6:00/km.' },
];

const DEFAULT_CONNECTIONS = [
  { id: 'cn-1', name: 'Lê Văn Huấn Luyện', handle: 'pt01', status: 'CONNECTED', role: 'Huấn luyện viên' },
  { id: 'cn-2', name: 'Trần Thị Lễ Tân', handle: 'reception', status: 'CONNECTED', role: 'Lễ tân' },
  { id: 'cn-3', name: 'pt02@gymsystem.local', handle: 'pt02', status: 'PENDING', role: '' },
];

/** Vài ngày tập mẫu (theo số ngày trước hôm nay) để lịch có dữ liệu minh hoạ. */
function buildDemoWorkoutDays() {
  const offsets = [1, 2, 4, 6, 8, 11, 13, 15, 18, 21];
  const days = new Set();
  const today = new Date();

  offsets.forEach((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    days.add(toDateKey(date));
  });

  return days;
}

const WorkoutContext = createContext(null);

/**
 * Store bài tập / lịch tập / kết nối chia sẻ.
 *
 * Hiện lưu trong bộ nhớ ứng dụng (mất khi tải lại trang). Khi backend có API tương ứng,
 * chỉ cần thay phần state bằng lời gọi API trong `src/services` — phần UI không phải sửa.
 */
export function WorkoutProvider({ children }) {
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [workoutDays, setWorkoutDays] = useState(() => buildDemoWorkoutDays());
  const [connections, setConnections] = useState(DEFAULT_CONNECTIONS);
  const [sharedWorkouts, setSharedWorkouts] = useState([
    { id: 'sh-1', exerciseId: 'ex-2', exerciseName: 'Squat', connectionId: 'cn-1', connectionName: 'Lê Văn Huấn Luyện', sharedAt: new Date(Date.now() - 86400000).toISOString() },
  ]);

  const addExercise = useCallback((draft) => {
    const exercise = {
      id: `ex-${Date.now()}`,
      name: draft.name.trim(),
      group: draft.group,
      sets: Number(draft.sets) || 3,
      reps: Number(draft.reps) || 10,
      restSeconds: Number(draft.restSeconds) || 60,
      note: draft.note?.trim() ?? '',
    };

    setExercises((current) => [exercise, ...current]);

    return exercise;
  }, []);

  const removeExercise = useCallback((exerciseId) => {
    setExercises((current) => current.filter((exercise) => exercise.id !== exerciseId));
  }, []);

  const toggleWorkoutDay = useCallback((dateKey) => {
    setWorkoutDays((current) => {
      const next = new Set(current);

      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }

      return next;
    });
  }, []);

  /** Đánh dấu ngày hôm nay đã tập. */
  const logWorkoutToday = useCallback(() => {
    setWorkoutDays((current) => new Set(current).add(toDateKey(new Date())));
  }, []);

  const inviteConnection = useCallback((query) => {
    const handle = query.trim();
    let created = null;

    setConnections((current) => {
      if (current.some((item) => item.handle.toLowerCase() === handle.toLowerCase())) {
        return current;
      }

      created = {
        id: `cn-${Date.now()}`,
        name: handle.includes('@') ? handle : handle,
        handle,
        status: 'PENDING',
        role: '',
      };

      return [...current, created];
    });

    return created ?? { handle, status: 'ALREADY_CONNECTED' };
  }, []);

  const acceptConnection = useCallback((connectionId) => {
    setConnections((current) =>
      current.map((item) => (item.id === connectionId ? { ...item, status: 'CONNECTED' } : item)),
    );
  }, []);

  const shareExercise = useCallback(
    (exerciseId, connectionId) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      const connection = connections.find((item) => item.id === connectionId);

      if (!exercise || !connection) return null;

      const share = {
        id: `sh-${Date.now()}`,
        exerciseId,
        exerciseName: exercise.name,
        connectionId,
        connectionName: connection.name,
        sharedAt: new Date().toISOString(),
      };

      setSharedWorkouts((current) => [share, ...current]);

      return share;
    },
    [exercises, connections],
  );

  const isWorkoutDay = useCallback((dateKey) => workoutDays.has(dateKey), [workoutDays]);

  const stats = useMemo(() => {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthCount = [...workoutDays].filter((key) => key.startsWith(monthPrefix)).length;

    let streak = 0;
    const cursor = new Date(today);

    // Chuỗi ngày tập liên tiếp tính lùi từ hôm nay (hoặc từ hôm qua nếu hôm nay chưa tập)
    if (!workoutDays.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (workoutDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      monthCount,
      streak,
      totalCount: workoutDays.size,
      exerciseCount: exercises.length,
      connectionCount: connections.filter((item) => item.status === 'CONNECTED').length,
    };
  }, [workoutDays, exercises, connections]);

  const value = useMemo(
    () => ({
      exercises,
      workoutDays,
      connections,
      sharedWorkouts,
      stats,
      addExercise,
      removeExercise,
      toggleWorkoutDay,
      logWorkoutToday,
      isWorkoutDay,
      inviteConnection,
      acceptConnection,
      shareExercise,
    }),
    [
      exercises,
      workoutDays,
      connections,
      sharedWorkouts,
      stats,
      addExercise,
      removeExercise,
      toggleWorkoutDay,
      logWorkoutToday,
      isWorkoutDay,
      inviteConnection,
      acceptConnection,
      shareExercise,
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);

  if (!context) throw new Error('useWorkout phải được dùng bên trong <WorkoutProvider>.');

  return context;
}
