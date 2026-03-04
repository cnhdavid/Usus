import type { Habit, DailyLog } from '../types';

export const calculateStreak = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date);
    logDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (logDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const calculateCompletionRate = (logs: DailyLog[], habit: Habit): number => {
  if (logs.length === 0) return 0;
  const completedLogs = logs.filter(l => l.completedCount >= habit.targetCount);
  return Math.round((completedLogs.length / logs.length) * 100);
};

export const getTodayLog = (logs: DailyLog[], habitId: number): DailyLog | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return logs.find(l => l.habitId === habitId && l.date.split('T')[0] === today);
};

export const getLogForDate = (
  logs: DailyLog[],
  habitId: number,
  date: Date
): DailyLog | undefined => {
  const dateStr = date.toISOString().split('T')[0];
  return logs.find(l => l.habitId === habitId && l.date.split('T')[0] === dateStr);
};

export const calculateDailyCompletion = (habits: Habit[], allLogs: DailyLog[]): number => {
  if (habits.length === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = allLogs.filter(l => l.date.split('T')[0] === today);
  const completedCount = habits.filter(h => {
    const log = todayLogs.find(l => l.habitId === h.id);
    return log && log.completedCount >= h.targetCount;
  }).length;
  return Math.round((completedCount / habits.length) * 100);
};

export const calculateCompletionForDate = (
  habits: Habit[],
  allLogs: DailyLog[],
  date: Date
): number => {
  if (habits.length === 0) return 0;
  const dateStr = date.toISOString().split('T')[0];
  const dateLogs = allLogs.filter(l => l.date.split('T')[0] === dateStr);
  const completedCount = habits.filter(h => {
    const log = dateLogs.find(l => l.habitId === h.id);
    return log && log.completedCount >= h.targetCount;
  }).length;
  return Math.round((completedCount / habits.length) * 100);
};
