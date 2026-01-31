import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Habit, DailyLog } from '../types';
import { HeatMap } from './HeatMap';
import { getTodayLog, calculateStreak } from '../utils/stats';

interface HabitCardProps {
  habit: Habit;
  logs: DailyLog[];
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const HabitCard = ({ habit, logs, onToggle, onEdit, onDelete }: HabitCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const todayLog = getTodayLog(logs, habit.id);
  const isCompleted = todayLog && todayLog.completedCount >= habit.targetCount;
  const currentProgress = todayLog?.completedCount || 0;
  const streak = calculateStreak(logs);

  const handleToggle = async () => {
    onToggle();
    
    if (!isCompleted && currentProgress + 1 >= habit.targetCount) {
      setTimeout(() => {
        const card = document.getElementById(`habit-${habit.id}`);
        if (card) {
          card.classList.add('animate-scale-up');
          setTimeout(() => card.classList.remove('animate-scale-up'), 300);
        }
      }, 100);
    }
  };

  return (
    <motion.div
      id={`habit-${habit.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-card-bg border rounded-2xl p-6 transition-all duration-300 ${
        isCompleted 
          ? 'border-accent-cyan shadow-glow-cyan' 
          : 'border-card-border hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{habit.name}</h3>
            {streak > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-semibold"
              >
                🔥 {streak} day{streak !== 1 ? 's' : ''}
              </motion.span>
            )}
          </div>
          
          {habit.description && (
            <p className="text-zinc-400 text-sm mb-3">{habit.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-medium">
              {habit.frequency}
            </span>
            <span className="text-zinc-500">
              Target: {habit.targetCount}x
            </span>
          </div>
        </div>

        {isHovered && (onEdit || onDelete) && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Edit habit"
              >
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete habit"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 font-medium">14-Day Consistency</span>
          <span className="text-xs text-zinc-500">
            {currentProgress}/{habit.targetCount} today
          </span>
        </div>
        <HeatMap logs={logs} days={14} targetCount={habit.targetCount} />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleToggle}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          isCompleted
            ? 'bg-accent-cyan text-black shadow-glow-cyan hover:shadow-glow-cyan-lg'
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
        }`}
      >
        {isCompleted ? '✓ Completed' : 'Mark Complete'}
      </motion.button>
    </motion.div>
  );
};
