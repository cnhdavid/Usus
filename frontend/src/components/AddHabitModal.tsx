import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { CreateHabitRequest } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHabitRequest) => void;
  userId: number;
}

export const AddHabitModal = ({ isOpen, onClose, onSubmit, userId }: AddHabitModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'Daily',
    targetCount: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, userId });
    setFormData({ name: '', description: '', frequency: 'Daily', targetCount: 1 });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card-bg border border-card-border rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Habit</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-accent-cyan transition-colors"
                    placeholder="e.g., Morning Exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-accent-cyan transition-colors resize-none"
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-accent-cyan transition-colors"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Target Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.targetCount}
                      onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-accent-cyan transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-semibold transition-all"
                  >
                    Create Habit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
