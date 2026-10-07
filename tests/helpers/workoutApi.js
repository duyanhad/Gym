/** Khoá ngày hôm nay theo 'YYYY-MM-DD' (giống frontend gửi lên). */
function todayKey() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

const EXERCISES = [
  {
    exerciseId: 'ex-1',
    name: 'Bench Press',
    muscleGroup: 'Ngực',
    defaultSets: 4,
    defaultReps: 10,
    defaultRestSeconds: 90,
    note: 'Giữ vai cố định.',
    isSystem: true,
  },
  {
    exerciseId: 'ex-2',
    name: 'Squat',
    muscleGroup: 'Chân',
    defaultSets: 4,
    defaultReps: 12,
    defaultRestSeconds: 120,
    note: null,
    isSystem: false,
  },
  {
    exerciseId: 'ex-3',
    name: 'Chạy bộ 3km',
    muscleGroup: 'Cardio',
    defaultSets: 1,
    defaultReps: 1,
    defaultRestSeconds: 0,
    note: null,
    isSystem: true,
  },
];

const PLAN_ITEMS = {
  'plan-1': [
    { exerciseId: 'ex-1', exerciseName: 'Bench Press', targetSets: 4, targetReps: 10, restSeconds: 90 },
    { exerciseId: 'ex-2', exerciseName: 'Squat', targetSets: 4, targetReps: 12, restSeconds: 120 },
  ],
  'plan-2': [
    { exerciseId: 'ex-2', exerciseName: 'Squat', targetSets: 3, targetReps: 15, restSeconds: 60 },
    { exerciseId: 'ex-3', exerciseName: 'Chạy bộ 3km', targetSets: 1, targetReps: 1, restSeconds: 0 },
  ],
};

function planDto(id, name, focus, isSystem = false) {
  const items = (PLAN_ITEMS[id] ?? []).map((item, index) => ({
    workoutPlanItemId: `${id}-item-${index + 1}`,
    orderIndex: index + 1,
    note: null,
    ...item,
  }));

  return {
    workoutPlanId: id,
    name,
    focus,
    note: null,
    isSystem,
    createdAt: new Date().toISOString(),
    totalSets: items.reduce((sum, item) => sum + item.targetSets, 0),
    items,
  };
}

/** Session DTO giống backend trả về (đã tính sẵn các tổng). */
function recalc(session) {
  let totalWork = 0;
  let totalRest = 0;

  session.exercises.forEach((exercise) => {
    exercise.totalWorkSeconds = exercise.sets.reduce((sum, set) => sum + set.durationSeconds, 0);
    exercise.totalExerciseRestSeconds = exercise.sets.reduce((sum, set) => sum + set.restSeconds, 0);
    totalWork += exercise.totalWorkSeconds;
    totalRest += exercise.totalExerciseRestSeconds;
  });

  session.totalDurationSeconds = totalWork;
  session.totalRestSeconds = totalRest;
  session.completedExercises = session.exercises.filter((exercise) => exercise.isCompleted).length;
  session.totalExercises = session.exercises.length;
  session.progressPercent = session.totalExercises === 0
    ? 0
    : Math.round((session.completedExercises / session.totalExercises) * 100);
  session.totalExerciseRestSeconds = totalRest;
  session.planName = session.planName ?? null;

  return session;
}

function createSession(dateKey, body, state, existingId) {
  const exercises = (body.exercises ?? []).map((item, index) => ({
    workoutSessionExerciseId: `sx-${index + 1}`,
    orderIndex: index + 1,
    exerciseId: item.exerciseId ?? null,
    exerciseName: item.exerciseName,
    muscleGroup: item.muscleGroup ?? 'Khác',
    targetSets: item.targetSets ?? 3,
    targetReps: item.targetReps ?? 10,
    restSeconds: item.restSeconds ?? 60,
    note: item.note ?? null,
    totalWorkSeconds: 0,
    totalExerciseRestSeconds: 0,
    isCompleted: false,
    sets: [],
  }));

  return recalc({
    workoutSessionId: existingId ?? 'session-1',
    dateKey,
    workoutPlanId: body.workoutPlanId ?? null,
    planName: body.planName ?? state.planNameForDate(dateKey) ?? null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    status: 'IN_PROGRESS',
    note: null,
    totalDurationSeconds: 0,
    totalRestSeconds: 0,
    completedExercises: 0,
    totalExercises: exercises.length,
    progressPercent: 0,
    exercises,
  });
}

