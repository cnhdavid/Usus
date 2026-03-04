import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Dumbbell,
  Apple,
  BookOpen,
  Brain,
  Zap,
  Users,
  Sparkles,
  Flame,
  Target,
  TrendingUp,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react-native';
import type { Habit, DailyLog } from '../types';
import { getLogForDate, calculateStreak } from '../utils/stats';
import { useColors, type Colors } from '../hooks/useColors';

// CATEGORY_COLORS is computed inside HabitCard from useColors() so it reacts to theme changes.
// CATEGORY_ICONS is theme-independent and stays at module level.
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fitness:      Dumbbell,
  health:       Apple,
  learning:     BookOpen,
  mindfulness:  Brain,
  productivity: Zap,
  social:       Users,
  other:        Sparkles,
};

// ── Mini 14-day heat-map ───────────────────────────────────────────
interface MiniHeatMapProps {
  logs: DailyLog[];
  days?: number;
  targetCount: number;
}

const MiniHeatMap = ({ logs, days = 14, targetCount }: MiniHeatMapProps) => {
  const C = useColors();
  const heatStyles = useMemo(() => makeHeatStyles(C), [C]);
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find(l => l.date.split('T')[0] === dateStr);
    const done = log ? log.completedCount >= targetCount : false;
    return { done };
  });

  return (
    <View style={heatStyles.row}>
      {cells.map((c, i) => (
        <View
          key={i}
          style={[
            heatStyles.cell,
            c.done ? heatStyles.cellDone : heatStyles.cellEmpty,
          ]}
        />
      ))}
    </View>
  );
};

const makeHeatStyles = (C: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 3, flexWrap: 'nowrap' },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 3,
    maxWidth: 18,
  },
  cellDone:  { backgroundColor: C.accent },
  cellEmpty: { backgroundColor: C.zinc800 },
});

// ── HabitCard ──────────────────────────────────────────────────────
export interface HabitCardProps {
  habit: Habit;
  logs: DailyLog[];
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selectedDate?: Date;
}

