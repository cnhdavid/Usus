/**
 * Minimal session-cookie store for React Native.
 *
 * React Native's fetch does NOT filter the `Set-Cookie` response header
 * (unlike browsers), so we can read it, persist the value in AsyncStorage,
 * and re-attach it manually on every outgoing request.
 *
 * This gives us full cookie-based auth persistence across app restarts
 * without any native modules or a dev build.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'usus_session_cookie';

export const cookieStore = {
  /**
   * Parse a raw `Set-Cookie` header and persist only the name=value part.
   * Example input  : "usus_session=abc123; Path=/; HttpOnly; SameSite=Lax"
   * Stored value   : "usus_session=abc123"
   */
  save: async (rawSetCookieHeader: string): Promise<void> => {
    const nameValuePair = rawSetCookieHeader.split(';')[0].trim();
    await AsyncStorage.setItem(STORAGE_KEY, nameValuePair);
  },

  /** Returns "usus_session=<value>" or null if no session is stored. */
  load: (): Promise<string | null> => AsyncStorage.getItem(STORAGE_KEY),

  /** Call on logout to remove the persisted cookie. */
  clear: (): Promise<void> => AsyncStorage.removeItem(STORAGE_KEY),
};
