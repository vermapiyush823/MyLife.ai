import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Google OAuth Configuration
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  
  // Using the client ID from your Firebase config
  const googleClientId = '937507742250-your-google-client-id.apps.googleusercontent.com'; // TODO: Update with your actual Google OAuth client ID
  
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'mylife-ai-app',
      }),
    },
    discovery
  );

  // Validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Toggle between sign in and sign up modes
  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Handle email/password authentication
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (isSignUp) {
      if (!validatePassword(password)) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      let userCredential;
      
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        console.log('✅ Account created successfully:', userCredential.user.email);
        Alert.alert('Success', 'Account created successfully! Welcome to MyLife AI!');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log('✅ User signed in successfully:', userCredential.user.email);
      }

      // Navigation will be handled automatically by your auth state listener
      console.log('🏠 Navigation to HomeScreen will happen automatically via AuthNavigator');
      
    } catch (error) {
      console.error('Email auth error:', error);
      
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials. Please check your email and password.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.idToken) {
          // Create a Google credential with the token
          const credential = GoogleAuthProvider.credential(authentication.idToken);
          
          // Sign in with the credential
          const userCredential = await signInWithCredential(auth, credential);
          console.log('✅ Google sign in successful:', userCredential.user.email);
          console.log('🏠 Navigation to HomeScreen will happen automatically via AuthNavigator');
          
          // Navigation will be handled automatically by your auth state listener
        } else {
          throw new Error('No ID token received from Google');
        }
      } else if (result.type === 'cancel') {
        console.log('Google sign in cancelled');
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-12 justify-center">
            {/* Header */}
            <View className="items-center mb-12">
              <Text className="text-3xl font-bold text-textPrimary text-center mb-3">
                {isSignUp ? 'Join MyLife AI' : 'Welcome Back'}
              </Text>
              <Text className="text-lg text-textSecondary text-center">
                {isSignUp 
                  ? 'Create your personal AI vault and take control of your digital life' 
                  : 'Sign in to access your personal AI assistant'
                }
              </Text>
            </View>

            {/* Email and Password Form */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-textPrimary mb-3">
                Email Address
              </Text>
              <TextInput
                className={`bg-surface border rounded-lg px-4 py-4 text-textPrimary text-base mb-4 ${
                  email.length > 0 
                    ? validateEmail(email) 
                      ? 'border-success' 
                      : 'border-danger'
                    : 'border-gray-600'
                }`}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              
              <Text className="text-lg font-semibold text-textPrimary mb-3">
                Password
              </Text>
              <TextInput
                className="bg-surface border border-gray-600 rounded-lg px-4 py-4 text-textPrimary text-base mb-4"
                placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />
              
              {isSignUp && (
                <>
                  <Text className="text-lg font-semibold text-textPrimary mb-3">
                    Confirm Password
                  </Text>
                  <TextInput
                    className={`bg-surface border rounded-lg px-4 py-4 text-textPrimary text-base mb-4 ${
                      confirmPassword.length > 0 
                        ? password === confirmPassword 
                          ? 'border-success' 
                          : 'border-danger'
                        : 'border-gray-600'
                    }`}
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                  />
                </>
              )}
              
              {/* Password Requirements for Sign Up */}
              {isSignUp && (
                <View className="mb-4 p-3 bg-surface/50 rounded-lg border border-gray-700">
                  <Text className="text-textSecondary text-sm mb-2 font-medium">Password Requirements:</Text>
                  <Text className={`text-xs mb-1 ${password.length >= 6 ? 'text-success' : 'text-textSecondary'}`}>
                    • At least 6 characters {password.length >= 6 ? '✓' : ''}
                  </Text>
                  <Text className={`text-xs mb-1 ${password === confirmPassword && password.length > 0 ? 'text-success' : 'text-textSecondary'}`}>
                    • Passwords match {password === confirmPassword && password.length > 0 ? '✓' : ''}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                className={`bg-primary rounded-lg py-4 items-center ${loading ? 'opacity-60' : ''}`}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#F1F5F9" size="small" />
                ) : (
                  <Text className="text-textPrimary text-lg font-semibold">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Sign Up / Sign In */}
            <TouchableOpacity
              className="mb-6"
              onPress={toggleSignUpMode}
            >
              <Text className="text-secondary text-center text-sm">
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-600" />
              <Text className="mx-4 text-textSecondary text-base">OR</Text>
              <View className="flex-1 h-px bg-gray-600" />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              className="bg-surface border border-gray-600 rounded-lg py-4 px-6 mb-6 flex-row items-center justify-center"
              onPress={handleGoogleSignIn}
              disabled={loading || !request}
            >
              {loading ? (
                <ActivityIndicator color="#F1F5F9" size="small" />
              ) : (
                <>
                  <Text className="text-2xl mr-3">🔍</Text>
                  <Text className="text-textPrimary text-lg font-medium">
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View className="mt-auto pt-8">
              <Text className="text-textSecondary text-xs text-center leading-5">
                By continuing, you agree to our{' '}
                <Text className="text-primary underline">Terms of Service</Text> and{' '}
                <Text className="text-primary underline">Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
