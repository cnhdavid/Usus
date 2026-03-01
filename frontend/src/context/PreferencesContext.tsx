import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Language, type Translations } from '../i18n/translations';

type Theme = 'dark' | 'light';

interface PreferencesContextType {
  language: Language;
  setLanguage: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  t: Translations;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('usus-language') as Language) ?? 'en';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = (localStorage.getItem('usus-theme') as Theme) ?? 'dark';
    // Apply synchronously so the class is set before the first paint
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return saved;
  });

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // Apply lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (l: Language) => {
    localStorage.setItem('usus-language', l);
    setLanguageState(l);
  };

  const setTheme = (t: Theme) => {
    localStorage.setItem('usus-theme', t);
    setThemeState(t);
  };

  return (
    <PreferencesContext.Provider
      value={{ language, setLanguage, theme, setTheme, t: translations[language] as Translations }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
};
