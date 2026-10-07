import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DEFAULT_WEEK_PLAN, WEEKDAY_FULL_LABELS, WORKOUT_TEMPLATES } from '../constants/workoutTemplates';
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

function cloneTemplates() {
  return WORKOUT_TEMPLATES.map((template) => ({
    ...template,
    items: template.items.map((item) => ({ ...item })),
  }));
}

/** Gộp nhiều buổi tập thành 1 danh sách bài tập (trùng tên thì giữ mục tiêu cao hơn). */
export function mergePlanItems(plans) {
  const merged = new Map();

  plans.filter(Boolean).forEach((plan) => {
    plan.items.forEach((item) => {
      const current = merged.get(item.exerciseName);

      if (!current) {
        merged.set(item.exerciseName, { ...item });
        return;
      }

      merged.set(item.exerciseName, {
        ...current,
        targetSets: Math.max(current.targetSets, item.targetSets),
        targetReps: Math.max(current.targetReps, item.targetReps),
      });
    });
  });

  return [...merged.values()];
}

const WorkoutContext = createContext(null);

/**
 * Store bài tập / giáo án / lịch tuần / kết nối chia sẻ.
 *
 * Hiện lưu trong bộ nhớ ứng dụng (mất khi tải lại trang). Khi backend có API tương ứng,
 * chỉ cần thay phần state bằng lời gọi API trong `src/services` — phần UI không phải sửa.
 */
