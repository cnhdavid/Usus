import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Habit, DailyLog } from '../types';
import { HeatMap } from './HeatMap';
import { getTodayLog, calculateStreak } from '../utils/stats';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Apple, BookOpen, Brain, Zap, Users, Sparkles, Flame, Target, TrendingUp, Pencil, Trash2, Check } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  fitness:      'bg-orange-500/20 border-orange-500/30 text-orange-400',
  health:       'bg-green-500/20 border-green-500/30 text-green-400',
  learning:     'bg-blue-500/20 border-blue-500/30 text-blue-400',
  mindfulness:  'bg-purple-500/20 border-purple-500/30 text-purple-400',
  productivity: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  social:       'bg-pink-500/20 border-pink-500/30 text-pink-400',
  other:        'bg-zinc-700/40 border-zinc-600/30 text-zinc-400',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  fitness:      Dumbbell,
  health:       Apple,
  learning:     BookOpen,
  mindfulness:  Brain,
  productivity: Zap,
  social:       Users,
  other:        Sparkles,
};

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

  // Measurement stats: sum of values over last 7 days
  const last7Days = logs.filter(l => {
    const d = new Date(l.date);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return d >= threshold;
  });
  const weeklyTotal = habit.unit
    ? last7Days.reduce((sum, l) => sum + (l.value ?? 0), 0)
    : null;

  const categoryKey = habit.category?.toLowerCase() ?? 'other';
  const categoryColor = CATEGORY_COLORS[categoryKey] ?? CATEGORY_COLORS.other;
  const CategoryIcon = CATEGORY_ICONS[categoryKey] ?? Sparkles;

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-xl font-bold text-white">{habit.name}</h3>
            {streak > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-semibold"
              >
                <Flame className="w-3.5 h-3.5" /> {streak} day{streak !== 1 ? 's' : ''}
              </motion.span>
            )}
            {habit.category && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 border rounded-lg text-xs font-semibold ${categoryColor}`}>
                <CategoryIcon className="w-3.5 h-3.5" /> {habit.category}
              </span>
            )}
          </div>

          {habit.description && (
            <p className="text-zinc-400 text-sm mb-3">{habit.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="px-3 py-1 bg-zinc-800 rounded-lg text-zinc-300 font-medium">
              {habit.frequency}
            </span>
            <span className="text-zinc-500">
              {habit.targetCount}× per {habit.frequency === 'Weekly' ? 'week' : habit.frequency === 'Monthly' ? 'month' : 'day'}
            </span>
            {habit.unit && habit.targetValue && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800/60 border border-zinc-700/50 rounded-lg text-zinc-300 font-medium">
                <Target className="w-3.5 h-3.5" /> {habit.targetValue} {habit.unit} / session
              </span>
            )}
            {habit.unit && weeklyTotal !== null && weeklyTotal > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg text-accent-cyan text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> {Number.isInteger(weeklyTotal) ? weeklyTotal : weeklyTotal.toFixed(1)} {habit.unit} this week
              </span>
            )}
          </div>
        </div>

        {isHovered && (onEdit || onDelete) && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 ml-3"
          >
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Edit habit"
              >
                <Pencil className="w-4 h-4 text-zinc-400" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete habit"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
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
        {isCompleted ? <span className="inline-flex items-center gap-2"><Check className="w-5 h-5" /> Completed</span> : 'Mark Complete'}
      </motion.button>
    </motion.div>
  );
};
