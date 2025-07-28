import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import {
  CalculatorIcon,
  NotesIcon,
  MoodIcon,
  VaultIcon,
  SplitIcon,
  AIIcon,
  TasksIcon,
  CalendarIcon,
} from '../components/Icons';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const features = [
    { 
      name: 'Calculator', 
      description: 'Advanced calculations', 
      icon: <CalculatorIcon size={32} color="#0070F3" />, 
      color: 'bg-blue-600',
      onPress: () => navigation.navigate('Calculator')
    },
    { 
      name: 'Mood Tracker', 
      description: 'Track your emotions', 
      icon: <MoodIcon size={32} color="#FF0080" />, 
      color: 'bg-pink-600',
      onPress: () => navigation.navigate('MoodTracker')
    },
    { 
      name: 'Notes', 
      description: 'Capture your thoughts', 
      icon: <NotesIcon size={32} color="#F5A623" />, 
      color: 'bg-yellow-600',
      onPress: () => navigation.navigate('Notes')
    },
    { 
      name: 'Vault', 
      description: 'Secure storage', 
      icon: <VaultIcon size={32} color="#00D9FF" />, 
      color: 'bg-green-600',
      onPress: () => navigation.navigate('Vault')
    },
    { 
      name: 'Splitwise', 
      description: 'Split expenses', 
      icon: <SplitIcon size={32} color="#7C3AED" />, 
      color: 'bg-purple-600',
      onPress: () => navigation.navigate('Splitwise')
    },
    { 
      name: 'AI Chat', 
      description: 'Smart assistant', 
      icon: <AIIcon size={32} color="#0070F3" />, 
      color: 'bg-indigo-600',
      onPress: () => navigation.navigate('AIChat')
    },
    { 
      name: 'Tasks', 
      description: 'Stay organized', 
      icon: <TasksIcon size={32} color="#00D9FF" />, 
      color: 'bg-emerald-600',
      onPress: () => navigation.navigate('Tasks')
    },
    { 
      name: 'Calendar', 
      description: 'Plan your day', 
      icon: <CalendarIcon size={32} color="#FF0080" />, 
      color: 'bg-red-600',
      onPress: () => navigation.navigate('Calendar')
    },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header */}
        <View className="px-6 py-6 border-b border-border">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold text-textPrimary mb-1">
                Dashboard
              </Text>
              <Text className="text-textSecondary text-base">
                Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'User'}!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-danger px-4 py-2 rounded-lg"
            >
              <Text className="text-textPrimary text-sm font-medium">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Welcome Section */}
        <View className="px-6 py-6">
          <View className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-xl border border-primary/30">
            <Text className="text-xl font-semibold text-textPrimary mb-2">
              ✨ MyLife AI Dashboard
            </Text>
            <Text className="text-textSecondary text-base">
              Your personal productivity companion. Everything you need in one place.
            </Text>
          </View>
        </View>
        {/* Quick Stats */}
        <View className="px-6  py-6">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Today's Overview
          </Text>
          
          <View className="flex-row space-x-4 gap-2">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-textSecondary text-sm mb-1">Tasks</Text>
              <Text className="text-textPrimary text-2xl font-bold">5</Text>
              <Text className="text-success text-xs">+2 today</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-textSecondary text-sm mb-1">Notes</Text>
              <Text className="text-textPrimary text-2xl font-bold">12</Text>
              <Text className="text-info text-xs">3 recent</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Mood</Text>
              <Text className="text-textPrimary text-2xl font-bold">😊</Text>
              <Text className="text-yellow-400 text-xs">Great!</Text>
            </View>
          </View>
        </View>
        {/* Features Grid */}
        <View className="px-6">
          <Text className="text-xl font-semibold text-textPrimary mb-6">
            Quick Actions
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={feature.onPress}
                className="mb-4 w-[49%]"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="bg-surface rounded-2xl p-4 border border-border relative overflow-hidden">
                  
                  {/* Icon */}
                  <View className="mb-4">
                    {feature.icon}
                  </View>
                  
                  {/* Content */}
                  <View>
                    <Text className="text-textPrimary text-lg font-semibold mb-1">
                      {feature.name}
                    </Text>
                    <Text className="text-textSecondary text-sm">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </ScrollView>
    </View>
  );
}
