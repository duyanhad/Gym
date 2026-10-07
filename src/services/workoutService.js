import { apiRequest } from './apiClient';

// ============================== BÀI TẬP ==============================

export const fetchExercises = () => apiRequest('/api/exercises');

export const createExercise = (payload) =>
  apiRequest('/api/exercises', { method: 'POST', body: payload });

export const updateExercise = (exerciseId, payload) =>
  apiRequest(`/api/exercises/${exerciseId}`, { method: 'PUT', body: payload });

export const deleteExercise = (exerciseId) =>
  apiRequest(`/api/exercises/${exerciseId}`, { method: 'DELETE' });

// ============================== GIÁO ÁN ==============================

export const fetchPlans = () => apiRequest('/api/workout-plans');

export const fetchPlan = (planId) => apiRequest(`/api/workout-plans/${planId}`);

export const createPlan = (payload) =>
  apiRequest('/api/workout-plans', { method: 'POST', body: payload });

export const updatePlan = (planId, payload) =>
  apiRequest(`/api/workout-plans/${planId}`, { method: 'PUT', body: payload });

export const deletePlan = (planId) =>
  apiRequest(`/api/workout-plans/${planId}`, { method: 'DELETE' });

export const fetchWeeklySchedule = () => apiRequest('/api/workout-plans/weekly-schedule');

export const assignWeeklyDay = (dayOfWeek, workoutPlanId) =>
  apiRequest('/api/workout-plans/weekly-schedule', {
    method: 'PUT',
    body: { dayOfWeek, workoutPlanId },
  });

export const fetchItemsForDate = (dateKey) => apiRequest(`/api/workout-plans/for-date/${dateKey}`);

// ============================== BUỔI TẬP ==============================

export const fetchSessionByDate = (dateKey) => apiRequest(`/api/workout-sessions/by-date/${dateKey}`);

export const startSession = (payload) =>
  apiRequest('/api/workout-sessions/start', { method: 'POST', body: payload });

export const logSet = (sessionId, sessionExerciseId, payload) =>
  apiRequest(`/api/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/sets`, {
    method: 'POST',
    body: payload,
  });

export const setExerciseCompleted = (sessionExerciseId, isCompleted) =>
  apiRequest(`/api/workout-sessions/exercises/${sessionExerciseId}/completed`, {
    method: 'PATCH',
    body: { isCompleted },
  });

export const reorderSessionExercises = (sessionId, orderedSessionExerciseIds) =>
  apiRequest(`/api/workout-sessions/${sessionId}/exercises/reorder`, {
    method: 'POST',
    body: { orderedSessionExerciseIds },
  });

export const finishSession = (sessionId, note) =>
  apiRequest(`/api/workout-sessions/${sessionId}/finish`, { method: 'POST', body: { note } });

export const deleteSession = (sessionId) =>
  apiRequest(`/api/workout-sessions/${sessionId}`, { method: 'DELETE' });

export const fetchHistory = (params = {}) => {
  const query = new URLSearchParams();

  if (params.fromDate) query.set('fromDate', params.fromDate);
  if (params.toDate) query.set('toDate', params.toDate);
  if (params.pageSize) query.set('pageSize', String(params.pageSize));

  const suffix = query.toString();

  return apiRequest(`/api/workout-sessions/history${suffix ? `?${suffix}` : ''}`);
};

export const fetchDayMarks = (fromDate, toDate) =>
  apiRequest(`/api/workout-sessions/day-marks?fromDate=${fromDate}&toDate=${toDate}`);

export const fetchStats = () => apiRequest('/api/workout-sessions/stats');

// ============================== KẾT NỐI & CHIA SẺ ==============================

export const fetchConnections = () => apiRequest('/api/workout-shares/connections');

export const inviteConnection = (query) =>
  apiRequest('/api/workout-shares/connections/invite', { method: 'POST', body: { query } });

export const acceptConnection = (connectionId) =>
  apiRequest(`/api/workout-shares/connections/${connectionId}/accept`, { method: 'POST', body: {} });

export const sharePlan = (payload) =>
  apiRequest('/api/workout-shares', { method: 'POST', body: payload });

export const fetchReceivedShares = () => apiRequest('/api/workout-shares/received');

export const fetchSentShares = () => apiRequest('/api/workout-shares/sent');

export const importSharedPlan = (shareId) =>
  apiRequest(`/api/workout-shares/${shareId}/import`, { method: 'POST', body: {} });

export const fetchNotifications = (unreadOnly = false) =>
  apiRequest(`/api/workout-shares/notifications?unreadOnly=${unreadOnly}`);

export const markNotificationsRead = (id) =>
  apiRequest(`/api/workout-shares/notifications/read${id ? `?id=${id}` : ''}`, {
    method: 'POST',
    body: {},
  });
