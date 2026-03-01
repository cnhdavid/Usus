import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Apple, BookOpen, Brain, Zap, Users, Sparkles, ChevronDown, Plus, Minus, Check } from 'lucide-react';
import type { Habit, UpdateHabitRequest } from '../types';

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateHabitRequest) => void;
}

const CATEGORIES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'fitness',      label: 'Fitness',      Icon: Dumbbell  },
  { value: 'health',       label: 'Health',        Icon: Apple     },
  { value: 'learning',     label: 'Learning',      Icon: BookOpen  },
  { value: 'mindfulness',  label: 'Mindfulness',   Icon: Brain     },
  { value: 'productivity', label: 'Productivity',  Icon: Zap       },
  { value: 'social',       label: 'Social',        Icon: Users     },
  { value: 'other',        label: 'Other',         Icon: Sparkles  },
];

const UNITS = [
  { value: '',        label: 'No measurement' },
  { value: 'km',      label: 'km  – kilometers' },
  { value: 'm',       label: 'm   – meters' },
  { value: 'miles',   label: 'mi  – miles' },
  { value: 'min',     label: 'min – minutes' },
  { value: 'h',       label: 'h   – hours' },
  { value: 'pages',   label: 'pages' },
  { value: 'reps',    label: 'reps' },
  { value: 'sets',    label: 'sets' },
  { value: 'cal',     label: 'calories' },
  { value: 'kg',      label: 'kg  – kilograms' },
  { value: 'lbs',     label: 'lbs – pounds' },
  { value: 'cups',    label: 'cups' },
  { value: 'glasses', label: 'glasses' },
  { value: 'steps',   label: 'steps' },
  { value: 'custom',  label: 'custom…' },
];

const DAYS = [
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
  { key: 'Sun', label: 'S' },
];

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKENDS  = ['Sat', 'Sun'];

const UNIT_VALUES = new Set(UNITS.map(u => u.value).filter(v => v !== '' && v !== 'custom'));

function habitToFormData(habit: Habit) {
  // Reconstruct selectedDays from frequency string
  let selectedDays: string[];
  if (habit.frequency === 'Daily') {
    selectedDays = ALL_DAYS;
  } else if (habit.frequency === 'Weekdays') {
    selectedDays = WEEKDAYS;
  } else if (habit.frequency === 'Weekends') {
    selectedDays = WEEKENDS;
  } else {
    // e.g. "Mon,Wed,Fri"
    const parsed = habit.frequency.split(',').map(d => d.trim()).filter(d => ALL_DAYS.includes(d));
    selectedDays = parsed.length > 0 ? parsed : ALL_DAYS;
  }

  const timesPerDay = Math.max(1, Math.round(habit.targetCount / selectedDays.length));

  // Reconstruct unit / customUnit
  let unit = '';
  let customUnit = '';
  if (habit.unit) {
    if (UNIT_VALUES.has(habit.unit)) {
      unit = habit.unit;
    } else {
      unit = 'custom';
      customUnit = habit.unit;
    }
  }

  return {
    name:         habit.name,
    description:  habit.description ?? '',
    selectedDays,
    timesPerDay,
    targetValue:  habit.targetValue != null ? String(habit.targetValue) : ('' as string | number),
    unit,
    customUnit,
    category:     habit.category ?? 'other',
  };
}

