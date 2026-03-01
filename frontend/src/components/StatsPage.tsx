import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { Flame, CheckCircle2, BarChart2, Award, TrendingUp } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { apiClient } from '../api/client';
import { calculateStreak } from '../utils/stats';
import { usePreferences } from '../context/PreferencesContext';
import type { DailyLog } from '../types';

// ── helpers ──────────────────────────────────────────────────
const completionRateLast30 = (logs: DailyLog[], targetCount: number): number => {
  if (logs.length === 0) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const done = logs.filter(
    l => new Date(l.date) >= cutoff && l.completedCount >= targetCount
  ).length;
  return Math.round((done / 30) * 100);
};

// ── shared UI pieces ─────────────────────────────────────────
const SummaryCard = ({
  icon: Icon, label, value, color, delay,
}: {
  icon: typeof Flame;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-card-bg border border-card-border rounded-2xl p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-slate-500 dark:text-zinc-400 text-sm truncate">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </motion.div>
);

const DailyBar = ({
  label, count, max, isToday,
}: { label: string; count: number; max: number; isToday: boolean }) => {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs text-slate-500 dark:text-zinc-400">{count}</span>
      <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(pct, 2)}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`w-full rounded-t-md ${isToday ? 'bg-accent-cyan' : 'bg-zinc-700'}`}
        />
      </div>
      <span className={`text-[10px] font-medium ${isToday ? 'text-accent-cyan' : 'text-slate-400 dark:text-zinc-500'}`}>
        {label}
      </span>
    </div>
  );
};

