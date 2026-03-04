import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import { LoginScreen } from './src/components/LoginScreen';
import { SignupScreen } from './src/components/SignupScreen';
import { HabitTracker } from './src/components/HabitTracker';

// ── Shared QueryClient instance ───────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// ── Auth gate: decides which screen to show ───────────────────────
type AuthView = 'login' | 'signup';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginScreen onSwitchToSignup={() => setAuthView('signup')} />
    ) : (
      <SignupScreen onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return <HabitTracker />;
}

// ── Root component ────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <AuthProvider>
            <StatusBar style="light" />
            <AppContent />
          </AuthProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
