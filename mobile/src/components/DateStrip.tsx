import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColors, type Colors } from '../hooks/useColors';

interface DateStripProps {
  selectedDate: Date;
  onChange: (d: Date) => void;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DateStrip = ({ selectedDate, onChange }: DateStripProps) => {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [weekOffset, setWeekOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const weekDays = useMemo(() => {
    const mon = new Date(today);
    const dow = mon.getDay();
    mon.setDate(mon.getDate() - (dow === 0 ? 6 : dow - 1) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return d;
    });
  }, [today, weekOffset]);

  const selectedStr = selectedDate.toISOString().split('T')[0];
  const todayStr    = today.toISOString().split('T')[0];

  const weekLabel =
    weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' – ' +
    weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <View style={styles.container}>
      {/* Week navigation header */}
      <View style={styles.navRow}>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <View style={styles.navBtns}>
          <TouchableOpacity
            onPress={() => setWeekOffset(o => o - 1)}
            style={styles.navBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={18} color={C.textMuted} />
          </TouchableOpacity>

          {weekOffset !== 0 && (
            <TouchableOpacity
              onPress={() => { setWeekOffset(0); onChange(new Date(today)); }}
              style={styles.todayBtn}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setWeekOffset(o => o + 1)}
            disabled={weekOffset >= 0}
            style={[styles.navBtn, weekOffset >= 0 && styles.navBtnDisabled]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRight size={18} color={C.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day cells */}
      <View style={styles.daysRow}>
        {DAY_LABELS.map((name, i) => {
          const day    = weekDays[i];
          const dayStr = day.toISOString().split('T')[0];
          const isFuture   = day > today;
          const isSelected = dayStr === selectedStr;
          const isToday    = dayStr === todayStr;

          return (
            <TouchableOpacity
              key={dayStr}
              disabled={isFuture}
              onPress={() => onChange(new Date(day))}
              style={[
                styles.dayCell,
                isSelected ? styles.dayCellSelected : undefined,
                isFuture   ? styles.dayCellDisabled : undefined,
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameSelected : undefined,
                ]}
              >
                {name}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  isSelected ? styles.dayNumSelected : undefined,
                  isToday && !isSelected ? styles.dayNumToday : undefined,
                ]}
              >
                {day.getDate()}
              </Text>
              {isToday && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: isSelected ? '#000' : C.accent },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
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
    padding: 16,
    marginBottom: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  navBtns:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navBtn: {
    width: 32,
    height: 32,
    backgroundColor: C.zinc800,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.zinc800,
    borderRadius: 8,
  },
  todayBtnText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },

  daysRow: { flexDirection: 'row', gap: 4 },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    minHeight: 60,
    justifyContent: 'center',
  },
  dayCellSelected: { backgroundColor: C.accent },
  dayCellDisabled: { opacity: 0.3 },

  dayName: { fontSize: 10, fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  dayNameSelected: { color: '#000' },

  dayNum: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 2 },
  dayNumSelected: { color: '#000' },
  dayNumToday:    { color: C.accent },

  dot: { width: 5, height: 5, borderRadius: 99, marginTop: 3 },
});
