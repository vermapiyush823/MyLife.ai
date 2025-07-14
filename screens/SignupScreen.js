import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK' }]
      );
      
      // Navigation will be handled by auth state listener
    } catch (error) {
      let errorMessage = 'Signup failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              MyLife AI
            </Text>
            <Text style={styles.subtitle}>
              Create your account
            </Text>
          </View>

          {/* Signup Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Full Name
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Password
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.passwordHint}>
                Minimum 6 characters
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Confirm Password
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{'\n'}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLink}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120', // background
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F1F5F9', // textPrimary
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8', // textSecondary
    fontSize: 18,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#F1F5F9', // textPrimary
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B', // surface
    color: '#F1F5F9', // textPrimary
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 16,
  },
  passwordHint: {
    color: '#94A3B8', // textSecondary
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3B82F6', // primary
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F1F5F9', // textPrimary
    fontSize: 18,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    color: '#94A3B8', // textSecondary
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#60A5FA', // secondary
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#94A3B8', // textSecondary
    fontSize: 16,
  },
  loginLink: {
    color: '#60A5FA', // secondary
    fontSize: 16,
    fontWeight: '600',
  },
});
