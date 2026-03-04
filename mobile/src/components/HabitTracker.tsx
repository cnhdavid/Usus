/**
 * HabitTracker.tsx
 *
 * Main screen of the Usus mobile app. Equivalent of Dashboard.tsx from the
 * web version — all state logic is preserved 1:1, only the JSX layer is
 * translated to native components.
 *
 * Architecture:
 *   HabitTracker (root, holds page state + AddModal)
 *     ├─ BottomNav
 *     ├─ DashboardScreen  → FlatList of HabitWithLogs
 *     ├─ StatsScreen      (stub, extend as needed)
 *     └─ SettingsScreen
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  LogOut,
  User,
  Moon,
  Sun,
} from 'lucide-react-native';

import { useHabits } from '../hooks/useHabits';
import { useLogs } from '../hooks/useLogs';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { apiClient } from '../api/client';
import { calculateDailyCompletion, getLogForDate, calculateStreak, calculateCompletionRate } from '../utils/stats';

import { HabitCard } from './HabitCard';
import { HeroStats } from './HeroStats';
import { DateStrip } from './DateStrip';
import { AddHabitModal } from './AddHabitModal';
import { EditHabitModal } from './EditHabitModal';

import type { Habit, DailyLog } from '../types';
import { useColors, type Colors } from '../hooks/useColors';

// ─────────────────────────────────────────────────────────────────
// HabitWithLogs
// Loads the per-habit logs and renders HabitCard.
// (Same pattern as on the web.)
// ─────────────────────────────────────────────────────────────────
interface HabitWithLogsProps {
  habit: Habit;
  selectedDate: Date;
  onEdit: (h: Habit) => void;
  onDelete: (h: Habit) => void;
}

const HabitWithLogs = ({ habit, selectedDate, onEdit, onDelete }: HabitWithLogsProps) => {
  const { logs, toggleHabitCompletion } = useLogs(habit.id);
  return (
    <HabitCard
      habit={habit}
      logs={logs}
      onToggle={() => toggleHabitCompletion(habit, selectedDate)}
      onEdit={() => onEdit(habit)}
      onDelete={() =>
        Alert.alert('Delete Habit', `Delete "${habit.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(habit) },
        ])
      }
      selectedDate={selectedDate}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// FILTER CONSTANTS (same as web)
// ─────────────────────────────────────────────────────────────────
type StatusFilter = 'all' | 'pending' | 'done';

const CATEGORY_OPTIONS = ['all', 'fitness', 'health', 'learning', 'mindfulness', 'productivity', 'social', 'other'];
const FREQUENCY_OPTIONS = ['all', 'Daily', 'Weekdays', 'Weekends', 'Weekly', 'Monthly'];

// ─────────────────────────────────────────────────────────────────
// DashboardScreen
// ─────────────────────────────────────────────────────────────────
interface DashboardScreenProps {
  onAddHabit: () => void;
}

const DashboardScreen = ({ onAddHabit }: DashboardScreenProps) => {
  const C = useColors();
  const dashStyles = useMemo(() => makeDashStyles(C), [C]);
  const filterStyles = useMemo(() => makeFilterStyles(C), [C]);
  const { habits, isLoading, updateHabit, deleteHabit } = useHabits();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Filters — identical to web Dashboard
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created'>('created');

  // Fetch all logs for the loaded habits (for HeroStats / filtering)
  useEffect(() => {
    if (habits.length === 0) {
      setAllLogs(prev => (prev.length === 0 ? prev : []));
      return;
    }
    Promise.all(
      habits.map(h => apiClient.logs.getByHabit(h.id).catch(() => [] as DailyLog[]))
    ).then(arrays => setAllLogs(arrays.flat()));
  }, [habits]);

  // Filtered + sorted habits (1:1 from web)
  const visibleHabits = useMemo(() => {
    let list = [...habits];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        h => h.name.toLowerCase().includes(q) || h.description?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all')
      list = list.filter(h => (h.category ?? 'other') === categoryFilter);
    if (frequencyFilter !== 'all')
      list = list.filter(h => h.frequency === frequencyFilter);
    if (statusFilter !== 'all') {
      list = list.filter(h => {
        const log = getLogForDate(allLogs, h.id, selectedDate);
        const done = !!(log && log.completedCount >= h.targetCount);
        return statusFilter === 'done' ? done : !done;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [habits, allLogs, search, categoryFilter, frequencyFilter, statusFilter, sortBy, selectedDate]);

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

  const handleEdit = useCallback((h: Habit) => setEditingHabit(h), []);
  const handleDelete = useCallback((h: Habit) => deleteHabit(h.id), [deleteHabit]);

  // FlatList ListHeaderComponent
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Hero stats */}
        <HeroStats habits={habits} allLogs={allLogs} selectedDate={selectedDate} />

        {/* Date strip */}
        <DateStrip selectedDate={selectedDate} onChange={setSelectedDate} />

        {/* Filter bar */}
        {habits.length > 0 && (
          <View style={filterStyles.container}>
            {/* Search + sort */}
            <View style={filterStyles.topRow}>
              <View style={filterStyles.searchWrap}>
                <Search size={16} color={C.textFaint} style={filterStyles.searchIcon} />
                <TextInput
                  style={filterStyles.searchInput}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search habits…"
                  placeholderTextColor={C.textFaint}
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                onPress={() => setSortBy(s => (s === 'created' ? 'name' : 'created'))}
                style={filterStyles.sortBtn}
              >
                <Text style={filterStyles.sortBtnText}>
                  {sortBy === 'created' ? '↓ Newest' : 'A→Z'}
                </Text>
              </TouchableOpacity>
              {activeFilters > 0 && (
                <TouchableOpacity onPress={clearFilters} style={filterStyles.clearBtn}>
                  <Text style={filterStyles.clearBtnText}>
                    Clear {activeFilters}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={filterStyles.chipsRow}
            >
              <Text style={filterStyles.chipGroupLabel}>Status:</Text>
              {(['all', 'pending', 'done'] as StatusFilter[]).map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatusFilter(s)}
                  style={[filterStyles.chip, statusFilter === s && filterStyles.chipActive]}
                >
                  {s === 'pending' && <Clock size={11} color={statusFilter === s ? '#000' : C.textMuted} />}
                  {s === 'done' && <CheckCircle2 size={11} color={statusFilter === s ? '#000' : C.textMuted} />}
                  <Text style={[filterStyles.chipText, statusFilter === s && filterStyles.chipTextActive]}>
                    {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : 'Done'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Frequency chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={filterStyles.chipsRow}
            >
              <Text style={filterStyles.chipGroupLabel}>Freq:</Text>
              {FREQUENCY_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequencyFilter(f)}
                  style={[filterStyles.chip, frequencyFilter === f && filterStyles.chipActive]}
                >
                  <Text style={[filterStyles.chipText, frequencyFilter === f && filterStyles.chipTextActive]}>
                    {f === 'all' ? 'All' : f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={filterStyles.chipsRow}
            >
              <Text style={filterStyles.chipGroupLabel}>Cat:</Text>
              {CATEGORY_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategoryFilter(c)}
                  style={[filterStyles.chip, categoryFilter === c && filterStyles.chipActive]}
                >
                  <Text style={[filterStyles.chipText, categoryFilter === c && filterStyles.chipTextActive]}>
                    {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section title */}
        {habits.length > 0 && (
          <View style={dashStyles.sectionHeader}>
            <Text style={dashStyles.sectionTitle}>Your Habits</Text>
            <Text style={dashStyles.sectionCount}>
              {visibleHabits.length}/{habits.length}
            </Text>
          </View>
        )}
      </View>
    ),
    [
      habits, allLogs, selectedDate,
      search, categoryFilter, frequencyFilter, statusFilter, sortBy,
      activeFilters, visibleHabits.length, C,
    ]
  );

  if (isLoading) {
    return (
      <View style={dashStyles.loader}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={visibleHabits}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <HabitWithLogs
            habit={item}
            selectedDate={selectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={dashStyles.emptyState}>
            <View style={dashStyles.emptyCard}>
              {habits.length === 0 ? (
                <>
                  <Text style={dashStyles.emptyIcon}>🎯</Text>
                  <Text style={dashStyles.emptyTitle}>No Habits Yet</Text>
                  <Text style={dashStyles.emptySub}>
                    Start building better habits by creating your first one
                  </Text>
                  <TouchableOpacity onPress={onAddHabit} style={dashStyles.emptyBtn}>
                    <Text style={dashStyles.emptyBtnText}>Create Your First Habit</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={dashStyles.emptyTitle}>No matches</Text>
                  <TouchableOpacity onPress={clearFilters} style={dashStyles.emptyBtn}>
                    <Text style={dashStyles.emptyBtnText}>Clear filters</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        }
        contentContainerStyle={dashStyles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit modal */}
      <EditHabitModal
        isOpen={!!editingHabit}
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onSubmit={(id, data) => updateHabit({ id, data })}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────
// StatsScreen (production stub — extend with your StatsPage logic)
// ─────────────────────────────────────────────────────────────────
const StatsScreen = () => {
  const C = useColors();
  const statsStyles = useMemo(() => makeStatsStyles(C), [C]);
  const { t } = usePreferences();
  const { habits } = useHabits();
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    if (habits.length === 0) { setAllLogs([]); return; }
    Promise.all(
      habits.map(h => apiClient.logs.getByHabit(h.id).catch(() => [] as DailyLog[]))
    ).then(arrays => setAllLogs(arrays.flat()));
  }, [habits]);

  const totalCompletions = allLogs.length;

  const bestStreak = habits.reduce((max, h) => {
    const hLogs = allLogs.filter(l => l.habitId === h.id);
    return Math.max(max, calculateStreak(hLogs));
  }, 0);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = allLogs.filter(l => l.date.split('T')[0] === today);
  const dailyPct = calculateDailyCompletion(habits, allLogs);

  return (
    <ScrollView
      style={statsStyles.scroll}
      contentContainerStyle={statsStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={statsStyles.title}>{t.stats.title}</Text>
      <Text style={statsStyles.subtitle}>{t.stats.subtitle}</Text>

      <View style={statsStyles.grid}>
        {[
          { label: 'Total Habits',      value: String(habits.length) },
          { label: 'Total Completions', value: String(totalCompletions) },
          { label: 'Best Streak',       value: `${bestStreak} days` },
          { label: 'Today\'s Progress', value: `${dailyPct}%` },
        ].map(stat => (
          <View key={stat.label} style={statsStyles.statCard}>
            <Text style={statsStyles.statValue}>{stat.value}</Text>
            <Text style={statsStyles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Per-habit breakdown */}
      <Text style={statsStyles.sectionTitle}>Habit Breakdown</Text>
      {habits.map(h => {
        const hLogs = allLogs.filter(l => l.habitId === h.id);
        const streak = calculateStreak(hLogs);
        const rate = calculateCompletionRate(hLogs, h);
        return (
          <View key={h.id} style={statsStyles.habitRow}>
            <Text style={statsStyles.habitRowName} numberOfLines={1}>{h.name}</Text>
            <View style={statsStyles.habitRowMeta}>
              <Text style={statsStyles.habitRowStat}>🔥 {streak}d streak</Text>
              <Text style={statsStyles.habitRowStat}>{rate}% rate</Text>
              <Text style={statsStyles.habitRowStat}>{hLogs.length} total</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────
// SettingsScreen
// ─────────────────────────────────────────────────────────────────
const SettingsScreen = () => {
  const C = useColors();
  const settingsStyles = useMemo(() => makeSettingsStyles(C), [C]);
  const { user, logout } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = usePreferences();

  return (
    <ScrollView
      style={settingsStyles.scroll}
      contentContainerStyle={settingsStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={settingsStyles.title}>{t.settings.title}</Text>

      {/* Appearance */}
      <Text style={settingsStyles.section}>{t.settings.appearance}</Text>
      <View style={settingsStyles.card}>
        <Text style={settingsStyles.rowLabel}>{t.settings.theme}</Text>
        <View style={settingsStyles.toggleRow}>
          {(['dark', 'light'] as const).map(t_ => (
            <TouchableOpacity
              key={t_}
              onPress={() => setTheme(t_)}
              style={[settingsStyles.toggleBtn, theme === t_ && settingsStyles.toggleBtnActive]}
            >
              {t_ === 'dark'
                ? <Moon size={14} color={theme === t_ ? '#000' : C.textMuted} />
                : <Sun size={14} color={theme === t_ ? '#000' : C.textMuted} />}
              <Text style={[settingsStyles.toggleBtnText, theme === t_ && settingsStyles.toggleBtnTextActive]}>
                {t_ === 'dark' ? t.settings.dark : t.settings.light}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Language */}
      <View style={[settingsStyles.card, { marginTop: 8 }]}>
        <Text style={settingsStyles.rowLabel}>{t.settings.language}</Text>
        <View style={settingsStyles.toggleRow}>
          {(['en', 'de'] as const).map(l => (
            <TouchableOpacity
              key={l}
              onPress={() => setLanguage(l)}
              style={[settingsStyles.toggleBtn, language === l && settingsStyles.toggleBtnActive]}
            >
              <Text style={[settingsStyles.toggleBtnText, language === l && settingsStyles.toggleBtnTextActive]}>
                {l === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Account */}
      {user && (
        <>
          <Text style={[settingsStyles.section, { marginTop: 24 }]}>{t.settings.account}</Text>
          <View style={settingsStyles.card}>
            <View style={settingsStyles.profileRow}>
              <View style={settingsStyles.avatar}>
                <User size={22} color={C.accent} />
              </View>
              <View>
                <Text style={settingsStyles.username}>{user.username}</Text>
                <Text style={settingsStyles.email}>{user.email}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(t.settings.logout, 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: t.settings.logout, style: 'destructive', onPress: logout },
              ])
            }
            style={settingsStyles.logoutBtn}
          >
            <LogOut size={18} color={C.red} />
            <Text style={settingsStyles.logoutText}>{t.settings.logout}</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────
// BottomNav
// ─────────────────────────────────────────────────────────────────
type Page = 'dashboard' | 'stats' | 'settings';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
  onAddHabit: () => void;
  bottomInset: number;
}

const BottomNav = ({ activePage, onNavigate, onAddHabit, bottomInset }: BottomNavProps) => {
  const C = useColors();
  const navStyles = useMemo(() => makeNavStyles(C), [C]);
  const { t } = usePreferences();
  return (
  <View style={[navStyles.bar, { paddingBottom: bottomInset + 8 }]}>
    {/* Dashboard */}
    <TouchableOpacity
      onPress={() => onNavigate('dashboard')}
      style={navStyles.navBtn}
    >
      <LayoutDashboard
        size={22}
        color={activePage === 'dashboard' ? C.accent : C.textFaint}
      />
      <Text style={[navStyles.navLabel, activePage === 'dashboard' && navStyles.navLabelActive]}>
        {t.nav.dashboard}
      </Text>
    </TouchableOpacity>

    {/* FAB */}
    <Pressable onPress={onAddHabit} style={navStyles.fab}>
      <Plus size={26} color="#000" strokeWidth={2.5} />
    </Pressable>

    {/* Stats */}
    <TouchableOpacity
      onPress={() => onNavigate('stats')}
      style={navStyles.navBtn}
    >
      <BarChart3
        size={22}
        color={activePage === 'stats' ? C.accent : C.textFaint}
      />
      <Text style={[navStyles.navLabel, activePage === 'stats' && navStyles.navLabelActive]}>
        {t.nav.statistics}
      </Text>
    </TouchableOpacity>

    {/* Settings */}
    <TouchableOpacity
      onPress={() => onNavigate('settings')}
      style={navStyles.navBtn}
    >
      <Settings
        size={22}
        color={activePage === 'settings' ? C.accent : C.textFaint}
      />
      <Text style={[navStyles.navLabel, activePage === 'settings' && navStyles.navLabelActive]}>
        {t.nav.settings}
      </Text>
    </TouchableOpacity>
  </View>
  );
};

// ─────────────────────────────────────────────────────────────────
// HabitTracker — root exported component
// ─────────────────────────────────────────────────────────────────
export const HabitTracker = () => {
  const C = useColors();
  const rootStyles = useMemo(() => makeRootStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState<Page>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { createHabit } = useHabits();

  return (
    <SafeAreaView style={rootStyles.safe} edges={['top', 'left', 'right']}>
      {/* Page content */}
      <View style={rootStyles.content}>
        {page === 'dashboard' && (
          <DashboardScreen onAddHabit={() => setIsAddModalOpen(true)} />
        )}
        {page === 'stats' && <StatsScreen />}
        {page === 'settings' && <SettingsScreen />}
      </View>

      {/* Bottom navigation */}
      <BottomNav
        activePage={page}
        onNavigate={setPage}
        onAddHabit={() => setIsAddModalOpen(true)}
        bottomInset={insets.bottom}
      />

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createHabit}
      />
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const makeRootStyles = (C: Colors) => StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.background },
  content: { flex: 1 },
});

const makeDashStyles = (C: Colors) => StyleSheet.create({
  listContent:   { paddingHorizontal: 16, paddingBottom: 20 },
  loader:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  sectionCount: { fontSize: 13, color: C.textFaint },
  emptyState:   { padding: 16 },
  emptyCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon:    { fontSize: 40, marginBottom: 12 },
  emptyTitle:   { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub:     { fontSize: 14, color: C.textMuted, textAlign: 'center', marginBottom: 20 },
  emptyBtn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});

const makeFilterStyles = (C: Colors) => StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.zinc900,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon:  { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  sortBtn: {
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: C.zinc800,
    borderRadius: 12,
    justifyContent: 'center',
  },
  sortBtnText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  clearBtn: {
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
  },
  clearBtnText: { fontSize: 12, color: C.red, fontWeight: '500' },
  chipsRow: { gap: 6, paddingBottom: 4, marginBottom: 6, alignItems: 'center' },
  chipGroupLabel: { fontSize: 11, color: C.textFaint, fontWeight: '600', marginRight: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.zinc800,
    borderRadius: 10,
  },
  chipActive:     { backgroundColor: C.accent },
  chipText:       { fontSize: 12, fontWeight: '500', color: C.textMuted },
  chipTextActive: { color: '#000' },
});

const makeNavStyles = (C: Colors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn:        { alignItems: 'center', flex: 1 },
  navLabel:      { fontSize: 10, marginTop: 3, color: C.textFaint },
  navLabelActive:{ color: C.accent },
  fab: {
    width: 56,
    height: 56,
    backgroundColor: C.accent,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});

const makeStatsStyles = (C: Colors) => StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: C.background },
  content:  { padding: 16, paddingBottom: 30 },
  title:    { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.textMuted, marginBottom: 20 },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue:    { fontSize: 24, fontWeight: '800', color: C.text },
  statLabel:    { fontSize: 12, color: C.textFaint, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 10 },
  habitRow: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  habitRowName:   { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 6 },
  habitRowMeta:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  habitRowStat:   { fontSize: 12, color: C.textMuted },
});

const makeSettingsStyles = (C: Colors) => StyleSheet.create({
  scroll:   { flex: 1, backgroundColor: C.background },
  content:  { padding: 16, paddingBottom: 30 },
  title:    { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 20 },
  section:  { fontSize: 12, fontWeight: '600', color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
  },
  rowLabel:    { fontSize: 14, fontWeight: '600', color: C.textMuted, marginBottom: 10 },
  toggleRow:   { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: C.zinc800,
    borderRadius: 12,
  },
  toggleBtnActive:     { backgroundColor: C.accent },
  toggleBtnText:       { fontSize: 14, fontWeight: '500', color: C.textMuted },
  toggleBtnTextActive: { color: '#000' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: C.accentBg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username:  { fontSize: 16, fontWeight: '700', color: C.text },
  email:     { fontSize: 13, color: C.textFaint, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.2)',
    borderRadius: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: C.red },
});
