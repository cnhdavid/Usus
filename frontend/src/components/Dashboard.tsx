import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../hooks/useHabits';
import { useLogs } from '../hooks/useLogs';
import { HeroStats } from './HeroStats';
import { HabitCard } from './HabitCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Sidebar } from './Sidebar';
import { AddHabitModal } from './AddHabitModal';
import { triggerSuccessConfetti } from '../utils/confetti';
import { calculateDailyCompletion } from '../utils/stats';
import type { Habit } from '../types';

export const Dashboard = () => {
  const userId = 1;
  const { habits, isLoading, createHabit, deleteHabit } = useHabits(userId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [previousCompletion, setPreviousCompletion] = useState(0);

  useEffect(() => {
    const fetchAllLogs = async () => {
      const logsPromises = habits.map(async (habit) => {
        try {
          const response = await fetch(`http://localhost:5000/api/logs/habit/${habit.id}`);
          if (response.ok) {
            return await response.json();
          }
          return [];
        } catch {
          return [];
        }
      });
      
      const logsArrays = await Promise.all(logsPromises);
      const flatLogs = logsArrays.flat();
      setAllLogs(flatLogs);
    };

    if (habits.length > 0) {
      fetchAllLogs();
    }
  }, [habits]);

  useEffect(() => {
    const currentCompletion = calculateDailyCompletion(habits, allLogs);
    
    if (currentCompletion === 100 && previousCompletion < 100 && habits.length > 0) {
      triggerSuccessConfetti();
    }
    
    setPreviousCompletion(currentCompletion);
  }, [allLogs, habits]);

  const HabitWithLogs = ({ habit }: { habit: Habit }) => {
    const { logs, toggleHabitCompletion } = useLogs(habit.id);

    return (
      <HabitCard
        habit={habit}
        logs={logs}
        onToggle={() => toggleHabitCompletion(habit)}
        onDelete={() => {
          if (confirm(`Delete "${habit.name}"?`)) {
            deleteHabit(habit.id);
          }
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <Sidebar onAddHabit={() => setIsModalOpen(true)} />
      
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <HeroStats habits={habits} allLogs={allLogs} />

            {isLoading ? (
              <LoadingSkeleton />
            ) : habits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="bg-card-bg border border-card-border rounded-2xl p-12">
                  <svg
                    className="w-24 h-24 mx-auto text-zinc-700 mb-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <h3 className="text-2xl font-bold text-white mb-2">No Habits Yet</h3>
                  <p className="text-zinc-400 mb-6">
                    Start building better habits by creating your first one
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-3 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-bold transition-all"
                  >
                    Create Your First Habit
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">Your Habits</h2>
                <AnimatePresence mode="popLayout">
                  {habits.map((habit) => (
                    <HabitWithLogs key={habit.id} habit={habit} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createHabit}
        userId={userId}
      />
    </div>
  );
};
