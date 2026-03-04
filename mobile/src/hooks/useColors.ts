import { usePreferences } from '../context/PreferencesContext';
import { C, lightColors, type Colors } from '../theme';

export type { Colors };

/**
 * Returns the theme-appropriate color palette.
 * Use this instead of importing `C` directly so components respond to
 * light/dark mode switches.
 *
 * Usage inside a component:
 *   const C = useColors();
 *   const styles = useMemo(() => StyleSheet.create({ container: { backgroundColor: C.background } }), [C]);
 */
export const useColors = (): Colors => {
  const { theme } = usePreferences();
  return theme === 'light' ? lightColors : C;
};
