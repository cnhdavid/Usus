import { type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export type Page = 'dashboard' | 'stats' | 'settings';

interface SidebarProps {
  onAddHabit: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar = ({ onAddHabit, activePage, onNavigate }: SidebarProps) => {
  const { user, logout } = useAuth();
  const { t } = usePreferences();

  const navItems: { id: Page; label: string; icon: ReactElement }[] = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'stats',
      label: t.nav.statistics,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card-bg border-r border-card-border">
        <div className="flex flex-col flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-accent-cyan">Usus</h1>
            <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">Habit Tracker</p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-slate-900 dark:text-white bg-slate-200/50 dark:bg-zinc-800/50'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-zinc-800/30'
                }`}
              >
                {item.icon}
                {item.label}
              </motion.button>
            ))}
          </nav>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddHabit}
            className="w-full py-4 bg-accent-cyan hover:shadow-glow-cyan text-black rounded-xl font-bold transition-all"
          >
            {t.nav.newHabit}
          </motion.button>

          {/* User-Info und Logout */}
          <div className="mt-4 pt-4 border-t border-card-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-accent-cyan/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-accent-cyan text-sm font-bold">
                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <span className="text-slate-600 dark:text-zinc-300 text-sm font-medium truncate">{user?.username}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-400 dark:text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-card-bg border-t border-card-border z-30">
        <div className="flex items-center justify-around px-4 py-3">
          {/* Dashboard */}
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 ${activePage === 'dashboard' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">{t.nav.dashboard}</span>
          </button>

          {/* Stats */}
          <button
            onClick={() => onNavigate('stats')}
            className={`flex flex-col items-center gap-1 ${activePage === 'stats' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium">{t.nav.statistics}</span>
          </button>

          {/* Add habit FAB */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddHabit}
            className="flex items-center justify-center w-14 h-14 -mt-8 bg-accent-cyan rounded-full shadow-glow-cyan"
          >
            <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center gap-1 ${activePage === 'settings' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span className="text-xs font-medium">{t.nav.settings}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
