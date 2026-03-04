import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
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

          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Section title={t.settings.preferences}>
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

              <div className="border-t border-card-border pt-4">
                <Row label={t.settings.language} description={t.settings.languageDesc}>
                  <div className="flex gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
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
              </div>
            </Section>
          </motion.div>

        </div>
      </main>
    </div>
  );
};
