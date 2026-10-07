import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { WEEKDAY_FULL_LABELS } from '../constants/workoutTemplates';
import { toDateKey } from '../utils/date';
import { useAuth } from './AuthContext';
import * as workoutApi from '../services/workoutService';

export const MUSCLE_GROUPS = ['Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng', 'Cardio'];

const FINISHED_STATUS = 'FINISHED';

const WorkoutContext = createContext(null);

function mapExercise(dto) {
  return {
    id: dto.exerciseId,
    name: dto.name,
    group: dto.muscleGroup,
    sets: dto.defaultSets,
    reps: dto.defaultReps,
    restSeconds: dto.defaultRestSeconds,
    note: dto.note ?? '',
    isSystem: dto.isSystem,
  };
}

function mapPlanItem(item) {
  return {
    id: item.workoutPlanItemId,
    orderIndex: item.orderIndex,
    exerciseId: item.exerciseId,
    exerciseName: item.exerciseName,
    targetSets: item.targetSets,
    targetReps: item.targetReps,
    restSeconds: item.restSeconds,
    note: item.note ?? '',
  };
}

function mapPlan(dto) {
  return {
    id: dto.workoutPlanId,
    name: dto.name,
    focus: dto.focus ?? '',
    note: dto.note ?? '',
    isSystem: dto.isSystem,
    totalSets: dto.totalSets,
    items: (dto.items ?? []).map(mapPlanItem),
  };
}

function mapConnection(dto) {
  return {
    id: dto.userConnectionId,
    userId: dto.userId,
    name: dto.fullName || dto.username,
    handle: dto.username,
    status: dto.status,
    direction: dto.direction,
  };
}

function mapSession(dto) {
  if (!dto) return null;

  return {
    id: dto.workoutSessionId,
    dateKey: dto.dateKey,
    planId: dto.workoutPlanId,
    planName: dto.planName,
    startedAt: dto.startedAt,
    finishedAt: dto.finishedAt,
    status: dto.status,
    note: dto.note,
    totalDurationSeconds: dto.totalDurationSeconds,
    totalRestSeconds: dto.totalRestSeconds,
    completedExercises: dto.completedExercises,
    totalExercises: dto.totalExercises,
    progressPercent: dto.progressPercent,
    exercises: (dto.exercises ?? []).map((exercise) => ({
      id: exercise.workoutSessionExerciseId,
      orderIndex: exercise.orderIndex,
      exerciseId: exercise.exerciseId,
      name: exercise.exerciseName,
      group: exercise.muscleGroup ?? '',
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      restSeconds: exercise.restSeconds,
      note: exercise.note ?? '',
      totalWorkSeconds: exercise.totalWorkSeconds,
      totalRestSeconds: exercise.totalExerciseRestSeconds,
      isCompleted: exercise.isCompleted,
      sets: (exercise.sets ?? []).map((set) => ({
        id: set.workoutSetLogId,
        setNumber: set.setNumber,
        reps: set.reps,
        durationSeconds: set.durationSeconds,
        restSeconds: set.restSeconds,
        startedAt: set.startedAt,
        finishedAt: set.finishedAt,
      })),
    })),
  };
}

/**
 * Store tập luyện: bài tập, giáo án, lịch tuần, buổi tập, kết nối & chia sẻ.
 * Dữ liệu lấy từ backend GYM System qua `src/services/workoutService.js`.
 */
