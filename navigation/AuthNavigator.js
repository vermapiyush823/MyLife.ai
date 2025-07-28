import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/EnhancedLoginScreen';
import SignupScreen from '../screens/EnhancedSignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NotesScreen from '../screens/EnhancedNotesScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import SplashScreen from '../screens/SplashScreen';
import MoodTrackerScreen from '../screens/MoodTrackerScreen';
import VaultScreen from '../screens/VaultScreen';
import SplitwiseScreen from '../screens/SplitwiseScreen';
import AIChatScreen from '../screens/EnhancedAIChatScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Dashboard"
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="MoodTracker" component={MoodTrackerScreen} />
      <Stack.Screen name="Vault" component={VaultScreen} />
      <Stack.Screen name="Splitwise" component={SplitwiseScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen for 2 seconds
  if (showSplash) {
    return <SplashScreen onSplashComplete={handleSplashComplete} />;
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#2979FF" />
        <Text className="text-textPrimary text-lg font-medium mt-4">
          Loading MyLife AI...
        </Text>
      </View>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

export default function Navigation() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
