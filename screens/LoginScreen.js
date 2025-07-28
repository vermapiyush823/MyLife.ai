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
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Colors } from '../constants/Config';

// Complete the auth session for Expo
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('✅ User signed in successfully:', userCredential.user.email);
      
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
                Welcome Back
              </Text>
              <Text className="text-lg text-textSecondary text-center">
                Sign in to access your personal AI assistant
              </Text>
            </View>            
            {/* add an image  tag to add image*/}
            <View className="items-center mb-8">
              <Svg width="200" height="250" viewBox="0 0 300 400">
                <Defs>
                  <LinearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#ec4899"/>
                    <Stop offset="50%" stopColor="#8b5cf6"/>
                    <Stop offset="100%" stopColor="#3b82f6"/>
                  </LinearGradient>
                  
                  <LinearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#10b981"/>
                    <Stop offset="100%" stopColor="#06b6d4"/>
                  </LinearGradient>
                  
                  <LinearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#f97316"/>
                    <Stop offset="100%" stopColor="#eab308"/>
                  </LinearGradient>
                  
                  <LinearGradient id="lifeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#ef4444"/>
                    <Stop offset="100%" stopColor="#f97316"/>
                  </LinearGradient>
                  
                  <LinearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#fbbf24"/>
                    <Stop offset="100%" stopColor="#f59e0b"/>
                  </LinearGradient>
                  
                  <Filter id="glow">
                    <FeGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <FeMerge> 
                      <FeMergeNode in="coloredBlur"/>
                      <FeMergeNode in="SourceGraphic"/>
                    </FeMerge>
                  </Filter>
                  
                  <Filter id="sparkle">
                    <FeGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <FeMerge> 
                      <FeMergeNode in="coloredBlur"/>
                      <FeMergeNode in="SourceGraphic"/>
                    </FeMerge>
                  </Filter>
                </Defs>
                
                {/* Floating abstract shapes */}
                <Ellipse cx="50" cy="80" rx="30" ry="20" fill="url(#orbitGradient)" opacity="0.15" transform="rotate(45 50 80)"/>
                <Ellipse cx="250" cy="120" rx="25" ry="35" fill="url(#energyGradient)" opacity="0.1" transform="rotate(-30 250 120)"/>
                <Ellipse cx="80" cy="350" rx="40" ry="25" fill="url(#lifeGradient)" opacity="0.15" transform="rotate(60 80 350)"/>
                
                {/* Central AI Brain/Core */}
                <Path d="M 110 170 Q 100 155 120 150 Q 140 145 150 150 Q 160 145 180 150 Q 200 155 190 170 
                         Q 200 185 190 200 Q 200 215 190 230 Q 180 245 160 240 Q 150 250 140 240 Q 120 245 110 230 
                         Q 100 215 110 200 Q 100 185 110 170 Z" 
                      fill="url(#brainGradient)" filter="url(#glow)"/>
                
                {/* Brain texture lines */}
                <Path d="M 125 180 Q 145 175 165 180 Q 185 185 175 205 Q 165 225 145 220 Q 125 215 135 195 Q 125 180 125 180" 
                      fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <Path d="M 120 205 Q 140 195 160 205 Q 180 215 185 205" 
                      fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
                <Path d="M 135 165 Q 150 175 165 165" 
                      fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
                
                {/* Central AI core */}
                <Circle cx="150" cy="200" r="12" fill="white" opacity="0.9"/>
                <Circle cx="150" cy="200" r="8" fill="url(#energyGradient)" opacity="0.8"/>
                <Circle cx="150" cy="200" r="4" fill="white" opacity="0.7"/>
                
                {/* Orbiting Life Management Icons */}
                {/* Health/Heart */}
                <Circle cx="150" cy="120" r="18" fill="url(#lifeGradient)" opacity="0.8" filter="url(#glow)"/>
                <Path d="M 142 118 Q 138 112 144 112 Q 150 108 156 112 Q 162 112 158 118 Q 150 128 150 128 Q 150 128 142 118" 
                      fill="white" opacity="0.9"/>
                
                {/* Calendar/Schedule */}
                <Circle cx="220" cy="200" r="18" fill="url(#orbitGradient)" opacity="0.8" filter="url(#glow)"/>
                <Rect x="212" y="194" width="16" height="12" rx="2" fill="white" opacity="0.9"/>
                <Line x1="214" y1="192" x2="214" y2="196" stroke="url(#orbitGradient)" strokeWidth="2"/>
                <Line x1="226" y1="192" x2="226" y2="196" stroke="url(#orbitGradient)" strokeWidth="2"/>
                <Rect x="214" y="198" width="12" height="1" fill="url(#orbitGradient)" opacity="0.7"/>
                <Rect x="214" y="201" width="8" height="1" fill="url(#orbitGradient)" opacity="0.7"/>
                
                {/* Goals/Target */}
                <Circle cx="150" cy="280" r="18" fill="url(#energyGradient)" opacity="0.8" filter="url(#glow)"/>
                <Circle cx="150" cy="280" r="10" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
                <Circle cx="150" cy="280" r="6" fill="none" stroke="white" strokeWidth="2" opacity="0.7"/>
                <Circle cx="150" cy="280" r="2" fill="white" opacity="0.9"/>
                
                {/* Growth/Plant */}
                <Circle cx="80" cy="200" r="18" fill="url(#lifeGradient)" opacity="0.8" filter="url(#glow)"/>
                <Path d="M 80 208 Q 74 202 76 198 Q 78 194 82 196 Q 86 198 84 202 Q 82 206 80 208" 
                      fill="white" opacity="0.9"/>
                <Line x1="80" y1="202" x2="80" y2="208" stroke="white" strokeWidth="2" opacity="0.9"/>
                
                {/* Energy/Data Flow Lines */}
                <Path d="M 150 140 Q 130 160 150 180" stroke="url(#energyGradient)" strokeWidth="2" opacity="0.6" fill="none" filter="url(#sparkle)"/>
                <Path d="M 200 200 Q 210 210 220 200" stroke="url(#energyGradient)" strokeWidth="2" opacity="0.6" fill="none" filter="url(#sparkle)"/>
                <Path d="M 150 220 Q 130 240 150 260" stroke="url(#energyGradient)" strokeWidth="2" opacity="0.6" fill="none" filter="url(#sparkle)"/>
                <Path d="M 100 200 Q 120 190 130 200" stroke="url(#energyGradient)" strokeWidth="2" opacity="0.6" fill="none" filter="url(#sparkle)"/>
                
                {/* Floating Data Particles */}
                <Circle cx="60" cy="150" r="3" fill="url(#sparkleGradient)" filter="url(#sparkle)" opacity="0.8"/>
                <Circle cx="240" cy="160" r="2" fill="url(#orbitGradient)" filter="url(#sparkle)" opacity="0.8"/>
                <Circle cx="100" cy="120" r="2.5" fill="url(#energyGradient)" filter="url(#sparkle)" opacity="0.8"/>
                <Circle cx="200" cy="140" r="2" fill="url(#lifeGradient)" filter="url(#sparkle)" opacity="0.8"/>
                <Circle cx="80" cy="280" r="3" fill="url(#sparkleGradient)" filter="url(#sparkle)" opacity="0.8"/>
                <Circle cx="220" cy="260" r="2.5" fill="url(#orbitGradient)" filter="url(#sparkle)" opacity="0.8"/>
                
                {/* Sparkles/Stars */}
                <Polygon points="70,-6 72,-2 76,0 72,2 70,6 68,2 64,0 68,-2" fill="url(#sparkleGradient)" opacity="0.9" filter="url(#sparkle)" transform="translate(0,106)"/>
                <Polygon points="230,-4.2 231.4,-1.4 234.2,0 231.4,1.4 230,4.2 228.6,1.4 225.8,0 228.6,-1.4" fill="url(#sparkleGradient)" opacity="0.9" filter="url(#sparkle)" transform="translate(0,180)"/>
                <Polygon points="50,-4.8 51.6,-1.6 54.8,0 51.6,1.6 50,4.8 48.4,1.6 45.2,0 48.4,-1.6" fill="url(#sparkleGradient)" opacity="0.9" filter="url(#sparkle)" transform="translate(0,320)"/>
                <Polygon points="250,-3.6 251.2,-1.2 253.6,0 251.2,1.2 250,3.6 248.8,1.2 246.4,0 248.8,-1.2" fill="url(#sparkleGradient)" opacity="0.9" filter="url(#sparkle)" transform="translate(0,300)"/>
              </Svg>
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
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
              />
              
              <TouchableOpacity
                className={`bg-primary rounded-lg py-4 items-center ${loading ? 'opacity-60' : ''}`}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#F1F5F9" size="small" />
                ) : (
                  <Text className="text-textPrimary text-lg font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Navigate to Sign Up */}
            <TouchableOpacity
              className="mb-6"
              onPress={() => navigation.navigate('Signup')}
            >
              <Text className="text-secondary text-center text-sm">
                Don't have an account? Sign Up
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
