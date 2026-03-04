import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Habit, DailyLog } from '../types';
import { calculateDailyCompletion, calculateStreak } from '../utils/stats';
import { useColors, type Colors } from '../hooks/useColors';

interface HeroStatsProps {
  habits: Habit[];
  allLogs: DailyLog[];
  selectedDate: Date;
}

export const HeroStats = ({ habits, allLogs, selectedDate }: HeroStatsProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const isToday = sel.getTime() === today.getTime();

  const completionPct = calculateDailyCompletion(habits, allLogs);

  const todayLogs = allLogs.filter(
    l => l.date.split('T')[0] === new Date().toISOString().split('T')[0]
  );
  const doneCount = habits.filter(h => {
    const log = todayLogs.find(l => l.habitId === h.id);
    return log && log.completedCount >= h.targetCount;
  }).length;

  // Best streak across all habits
  const bestStreak = habits.reduce((max, h) => {
    const hLogs = allLogs.filter(l => l.habitId === h.id);
    return Math.max(max, calculateStreak(hLogs));
  }, 0);

  const isPerfect = completionPct === 100 && habits.length > 0;

  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={styles.container}>
      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>
            {isToday ? '📅 Daily Progress' : '📅 Day Progress'}
          </Text>
          <Text style={styles.progressPct}>{completionPct}%</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              {
                width: `${completionPct}%` as any,
                backgroundColor: isPerfect ? '#4ade80' : C.accent,
              },
            ]}
          />
        </View>

        <Text style={styles.progressSub}>
          {isPerfect
            ? '🎉 Perfect Day! All habits completed!'
            : `${doneCount} of ${habits.length} habits completed`}
        </Text>
      </View>

      {/* Stat chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Text style={styles.chipValue}>{habits.length}</Text>
          <Text style={styles.chipLabel}>Habits</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipValue}>{doneCount}</Text>
          <Text style={styles.chipLabel}>Done today</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipValue}>{bestStreak}</Text>
          <Text style={styles.chipLabel}>Best streak</Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (C: Colors) => StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  progressSection: { marginBottom: 16 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  progressPct:   { fontSize: 22, fontWeight: '800', color: C.text },
  barBg: {
    height: 8,
    backgroundColor: C.zinc800,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
    minWidth: 4,
  },
  progressSub: { fontSize: 13, color: C.textMuted },
  chipsRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    backgroundColor: C.zinc800,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  chipValue: { fontSize: 20, fontWeight: '700', color: C.text },
  chipLabel: { fontSize: 11, color: C.textFaint, marginTop: 2 },
});
