import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MoodTrackerScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);

  const moods = [
    { emoji: '😄', name: 'Excellent', value: 5, color: 'bg-green-500' },
    { emoji: '😊', name: 'Good', value: 4, color: 'bg-blue-500' },
    { emoji: '😐', name: 'Neutral', value: 3, color: 'bg-yellow-500' },
    { emoji: '😔', name: 'Poor', value: 2, color: 'bg-orange-500' },
    { emoji: '😢', name: 'Terrible', value: 1, color: 'bg-red-500' },
  ];

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(`mood_history_${user?.uid}`);
      if (history) {
        const parsedHistory = JSON.parse(history);
        setMoodHistory(parsedHistory);
        calculateStreak(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading mood history:', error);
    }
  };

  const calculateStreak = (history) => {
    if (history.length === 0) {
      setCurrentStreak(0);
      return;
    }

    let streak = 0;
    const today = new Date().toDateString();
    
    // Check if user logged mood today
    const todayEntry = history.find(entry => 
      new Date(entry.date).toDateString() === today
    );
    
    if (todayEntry) {
      streak = 1;
      // Count consecutive days backwards
      for (let i = history.length - 2; i >= 0; i--) {
        const currentDate = new Date(history[i].date);
        const nextDate = new Date(history[i + 1].date);
        const dayDiff = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    setCurrentStreak(streak);
  };

  const saveMood = async (mood) => {
    try {
      const today = new Date().toDateString();
      const newEntry = {
        date: new Date().toISOString(),
        mood: mood.name,
        value: mood.value,
        emoji: mood.emoji,
      };

      // Remove any existing entry for today
      const updatedHistory = moodHistory.filter(entry => 
        new Date(entry.date).toDateString() !== today
      );
      
      // Add new entry
      updatedHistory.push(newEntry);
      updatedHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

      await AsyncStorage.setItem(`mood_history_${user?.uid}`, JSON.stringify(updatedHistory));
      setMoodHistory(updatedHistory);
      setSelectedMood(mood);
      calculateStreak(updatedHistory);

      Alert.alert(
        'Mood Saved!',
        `Your mood has been recorded as ${mood.name} ${mood.emoji}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save mood. Please try again.');
    }
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.value, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  const getTodaysMood = () => {
    const today = new Date().toDateString();
    return moodHistory.find(entry => 
      new Date(entry.date).toDateString() === today
    );
  };

  const getWeeklyMoods = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return moodHistory.filter(entry => 
      new Date(entry.date) >= weekAgo
    );
  };

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
                Mood Tracker
              </Text>
              <Text className="text-textSecondary text-base">
                How are you feeling today?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-surface px-4 py-2 rounded-lg border border-gray-600"
            >
              <Text className="text-textPrimary text-sm font-medium">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Mood Selection */}
        <View className="px-6 py-6">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Select Your Mood
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {moods.map((mood, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => saveMood(mood)}
                className={`w-[30%] aspect-square rounded-xl border-2 mb-4 justify-center items-center ${
                  getTodaysMood()?.name === mood.name 
                    ? 'border-primary bg-primary/20' 
                    : 'border-gray-600 bg-surface'
                }`}
              >
                <Text className="text-4xl mb-2">{mood.emoji}</Text>
                <Text className="text-textPrimary text-sm font-medium text-center">
                  {mood.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Your Stats
          </Text>
          
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Current Streak</Text>
              <Text className="text-textPrimary text-2xl font-bold">{currentStreak}</Text>
              <Text className="text-success text-xs">days</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Average Mood</Text>
              <Text className="text-textPrimary text-2xl font-bold">{getAverageMood()}</Text>
              <Text className="text-info text-xs">out of 5</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">This Week</Text>
              <Text className="text-textPrimary text-2xl font-bold">{getWeeklyMoods().length}</Text>
              <Text className="text-yellow-400 text-xs">entries</Text>
            </View>
          </View>
        </View>

        {/* Recent Mood History */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Recent History
          </Text>
          
          {moodHistory.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 border border-gray-600 items-center">
              <Text className="text-4xl mb-2">📊</Text>
              <Text className="text-textPrimary text-lg font-medium mb-1">
                No mood data yet
              </Text>
              <Text className="text-textSecondary text-center">
                Start tracking your mood to see insights and patterns
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {moodHistory.slice(-7).reverse().map((entry, index) => (
                <View key={index} className="bg-surface rounded-xl p-4 border border-gray-600">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Text className="text-3xl mr-3">{entry.emoji}</Text>
                      <View>
                        <Text className="text-textPrimary font-medium">
                          {entry.mood}
                        </Text>
                        <Text className="text-textSecondary text-sm">
                          {new Date(entry.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-textPrimary font-bold">
                        {entry.value}/5
                      </Text>
                      <Text className="text-textSecondary text-xs">
                        {new Date(entry.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View className="px-6 py-4">
          <View className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-xl border border-primary/30">
            <Text className="text-lg font-semibold text-textPrimary mb-2">
              💡 Mood Tracking Tips
            </Text>
            <Text className="text-textSecondary text-sm">
              • Track your mood daily for better insights{'\n'}
              • Notice patterns in your emotional well-being{'\n'}
              • Use this data to identify triggers and improvements{'\n'}
              • Celebrate your tracking streaks!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