// ── main page ─────────────────────────────────────────────────
export const StatsPage = () => {
  const { habits, isLoading: habitsLoading } = useHabits();
  const { t } = usePreferences();

  // Batch-fetch logs for every habit via a single useQueries call (no hooks-in-loops)
  const logQueries = useQueries({
    queries: habits.map(h => ({
      queryKey: ['logs', h.id],
      queryFn: () => apiClient.logs.getByHabit(h.id),
      staleTime: 5000,
    })),
  });

  const isLoading = habitsLoading || logQueries.some(q => q.isLoading);

  // habitId → logs map
  const logsMap = useMemo<Map<number, DailyLog[]>>(() => {
    const m = new Map<number, DailyLog[]>();
    habits.forEach((h, i) => { m.set(h.id, logQueries[i]?.data ?? []); });
    return m;
  }, [habits, logQueries]);

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  // Summary numbers
  const totalCompletions = useMemo(() => {
    let n = 0;
    logsMap.forEach(logs => { n += logs.filter(l => l.completedCount >= 1).length; });
    return n;
  }, [logsMap]);

  const bestStreak = useMemo(() => {
    let best = 0;
    logsMap.forEach(logs => { best = Math.max(best, calculateStreak(logs)); });
    return best;
  }, [logsMap]);

  const monthlyRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
    let done = 0;
    habits.forEach(h => {
      const logs = logsMap.get(h.id) ?? [];
      done += logs.filter(l => new Date(l.date) >= cutoff && l.completedCount >= h.targetCount).length;
    });
    return Math.round((done / (habits.length * 30)) * 100);
  }, [habits, logsMap]);

  // Weekly bar data (last 7 days)
  const weekData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = habits.filter(h => {
      const logs = logsMap.get(h.id) ?? [];
      return logs.some(l => l.date.split('T')[0] === dateStr && l.completedCount >= h.targetCount);
    }).length;
    return { label, count, isToday: i === 6 };
  }), [habits, logsMap, today]);

  // Top habits by streak
  const topHabits = useMemo(() =>
    [...habits]
      .map(h => ({ habit: h, streak: calculateStreak(logsMap.get(h.id) ?? []) }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5),
    [habits, logsMap]
  );

  // Per-habit breakdown sorted by last-30 rate
  const habitRows = useMemo(() =>
    [...habits].map(h => {
      const logs = logsMap.get(h.id) ?? [];
      return {
        habit: h,
        streak: calculateStreak(logs),
        rate: completionRateLast30(logs, h.targetCount),
        total: logs.filter(l => l.completedCount >= h.targetCount).length,
      };
    }).sort((a, b) => b.rate - a.rate),
    [habits, logsMap]
  );

  const maxWeekly = Math.max(...weekData.map(d => d.count), 1);
  const medals = ['🥇', '🥈', '🥉'];

  // ── loading / empty states ──────────────────────────────────
  if (habitsLoading || (habits.length > 0 && isLoading)) {
    return (
      <div className="min-h-screen bg-deep-black lg:pl-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="min-h-screen bg-deep-black lg:pl-64 flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart2 className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-zinc-400 text-lg">{t.stats.noData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.stats.title}</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">{t.stats.subtitle}</p>
          </motion.div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={BarChart2}    label={t.stats.totalHabits}      value={habits.length}                   color="bg-blue-500/20 text-blue-400"     delay={0}    />
            <SummaryCard icon={CheckCircle2} label={t.stats.totalCompletions}  value={totalCompletions}                color="bg-green-500/20 text-green-400"   delay={0.05} />
            <SummaryCard icon={Flame}        label={t.stats.bestStreak}        value={`${bestStreak} ${t.stats.days}`} color="bg-orange-500/20 text-orange-400" delay={0.1}  />
            <SummaryCard icon={TrendingUp}   label={t.stats.monthlyRate}       value={`${monthlyRate}%`}               color="bg-purple-500/20 text-purple-400" delay={0.15} />
          </div>

          {/* Weekly bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card-bg border border-card-border rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.stats.weeklyOverview}</h2>
            <p className="text-sm text-slate-400 dark:text-zinc-500 mb-6">{t.stats.weeklyDesc}</p>
            <div className="flex items-end gap-2">
              {weekData.map((d, i) => (
                <DailyBar key={i} label={d.label} count={d.count} max={maxWeekly} isToday={d.isToday} />
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-600 mt-3 text-right">max {habits.length} per day</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top performers */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card-bg border border-card-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-accent-cyan" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.stats.topHabits}</h2>
              </div>
              <p className="text-sm text-slate-400 dark:text-zinc-500 mb-4">{t.stats.topHabitsDesc}</p>
              {topHabits.length === 0 ? (
                <p className="text-slate-400 dark:text-zinc-500 text-sm">{t.stats.noLogs}</p>
              ) : (
                topHabits.map(({ habit, streak }, i) => (
                  <div key={habit.id} className="flex items-center gap-3 py-2 border-b border-card-border last:border-0">
                    <span className="text-lg w-7 shrink-0">{medals[i] ?? `#${i + 1}`}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{habit.name}</p>
                      {habit.category && <p className="text-slate-400 dark:text-zinc-500 text-xs capitalize">{habit.category}</p>}
                    </div>
                    <span className="flex items-center gap-1 text-orange-400 text-sm font-bold shrink-0">
                      <Flame className="w-3.5 h-3.5" /> {streak}d
                    </span>
                  </div>
                ))
              )}
            </motion.div>

            {/* Habit breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card-bg border border-card-border rounded-2xl p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t.stats.habitBreakdown}</h2>
              <p className="text-sm text-slate-400 dark:text-zinc-500 mb-4">{t.stats.habitBreakdownDesc}</p>

              <div className="flex items-center gap-2 pb-2 border-b border-card-border text-[10px] text-slate-400 dark:text-zinc-500 font-medium uppercase tracking-wide">
                <span className="flex-1">{t.stats.name}</span>
                <span className="w-14 text-right shrink-0">{t.stats.streak}</span>
                <span className="w-12 text-right shrink-0">{t.stats.last30}</span>
                <span className="w-14 text-right shrink-0">{t.stats.total}</span>
              </div>

              {habitRows.map(({ habit, streak, rate, total }, i) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.04 }}
                  className="flex items-center gap-2 py-2.5 border-b border-card-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{habit.name}</p>
                    <div className="mt-1 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 + i * 0.04 }}
                        className="h-full bg-accent-cyan rounded-full"
                      />
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-orange-400 text-xs font-bold w-14 justify-end shrink-0">
                    <Flame className="w-3 h-3" />{streak}d
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 w-12 text-right shrink-0">{rate}%</span>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 w-14 text-right shrink-0">{total}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};
