import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import type { Habit, DailyLog } from '../types';
import { calculateDailyCompletion } from '../utils/stats';

interface HeroStatsProps {
  habits: Habit[];
  allLogs: DailyLog[];
}

export const HeroStats = ({ habits, allLogs }: HeroStatsProps) => {
  const dailyCompletion = calculateDailyCompletion(habits, allLogs);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const completedToday = habits.filter(habit => {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = allLogs.find(l => 
      l.habitId === habit.id && 
      l.date.split('T')[0] === todayStr
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
          <p className="text-zinc-400 text-sm font-medium">{today}</p>
          <h1 className="text-4xl font-bold text-white">Daily Progress</h1>
          <p className="text-zinc-300 text-lg">
            {completedToday} of {habits.length} habits completed
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
