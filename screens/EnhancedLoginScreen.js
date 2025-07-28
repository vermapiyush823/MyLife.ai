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
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../constants/Config';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

// Modern illustration component
const LoginIllustration = ({ size = 200 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <LinearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={Colors.primary} />
        <Stop offset="100%" stopColor={Colors.secondary} />
      </LinearGradient>
      <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#1E293B" />
        <Stop offset="100%" stopColor="#0F172A" />
      </LinearGradient>
    </Defs>
    
    {/* Background circle */}
    <Circle cx="100" cy="100" r="90" fill="url(#backgroundGradient)" opacity="0.3" />
    
    {/* Main device illustration */}
    <G transform="translate(50, 40)">
      {/* Phone outline */}
      <Rect x="20" y="20" width="60" height="100" rx="12" fill="url(#primaryGradient)" />
      <Rect x="25" y="30" width="50" height="80" rx="8" fill={Colors.background} />
      
      {/* Screen content lines */}
      <Rect x="30" y="40" width="40" height="4" rx="2" fill={Colors.primary} opacity="0.6" />
      <Rect x="30" y="50" width="30" height="3" rx="1.5" fill={Colors.textSecondary} opacity="0.4" />
      <Rect x="30" y="58" width="35" height="3" rx="1.5" fill={Colors.textSecondary} opacity="0.4" />
      
      {/* Login form representation */}
      <Rect x="32" y="70" width="36" height="8" rx="4" fill={Colors.surface} />
      <Rect x="32" y="82" width="36" height="8" rx="4" fill={Colors.surface} />
      <Rect x="32" y="94" width="36" height="10" rx="5" fill={Colors.primary} />
    </G>
    
    {/* Floating elements */}
    <Circle cx="40" cy="60" r="8" fill={Colors.success} opacity="0.7" />
    <Circle cx="160" cy="50" r="6" fill={Colors.secondary} opacity="0.6" />
    <Circle cx="170" cy="140" r="10" fill={Colors.primary} opacity="0.5" />
    
    {/* Security shield */}
    <G transform="translate(130, 120)">
      <Path 
        d="M20 10 L30 5 L40 10 L40 25 C40 35 30 40 30 40 C30 40 20 35 20 25 Z" 
        fill={Colors.success} 
        opacity="0.8"
      />
      <Path 
        d="M25 18 L28 21 L35 14" 
        stroke={Colors.textPrimary} 
        strokeWidth="2" 
        fill="none"
      />
    </G>
  </Svg>
);

export default function EnhancedLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Google OAuth Configuration
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const googleClientId = '937507742250-your-google-client-id.apps.googleusercontent.com';
  
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

  const getInputBorderColor = (value, isValid, isFocused) => {
    if (isFocused) return Colors.primary;
    if (value.length > 0) return isValid ? Colors.success : Colors.danger;
    return '#374151';
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

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ User signed in successfully:', userCredential.user.email);
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
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
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
          const credential = GoogleAuthProvider.credential(authentication.idToken);
          const userCredential = await signInWithCredential(auth, credential);
          console.log('✅ Google sign-in successful:', userCredential.user.email);
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerPadding = isTablet ? 'px-12' : 'px-6';
  const maxWidth = isTablet ? 'max-w-md mx-auto' : '';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className={`flex-1 justify-center ${containerPadding} py-8`}>
            <View className={maxWidth}>
              {/* Header Section */}
              <View className="items-center mb-8">
                <LoginIllustration size={isTablet ? 240 : 200} />
                
                <View className="mt-6 items-center">
                  <Text className="text-3xl font-bold text-textPrimary mb-2">
                    Welcome Back
                  </Text>
                  <Text className="text-base text-textSecondary text-center leading-6">
                    Sign in to access your personal AI assistant and manage your life seamlessly
                  </Text>
                </View>
              </View>

              {/* Login Form */}
              <View className="space-y-6">
                {/* Email Input */}
                <View>
                  <Text className="text-sm font-medium text-textPrimary mb-2">
                    Email Address
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-surface rounded-xl px-4 py-4 text-textPrimary text-base pr-12"
                      style={{
                        borderWidth: 2,
                        borderColor: getInputBorderColor(email, validateEmail(email), emailFocused)
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                    />
                    {email.length > 0 && (
                      <View className="absolute right-4 top-1/2 -translate-y-2">
                        <Text className={`text-lg ${validateEmail(email) ? 'text-success' : 'text-danger'}`}>
                          {validateEmail(email) ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-sm font-medium text-textPrimary mb-2">
                    Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-surface rounded-xl px-4 py-4 text-textPrimary text-base pr-12"
                      style={{
                        borderWidth: 2,
                        borderColor: getInputBorderColor(password, validatePassword(password), passwordFocused)
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="#6B7280"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      textContentType="password"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text className="text-lg text-textSecondary">
                        {showPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {password.length > 0 && password.length < 6 && (
                    <Text className="text-xs text-danger mt-1">
                      Password must be at least 6 characters
                    </Text>
                  )}
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${
                    loading ? 'bg-primary/60' : 'bg-primary'
                  }`}
                  onPress={handleEmailAuth}
                  disabled={loading}
                  style={{
                    shadowColor: Colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  {loading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text className="text-white text-base font-semibold ml-2">
                        Signing In...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Sign In
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity className="items-center">
                  <Text className="text-sm text-secondary">
                    Forgot your password?
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-gray-600" />
                  <Text className="mx-4 text-textSecondary text-sm">or continue with</Text>
                  <View className="flex-1 h-px bg-gray-600" />
                </View>

                {/* Google Sign In */}
                <TouchableOpacity
                  className="bg-surface border-2 border-gray-600 rounded-xl py-4 px-6 flex-row items-center justify-center"
                  onPress={handleGoogleSignIn}
                  disabled={loading || !request}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.textPrimary} size="small" />
                  ) : (
                    <>
                      <Svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
                        <Path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <Path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <Path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <Path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </Svg>
                      <Text className="text-textPrimary text-base font-medium">
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-textSecondary text-sm">
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text className="text-secondary text-sm font-semibold">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View className="mt-8 pt-6">
                <Text className="text-textSecondary text-xs text-center leading-5">
                  By signing in, you agree to our{' '}
                  <Text className="text-secondary underline">Terms of Service</Text> and{' '}
                  <Text className="text-secondary underline">Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
