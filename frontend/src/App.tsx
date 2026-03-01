import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { StatsPage } from './components/StatsPage';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { useAuth } from './context/AuthContext';
import { AddHabitModal } from './components/AddHabitModal';
import { useHabits } from './hooks/useHabits';
import type { Page } from './components/Sidebar';

function AppShell() {
  const [page, setPage] = useState<Page>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { createHabit } = useHabits();

  return (
    <>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'stats' && (
        <>
          <Sidebar onAddHabit={() => setIsAddModalOpen(true)} activePage={page} onNavigate={setPage} />
          <StatsPage />
        </>
      )}
      {page === 'settings' && (
        <>
          <Sidebar onAddHabit={() => setIsAddModalOpen(true)} activePage={page} onNavigate={setPage} />
          <SettingsPage />
        </>
      )}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createHabit}
      />
    </>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return view === 'login'
      ? <Login onSwitchToSignup={() => setView('signup')} />
      : <Signup onSwitchToLogin={() => setView('login')} />;
  }

  return <AppShell />;
}

export default App;
