import { type ReactElement } from 'react';
import { LayoutDashboard, BarChart2, Settings, LogOut, Plus, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export type Page = 'dashboard' | 'stats' | 'profile' | 'settings';

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
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'stats',
      label: t.nav.statistics,
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: t.nav.profile,
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: <Settings className="w-5 h-5" />,
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
                <LogOut className="w-4 h-4" />
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
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-xs font-medium">{t.nav.dashboard}</span>
          </button>

          {/* Stats */}
          <button
            onClick={() => onNavigate('stats')}
            className={`flex flex-col items-center gap-1 ${activePage === 'stats' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-xs font-medium">{t.nav.statistics}</span>
          </button>

          {/* Add habit FAB */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAddHabit}
            className="flex items-center justify-center w-14 h-14 -mt-8 bg-accent-cyan rounded-full shadow-glow-cyan"
          >
            <Plus className="w-7 h-7 text-black" strokeWidth={3} />
          </motion.button>

          {/* Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center gap-1 ${activePage === 'profile' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">{t.nav.profile}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center gap-1 ${activePage === 'settings' ? 'text-accent-cyan' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">{t.nav.settings}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
