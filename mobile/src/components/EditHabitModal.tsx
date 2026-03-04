import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import {
  HabitForm,
  ALL_DAYS,
  WEEKDAYS,
  WEEKENDS,
  UNITS,
  deriveFrequency,
  deriveTargetCount,
  type HabitFormData,
} from './HabitForm';
import type { Habit, UpdateHabitRequest } from '../types';
import { useColors, type Colors } from '../hooks/useColors';

const UNIT_VALUES = new Set(
  UNITS.map(u => u.value).filter(v => v !== '' && v !== 'custom')
);

function habitToFormData(habit: Habit): HabitFormData {
  // Reconstruct selectedDays from frequency string
  let selectedDays: string[];
  if (habit.frequency === 'Daily') {
    selectedDays = ALL_DAYS;
  } else if (habit.frequency === 'Weekdays') {
    selectedDays = WEEKDAYS;
  } else if (habit.frequency === 'Weekends') {
    selectedDays = WEEKENDS;
  } else {
    const parsed = habit.frequency
      .split(',')
      .map(d => d.trim())
      .filter(d => ALL_DAYS.includes(d));
    selectedDays = parsed.length > 0 ? parsed : ALL_DAYS;
  }

  const timesPerDay = Math.max(
    1,
    Math.round(habit.targetCount / Math.max(selectedDays.length, 1))
  );

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
    name:        habit.name,
    description: habit.description ?? '',
    selectedDays,
    timesPerDay,
    targetValue: habit.targetValue != null ? String(habit.targetValue) : '',
    unit,
    customUnit,
    category: habit.category ?? 'other',
  };
}

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateHabitRequest) => void;
}

export const EditHabitModal = ({
  isOpen,
  habit,
  onClose,
  onSubmit,
}: EditHabitModalProps) => {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [formData, setFormData] = useState<HabitFormData>(() =>
    habit
      ? habitToFormData(habit)
      : { name: '', description: '', selectedDays: ALL_DAYS, timesPerDay: 1, targetValue: '', unit: '', customUnit: '', category: 'other' }
  );

  // Re-initialize when the habit changes
  useEffect(() => {
    if (habit) setFormData(habitToFormData(habit));
  }, [habit?.id]);

  const handleChange = (patch: Partial<HabitFormData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    if (!habit) return;
    if (!formData.name.trim()) {
      Alert.alert('Required', 'Please enter a habit name.');
      return;
    }

    const effectiveUnit =
      formData.unit === 'custom' ? formData.customUnit : formData.unit;

    const payload: UpdateHabitRequest = {
      name:        formData.name.trim(),
      description: formData.description.trim(),
      frequency:   deriveFrequency(formData.selectedDays),
      targetCount: deriveTargetCount(formData.selectedDays, formData.timesPerDay),
      category:    formData.category,
    };

    if (effectiveUnit) {
      payload.unit = effectiveUnit;
      const num = Number(formData.targetValue);
      payload.targetValue =
        !isNaN(num) && formData.targetValue !== '' ? num : undefined;
    } else {
      payload.unit        = undefined;
      payload.targetValue = undefined;
    }

    onSubmit(habit.id, payload);
    onClose();
  };

  return (
    <Modal
      visible={isOpen && !!habit}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Habit</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Scrollable form */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <HabitForm data={formData} onChange={handleChange} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (C: Colors) => StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title:    { fontSize: 20, fontWeight: '700', color: C.text },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.zinc800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 8 },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  submitBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
});