export function WorkoutProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [sessionsByDate, setSessionsByDate] = useState({});
  const [dayMarks, setDayMarks] = useState({});
  const [stats, setStats] = useState({
    streak: 0,
    monthCount: 0,
    totalCount: 0,
    totalMinutes: 0,
    scheduledWeekdays: 0,
    completionRate: 0,
  });
  const [history, setHistory] = useState([]);
  const [connections, setConnections] = useState([]);
  const [receivedShares, setReceivedShares] = useState([]);
  const [sentShares, setSentShares] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshExercises = useCallback(async () => {
    const data = await workoutApi.fetchExercises();

    setExercises((data ?? []).map(mapExercise));

    return data;
  }, []);

  const refreshPlans = useCallback(async () => {
    const data = await workoutApi.fetchPlans();

    setPlans((data ?? []).map(mapPlan));

    return data;
  }, []);

  const refreshWeeklySchedule = useCallback(async () => {
    const data = await workoutApi.fetchWeeklySchedule();

    setWeeklySchedule(data ?? []);

    return data;
  }, []);

  const refreshStats = useCallback(async () => {
    const data = await workoutApi.fetchStats();

    setStats({
      streak: data?.streakDays ?? 0,
      monthCount: data?.sessionsThisMonth ?? 0,
      totalCount: data?.totalSessions ?? 0,
      totalMinutes: data?.totalDurationMinutes ?? 0,
      scheduledWeekdays: data?.scheduledWeekdays ?? 0,
      completionRate: data?.completionRate ?? 0,
    });

    return data;
  }, []);

  const refreshDayMarks = useCallback(async (fromDate, toDate) => {
    const data = await workoutApi.fetchDayMarks(fromDate, toDate);
    const marks = {};

    (data ?? []).forEach((mark) => {
      marks[mark.dateKey] = mark;
    });

    setDayMarks((current) => ({ ...current, ...marks }));

    return marks;
  }, []);

  const refreshHistory = useCallback(async () => {
    const data = await workoutApi.fetchHistory({ pageSize: 20 });

    setHistory(data?.items ?? []);

    return data;
  }, []);

  /** Tải buổi tập của một ngày (null nếu ngày đó chưa có buổi tập). */
  const loadSessionForDate = useCallback(async (dateKey) => {
    const data = await workoutApi.fetchSessionByDate(dateKey);
    const session = mapSession(data);

    setSessionsByDate((current) => ({ ...current, [dateKey]: session }));

    return session;
  }, []);

  const refreshConnections = useCallback(async () => {
    const data = await workoutApi.fetchConnections();

    setConnections((data ?? []).map(mapConnection));

    return data;
  }, []);

  const refreshShares = useCallback(async () => {
    const [received, sent] = await Promise.all([
      workoutApi.fetchReceivedShares(),
      workoutApi.fetchSentShares(),
    ]);

    setReceivedShares(received ?? []);
    setSentShares(sent ?? []);

    return { received, sent };
  }, []);

  const refreshNotifications = useCallback(async () => {
    const data = await workoutApi.fetchNotifications();

    setNotifications(data ?? []);

    return data;
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const from = toDateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      const to = toDateKey(new Date(today.getFullYear(), today.getMonth() + 1, 0));

      await Promise.all([
        refreshExercises(),
        refreshPlans(),
        refreshWeeklySchedule(),
        refreshStats(),
        refreshDayMarks(from, to),
        refreshHistory(),
        refreshConnections(),
        refreshShares(),
        refreshNotifications(),
        loadSessionForDate(toDateKey(today)),
      ]);
    } catch (requestError) {
      setError(requestError.message ?? 'Không tải được dữ liệu tập luyện.');
    } finally {
      setLoading(false);
    }
  }, [
    refreshExercises,
    refreshPlans,
    refreshWeeklySchedule,
    refreshStats,
    refreshDayMarks,
    refreshHistory,
    refreshConnections,
    refreshShares,
    refreshNotifications,
    loadSessionForDate,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      setExercises([]);
      setPlans([]);
      setWeeklySchedule([]);
      setSessionsByDate({});
      setDayMarks({});
      setHistory([]);
      setConnections([]);
      setReceivedShares([]);
      setSentShares([]);
      setNotifications([]);
      setError(null);

      return;
    }

    refreshAll();
  }, [isAuthenticated, refreshAll]);

  // ======================= BÀI TẬP =======================

  const addExercise = useCallback(
    async (draft) => {
      const created = await workoutApi.createExercise({
        name: draft.name,
        muscleGroup: draft.group,
        defaultSets: Number(draft.sets) || 3,
        defaultReps: Number(draft.reps) || 10,
        defaultRestSeconds: Number(draft.restSeconds) || 60,
        note: draft.note,
      });

      await refreshExercises();

      return mapExercise(created);
    },
    [refreshExercises],
  );

  const removeExercise = useCallback(
    async (exerciseId) => {
      await workoutApi.deleteExercise(exerciseId);
      await refreshExercises();
    },
    [refreshExercises],
  );

  // ======================= GIÁO ÁN =======================

  const savePlan = useCallback(
    async (draft) => {
      const payload = {
        name: draft.name,
        focus: draft.focus,
        note: draft.note,
        items: draft.items.map((item) => ({
          exerciseId: item.exerciseId ?? null,
          exerciseName: item.exerciseName,
          targetSets: Number(item.targetSets) || 1,
          targetReps: Number(item.targetReps) || 1,
          restSeconds: Number(item.restSeconds) || 0,
          note: item.note
        }))
      };

      const saved = draft.id
        ? await workoutApi.updatePlan(draft.id, payload)
        : await workoutApi.createPlan(payload);

      await refreshPlans();

      return mapPlan(saved);
    },
    [refreshPlans],
  );

  const deletePlanById = useCallback(
    async (planId) => {
      await workoutApi.deletePlan(planId);
      await Promise.all([refreshPlans(), refreshWeeklySchedule()]);
    },
    [refreshPlans, refreshWeeklySchedule],
  );

  const assignPlanToWeekday = useCallback(
    async (dayOfWeek, planId) => {
      await workoutApi.assignWeeklyDay(dayOfWeek, planId ?? null);
      await Promise.all([refreshWeeklySchedule(), refreshStats()]);
    },
    [refreshWeeklySchedule, refreshStats],
  );

  // ======================= BUỔI TẬP =======================

  const startSessionForDate = useCallback(
    async ({ dateKey, planId, planName, items, restart = false }) => {
      const data = await workoutApi.startSession({
        dateKey,
        workoutPlanId: planId ?? null,
        planName: planName ?? null,
        restart,
        exercises: (items ?? []).map((item) => ({
          exerciseId: item.exerciseId ?? null,
          exerciseName: item.exerciseName ?? item.name,
          muscleGroup: item.group ?? null,
          targetSets: Number(item.targetSets ?? item.sets) || 1,
          targetReps: Number(item.targetReps ?? item.reps) || 1,
          restSeconds: Number(item.restSeconds) || 0,
          note: item.note ?? null
        }))
      });

      const session = mapSession(data);

      setSessionsByDate((current) => ({ ...current, [dateKey]: session }));
      await Promise.all([refreshDayMarks(dateKey, dateKey), refreshStats(), refreshHistory()]);

      return session;
    },
    [refreshDayMarks, refreshStats, refreshHistory],
  );

  const applySessionUpdate = useCallback((session) => {
    setSessionsByDate((current) => ({ ...current, [session.dateKey]: session }));

    return session;
  }, []);

  const logSetForExercise = useCallback(
    async (sessionId, sessionExerciseId, payload) => {
      const data = await workoutApi.logSet(sessionId, sessionExerciseId, payload);

      return applySessionUpdate(mapSession(data));
    },
    [applySessionUpdate],
  );

  const toggleExerciseCompleted = useCallback(
    async (sessionExerciseId, isCompleted) => {
      const data = await workoutApi.setExerciseCompleted(sessionExerciseId, isCompleted);
      const session = applySessionUpdate(mapSession(data));

      await refreshDayMarks(session.dateKey, session.dateKey);

      return session;
    },
    [applySessionUpdate, refreshDayMarks],
  );

  const reorderSessionExercises = useCallback(
    async (sessionId, orderedIds) => {
      const data = await workoutApi.reorderSessionExercises(sessionId, orderedIds);

      return applySessionUpdate(mapSession(data));
    },
    [applySessionUpdate],
  );

  const finishSessionForDate = useCallback(
    async (sessionId, note) => {
      const data = await workoutApi.finishSession(sessionId, note);
      const session = applySessionUpdate(mapSession(data));

      await Promise.all([
        refreshDayMarks(session.dateKey, session.dateKey),
        refreshStats(),
        refreshHistory(),
      ]);

      return session;
    },
    [applySessionUpdate, refreshDayMarks, refreshStats, refreshHistory],
  );

  const removeSession = useCallback(
    async (sessionId, dateKey) => {
      await workoutApi.deleteSession(sessionId);

      setSessionsByDate((current) => ({ ...current, [dateKey]: null }));
      await Promise.all([refreshDayMarks(dateKey, dateKey), refreshStats(), refreshHistory()]);
    },
    [refreshDayMarks, refreshStats, refreshHistory],
  );

  // ======================= KẾT NỐI & CHIA SẺ =======================

  const inviteConnection = useCallback(
    async (query) => {
      const created = await workoutApi.inviteConnection(query);

      await Promise.all([refreshConnections(), refreshNotifications()]);

      return mapConnection(created);
    },
    [refreshConnections, refreshNotifications],
  );

  const acceptConnection = useCallback(
    async (connectionId) => {
      const accepted = await workoutApi.acceptConnection(connectionId);

      await Promise.all([refreshConnections(), refreshNotifications()]);

      return mapConnection(accepted);
    },
    [refreshConnections, refreshNotifications],
  );

  const shareWorkoutPlan = useCallback(
    async ({ planId, connectionId, toUserId, message }) => {
      const share = await workoutApi.sharePlan({
        workoutPlanId: planId,
        userConnectionId: connectionId ?? null,
        toUserId: toUserId ?? null,
        message
      });

      await refreshShares();

      return share;
    },
    [refreshShares],
  );

  const importSharedPlan = useCallback(
    async (shareId) => {
      const imported = await workoutApi.importSharedPlan(shareId);

      await Promise.all([refreshPlans(), refreshShares()]);

      return imported;
    },
    [refreshPlans, refreshShares],
  );

  const markNotificationsRead = useCallback(
    async (id) => {
      await workoutApi.markNotificationsRead(id);
      await refreshNotifications();
    },
    [refreshNotifications],
  );

  /** Chạy một hành động API: lưu lỗi vào state rồi ném lại để UI hiển thị. */
  const runOrThrow = useCallback(async (action) => {
    try {
      setError(null);

      return await action();
    } catch (requestError) {
      setError(requestError.message ?? 'Có lỗi xảy ra.');

      throw requestError;
    }
  }, []);

  // ======================= DẪN XUẤT CHO UI =======================

  const planById = useCallback((planId) => plans.find((plan) => plan.id === planId) ?? null, [plans]);

  /** { [0..6]: planId } */
  const weekPlan = useMemo(() => {
    const map = {};

    weeklySchedule.forEach((entry) => {
      map[entry.dayOfWeek] = entry.workoutPlanId ?? null;
    });

    return map;
  }, [weeklySchedule]);

  const scheduleForDay = useCallback(
    (dayOfWeek) => weeklySchedule.find((entry) => entry.dayOfWeek === dayOfWeek) ?? null,
    [weeklySchedule],
  );

  const sessionForDate = useCallback((dateKey) => sessionsByDate[dateKey] ?? null, [sessionsByDate]);

  const isWorkoutDay = useCallback((dateKey) => Boolean(dayMarks[dateKey]?.hasSession), [dayMarks]);

  const workoutDays = useMemo(
    () => Object.keys(dayMarks).filter((key) => dayMarks[key].hasSession),
    [dayMarks],
  );

  const sessionsInProgress = useMemo(
    () => Object.values(sessionsByDate).filter((session) => session && session.status === 'IN_PROGRESS'),
    [sessionsByDate],
  );

  const value = useMemo(
    () => ({
      exercises,
      plans,
      weeklySchedule,
      weekPlan,
      exerciseCount: exercises.length,
      planCount: plans.length,
      sessionsByDate,
      sessionsInProgress,
      dayMarks,
      workoutDays,
      history,
      connections,
      receivedShares,
      sentShares,
      notifications,
      stats: {
        ...stats,
        exerciseCount: exercises.length,
        connectionCount: connections.filter((item) => item.status === 'ACCEPTED').length
      },
      notificationCount: notifications.filter((item) => !item.isRead).length,
      finishedStatus: FINISHED_STATUS,
      loading,
      error,

      refreshAll,
      refreshExercises,
      refreshPlans,
      refreshWeeklySchedule,
      refreshStats,
      refreshDayMarks,
      refreshHistory,
      refreshConnections,
      refreshShares,
      refreshNotifications,
      addExercise,
      removeExercise,
      savePlan,
      deletePlanById,
      assignPlanToWeekday,
      loadSessionForDate,
      startSessionForDate,
      logSetForExercise,
      toggleExerciseCompleted,
      reorderSessionExercises,
      finishSessionForDate,
      removeSession,
      inviteConnection,
      acceptConnection,
      shareWorkoutPlan,
      importSharedPlan,
      markNotificationsRead,
      runOrThrow,

      planById,
      scheduleForDay,
      sessionForDate,
      isWorkoutDay,
      weekdayLabel: (weekday) => WEEKDAY_FULL_LABELS[weekday]
    }),
    [
      exercises,
      plans,
      weeklySchedule,
      weekPlan,
      sessionsByDate,
      sessionsInProgress,
      dayMarks,
      workoutDays,
      history,
      connections,
      receivedShares,
      sentShares,
      notifications,
      stats,
      loading,
      error,
      refreshAll,
      refreshExercises,
      refreshPlans,
      refreshWeeklySchedule,
      refreshStats,
      refreshDayMarks,
      refreshHistory,
      refreshConnections,
      refreshShares,
      refreshNotifications,
      addExercise,
      removeExercise,
      savePlan,
      deletePlanById,
      assignPlanToWeekday,
      loadSessionForDate,
      startSessionForDate,
      logSetForExercise,
      toggleExerciseCompleted,
      reorderSessionExercises,
      finishSessionForDate,
      removeSession,
      inviteConnection,
      acceptConnection,
      shareWorkoutPlan,
      importSharedPlan,
      markNotificationsRead,
      runOrThrow,
      planById,
      scheduleForDay,
      sessionForDate,
      isWorkoutDay
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);

  if (!context) throw new Error('useWorkout phải được dùng bên trong <WorkoutProvider>.');

  return context;
}