export const EditHabitModal = ({ isOpen, habit, onClose, onSubmit }: EditHabitModalProps) => {
  const [formData, setFormData] = useState(() =>
    habit ? habitToFormData(habit) : habitToFormData({ id: 0, name: '', description: '', frequency: 'Daily', targetCount: 7, category: 'other', createdAt: '', userId: 0 })
  );
  const [unitOpen, setUnitOpen] = useState(false);
  const unitRef = useRef<HTMLDivElement>(null);

  // Re-initialize when the habit changes
  useEffect(() => {
    if (habit) setFormData(habitToFormData(habit));
  }, [habit]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (unitRef.current && !unitRef.current.contains(e.target as Node)) setUnitOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const set = (patch: Partial<typeof formData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const toggleDay = (day: string) =>
    set({
      selectedDays: formData.selectedDays.includes(day)
        ? formData.selectedDays.filter(d => d !== day)
        : [...formData.selectedDays, day],
    });

  const sortedSelected = ALL_DAYS.filter(d => formData.selectedDays.includes(d));
  const derivedFrequency =
    sortedSelected.length === 7 ? 'Daily'
    : JSON.stringify(sortedSelected) === JSON.stringify(WEEKDAYS) ? 'Weekdays'
    : JSON.stringify(sortedSelected) === JSON.stringify(WEEKENDS) ? 'Weekends'
    : sortedSelected.join(',') || 'Daily';
  const derivedTargetCount = Math.max(sortedSelected.length, 1) * formData.timesPerDay;

  const showMeasurement = formData.unit !== '';
  const effectiveUnit = formData.unit === 'custom' ? formData.customUnit : formData.unit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit) return;

    const payload: UpdateHabitRequest = {
      name:        formData.name,
      description: formData.description,
      frequency:   derivedFrequency,
      targetCount: derivedTargetCount,
      category:    formData.category,
    };
    if (effectiveUnit) {
      payload.unit = effectiveUnit;
      if (formData.targetValue !== '' && !isNaN(Number(formData.targetValue))) {
        payload.targetValue = Number(formData.targetValue);
      } else {
        payload.targetValue = undefined;
      }
    } else {
      payload.unit = undefined;
      payload.targetValue = undefined;
    }

    onSubmit(habit.id, payload);
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
            <div className="bg-card-bg border border-card-border rounded-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
              {/* Sticky header */}
              <div className="px-8 pt-8 pb-4 border-b border-card-border shrink-0">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Habit</h2>
              </div>

              {/* Scrollable fields */}
              <div className="overflow-y-auto px-8 py-5 flex-1">
                <form id="edit-habit-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">Habit Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => set({ name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent-cyan transition-colors"
                      placeholder="e.g., Cycling"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => set({ description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent-cyan transition-colors resize-none"
                      placeholder="Optional notes…"
                      rows={2}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => set({ category: c.value })}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            formData.category === c.value
                              ? 'bg-accent-cyan text-black'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          <c.Icon className="w-3.5 h-3.5" />
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">Schedule</label>

                    <div className="flex gap-2 mb-3">
                      {[
                        { label: 'Every day', days: ALL_DAYS },
                        { label: 'Weekdays',  days: WEEKDAYS  },
                        { label: 'Weekends',  days: WEEKENDS  },
                      ].map(({ label, days }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => set({ selectedDays: days })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            JSON.stringify(sortedSelected) === JSON.stringify(days)
                              ? 'bg-accent-cyan text-black'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {DAYS.map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDay(key)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            formData.selectedDays.includes(key)
                              ? 'bg-accent-cyan text-black shadow-glow-cyan'
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-zinc-700'
                          }`}
                          title={key}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {sortedSelected.length === 0 && (
                      <p className="mt-2 text-xs text-red-400">Select at least one day.</p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-slate-500 dark:text-zinc-400 whitespace-nowrap">Times per session day</label>
                      <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => set({ timesPerDay: Math.max(1, formData.timesPerDay - 1) })}
                          className="px-3 py-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-slate-900 dark:text-white font-medium text-sm select-none">
                          {formData.timesPerDay}
                        </span>
                        <button
                          type="button"
                          onClick={() => set({ timesPerDay: Math.min(20, formData.timesPerDay + 1) })}
                          className="px-3 py-2 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">
                        → {sortedSelected.length} day{sortedSelected.length !== 1 ? 's' : ''}/week · {derivedTargetCount}× total
                      </span>
                    </div>
                  </div>

                  {/* Measurement */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">
                      Measurement unit
                      <span className="ml-2 text-xs text-slate-400 dark:text-zinc-500 font-normal">optional — track km, reps, pages…</span>
                    </label>
                    <div ref={unitRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setUnitOpen(o => !o)}
                        className={`w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-zinc-900 border rounded-xl text-slate-900 dark:text-white transition-colors ${
                          unitOpen ? 'border-accent-cyan' : 'border-slate-200 dark:border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <span className={formData.unit === '' ? 'text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-white'}>
                          {UNITS.find(u => u.value === formData.unit)?.label ?? 'No measurement'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-zinc-500 transition-transform ${unitOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {unitOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-10 mt-1 w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-xl max-h-56 overflow-y-auto"
                          >
                            {UNITS.map(u => (
                              <li key={u.value}>
                                <button
                                  type="button"
                                  onClick={() => { set({ unit: u.value, targetValue: '' }); setUnitOpen(false); }}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                                    formData.unit === u.value
                                      ? 'bg-accent-cyan/10 text-accent-cyan'
                                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                                  }`}
                                >
                                  {u.label}
                                  {formData.unit === u.value && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Custom unit label */}
                  {formData.unit === 'custom' && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">Custom unit name</label>
                      <input
                        type="text"
                        value={formData.customUnit}
                        onChange={e => set({ customUnit: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent-cyan transition-colors"
                        placeholder="e.g., chapters, pushups…"
                      />
                    </motion.div>
                  )}

                  {/* Target value per session */}
                  {showMeasurement && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="block text-sm font-medium text-slate-600 dark:text-zinc-300 mb-2">
                        Target per session
                        <span className="ml-2 text-xs text-slate-400 dark:text-zinc-500 font-normal">optional</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.targetValue}
                          onChange={e => set({ targetValue: e.target.value })}
                          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-accent-cyan transition-colors"
                          placeholder="e.g., 30"
                        />
                        <span className="px-3 py-3 bg-slate-200 dark:bg-zinc-800 rounded-xl text-slate-600 dark:text-zinc-300 text-sm font-medium min-w-[60px] text-center">
                          {effectiveUnit || '–'}
                        </span>
                      </div>
                      {formData.targetValue !== '' && effectiveUnit && (
                        <p className="mt-1.5 text-xs text-slate-400 dark:text-zinc-500">
                          Goal: {sortedSelected.length} day{sortedSelected.length !== 1 ? 's' : ''}/week
                          {` · ${formData.targetValue} ${effectiveUnit} per session`}
                        </p>
                      )}
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Sticky footer */}
              <div className="px-8 py-5 border-t border-card-border shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-habit-form"
                  disabled={sortedSelected.length === 0}
                  className="flex-1 py-3 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
