import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useHabits } from '../hooks/useHabits';
import { useLogs } from '../hooks/useLogs';
import { apiClient } from '../api/client';
import { HeroStats } from './HeroStats';
import { HabitCard } from './HabitCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Sidebar } from './Sidebar';
import { AddHabitModal } from './AddHabitModal';
import { triggerSuccessConfetti } from '../utils/confetti';
import { calculateDailyCompletion, getTodayLog } from '../utils/stats';
import type { Habit, DailyLog } from '../types';

type StatusFilter = 'all' | 'pending' | 'done';

const CATEGORY_OPTIONS = ['all', 'fitness', 'health', 'learning', 'mindfulness', 'productivity', 'social', 'other'];
const FREQUENCY_OPTIONS = ['all', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Monthly'];

export const Dashboard = () => {
  const { habits, isLoading, createHabit, deleteHabit } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [previousCompletion, setPreviousCompletion] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'created'>('created');

  useEffect(() => {
    const fetchAllLogs = async () => {
      const arrays = await Promise.all(
        habits.map(h => apiClient.logs.getByHabit(h.id).catch(() => [] as DailyLog[]))
      );
      setAllLogs(arrays.flat());
    };
    if (habits.length > 0) fetchAllLogs();
    else setAllLogs([]);
  }, [habits]);

  useEffect(() => {
    const pct = calculateDailyCompletion(habits, allLogs);
    if (pct === 100 && previousCompletion < 100 && habits.length > 0) triggerSuccessConfetti();
    setPreviousCompletion(pct);
  }, [allLogs, habits]);

  // Filtered + sorted habits
  const visibleHabits = useMemo(() => {
    let list = [...habits];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') list = list.filter(h => (h.category ?? 'other') === categoryFilter);
    if (frequencyFilter !== 'all') list = list.filter(h => h.frequency === frequencyFilter);
    if (statusFilter !== 'all') {
      list = list.filter(h => {
        const log = getTodayLog(allLogs, h.id);
        const done = !!(log && log.completedCount >= h.targetCount);
        return statusFilter === 'done' ? done : !done;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0; // streak sorting handled per-card
    });

    return list;
  }, [habits, allLogs, search, categoryFilter, frequencyFilter, statusFilter, sortBy]);

  const activeFilters = [
    search.trim() !== '',
    categoryFilter !== 'all',
    frequencyFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setFrequencyFilter('all');
    setStatusFilter('all');
  };

  const HabitWithLogs = ({ habit }: { habit: Habit }) => {
    const { logs, toggleHabitCompletion } = useLogs(habit.id);
    return (
      <HabitCard
        habit={habit}
        logs={logs}
        onToggle={() => toggleHabitCompletion(habit)}
        onDelete={() => { if (confirm(`Delete "${habit.name}"?`)) deleteHabit(habit.id); }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <Sidebar onAddHabit={() => setIsModalOpen(true)} />

      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <HeroStats habits={habits} allLogs={allLogs} />

            {isLoading ? (
              <LoadingSkeleton />
            ) : habits.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                <div className="bg-card-bg border border-card-border rounded-2xl p-12">
                  <svg className="w-24 h-24 mx-auto text-zinc-700 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white mb-2">No Habits Yet</h3>
                  <p className="text-zinc-400 mb-6">Start building better habits by creating your first one</p>
                  <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-bold transition-all">
                    Create Your First Habit
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* ── Filter bar ── */}
                <div className="bg-card-bg border border-card-border rounded-2xl p-4 space-y-3">
                  {/* Search + sort row */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[180px] relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                      </svg>
                      <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search habits…"
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 text-sm focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="created">Newest first</option>
                      <option value="name">A → Z</option>
                    </select>
                    {activeFilters > 0 && (
                      <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-400 hover:text-red-300 bg-red-900/20 border border-red-900/30 rounded-xl transition-colors">
                        Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  {/* Chip filters */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-zinc-500 font-medium mr-1">Status:</span>
                    {(['all', 'pending', 'done'] as StatusFilter[]).map(s => (
                      <button key={s} onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-accent-cyan text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                        {s === 'pending' ? <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span> : s === 'done' ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span> : 'All'}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-zinc-500 font-medium mr-1">Frequency:</span>
                    {FREQUENCY_OPTIONS.map(f => (
                      <button key={f} onClick={() => setFrequencyFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${frequencyFilter === f ? 'bg-accent-cyan text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-zinc-500 font-medium mr-1">Category:</span>
                    {CATEGORY_OPTIONS.map(c => (
                      <button key={c} onClick={() => setCategoryFilter(c)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${categoryFilter === c ? 'bg-accent-cyan text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                        {c === 'all' ? 'All' : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Habit list ── */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Habits</h2>
                  <span className="text-sm text-zinc-500">{visibleHabits.length} / {habits.length}</span>
                </div>

                {visibleHabits.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">
                    <p className="text-lg mb-2">No habits match your filters.</p>
                    <button onClick={clearFilters} className="text-accent-cyan hover:underline text-sm">Clear filters</button>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {visibleHabits.map(habit => (
                      <HabitWithLogs key={habit.id} habit={habit} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={createHabit} />
    </div>
  );
};
