import { motion } from 'framer-motion';
import { Sun, Moon, LogOut } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import type { Language } from '../i18n/translations';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card-bg border border-card-border rounded-2xl p-6 space-y-4"
  >
    <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{title}</h2>
    {children}
  </motion.div>
);

const Row = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-slate-900 dark:text-white font-medium">{label}</p>
      {description && <p className="text-slate-400 dark:text-zinc-500 text-sm mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const SettingsPage = () => {
  const { t, theme, setTheme, language, setLanguage } = usePreferences();
  const { user, logout } = useAuth();

  const LANGUAGES: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <div className="min-h-screen bg-deep-black">
      <main className="lg:pl-64 pb-20 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.settings.title}</h1>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">{t.settings.preferencesDesc}</p>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Section title={t.settings.appearance}>
              <Row label={t.settings.theme}>
                <div className="flex rounded-xl overflow-hidden border border-card-border">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-accent-cyan text-black'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    {t.settings.dark}
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-accent-cyan text-black'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    {t.settings.light}
                  </button>
                </div>
              </Row>
            </Section>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Section title={t.settings.language}>
              <Row label={t.settings.language} description={t.settings.languageDesc}>
                <div className="flex gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        language === lang.code
                          ? 'bg-accent-cyan text-black border-accent-cyan'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </Row>
            </Section>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Section title={t.settings.account}>
              <div className="flex items-center gap-4 pb-4 border-b border-card-border">
                <div className="w-14 h-14 bg-accent-cyan/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-accent-cyan text-xl font-bold">
                    {user?.username?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold text-lg">{user?.username}</p>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm">{user?.email}</p>
                </div>
              </div>

              <Row label={t.settings.username}>
                <span className="text-slate-600 dark:text-zinc-300 text-sm bg-slate-200 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                  {user?.username}
                </span>
              </Row>

              <Row label={t.settings.email}>
                <span className="text-slate-600 dark:text-zinc-300 text-sm bg-slate-200 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                  {user?.email}
                </span>
              </Row>

              {user?.createdAt && (
                <Row label={t.settings.memberSince}>
                  <span className="text-slate-500 dark:text-zinc-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </Row>
              )}

              <div className="pt-2 border-t border-card-border">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 rounded-xl text-sm font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t.settings.logout}
                </motion.button>
              </div>
            </Section>
          </motion.div>

        </div>
      </main>
    </div>
  );
};
