import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t, language } = usePreferences();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-deep-black">
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.settings.profile}</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">{t.settings.account}</p>
          </motion.div>

          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card-bg border border-card-border rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-16 h-16 bg-accent-cyan/20 rounded-full flex items-center justify-center shrink-0 ring-2 ring-accent-cyan/40">
              <span className="text-accent-cyan text-2xl font-bold">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
              <p className="text-slate-500 dark:text-zinc-400 text-sm truncate">{user?.email}</p>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              {t.settings.account}
            </h2>

            <div className="flex items-center gap-3 py-3 border-b border-card-border">
              <User className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 dark:text-zinc-500">{t.settings.username}</p>
                <p className="text-slate-900 dark:text-white font-medium truncate">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3 border-b border-card-border">
              <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 dark:text-zinc-500">{t.settings.email}</p>
                <p className="text-slate-900 dark:text-white font-medium truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 dark:text-zinc-500">{t.settings.memberSince}</p>
                <p className="text-slate-900 dark:text-white font-medium">{memberSince}</p>
              </div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-900/20 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t.settings.logout}
            </motion.button>
          </motion.div>

        </div>
      </main>
    </div>
  );
};
