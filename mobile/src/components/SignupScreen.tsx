import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useColors, type Colors } from '../hooks/useColors';

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export const SignupScreen = ({ onSwitchToLogin }: SignupScreenProps) => {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { signup } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await signup({ username: form.username, email: form.email, password: form.password });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Text style={styles.brandTitle}>Usus</Text>
            <Text style={styles.brandSub}>Build better habits, every day.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create your account</Text>

            {(
              [
                { field: 'username',        label: 'Username',         placeholder: 'yourname',         type: 'default',        secure: false },
                { field: 'email',           label: 'Email',            placeholder: 'you@example.com',  type: 'email-address',  secure: false },
                { field: 'password',        label: 'Password',         placeholder: 'Min. 6 characters',type: 'default',        secure: true  },
                { field: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••',         type: 'default',        secure: true  },
              ] as Array<{ field: keyof typeof form; label: string; placeholder: string; type: string; secure: boolean }>
            ).map(({ field, label, placeholder, type, secure }) => (
              <View key={field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[field]}
                  onChangeText={v => setForm(f => ({ ...f, [field]: v }))}
                  placeholder={placeholder}
                  placeholderTextColor={C.textFaint}
                  keyboardType={type as any}
                  autoCapitalize={field === 'username' ? 'none' : 'none'}
                  autoCorrect={false}
                  secureTextEntry={secure}
                />
              </View>
            ))}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.btnText}>Create account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeStyles = (C: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brand: { alignItems: 'center', marginBottom: 32 },
  brandTitle: { fontSize: 40, fontWeight: '800', color: C.text, letterSpacing: -1 },
  brandSub: { fontSize: 15, color: C.textMuted, marginTop: 6 },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    padding: 28,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '500', color: C.textMuted, marginBottom: 8 },
  input: {
    backgroundColor: C.zinc900,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.text,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: C.red, fontSize: 13 },
  btn: {
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { color: C.textMuted, fontSize: 14 },
  switchLink: { color: C.accent, fontSize: 14, fontWeight: '600' },
});
