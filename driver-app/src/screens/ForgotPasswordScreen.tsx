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
  container: { flex: 1, backgroundColor: '#f3f4f6', justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2563eb' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 15, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  linkButton: { alignItems: 'center', padding: 10 },
  linkText: { color: '#2563eb', fontSize: 14, fontWeight: '500' },
  successBox: { backgroundColor: '#ecfdf5', borderRadius: 8, padding: 15, marginBottom: 15 },
  successText: { color: '#065f46', fontSize: 14, textAlign: 'center' },
});
