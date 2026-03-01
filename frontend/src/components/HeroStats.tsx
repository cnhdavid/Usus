import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import type { Habit, DailyLog } from '../types';
import { calculateCompletionForDate } from '../utils/stats';

interface HeroStatsProps {
  habits: Habit[];
  allLogs: DailyLog[];
  selectedDate: Date;
}

export const HeroStats = ({ habits, allLogs, selectedDate }: HeroStatsProps) => {
  const dailyCompletion = calculateCompletionForDate(habits, allLogs, selectedDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const isToday = sel.getTime() === today.getTime();

  const dateLabel = isToday
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' (Today)'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const completedOnDate = habits.filter(habit => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const log = allLogs.find(l =>
      l.habitId === habit.id &&
      l.date.split('T')[0] === dateStr
    );
    return log && log.completedCount >= habit.targetCount;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card-bg border border-card-border rounded-2xl p-8 backdrop-blur-md"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-2">
          <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{dateLabel}</p>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{isToday ? 'Daily Progress' : 'Day Progress'}</h1>
          <p className="text-slate-600 dark:text-zinc-300 text-lg">
            {completedOnDate} of {habits.length} habits completed
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <ProgressRing progress={dailyCompletion} size={140} strokeWidth={10} />
        </div>
      </div>
      
      {dailyCompletion === 100 && habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl"
        >
          <p className="text-accent-cyan font-semibold text-center flex items-center justify-center gap-2">
            <PartyPopper className="w-5 h-5" /> Perfect Day! All habits completed!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