export const HabitCard = ({
  habit,
  logs,
  onToggle,
  onEdit,
  onDelete,
  selectedDate = new Date(),
}: HabitCardProps) => {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const CATEGORY_COLORS = {
    fitness:      C.fitness,
    health:       C.health,
    learning:     C.learning,
    mindfulness:  C.mindfulness,
    productivity: C.productivity,
    social:       C.social,
    other:        C.other,
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selDate = new Date(selectedDate);
  selDate.setHours(0, 0, 0, 0);
  const isFutureDate = selDate > today;

  const todayLog = getLogForDate(logs, habit.id, selectedDate);
  const isCompleted =
    !isFutureDate && !!(todayLog && todayLog.completedCount >= habit.targetCount);
  const streak = calculateStreak(logs);

  const last7Days = logs.filter(l => {
    const d = new Date(l.date);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 7);
    return d >= threshold;
  });
  const weeklyDoneCount = last7Days.filter(
    l => l.completedCount >= habit.targetCount
  ).length;

  const catKey = (habit.category?.toLowerCase() ?? 'other') as keyof typeof CATEGORY_COLORS;
  const catColor = CATEGORY_COLORS[catKey] ?? CATEGORY_COLORS.other;
  const CategoryIcon = CATEGORY_ICONS[catKey] ?? Sparkles;

  // Track hover-like state for toggle button to show "Unmark" label
  const [pressing, setPressing] = useState(false);

  return (
    <View
      style={[
        styles.card,
        isCompleted ? styles.cardCompleted : styles.cardDefault,
      ]}
    >
      {/* ── Header row ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {/* Name + badges */}
          <View style={styles.nameBadgeRow}>
            <Text style={styles.name} numberOfLines={2}>
              {habit.name}
            </Text>
          </View>

          <View style={styles.badgeRow}>
            {streak > 0 && (
              <View style={[styles.badge, { backgroundColor: C.fitness.bg, borderColor: C.fitness.border }]}>
                <Flame size={12} color={C.orange} />
                <Text style={[styles.badgeText, { color: C.orange }]}>
                  {streak} day{streak !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {habit.category && (
              <View style={[styles.badge, { backgroundColor: catColor.bg, borderColor: catColor.border }]}>
                <CategoryIcon size={12} color={catColor.text} />
                <Text style={[styles.badgeText, { color: catColor.text }]}>{habit.category}</Text>
              </View>
            )}
          </View>

          {!!habit.description && (
            <Text style={styles.description} numberOfLines={2}>
              {habit.description}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{habit.frequency}</Text>
            </View>
            <Text style={styles.metaText}>
              {habit.targetCount}× per{' '}
              {habit.frequency === 'Weekly'
                ? 'week'
                : habit.frequency === 'Monthly'
                ? 'month'
                : 'day'}
            </Text>
            {habit.unit && habit.targetValue != null && (
              <View style={[styles.chip, styles.chipAccent]}>
                <Target size={11} color={C.textMuted} />
                <Text style={[styles.chipText, { color: C.textMuted }]}>
                  {habit.targetValue} {habit.unit}
                </Text>
              </View>
            )}
            {habit.unit && weeklyDoneCount > 0 && (
              <View style={[styles.chip, { backgroundColor: C.accentBg, borderColor: 'rgba(6,182,212,0.2)' }]}>
                <TrendingUp size={11} color={C.accent} />
                <Text style={[styles.chipText, { color: C.accent }]}>
                  {weeklyDoneCount}× this week
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit / Delete buttons */}
        {(onEdit || onDelete) && (
          <View style={styles.actionCol}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Pencil size={16} color={C.accent} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.iconBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={16} color={C.red} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── 14-Day heat-map ── */}
      <View style={styles.heatSection}>
        <View style={styles.heatHeader}>
          <Text style={styles.heatLabel}>14-Day Consistency</Text>
          <Text style={styles.heatLabel}>{weeklyDoneCount}/7 days this week</Text>
        </View>
        <MiniHeatMap logs={logs} days={14} targetCount={habit.targetCount} />
      </View>

      {/* ── Toggle button (mobile-optimised: min 56 px) ── */}
      <Pressable
        onPress={isFutureDate ? undefined : onToggle}
        onPressIn={() => setPressing(true)}
        onPressOut={() => setPressing(false)}
        disabled={isFutureDate}
        style={({ pressed }) => [
          styles.toggleBtn,
          isFutureDate
            ? styles.toggleFuture
            : isCompleted
            ? (pressing ? styles.toggleUnmark : styles.toggleDone)
            : (pressed ? styles.togglePendingPressed : styles.togglePending),
        ]}
      >
        {isFutureDate ? (
          <Text style={styles.toggleTextMuted}>Future Date</Text>
        ) : isCompleted && pressing ? (
          <View style={styles.toggleInner}>
            <X size={20} color={C.red} />
            <Text style={[styles.toggleText, { color: C.red }]}>Unmark</Text>
          </View>
        ) : isCompleted ? (
          <View style={styles.toggleInner}>
            <Check size={20} color="#000" />
            <Text style={[styles.toggleText, { color: '#000' }]}>Completed</Text>
          </View>
        ) : (
          <Text style={styles.toggleText}>Mark Complete</Text>
        )}
      </Pressable>
    </View>
  );
};

const makeStyles = (C: Colors) => StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  cardDefault:   { borderColor: C.border },
  cardCompleted: {
    borderColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  headerRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  headerLeft: { flex: 1 },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  name: { fontSize: 18, fontWeight: '700', color: C.text, flexShrink: 1 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },

  description: { fontSize: 13, color: C.textMuted, marginBottom: 8 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.zinc800,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
  },
  chipAccent: {},
  chipText: { fontSize: 12, fontWeight: '500', color: C.textMuted },
  metaText: { fontSize: 12, color: C.textFaint },

  actionCol:  { flexDirection: 'column', gap: 8, marginLeft: 10 },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: C.zinc800,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heatSection: { marginBottom: 14 },
  heatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heatLabel: { fontSize: 11, color: C.textFaint, fontWeight: '500' },

  // Toggle button – min height 56 for comfortable tapping
  toggleBtn: {
    minHeight: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  togglePending: {
    backgroundColor: C.zinc800,
    borderWidth: 1,
    borderColor: C.border,
  },
  togglePendingPressed: {
    backgroundColor: C.zinc700,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleDone: {
    backgroundColor: C.accent,
  },
  toggleUnmark: {
    backgroundColor: 'rgba(248,113,113,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.35)',
  },
  toggleFuture: {
    backgroundColor: 'rgba(39,39,42,0.4)',
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleText: { fontSize: 16, fontWeight: '700', color: C.text },
  toggleTextMuted: { fontSize: 15, fontWeight: '600', color: C.textFaint },
});
