import type { Habit, DailyLog } from '../types';

export const calculateStreak = (logs: DailyLog[]): number => {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
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
  
  const completedLogs = logs.filter(log => log.completedCount >= habit.targetCount);
  return Math.round((completedLogs.length / logs.length) * 100);
};

export const getTodayLog = (logs: DailyLog[], habitId: number): DailyLog | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return logs.find(log => 
    log.habitId === habitId && log.date.split('T')[0] === today
  );
};

export const getRecentLogs = (logs: DailyLog[], days: number = 14): DailyLog[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return logs.filter(log => new Date(log.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const calculateDailyCompletion = (habits: Habit[], allLogs: DailyLog[]): number => {
  if (habits.length === 0) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = allLogs.filter(log => log.date.split('T')[0] === today);
  
  const completedCount = habits.filter(habit => {
    const log = todayLogs.find(l => l.habitId === habit.id);
    return log && log.completedCount >= habit.targetCount;
  }).length;
  
  return Math.round((completedCount / habits.length) * 100);
};
