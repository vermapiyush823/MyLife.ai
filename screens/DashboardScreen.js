import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

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
      description: 'Smart calculations', 
      icon: '🔢', 
      color: 'bg-blue-600',
      onPress: () => navigation.navigate('Calculator')
    },
    { 
      name: 'Mood Tracker', 
      description: 'Track emotions', 
      icon: '😊', 
      color: 'bg-pink-600',
      onPress: () => navigation.navigate('MoodTracker')
    },
    { 
      name: 'Notes', 
      description: 'Capture thoughts', 
      icon: '📝', 
      color: 'bg-green-600',
      onPress: () => navigation.navigate('Notes')
    },
    { 
      name: 'Vault', 
      description: 'Secure storage', 
      icon: '🔒', 
      color: 'bg-purple-600',
      onPress: () => navigation.navigate('Vault')
    },
    { 
      name: 'Splitwise', 
      description: 'Split expenses', 
      icon: '💰', 
      color: 'bg-yellow-600',
      onPress: () => navigation.navigate('Splitwise')
    },
    { 
      name: 'AI Chat', 
      description: 'Smart assistant', 
      icon: '🤖', 
      color: 'bg-indigo-600',
      onPress: () => navigation.navigate('AIChat')
    },
    { 
      name: 'Tasks', 
      description: 'Stay organized', 
      icon: '✅', 
      color: 'bg-emerald-600',
      onPress: () => navigation.navigate('Tasks')
    },
    { 
      name: 'Calendar', 
      description: 'Plan your day', 
      icon: '📅', 
      color: 'bg-red-600',
      onPress: () => navigation.navigate('Calendar')
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-6 py-6 border-b mt-10 border-gray-700">
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
                className="w-[48%] mb-4"
                style={{ 
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <View className="bg-surface rounded-2xl p-6 border border-gray-600 relative overflow-hidden">
                  {/* Gradient overlay */}
                  <View className={`absolute -top-10 -right-10 w-20 h-20 ${feature.color} rounded-full opacity-20`} />
                  
                  {/* Icon */}
                  <View className="mb-4">
                    <Text className="text-4xl">{feature.icon}</Text>
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
                  
                  {/* Arrow */}
                  <View className="absolute bottom-4 right-4">
                    <Text className="text-textSecondary text-lg">→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View className="px-6 py-6">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Today's Overview
          </Text>
          
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Tasks</Text>
              <Text className="text-textPrimary text-2xl font-bold">5</Text>
              <Text className="text-success text-xs">+2 today</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
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

        {/* Account Section */}
        <View className="px-6 py-4">
          <View className="bg-surface rounded-xl p-4 border border-gray-600">
            <Text className="text-lg font-semibold text-textPrimary mb-3">
              Account Info
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Email</Text>
                <Text className="text-textPrimary text-right flex-1 ml-4" numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Status</Text>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${user?.emailVerified ? 'bg-success' : 'bg-yellow-500'}`} />
                  <Text className="text-textPrimary">
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Member since</Text>
                <Text className="text-textPrimary">
                  {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                    'Today'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
