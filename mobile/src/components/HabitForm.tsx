/**
 * Shared form component used by both AddHabitModal and EditHabitModal.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Dumbbell, Apple, BookOpen, Brain, Zap, Users, Sparkles,
  Plus, Minus,
} from 'lucide-react-native';
import { useColors, type Colors } from '../hooks/useColors';

export interface HabitFormData {
  name: string;
  description: string;
  selectedDays: string[];
  timesPerDay: number;
  targetValue: string;
  unit: string;
  customUnit: string;
  category: string;
}

export const emptyForm = (): HabitFormData => ({
  name: '',
  description: '',
  selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  timesPerDay: 1,
  targetValue: '',
  unit: '',
  customUnit: '',
  category: 'other',
});

export const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export const WEEKENDS  = ['Sat', 'Sun'];

export const CATEGORIES = [
  { value: 'fitness',      label: 'Fitness',      Icon: Dumbbell  },
  { value: 'health',       label: 'Health',        Icon: Apple     },
  { value: 'learning',     label: 'Learning',      Icon: BookOpen  },
  { value: 'mindfulness',  label: 'Mindfulness',   Icon: Brain     },
  { value: 'productivity', label: 'Productivity',  Icon: Zap       },
  { value: 'social',       label: 'Social',        Icon: Users     },
  { value: 'other',        label: 'Other',         Icon: Sparkles  },
];

export const UNITS = [
  { value: '',        label: 'None'  },
  { value: 'km',      label: 'km'    },
  { value: 'm',       label: 'm'     },
  { value: 'miles',   label: 'miles' },
  { value: 'min',     label: 'min'   },
  { value: 'h',       label: 'h'     },
  { value: 'pages',   label: 'pages' },
  { value: 'reps',    label: 'reps'  },
  { value: 'sets',    label: 'sets'  },
  { value: 'cal',     label: 'cal'   },
  { value: 'kg',      label: 'kg'    },
  { value: 'lbs',     label: 'lbs'   },
  { value: 'steps',   label: 'steps' },
  { value: 'custom',  label: 'custom…' },
];

const DAY_LABELS: Record<string, string> = {
  Mon: 'M', Tue: 'T', Wed: 'W', Thu: 'T', Fri: 'F', Sat: 'S', Sun: 'S',
};

export function deriveFrequency(selectedDays: string[]): string {
  const sorted = ALL_DAYS.filter(d => selectedDays.includes(d));
  if (sorted.length === 7) return 'Daily';
  if (JSON.stringify(sorted) === JSON.stringify(WEEKDAYS)) return 'Weekdays';
  if (JSON.stringify(sorted) === JSON.stringify(WEEKENDS)) return 'Weekends';
  return sorted.join(',') || 'Daily';
}

export function deriveTargetCount(selectedDays: string[], timesPerDay: number): number {
  return Math.max(ALL_DAYS.filter(d => selectedDays.includes(d)).length, 1) * timesPerDay;
}

// ── Form Component ────────────────────────────────────────────────

interface HabitFormProps {
  data: HabitFormData;
  onChange: (patch: Partial<HabitFormData>) => void;
}

export const HabitForm = ({ data, onChange }: HabitFormProps) => {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const toggleDay = (day: string) => {
    const next = data.selectedDays.includes(day)
      ? data.selectedDays.filter(d => d !== day)
      : [...data.selectedDays, day];
    onChange({ selectedDays: next });
  };

  return (
    <View>
      {/* ── Name ── */}
      <Text style={s.label}>Habit Name *</Text>
      <TextInput
        style={s.input}
        value={data.name}
        onChangeText={v => onChange({ name: v })}
        placeholder="e.g., Morning Run"
        placeholderTextColor={C.textFaint}
        autoCorrect={false}
      />

      {/* ── Description ── */}
      <Text style={s.label}>Description</Text>
      <TextInput
        style={[s.input, s.textarea]}
        value={data.description}
        onChangeText={v => onChange({ description: v })}
        placeholder="Optional notes…"
        placeholderTextColor={C.textFaint}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
      />

      {/* ── Category ── */}
      <Text style={s.label}>Category</Text>
      <View style={s.chipWrap}>
        {CATEGORIES.map(c => {
          const active = data.category === c.value;
          return (
            <TouchableOpacity
              key={c.value}
              onPress={() => onChange({ category: c.value })}
              style={[s.catChip, active && s.catChipActive]}
              activeOpacity={0.75}
            >
              <c.Icon size={13} color={active ? '#000' : C.textMuted} />
              <Text style={[s.catChipText, active && s.catChipTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Schedule: Quick presets ── */}
      <Text style={s.label}>Schedule</Text>
      <View style={s.presetRow}>
        {(['Daily', 'Weekdays', 'Weekends'] as const).map(preset => {
          const target =
            preset === 'Daily' ? ALL_DAYS : preset === 'Weekdays' ? WEEKDAYS : WEEKENDS;
          const active = JSON.stringify(ALL_DAYS.filter(d => data.selectedDays.includes(d))) === JSON.stringify(target);
          return (
            <TouchableOpacity
              key={preset}
              onPress={() => onChange({ selectedDays: target })}
              style={[s.presetBtn, active && s.presetBtnActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.presetBtnText, active && s.presetBtnTextActive]}>
                {preset}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Day toggles */}
      <View style={s.dayRow}>
        {ALL_DAYS.map(day => {
          const active = data.selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={[s.dayBtn, active && s.dayBtnActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.dayBtnText, active && s.dayBtnTextActive]}>
                {DAY_LABELS[day]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Times per day stepper ── */}
      <Text style={[s.label, { marginTop: 16 }]}>Times per day</Text>
      <View style={s.stepperRow}>
        <TouchableOpacity
          onPress={() => onChange({ timesPerDay: Math.max(1, data.timesPerDay - 1) })}
          style={s.stepperBtn}
        >
          <Minus size={16} color={C.text} />
        </TouchableOpacity>
        <Text style={s.stepperValue}>{data.timesPerDay}</Text>
        <TouchableOpacity
          onPress={() => onChange({ timesPerDay: Math.min(10, data.timesPerDay + 1) })}
          style={s.stepperBtn}
        >
          <Plus size={16} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* ── Unit ── */}
      <Text style={[s.label, { marginTop: 16 }]}>Measurement (optional)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.unitsScroll}
      >
        {UNITS.map(u => {
          const active = data.unit === u.value;
          return (
            <TouchableOpacity
              key={u.value}
              onPress={() => onChange({ unit: u.value })}
              style={[s.unitChip, active && s.unitChipActive]}
              activeOpacity={0.75}
            >
              <Text style={[s.unitChipText, active && s.unitChipTextActive]}>
                {u.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Custom unit input */}
      {data.unit === 'custom' && (
        <TextInput
          style={[s.input, { marginTop: 8 }]}
          value={data.customUnit}
          onChangeText={v => onChange({ customUnit: v })}
          placeholder="Enter unit name…"
          placeholderTextColor={C.textFaint}
          autoCorrect={false}
        />
      )}

      {/* Target value */}
      {data.unit !== '' && (
        <>
          <Text style={[s.label, { marginTop: 12 }]}>Target value per session</Text>
          <TextInput
            style={s.input}
            value={data.targetValue}
            onChangeText={v => onChange({ targetValue: v })}
            placeholder="e.g., 5"
            placeholderTextColor={C.textFaint}
            keyboardType="numeric"
          />
        </>
      )}
    </View>
  );
};

const makeStyles = (C: Colors) => StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: C.textMuted, marginBottom: 8 },

  input: {
    backgroundColor: C.zinc900,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
  },
  textarea: { minHeight: 70 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: C.zinc800,
    borderRadius: 10,
  },
  catChipActive:     { backgroundColor: C.accent },
  catChipText:       { fontSize: 13, fontWeight: '500', color: C.textMuted },
  catChipTextActive: { color: '#000' },

  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.zinc800,
    alignItems: 'center',
  },
  presetBtnActive:     { backgroundColor: C.accent },
  presetBtnText:       { fontSize: 13, fontWeight: '500', color: C.textMuted },
  presetBtnTextActive: { color: '#000' },

  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  dayBtn: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: C.zinc800,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtnActive:     { backgroundColor: C.accent },
  dayBtnText:       { fontSize: 14, fontWeight: '700', color: C.textMuted },
  dayBtnTextActive: { color: '#000' },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    backgroundColor: C.zinc800,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { fontSize: 22, fontWeight: '700', color: C.text, minWidth: 32, textAlign: 'center' },

  unitsScroll: { gap: 8, paddingBottom: 4 },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.zinc800,
    borderRadius: 10,
  },
  unitChipActive:     { backgroundColor: C.accent },
  unitChipText:       { fontSize: 13, fontWeight: '500', color: C.textMuted },
  unitChipTextActive: { color: '#000' },
});
