import { motion } from 'framer-motion';
import type { Habit, DailyLog } from '../types';
import { HeatMap } from './HeatMap';
import { getLogForDate, calculateStreak } from '../utils/stats';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Apple, BookOpen, Brain, Zap, Users, Sparkles, Flame, Target, TrendingUp, Pencil, Trash2, Check, X } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  fitness:      'bg-orange-500/20 border-orange-500/30 text-orange-400',
  health:       'bg-green-500/20 border-green-500/30 text-green-400',
  learning:     'bg-blue-500/20 border-blue-500/30 text-blue-400',
  mindfulness:  'bg-purple-500/20 border-purple-500/30 text-purple-400',
  productivity: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
  social:       'bg-pink-500/20 border-pink-500/30 text-pink-400',
  other:        'bg-zinc-700/40 border-slate-200/30 dark:border-zinc-600/30 text-slate-500 dark:text-zinc-400',
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
  selectedDate?: Date;
}

export const HabitCard = ({ habit, logs, onToggle, onEdit, onDelete, selectedDate = new Date() }: HabitCardProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selDate = new Date(selectedDate);
  selDate.setHours(0, 0, 0, 0);
  const isFutureDate = selDate > today;

  const todayLog = getLogForDate(logs, habit.id, selectedDate);
  const isCompleted = !isFutureDate && !!(todayLog && todayLog.completedCount >= habit.targetCount);
  const streak = calculateStreak(logs);

  // Measurement stats: sum of values over last 7 days
  const last7Days = logs.filter(l => {
    const d = new Date(l.date);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return d >= threshold;
  });
  // Count how many days in the past 7 days the habit was completed
  const weeklyDoneCount = last7Days.filter(l => l.completedCount >= habit.targetCount).length;

  const categoryKey = habit.category?.toLowerCase() ?? 'other';
  const categoryColor = CATEGORY_COLORS[categoryKey] ?? CATEGORY_COLORS.other;
  const CategoryIcon = CATEGORY_ICONS[categoryKey] ?? Sparkles;

  const handleToggle = async () => {
    onToggle();
    if (!isCompleted) {
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
      className={`group bg-card-bg border rounded-2xl p-6 transition-all duration-300 ${
        isCompleted
          ? 'border-accent-cyan shadow-glow-cyan'
          : 'border-card-border hover:border-slate-200 dark:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{habit.name}</h3>
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
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-3">{habit.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="px-3 py-1 bg-slate-200 dark:bg-zinc-800 rounded-lg text-slate-600 dark:text-zinc-300 font-medium">
              {habit.frequency}
            </span>
            <span className="text-slate-400 dark:text-zinc-500">
              {habit.targetCount}× per {habit.frequency === 'Weekly' ? 'week' : habit.frequency === 'Monthly' ? 'month' : 'day'}
            </span>
            {habit.unit && habit.targetValue && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-200/60 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700/50 rounded-lg text-slate-600 dark:text-zinc-300 font-medium">
                <Target className="w-3.5 h-3.5" /> {habit.targetValue} {habit.unit} / session
              </span>
            )}
            {habit.unit && weeklyDoneCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg text-accent-cyan text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> {weeklyDoneCount}× this week
              </span>
            )}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 ml-3 shrink-0">
            {onEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(); }}
                className="p-2 bg-slate-200 dark:bg-zinc-800 hover:bg-accent-cyan/20 rounded-lg transition-colors group/btn"
                title="Edit habit"
              >
                <Pencil className="w-4 h-4 text-accent-cyan" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                className="p-2 bg-slate-200 dark:bg-zinc-800 hover:bg-red-900/40 rounded-lg transition-colors"
                title="Delete habit"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">14-Day Consistency</span>
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            {weeklyDoneCount}/7 days this week
          </span>
        </div>
        <HeatMap logs={logs} days={14} targetCount={habit.targetCount} />
      </div>

      <motion.button
        whileTap={{ scale: isFutureDate ? 1 : 0.98 }}
        onClick={isFutureDate ? undefined : handleToggle}
        disabled={isFutureDate}
        className={`group/btn w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          isFutureDate
            ? 'bg-slate-200/40 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-600 cursor-not-allowed border border-slate-200 dark:border-zinc-700/30'
            : isCompleted
            ? 'bg-accent-cyan text-black shadow-glow-cyan hover:bg-red-500/20 hover:text-red-400 hover:shadow-none hover:border hover:border-red-500/40'
            : 'bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
        }`}
      >
        {isFutureDate ? (
          'Future Date'
        ) : isCompleted ? (
          <>
            <span className="inline-flex items-center gap-2 group-hover/btn:hidden">
              <Check className="w-5 h-5" /> Completed
            </span>
            <span className="hidden items-center gap-2 group-hover/btn:inline-flex">
              <X className="w-5 h-5" /> Unmark
            </span>
          </>
        ) : (
          'Mark Complete'
        )}
      </motion.button>
    </motion.div>
  );
};
