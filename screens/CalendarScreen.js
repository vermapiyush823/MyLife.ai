import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'Event',
    reminder: false
  });

  const eventTypes = ['Event', 'Meeting', 'Task', 'Reminder', 'Birthday', 'Other'];
  const typeColors = {
    'Event': 'bg-blue-500',
    'Meeting': 'bg-purple-500',
    'Task': 'bg-green-500',
    'Reminder': 'bg-yellow-500',
    'Birthday': 'bg-pink-500',
    'Other': 'bg-gray-500'
  };

  const typeIcons = {
    'Event': '📅',
    'Meeting': '👥',
    'Task': '✅',
    'Reminder': '🔔',
    'Birthday': '🎂',
    'Other': '📝'
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await AsyncStorage.getItem(`events_${user?.uid}`);
      if (eventsData) {
        setEvents(JSON.parse(eventsData));
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const saveEvents = async (newEvents) => {
    try {
      await AsyncStorage.setItem(`events_${user?.uid}`, JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Error saving events:', error);
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const addEvent = () => {
    if (!eventForm.title.trim() || !eventForm.date.trim()) {
      Alert.alert('Error', 'Please enter event title and date.');
      return;
    }

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      ...eventForm,
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(event => 
        event.id === editingEvent.id ? newEvent : event
      );
    } else {
      updatedEvents = [...events, newEvent];
    }

    saveEvents(updatedEvents);
    resetForm();
    setIsModalVisible(false);
  };

  const deleteEvent = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEvents = events.filter(event => event.id !== eventId);
            saveEvents(updatedEvents);
          }
        }
      ]
    );
  };

  const editEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      type: event.type || 'Event',
      reminder: event.reminder || false
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: formatDate(selectedDate),
      time: '',
      type: 'Event',
      reminder: false
    });
    setEditingEvent(null);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = formatDate(date);
    return events.filter(event => event.date === dateString);
  };

  const getEventsForSelectedDate = () => {
    return getEventsForDate(selectedDate);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-6 py-6 border-b mt-10 border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-textPrimary mb-1">
              Calendar
            </Text>
            <Text className="text-textSecondary text-base">
              Plan your day and schedule events
            </Text>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setIsModalVisible(true);
              }}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-textPrimary text-sm font-medium">
                Add Event
              </Text>
            </TouchableOpacity>
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
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Calendar Header */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth(-1)}
              className="bg-surface p-2 rounded-lg border border-gray-600"
            >
              <Text className="text-textPrimary text-lg">←</Text>
            </TouchableOpacity>
            
            <Text className="text-textPrimary text-xl font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            
            <TouchableOpacity
              onPress={() => navigateMonth(1)}
              className="bg-surface p-2 rounded-lg border border-gray-600"
            >
              <Text className="text-textPrimary text-lg">→</Text>
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View className="flex-row mb-2">
            {dayNames.map(day => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-textSecondary text-sm font-medium">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="bg-surface rounded-xl border border-gray-600 p-2">
            <View className="flex-row flex-wrap">
              {days.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const hasEvents = dayEvents.length > 0;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => date && setSelectedDate(date)}
                    className={`w-[14.28%] aspect-square items-center justify-center m-0.5 rounded-lg ${
                      !date 
                        ? 'bg-transparent' 
                        : isSelectedDate(date)
                        ? 'bg-primary'
                        : isToday(date)
                        ? 'bg-secondary/30 border border-secondary'
                        : hasEvents
                        ? 'bg-surface border border-primary/50'
                        : 'bg-transparent'
                    }`}
                    disabled={!date}
                  >
                    {date && (
                      <>
                        <Text className={`text-sm font-medium ${
                          isSelectedDate(date)
                            ? 'text-textPrimary'
                            : isToday(date)
                            ? 'text-secondary'
                            : 'text-textPrimary'
                        }`}>
                          {date.getDate()}
                        </Text>
                        {hasEvents && (
                          <View className="w-1 h-1 bg-primary rounded-full mt-1" />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Selected Date Events */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Events for {selectedDate.toLocaleDateString()}
          </Text>
          
          {selectedDateEvents.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 border border-gray-600 items-center">
              <Text className="text-4xl mb-2">📅</Text>
              <Text className="text-textPrimary text-lg font-semibold mb-1">
                No Events Today
              </Text>
              <Text className="text-textSecondary text-center mb-4">
                Add an event to start planning your day
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setIsModalVisible(true);
                }}
                className="bg-primary px-6 py-3 rounded-lg"
              >
                <Text className="text-textPrimary font-medium">
                  Add Event
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {selectedDateEvents
                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                .map((event) => (
                  <View key={event.id} className="bg-surface rounded-xl p-4 border border-gray-600">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-2xl mr-2">{typeIcons[event.type]}</Text>
                          <Text className="text-textPrimary text-lg font-semibold">
                            {event.title}
                          </Text>
                          <View className={`w-3 h-3 rounded-full ml-2 ${typeColors[event.type]}`} />
                        </View>
                        
                        {event.description && (
                          <Text className="text-textSecondary text-sm mb-2">
                            {event.description}
                          </Text>
                        )}
                        
                        <View className="flex-row items-center space-x-4">
                          {event.time && (
                            <Text className="text-textSecondary text-sm">
                              🕐 {event.time}
                            </Text>
                          )}
                          <Text className="text-textSecondary text-sm">
                            📋 {event.type}
                          </Text>
                          {event.reminder && (
                            <Text className="text-textSecondary text-sm">
                              🔔 Reminder
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          onPress={() => editEvent(event)}
                          className="bg-primary/20 px-3 py-1 rounded-lg"
                        >
                          <Text className="text-primary text-xs">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteEvent(event.id)}
                          className="bg-danger/20 px-3 py-1 rounded-lg"
                        >
                          <Text className="text-danger text-xs">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Upcoming Events
          </Text>
          
          {(() => {
            const today = new Date();
            const upcomingEvents = events
              .filter(event => new Date(event.date) > today)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5);

            return upcomingEvents.length === 0 ? (
              <View className="bg-surface rounded-xl p-4 border border-gray-600 items-center">
                <Text className="text-textSecondary">
                  No upcoming events scheduled
                </Text>
              </View>
            ) : (
              <View className="space-y-2">
                {upcomingEvents.map((event) => (
                  <View key={event.id} className="bg-surface rounded-xl p-3 border border-gray-600">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="text-lg mr-2">{typeIcons[event.type]}</Text>
                          <Text className="text-textPrimary font-medium">
                            {event.title}
                          </Text>
                        </View>
                        <Text className="text-textSecondary text-sm">
                          {new Date(event.date).toLocaleDateString()}
                          {event.time && ` at ${event.time}`}
                        </Text>
                      </View>
                      <View className={`w-3 h-3 rounded-full ${typeColors[event.type]}`} />
                    </View>
                  </View>
                ))}
              </View>
            );
          })()}
        </View>

        {/* Quick Stats */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Total Events</Text>
              <Text className="text-textPrimary text-2xl font-bold">{events.length}</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">This Month</Text>
              <Text className="text-textPrimary text-2xl font-bold">
                {events.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getMonth() === currentMonth.getMonth() && 
                         eventDate.getFullYear() === currentMonth.getFullYear();
                }).length}
              </Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Today</Text>
              <Text className="text-textPrimary text-2xl font-bold">
                {getEventsForDate(new Date()).length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Event Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-textPrimary">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={addEvent}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-textPrimary font-medium">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsModalVisible(false);
                    resetForm();
                  }}
                  className="bg-surface px-4 py-2 rounded-lg border border-gray-600"
                >
                  <Text className="text-textPrimary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {/* Title */}
            <Text className="text-textPrimary font-medium mb-2">Title *</Text>
            <TextInput
              value={eventForm.title}
              onChangeText={(text) => setEventForm({ ...eventForm, title: text })}
              placeholder="Enter event title"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            {/* Description */}
            <Text className="text-textPrimary font-medium mb-2">Description</Text>
            <TextInput
              value={eventForm.description}
              onChangeText={(text) => setEventForm({ ...eventForm, description: text })}
              placeholder="Enter event description (optional)"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Date */}
            <Text className="text-textPrimary font-medium mb-2">Date *</Text>
            <TextInput
              value={eventForm.date}
              onChangeText={(text) => setEventForm({ ...eventForm, date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            {/* Time */}
            <Text className="text-textPrimary font-medium mb-2">Time (Optional)</Text>
            <TextInput
              value={eventForm.time}
              onChangeText={(text) => setEventForm({ ...eventForm, time: text })}
              placeholder="HH:MM (e.g., 14:30)"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            {/* Event Type */}
            <Text className="text-textPrimary font-medium mb-2">Event Type</Text>
            <View className="flex-row flex-wrap mb-4">
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setEventForm({ ...eventForm, type })}
                  className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                    eventForm.type === type
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-lg mr-2">{typeIcons[type]}</Text>
                    <Text className={`${
                      eventForm.type === type ? 'text-primary' : 'text-textPrimary'
                    }`}>
                      {type}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reminder Toggle */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textPrimary font-medium">Set Reminder</Text>
              <TouchableOpacity
                onPress={() => setEventForm({ ...eventForm, reminder: !eventForm.reminder })}
                className={`w-12 h-6 rounded-full ${
                  eventForm.reminder ? 'bg-primary' : 'bg-gray-600'
                } items-center justify-center`}
              >
                <View className={`w-5 h-5 rounded-full bg-white transform ${
                  eventForm.reminder ? 'translate-x-3' : '-translate-x-3'
                }`} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