export function WorkoutProvider({ children }) {
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [workoutDays, setWorkoutDays] = useState(() => buildDemoWorkoutDays());
  const [connections, setConnections] = useState(DEFAULT_CONNECTIONS);
  const [sharedWorkouts, setSharedWorkouts] = useState([
    {
      id: 'sh-1',
      exerciseId: 'ex-2',
      exerciseName: 'Squat',
      connectionId: 'cn-1',
      connectionName: 'Lê Văn Huấn Luyện',
      sharedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  // Giáo án (buổi tập) lấy từ tài liệu có sẵn, người dùng có thể tự tạo thêm
  const [plans, setPlans] = useState(() => cloneTemplates());
  const [weekPlan, setWeekPlan] = useState(() => ({ ...DEFAULT_WEEK_PLAN }));
  const [workoutLogs, setWorkoutLogs] = useState({});

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

  /** Đánh dấu hoàn thành / bỏ hoàn thành một bài tập trong buổi của ngày. */
  const setWorkoutItemCompleted = useCallback((dateKey, exerciseName, completed) => {
    setWorkoutLogs((current) => {
      const log = current[dateKey] ?? { completed: [] };
      const completedList = new Set(log.completed);

      if (completed) {
        completedList.add(exerciseName);
      } else {
        completedList.delete(exerciseName);
      }

      return { ...current, [dateKey]: { ...log, completed: [...completedList] } };
    });

    // Hoàn thành bài đầu tiên => ngày đó được tính là ngày tập
    // (chỉ bỏ đánh dấu khi người dùng tự bỏ ở lịch / chi tiết buổi tập)
    if (completed) {
      setWorkoutDays((current) => new Set(current).add(dateKey));
    }
  }, []);

  /** Bắt đầu buổi tập: ghi lại thời điểm bắt đầu để đếm thời gian tập. */
  const startSession = useCallback((dateKey) => {
    setWorkoutLogs((current) => {
      const log = current[dateKey] ?? { completed: [] };

      return { ...current, [dateKey]: { ...log, startedAt: new Date().toISOString(), finishedAt: null } };
    });
  }, []);

  /** Kết thúc buổi tập: lưu thời điểm kết thúc (giữ nguyên các bài đã đạt). */
  const finishSession = useCallback((dateKey) => {
    setWorkoutLogs((current) => {
      const log = current[dateKey] ?? { completed: [] };

      return { ...current, [dateKey]: { ...log, finishedAt: new Date().toISOString() } };
    });

    setWorkoutDays((current) => new Set(current).add(dateKey));
  }, []);

  /** Bỏ trạng thái bắt đầu/kết thúc, giữ lại các bài đã đánh dấu đạt. */
  const resetSession = useCallback((dateKey) => {
    setWorkoutLogs((current) => {
      const log = current[dateKey] ?? { completed: [] };

      return { ...current, [dateKey]: { completed: log.completed ?? [] } };
    });
  }, []);

  const inviteConnection = useCallback((query) => {
    const handle = query.trim();
    let created = null;

    setConnections((current) => {
      if (current.some((item) => item.handle.toLowerCase() === handle.toLowerCase())) {
        return current;
      }

      created = { id: `cn-${Date.now()}`, name: handle, handle, status: 'PENDING', role: '' };

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

  // ===================== GIÁO ÁN & LỊCH TUẦN =====================

  /** Lưu một buổi tập tự soạn vào thư viện giáo án. */
  const savePlan = useCallback((draft) => {
    const plan = {
      id: `plan-${Date.now()}`,
      name: draft.name.trim(),
      focus: draft.focus?.trim() ?? '',
      note: draft.note?.trim() ?? '',
      items: draft.items.map((item) => ({
        exerciseName: item.exerciseName,
        targetSets: Number(item.targetSets) || 1,
        targetReps: Number(item.targetReps) || 1,
      })),
    };

    setPlans((current) => [plan, ...current]);

    return plan;
  }, []);

  const deletePlan = useCallback((planId) => {
    setPlans((current) => current.filter((plan) => plan.id !== planId));
    setWeekPlan((current) => {
      const next = { ...current };

      Object.keys(next).forEach((weekday) => {
        if (next[weekday] === planId) next[weekday] = null;
      });

      return next;
    });
  }, []);

  /** Gán (hoặc bỏ gán) buổi tập cho một thứ trong tuần. */
  const assignPlanToWeekday = useCallback((weekday, planId) => {
    setWeekPlan((current) => ({ ...current, [weekday]: planId }));
  }, []);

  const planById = useCallback((planId) => plans.find((plan) => plan.id === planId) ?? null, [plans]);

  /** 8 ngày sắp tới (kể cả hôm nay) có buổi tập theo lịch tuần. */
  const upcomingDateKeys = useMemo(() => {
    const hasAnyPlan = Object.values(weekPlan).some(Boolean);
    if (!hasAnyPlan) return [];

    const days = [];
    const today = new Date();

    for (let offset = 0; offset < 8; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      if (weekPlan[date.getDay()]) days.push(toDateKey(date));
    }

    return days;
  }, [weekPlan]);

  /**
   * Bài tập cần tập của một ngày: lấy buổi tập gần nhất trước đó,
   * gom luôn buổi liền trước nếu 2 buổi sát nhau (để đủ thời gian hồi phục).
   */
  const composePlanItemsForDate = useCallback(
    (dateKey) => {
      const index = upcomingDateKeys.indexOf(dateKey);
      if (index === -1) return [];

      const plansOfDay = (key) => planById(weekPlan[new Date(`${key}T00:00:00`).getDay()]);

      const primary = plansOfDay(dateKey);
      const previous = index > 0 ? plansOfDay(upcomingDateKeys[index - 1]) : null;

      return mergePlanItems([primary, previous]);
    },
    [planById, upcomingDateKeys, weekPlan],
  );

  const completedForDate = useCallback((dateKey) => workoutLogs[dateKey]?.completed ?? [], [workoutLogs]);

  const sessionOf = useCallback(
    (dateKey) => ({
      startedAt: workoutLogs[dateKey]?.startedAt ?? null,
      finishedAt: workoutLogs[dateKey]?.finishedAt ?? null,
      completed: workoutLogs[dateKey]?.completed ?? [],
    }),
    [workoutLogs],
  );

  const isWorkoutDay = useCallback((dateKey) => workoutDays.has(dateKey), [workoutDays]);

  const stats = useMemo(() => {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    let streak = 0;
    const cursor = new Date(today);

    if (!workoutDays.has(toDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (workoutDays.has(toDateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const loggedDays = Object.keys(workoutLogs).filter((key) => (workoutLogs[key].completed ?? []).length > 0);

    const completionRate = loggedDays.length === 0
      ? 0
      : Math.round(
          (loggedDays.reduce((total, key) => {
            const planned = composePlanItemsForDate(key).length;
            const done = workoutLogs[key].completed.length;

            return total + (planned > 0 ? Math.min(done / planned, 1) : 1);
          }, 0) / loggedDays.length) * 100,
        );

    return {
      monthCount: [...workoutDays].filter((key) => key.startsWith(monthPrefix)).length,
      streak,
      totalCount: workoutDays.size,
      exerciseCount: exercises.length,
      connectionCount: connections.filter((item) => item.status === 'CONNECTED').length,
      scheduledWeekdays: Object.values(weekPlan).filter(Boolean).length,
      completionRate,
    };
  }, [workoutDays, exercises, connections, weekPlan, workoutLogs, composePlanItemsForDate]);

  const value = useMemo(
    () => ({
      exercises,
      workoutDays,
      connections,
      sharedWorkouts,
      plans,
      weekPlan,
      workoutLogs,
      upcomingDateKeys,
      stats,
      addExercise,
      removeExercise,
      toggleWorkoutDay,
      logWorkoutToday,
      isWorkoutDay,
      inviteConnection,
      acceptConnection,
      shareExercise,
      savePlan,
      deletePlan,
      assignPlanToWeekday,
      planById,
      composePlanItemsForDate,
      completedForDate,
      sessionOf,
      setWorkoutItemCompleted,
      startSession,
      finishSession,
      resetSession,
      weekdayLabel: (weekday) => WEEKDAY_FULL_LABELS[weekday],
    }),
    [
      exercises,
      workoutDays,
      connections,
      sharedWorkouts,
      plans,
      weekPlan,
      workoutLogs,
      upcomingDateKeys,
      stats,
      addExercise,
      removeExercise,
      toggleWorkoutDay,
      logWorkoutToday,
      isWorkoutDay,
      inviteConnection,
      acceptConnection,
      shareExercise,
      savePlan,
      deletePlan,
      assignPlanToWeekday,
      planById,
      composePlanItemsForDate,
      completedForDate,
      sessionOf,
      setWorkoutItemCompleted,
      startSession,
      finishSession,
      resetSession,
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);

  if (!context) throw new Error('useWorkout phải được dùng bên trong <WorkoutProvider>.');

  return context;
}
