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
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { Colors } from '../constants/Config';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

// Modern signup illustration component
const SignupIllustration = ({ size = 200 }) => (
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
    
    {/* Main signup illustration */}
    <G transform="translate(40, 30)">
      {/* Person silhouette */}
      <Circle cx="60" cy="40" r="20" fill="url(#primaryGradient)" opacity="0.8" />
      <Rect x="45" y="55" width="30" height="40" rx="15" fill="url(#primaryGradient)" opacity="0.8" />
      
      {/* Welcome elements */}
      <Circle cx="25" cy="25" r="3" fill={Colors.success} opacity="0.7" />
      <Circle cx="95" cy="30" r="4" fill={Colors.secondary} opacity="0.6" />
      <Circle cx="110" cy="70" r="3" fill={Colors.primary} opacity="0.8" />
    </G>
    
    {/* Floating welcome elements */}
    <G transform="translate(30, 120)">
      <Rect x="0" y="0" width="40" height="6" rx="3" fill={Colors.primary} opacity="0.6" />
      <Rect x="0" y="10" width="30" height="4" rx="2" fill={Colors.textSecondary} opacity="0.4" />
      <Rect x="0" y="18" width="35" height="4" rx="2" fill={Colors.textSecondary} opacity="0.4" />
    </G>
    
    {/* Success checkmark */}
    <G transform="translate(140, 140)">
      <Circle cx="15" cy="15" r="15" fill={Colors.success} opacity="0.8" />
      <Path 
        d="M8 15 L12 19 L22 9" 
        stroke={Colors.textPrimary} 
        strokeWidth="2" 
        fill="none"
      />
    </G>
    
    {/* Decorative elements */}
    <Circle cx="170" cy="60" r="6" fill={Colors.secondary} opacity="0.5" />
    <Circle cx="30" cy="170" r="8" fill={Colors.primary} opacity="0.4" />
  </Svg>
);

export default function EnhancedSignupScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Validation functions
  const validateName = (name) => name.trim().length >= 2;
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePassword = (password) => password.length >= 6;
  const validateConfirmPassword = (password, confirmPassword) => 
    password === confirmPassword && password.length >= 6;

  const getInputBorderColor = (field, value, isValid) => {
    if (focusedField === field) return Colors.primary;
    if (value.length > 0) return isValid ? Colors.success : Colors.danger;
    return '#374151';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle email/password signup
  const handleEmailSignup = async () => {
    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateName(name)) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
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

    if (!validateConfirmPassword(password, confirmPassword)) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });

      console.log('✅ User signed up successfully:', userCredential.user.email);
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email signup is not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Signup Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-Up
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.idToken) {
          const credential = GoogleAuthProvider.credential(authentication.idToken);
          const userCredential = await signInWithCredential(auth, credential);
          console.log('✅ Google signup successful:', userCredential.user.email);
        }
      }
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Error', 'Google signup failed. Please try again.');
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
                <SignupIllustration size={isTablet ? 240 : 200} />
                
                <View className="mt-6 items-center">
                  <Text className="text-3xl font-bold text-textPrimary mb-2">
                    Join MyLife AI
                  </Text>
                  <Text className="text-base text-textSecondary text-center leading-6">
                    Create your account to start organizing your life with AI-powered tools
                  </Text>
                </View>
              </View>

              {/* Signup Form */}
              <View className="space-y-6">
                {/* Name Input */}
                <View>
                  <Text className="text-sm font-medium text-textPrimary mb-2">
                    Full Name
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-surface rounded-xl px-4 py-4 text-textPrimary text-base pr-12"
                      style={{
                        borderWidth: 2,
                        borderColor: getInputBorderColor('name', formData.name, validateName(formData.name))
                      }}
                      placeholder="Enter your full name"
                      placeholderTextColor="#6B7280"
                      value={formData.name}
                      onChangeText={(text) => handleInputChange('name', text)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      autoCapitalize="words"
                      textContentType="name"
                    />
                    {formData.name.length > 0 && (
                      <View className="absolute right-4 top-1/2 -translate-y-2">
                        <Text className={`text-lg ${validateName(formData.name) ? 'text-success' : 'text-danger'}`}>
                          {validateName(formData.name) ? '✓' : '✗'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

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
                        borderColor: getInputBorderColor('email', formData.email, validateEmail(formData.email))
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="#6B7280"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                    />
                    {formData.email.length > 0 && (
                      <View className="absolute right-4 top-1/2 -translate-y-2">
                        <Text className={`text-lg ${validateEmail(formData.email) ? 'text-success' : 'text-danger'}`}>
                          {validateEmail(formData.email) ? '✓' : '✗'}
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
                        borderColor: getInputBorderColor('password', formData.password, validatePassword(formData.password))
                      }}
                      placeholder="Create a password"
                      placeholderTextColor="#6B7280"
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
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
                  {formData.password.length > 0 && formData.password.length < 6 && (
                    <Text className="text-xs text-danger mt-1">
                      Password must be at least 6 characters
                    </Text>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text className="text-sm font-medium text-textPrimary mb-2">
                    Confirm Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="bg-surface rounded-xl px-4 py-4 text-textPrimary text-base pr-12"
                      style={{
                        borderWidth: 2,
                        borderColor: getInputBorderColor('confirmPassword', formData.confirmPassword, 
                          validateConfirmPassword(formData.password, formData.confirmPassword))
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor="#6B7280"
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password-new"
                      textContentType="newPassword"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-2"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text className="text-lg text-textSecondary">
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {formData.confirmPassword.length > 0 && 
                   !validateConfirmPassword(formData.password, formData.confirmPassword) && (
                    <Text className="text-xs text-danger mt-1">
                      Passwords do not match
                    </Text>
                  )}
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${
                    loading ? 'bg-primary/60' : 'bg-primary'
                  }`}
                  onPress={handleEmailSignup}
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
                        Creating Account...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-gray-600" />
                  <Text className="mx-4 text-textSecondary text-sm">or continue with</Text>
                  <View className="flex-1 h-px bg-gray-600" />
                </View>

                {/* Google Sign Up */}
                <TouchableOpacity
                  className="bg-surface border-2 border-gray-600 rounded-xl py-4 px-6 flex-row items-center justify-center"
                  onPress={handleGoogleSignup}
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

                {/* Sign In Link */}
                <View className="flex-row justify-center items-center mt-6">
                  <Text className="text-textSecondary text-sm">
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text className="text-secondary text-sm font-semibold">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View className="mt-8 pt-6">
                <Text className="text-textSecondary text-xs text-center leading-5">
                  By creating an account, you agree to our{' '}
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
