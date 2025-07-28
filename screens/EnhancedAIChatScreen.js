import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { askGemini } from '../lib/geminiAI';
import {
  LightbulbIcon,
  DocumentIcon,
  BrainIcon,
  SparkleIcon,
  ChartIcon,
  TargetIcon,
  BackIcon,
  DeleteIcon,
  RobotIcon,
} from '../components/Icons';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function EnhancedAIChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef();
  const insets = useSafeAreaInsets();

  // Quick suggestion prompts with SVG icons
  const quickSuggestions = [
    { text: "Give me productivity tips", icon: <LightbulbIcon size={16} color="#0070F3" /> },
    { text: "Help me organize my day", icon: <DocumentIcon size={16} color="#F5A623" /> },
    { text: "Explain a complex topic", icon: <BrainIcon size={16} color="#7C3AED" /> },
    { text: "Creative writing ideas", icon: <SparkleIcon size={16} color="#00D9FF" /> },
    { text: "Analyze my goals", icon: <ChartIcon size={16} color="#FF0080" /> },
    { text: "Problem-solving help", icon: <TargetIcon size={16} color="#00D9FF" /> }
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const chatKey = `ai_chat_${user?.uid || 'guest'}`;
      const savedMessages = await AsyncStorage.getItem(chatKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Add welcome message
        const welcomeMessage = {
          id: Date.now().toString(),
          text: "Hello! I'm your AI assistant powered by Gemini AI. I can help you with productivity tips, answer complex questions, provide creative ideas, or assist with problem-solving. What would you like to explore today?",
          sender: 'ai',
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const saveChatHistory = async (newMessages) => {
    try {
      const chatKey = `ai_chat_${user?.uid || 'guest'}`;
      await AsyncStorage.setItem(chatKey, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const userMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      // Create context from recent messages for better conversation flow
      const recentMessages = newMessages.slice(-6); // Last 6 messages for context
      const conversationContext = recentMessages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

      const contextualPrompt = `Based on our conversation:\n${conversationContext}\n\nPlease provide a helpful, informative, and engaging response. Keep it concise but thorough.`;

      const aiResponse = await askGemini(contextualPrompt);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please check your internet connection and try again. In the meantime, feel free to ask me anything else!",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      setError('Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const welcomeMessage = {
              id: Date.now().toString(),
              text: "Chat cleared! I'm here and ready to help. What would you like to talk about?",
              sender: 'ai',
              timestamp: new Date().toISOString(),
            };
            setMessages([welcomeMessage]);
            const chatKey = `ai_chat_${user?.uid || 'guest'}`;
            await AsyncStorage.setItem(chatKey, JSON.stringify([welcomeMessage]));
            setError(null);
          },
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSuggestionPress = (suggestion) => {
    const textToSend = typeof suggestion === 'string' ? suggestion : suggestion.text;
    sendMessage(textToSend);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-textSecondary mt-4 text-base">Loading AI Chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const containerPadding = isTablet ? 'px-8' : 'px-4';

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Enhanced Header */}
      <View className={`flex-row items-center justify-between ${containerPadding} py-4 bg-surface border-b border-border`}>
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2 rounded-full bg-gray-700 active:bg-gray-600"
          >
            <BackIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-textPrimary">AI Assistant</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-sm text-textSecondary">Powered by Gemini AI</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={clearChat}
          className="p-2 rounded-full bg-gray-700 active:bg-gray-600"
        >
          <DeleteIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View className="bg-errorBg border-l-4 border-danger px-4 py-3 mx-4 mt-2 rounded">
          <Text className="text-danger text-sm">{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className={`flex-1 ${containerPadding} py-4`}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View className="flex-1 justify-center items-center py-12">
              <View className="mb-4">
                <RobotIcon size={64} color="#0070F3" />
              </View>
              <Text className="text-textPrimary text-lg font-semibold mb-2">Welcome to AI Chat</Text>
              <Text className="text-textSecondary text-center leading-6">
                Start a conversation with your AI assistant
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 flex-row ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <View
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary rounded-br-md shadow-lg'
                    : `${message.isError ? 'bg-red-900/20 border border-red-500' : 'bg-surface border border-gray-700'} rounded-bl-md`
                }`}
                style={message.sender === 'user' ? {
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                } : {}}
              >
                <Text
                  className={`text-base leading-6 ${
                    message.sender === 'user' 
                      ? 'text-white' 
                      : message.isError 
                        ? 'text-red-400' 
                        : 'text-textPrimary'
                  }`}
                >
                  {message.text}
                </Text>
                <Text
                  className={`text-xs mt-2 ${
                    message.sender === 'user' 
                      ? 'text-blue-100' 
                      : message.isError 
                        ? 'text-red-300' 
                        : 'text-textSecondary'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {/* Enhanced Typing Indicator */}
          {isTyping && (
            <View className="mb-4 flex-row justify-start">
              <View className="bg-surface px-4 py-3 rounded-2xl rounded-bl-md border border-gray-700">
                <View className="flex-row items-center">
                  <View className="flex-row space-x-1 mr-3">
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <View className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </View>
                  <Text className="text-textSecondary text-sm">AI is thinking...</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Suggestions */}
          {messages.length <= 1 && !isTyping && (
            <View className="mt-6">
              <Text className="text-textSecondary text-sm mb-3 font-medium">Quick suggestions:</Text>
              <View className="flex-row flex-wrap">
                {quickSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionPress(suggestion)}
                    className="bg-surface border border-border rounded-full px-4 py-2 mr-2 mb-2 active:bg-hover flex-row items-center"
                  >
                    <View className="mr-2">
                      {suggestion.icon}
                    </View>
                    <Text className="text-textPrimary text-sm">{suggestion.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Enhanced Input Area */}
        <View className={`${containerPadding} py-4 bg-surface border-t border-border`}>
          <View className="flex-row items-end space-x-3">
            <View className="flex-1">
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-3 text-textPrimary text-base max-h-24"
                placeholder="Ask me anything..."
                placeholderTextColor="#6B7280"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                onSubmitEditing={() => !isTyping && sendMessage()}
                blurOnSubmit={false}
                style={{ textAlignVertical: 'top' }}
              />
              {inputText.length > 800 && (
                <Text className="text-xs text-textSecondary mt-1 text-right">
                  {inputText.length}/1000
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isTyping}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                inputText.trim() && !isTyping ? 'bg-primary' : 'bg-gray-600'
              }`}
              style={inputText.trim() && !isTyping ? {
                shadowColor: '#3B82F6',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 4,
              } : {}}
            >
              {isTyping ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg">➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
