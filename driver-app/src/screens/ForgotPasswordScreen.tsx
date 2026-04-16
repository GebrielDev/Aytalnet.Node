import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../services/api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSent(true);
      // In development, the API returns the token directly
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoS}>S</Text>
          <Text style={styles.logoT}>T</Text>
          <Text style={styles.logoS}>S</Text>
        </View>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>
      </View>

      <View style={styles.form}>
        {sent ? (
          <>
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                If an account with that email exists, a reset link has been generated. Check your email or proceed below.
              </Text>
            </View>
            {resetToken && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('ResetPassword', { token: resetToken })}
              >
                <Text style={styles.buttonText}>Reset Password Now</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.linkButton} onPress={() => { setSent(false); setResetToken(null); }}>
              <Text style={styles.linkText}>Try another email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  logoS: { fontSize: 48, fontWeight: '900', color: '#60a5fa', letterSpacing: 2 },
  logoT: { fontSize: 48, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  form: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16, marginBottom: 14, fontSize: 16, color: '#fff' },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10, shadowColor: '#2563eb', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  linkButton: { alignItems: 'center', padding: 12 },
  linkText: { color: '#60a5fa', fontSize: 14, fontWeight: '500' },
  successBox: { backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)' },
  successText: { color: '#86efac', fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