/** Tạo sẵn một buổi tập (dùng cho fixture của test). */
function sessionFixture({
  dateKey = todayKey(),
  planId = 'plan-1',
  planName = 'Buổi Push (Ngực - Vai - Tay sau)',
  status = 'IN_PROGRESS',
  items = [],
} = {}) {
  const exercises = items.map((item, index) => ({
    workoutSessionExerciseId: `sx-${index + 1}`,
    orderIndex: index + 1,
    exerciseId: item.exerciseId ?? null,
    exerciseName: item.exerciseName,
    muscleGroup: item.muscleGroup ?? 'Khác',
    targetSets: item.targetSets ?? 3,
    targetReps: item.targetReps ?? 10,
    restSeconds: item.restSeconds ?? 60,
    note: null,
    totalWorkSeconds: 0,
    totalExerciseRestSeconds: 0,
    isCompleted: Boolean(item.isCompleted),
    sets: (item.sets ?? []).map((set, setIndex) => ({
      workoutSetLogId: `set-${index + 1}-${setIndex + 1}`,
      setNumber: set.setNumber ?? setIndex + 1,
      reps: set.reps ?? null,
      durationSeconds: set.durationSeconds ?? 0,
      restSeconds: set.restSeconds ?? 0,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    })),
  }));

  return recalc({
    workoutSessionId: 'session-fixture',
    dateKey,
    workoutPlanId: planId,
    planName,
    startedAt: new Date().toISOString(),
    finishedAt: status === 'FINISHED' ? new Date().toISOString() : null,
    status,
    note: null,
    totalDurationSeconds: 0,
    totalRestSeconds: 0,
    completedExercises: 0,
    totalExercises: exercises.length,
    progressPercent: 0,
    exercises,
  });
}

/**
 * Giả lập toàn bộ API tập luyện của backend GYM System để test luồng UI
 * (bài tập, giáo án, lịch tuần, buổi tập + đồng hồ, kết nối & chia sẻ giáo án).
 */
