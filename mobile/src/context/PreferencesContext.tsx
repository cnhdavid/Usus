import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
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

// Defaults inferred from device
const systemTheme: Theme = Appearance.getColorScheme() === 'light' ? 'light' : 'dark';

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>(systemTheme);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.multiGet(['usus-language', 'usus-theme']).then(pairs => {
      const lang = pairs[0][1] as Language | null;
      const savedTheme = pairs[1][1] as Theme | null;
      if (lang) setLanguageState(lang);
      if (savedTheme) setThemeState(savedTheme);
    });
  }, []);

  const setLanguage = async (l: Language) => {
    await AsyncStorage.setItem('usus-language', l);
    setLanguageState(l);
  };

  const setTheme = async (t: Theme) => {
    await AsyncStorage.setItem('usus-theme', t);
    setThemeState(t);
  };

  return (
    <PreferencesContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        t: translations[language] as Translations,
      }}
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