async function mockWorkoutApi(page, options = {}) {
  const state = {
    exercises: (options.exercises ?? EXERCISES).map((item) => ({ ...item })),
    plans: options.plans ?? [
      planDto('plan-1', 'Buổi Push (Ngực - Vai - Tay sau)', 'Ngực · Vai · Tay', true),
      planDto('plan-2', 'Buổi Pull (Lưng - Tay trước)', 'Lưng · Tay', true),
    ],
    weekly: { ...(options.weekly ?? {}) },
    session: options.session ?? null,
    connections: options.connections ?? [],
    received: options.received ?? [],
    sent: options.sent ?? [],
    notifications: options.notifications ?? [],
  };

  state.planNameForDate = (dateKey) => {
    const weekday = new Date(`${dateKey}T00:00:00`).getDay();
    const planId = state.weekly[weekday];

    return state.plans.find((plan) => plan.workoutPlanId === planId)?.name ?? null;
  };

  const reply = (route, body, status = 200) =>
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body === undefined ? {} : body),
    });

  const notFound = (route, message = 'Không tìm thấy dữ liệu.') =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, message, data: null, errors: [message] }),
    });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const body = ['POST', 'PUT', 'PATCH'].includes(method) ? (request.postDataJSON() ?? {}) : {};

    // ============================== BÀI TẬP ==============================
    if (path === '/api/exercises' && method === 'GET') return reply(route, state.exercises);

    if (path === '/api/exercises' && method === 'POST') {
      const created = {
        exerciseId: `ex-${state.exercises.length + 1}-new`,
        name: body.name,
        muscleGroup: body.muscleGroup,
        defaultSets: body.defaultSets ?? 3,
        defaultReps: body.defaultReps ?? 10,
        defaultRestSeconds: body.defaultRestSeconds ?? 60,
        note: body.note ?? null,
        isSystem: false,
      };

      state.exercises = [...state.exercises, created];

      return reply(route, created);
    }

    if (path.startsWith('/api/exercises/') && method === 'DELETE') {
      const id = path.split('/').pop();

      state.exercises = state.exercises.filter((item) => item.exerciseId !== id);

      return reply(route, { success: true });
    }

    // ============================== GIÁO ÁN ==============================
    if (path === '/api/workout-plans/weekly-schedule' && method === 'GET') {
      return reply(
        route,
        Array.from({ length: 7 }, (_, dayOfWeek) => {
          const planId = state.weekly[dayOfWeek] ?? null;
          const plan = state.plans.find((item) => item.workoutPlanId === planId);

          return {
            dayOfWeek,
            dayName: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][dayOfWeek],
            workoutPlanId: planId,
            planName: plan?.name ?? null,
            focus: plan?.focus ?? null,
            itemsCount: plan?.items.length ?? 0,
          };
        }),
      );
    }

    if (path === '/api/workout-plans/weekly-schedule' && method === 'PUT') {
      if (body.workoutPlanId) state.weekly[body.dayOfWeek] = body.workoutPlanId;
      else delete state.weekly[body.dayOfWeek];

      return reply(route, { ...body });
    }

    if (path === '/api/workout-plans' && method === 'GET') return reply(route, state.plans);

    if (path === '/api/workout-plans' && method === 'POST') {
      const items = (body.items ?? []).map((item, index) => ({
        workoutPlanItemId: `new-item-${index + 1}`,
        orderIndex: index + 1,
        note: item.note ?? null,
        exerciseId: item.exerciseId ?? null,
        exerciseName: item.exerciseName,
        targetSets: item.targetSets,
        targetReps: item.targetReps,
        restSeconds: item.restSeconds ?? 60,
      }));

      const created = {
        workoutPlanId: `plan-new-${state.plans.length + 1}`,
        name: body.name,
        focus: body.focus ?? null,
        note: body.note ?? null,
        isSystem: false,
        createdAt: new Date().toISOString(),
        totalSets: items.reduce((sum, item) => sum + item.targetSets, 0),
        items,
      };

      state.plans = [...state.plans, created];

      return reply(route, created);
    }

    if (path.startsWith('/api/workout-plans/') && method === 'DELETE') {
      const id = path.split('/').pop();

      state.plans = state.plans.filter((plan) => plan.workoutPlanId !== id);

      return reply(route, { success: true });
    }

    // ============================== BUỔI TẬP ==============================
    if (path === '/api/workout-sessions/stats' && method === 'GET') {
      const trainedDays = state.session ? [state.session.dateKey] : [];

      return reply(route, {
        streakDays: trainedDays.length,
        sessionsThisMonth: trainedDays.length,
        totalSessions: trainedDays.length,
        totalDurationMinutes: state.session ? Math.floor(state.session.totalDurationSeconds / 60) : 0,
        scheduledWeekdays: Object.keys(state.weekly).length,
        completionRate: state.session?.status === 'FINISHED' ? 100 : 0,
      });
    }

    if (path === '/api/workout-sessions/day-marks' && method === 'GET') {
      return reply(
        route,
        state.session
          ? [
              {
                dateKey: state.session.dateKey,
                hasSession: true,
                isCompleted: state.session.status === 'FINISHED',
                totalDurationSeconds: state.session.totalDurationSeconds,
                completedExercises: state.session.completedExercises,
                totalExercises: state.session.totalExercises,
              },
            ]
          : [],
      );
    }

    if (path === '/api/workout-sessions/history' && method === 'GET') {
      const items = state.session
        ? [
            {
              workoutSessionId: state.session.workoutSessionId,
              dateKey: state.session.dateKey,
              planName: state.session.planName,
              status: state.session.status,
              totalDurationSeconds: state.session.totalDurationSeconds,
              totalRestSeconds: state.session.totalRestSeconds,
              completedExercises: state.session.completedExercises,
              totalExercises: state.session.totalExercises,
              exercises: state.session.exercises,
            },
          ]
        : [];

      return reply(route, { items, totalCount: items.length, pageNumber: 1, pageSize: 20, totalPages: 1 });
    }

    if (path.startsWith('/api/workout-sessions/by-date/') && method === 'GET') {
      const dateKey = path.split('/').pop();

      return reply(route, state.session && state.session.dateKey === dateKey ? state.session : null);
    }

    if (path === '/api/workout-sessions/start' && method === 'POST') {
      const existingId = state.session?.workoutSessionId ?? 'session-1';

      state.session = createSession(body.dateKey ?? todayKey(), body, state, existingId);

      return reply(route, { success: true, data: state.session, message: 'Đã bắt đầu buổi tập.' });
    }

    if (/^\/api\/workout-sessions\/[^/]+\/exercises\/[^/]+\/sets$/.test(path) && method === 'POST') {
      const parts = path.split('/');
      const sessionExerciseId = parts[parts.length - 2];
      const exercise = state.session?.exercises.find((item) => item.workoutSessionExerciseId === sessionExerciseId);

      if (!exercise) return notFound(route, 'Không tìm thấy bài tập trong buổi.');

      const existing = exercise.sets.find((set) => set.setNumber === body.setNumber);
      const payload = {
        workoutSetLogId: existing?.workoutSetLogId ?? `set-${exercise.sets.length + 1}`,
        setNumber: body.setNumber,
        durationSeconds: body.durationSeconds,
        restSeconds: body.restSeconds ?? 0,
        reps: body.reps ?? null,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
      };

      if (existing) Object.assign(existing, payload);
      else exercise.sets = [...exercise.sets, payload];

      recalc(state.session);

      return reply(route, { success: true, data: state.session, message: 'Đã ghi lại hiệp tập.' });
    }

    if (/^\/api\/workout-sessions\/exercises\/[^/]+\/completed$/.test(path) && method === 'PATCH') {
      const sessionExerciseId = path.split('/')[4];
      const exercise = state.session?.exercises.find((item) => item.workoutSessionExerciseId === sessionExerciseId);

      if (!exercise) return notFound(route, 'Không tìm thấy bài tập trong buổi.');

      exercise.isCompleted = Boolean(body.isCompleted);

      if (state.session.exercises.every((item) => item.isCompleted)) state.session.status = 'FINISHED';
      else if (state.session.status === 'FINISHED') state.session.status = 'IN_PROGRESS';

      recalc(state.session);

      return reply(route, { success: true, data: state.session });
    }

    if (/^\/api\/workout-sessions\/[^/]+\/exercises\/reorder$/.test(path) && method === 'POST') {
      const order = body.orderedSessionExerciseIds ?? [];

      state.session.exercises = order
        .map((id, index) => {
          const exercise = state.session.exercises.find((item) => item.workoutSessionExerciseId === id);

          if (exercise) exercise.orderIndex = index + 1;

          return exercise;
        })
        .filter(Boolean);

      recalc(state.session);

      return reply(route, { success: true, data: state.session });
    }

    if (/^\/api\/workout-sessions\/[^/]+\/finish$/.test(path) && method === 'POST') {
      state.session.status = 'FINISHED';
      state.session.finishedAt = new Date().toISOString();

      return reply(route, { success: true, data: recalc(state.session) });
    }

    if (/^\/api\/workout-sessions\/[^/]+$/.test(path) && method === 'DELETE') {
      state.session = null;

      return reply(route, { success: true });
    }

    // ============================== KẾT NỐI & CHIA SẺ ==============================
    if (path === '/api/workout-shares/connections' && method === 'GET') return reply(route, state.connections);

    if (path === '/api/workout-shares/connections/invite' && method === 'POST') {
      const created = {
        userConnectionId: `cn-new-${state.connections.length + 1}`,
        userId: 'user-invited',
        username: body.query,
        fullName: `Người tập ${body.query}`,
        status: 'PENDING',
        direction: 'SENT',
      };

      state.connections = [...state.connections, created];

      return reply(route, created);
    }

    if (/^\/api\/workout-shares\/connections\/[^/]+\/accept$/.test(path) && method === 'POST') {
      const connectionId = path.split('/')[4];
      const connection = state.connections.find((item) => item.userConnectionId === connectionId);

      if (!connection) return notFound(route, 'Không tìm thấy lời mời kết nối.');

      connection.status = 'ACCEPTED';

      return reply(route, connection);
    }

    if (path === '/api/workout-shares/received' && method === 'GET') return reply(route, state.received);

    if (path === '/api/workout-shares/sent' && method === 'GET') return reply(route, state.sent);

    if (path === '/api/workout-shares' && method === 'POST') {
      const plan = state.plans.find((item) => item.workoutPlanId === body.workoutPlanId);
      const share = {
        workoutPlanShareId: `share-sent-${state.sent.length + 1}`,
        workoutPlanId: body.workoutPlanId,
        planName: plan?.name ?? 'Giáo án',
        fromUserId: 'user-me',
        fromUserName: 'Tôi',
        toUserId: 'user-other',
        toUserName: 'Người nhận',
        message: body.message ?? null,
        sharedAt: new Date().toISOString(),
        isReceived: false,
      };

      state.sent = [...state.sent, share];

      return reply(route, share);
    }

    if (/^\/api\/workout-shares\/[^/]+\/import$/.test(path) && method === 'POST') {
      const shareId = path.split('/')[3];
      const share = state.received.find((item) => item.workoutPlanShareId === shareId);
      const source = state.plans.find((item) => item.workoutPlanId === share?.workoutPlanId) ?? state.plans[0];
      const imported = {
        ...source,
        workoutPlanId: `plan-imported-${state.plans.length + 1}`,
        name: `${source.name} (nhận)`,
        isSystem: false,
      };

      state.plans = [...state.plans, imported];

      return reply(route, imported);
    }

    if (path === '/api/workout-shares/notifications' && method === 'GET') return reply(route, state.notifications);

    if (path === '/api/workout-shares/notifications/read' && method === 'POST') {
      state.notifications = state.notifications.map((item) => ({ ...item, isRead: true }));

      return reply(route, { success: true });
    }

    // Mặc định: trả về rỗng để không gọi ra backend thật khi test.
    return reply(route, {});
  });

  return state;
}

/** Tài khoản đã kết nối sẵn (dùng cho test chia sẻ). */
const CONNECTED_PEER = {
  userConnectionId: 'cn-1',
  userId: 'user-pt02',
  username: 'pt02',
  fullName: 'Lê Văn Huấn Luyện',
  status: 'ACCEPTED',
  direction: 'SENT',
};

const PENDING_INVITE = {
  userConnectionId: 'cn-3',
  userId: 'user-pt03',
  username: 'pt03',
  fullName: 'Trần Văn Chờ',
  status: 'PENDING',
  direction: 'RECEIVED',
};

module.exports = {
  CONNECTED_PEER,
  EXERCISES,
  PENDING_INVITE,
  mockWorkoutApi,
  planDto,
  sessionFixture,
  todayKey,
};
