import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { askGemini, getSummary, analyzeText } from '../lib/geminiAI';
import { Colors } from '../constants/Config';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

const EnhancedNotesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) return;

    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to load notes. Please try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setModalVisible(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Error', 'Please enter a note title');
      return;
    }

    setSubmitting(true);

    try {
      const noteData = {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        updatedAt: serverTimestamp()
      };

      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), noteData);
      } else {
        await addDoc(collection(db, 'notes'), {
          ...noteData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      setModalVisible(false);
      setNoteTitle('');
      setNoteContent('');
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = (note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'notes', note.id));
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAIAction = async (action) => {
    if (!noteContent.trim()) {
      Alert.alert('Error', 'Please add some content to use AI features');
      return;
    }

    setAiLoading(true);
    setShowAIOptions(false);

    try {
      let result;
      switch (action) {
        case 'summarize':
          result = await getSummary(noteContent);
          break;
        case 'improve':
          result = await askGemini(`Please improve and enhance the following text while maintaining its original meaning:\n\n${noteContent}`);
          break;
        case 'analyze':
          result = await analyzeText(noteContent);
          break;
        case 'expand':
          result = await askGemini(`Please expand on the following text with more details and insights:\n\n${noteContent}`);
          break;
        default:
          return;
      }

      Alert.alert(
        'AI Result',
        result,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Use This', 
            onPress: () => setNoteContent(result)
          }
        ]
      );
    } catch (error) {
      console.error('AI Error:', error);
      Alert.alert('AI Error', error.message || 'Failed to process with AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return 'Just now';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getFilteredNotes = () => {
    if (!searchQuery.trim()) return notes;
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderNote = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleEditNote(item)}
      className={`bg-surface rounded-2xl p-4 mb-4 border border-gray-700 ${
        isTablet ? 'mx-2' : ''
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-textPrimary text-lg font-semibold mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-textSecondary text-sm">
            {formatDate(item.updatedAt || item.createdAt)}
          </Text>
        </View>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleEditNote(item)}
            className="bg-primary/20 p-2 rounded-lg"
          >
            <Text className="text-primary text-xs">✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteNote(item)}
            className="bg-danger/20 p-2 rounded-lg"
          >
            <Text className="text-danger text-xs">🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {item.content && (
        <Text className="text-textSecondary text-sm leading-5" numberOfLines={3}>
          {item.content}
        </Text>
      )}
      
      <View className="flex-row items-center justify-between px-6 py-4 bg-surface border-b border-vercel-border">
        <Text className="text-textSecondary text-xs">
          {item.content ? `${item.content.length} characters` : 'No content'}
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-primary rounded-full mr-2" />
          <Text className="text-textSecondary text-xs">Tap to edit</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-6xl mb-4">📝</Text>
      <Text className="text-textPrimary text-xl font-semibold mb-2 text-center">
        No Notes Yet
      </Text>
      <Text className="text-textSecondary text-center mb-6 leading-6">
        Create your first note to capture thoughts, ideas, and important information
      </Text>
      <TouchableOpacity
        onPress={handleAddNote}
        className="bg-primary px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Create First Note</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-textSecondary mt-4">Loading notes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredNotes = getFilteredNotes();
  const numColumns = isTablet ? 2 : 1;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className={`px-6 pt-4 pb-4 bg-background ${isTablet ? 'px-8' : ''}`}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-3xl font-bold text-textPrimary">Notes</Text>
            <Text className="text-textSecondary mt-1">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              {searchQuery ? ` found` : ''}
            </Text>
          </View>
          
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              className={`p-3 rounded-xl ${showSearch ? 'bg-primary' : 'bg-surface border border-gray-600'}`}
            >
              <Text className="text-lg">🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-surface border border-gray-600 p-3 rounded-xl"
            >
              <Text className="text-textPrimary text-sm">Back</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="mb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search notes..."
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-xl px-4 py-3 text-textPrimary"
            />
          </View>
        )}
      </View>

      {/* Notes List */}
      <View className={`flex-1 ${isTablet ? 'px-6' : 'px-6'}`}>
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={filteredNotes.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        />
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-8 right-6">
        <TouchableOpacity
          onPress={handleAddNote}
          className="bg-primary w-16 h-16 rounded-2xl items-center justify-center"
          style={{
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white text-2xl">+</Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Note Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-background"
        >
          <View className="flex-1" style={{ paddingTop: insets.top }}>
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-700">
              <View className="flex-row justify-between items-center">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="p-2 -ml-2"
                >
                  <Text className="text-textSecondary font-medium">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-textPrimary">
                  {editingNote ? 'Edit Note' : 'New Note'}
                </Text>
                <TouchableOpacity
                  onPress={handleSaveNote}
                  disabled={submitting}
                  className="p-2 -mr-2"
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text className="text-primary font-medium">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <ScrollView className="flex-1 px-6 py-6">
              <TextInput
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="Note title"
                className="text-xl font-semibold text-textPrimary mb-6 p-4 bg-surface rounded-xl border border-gray-600"
                placeholderTextColor="#6B7280"
              />
              
              <TextInput
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing your note..."
                multiline
                textAlignVertical="top"
                className="text-textPrimary p-4 bg-surface rounded-xl border border-gray-600 min-h-64"
                placeholderTextColor="#6B7280"
              />

              {/* AI Actions */}
              <View className="mt-6">
                <TouchableOpacity
                  onPress={() => setShowAIOptions(!showAIOptions)}
                  className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-xl border border-primary/30 flex-row items-center justify-center"
                >
                  <Text className="text-2xl mr-2">🤖</Text>
                  <Text className="text-primary font-semibold">AI Assistant</Text>
                  <Text className="text-primary ml-2">{showAIOptions ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {showAIOptions && (
                  <View className="mt-4 space-y-3">
                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={() => handleAIAction('summarize')}
                        disabled={aiLoading}
                        className="flex-1 bg-surface border border-gray-600 p-3 rounded-xl items-center"
                      >
                        <Text className="text-lg mb-1">📄</Text>
                        <Text className="text-textPrimary text-sm font-medium">Summarize</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => handleAIAction('improve')}
                        disabled={aiLoading}
                        className="flex-1 bg-surface border border-gray-600 p-3 rounded-xl items-center"
                      >
                        <Text className="text-lg mb-1">✨</Text>
                        <Text className="text-textPrimary text-sm font-medium">Improve</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row space-x-3">
                      <TouchableOpacity
                        onPress={() => handleAIAction('analyze')}
                        disabled={aiLoading}
                        className="flex-1 bg-surface border border-gray-600 p-3 rounded-xl items-center"
                      >
                        <Text className="text-lg mb-1">🔍</Text>
                        <Text className="text-textPrimary text-sm font-medium">Analyze</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => handleAIAction('expand')}
                        disabled={aiLoading}
                        className="flex-1 bg-surface border border-gray-600 p-3 rounded-xl items-center"
                      >
                        <Text className="text-lg mb-1">📝</Text>
                        <Text className="text-textPrimary text-sm font-medium">Expand</Text>
                      </TouchableOpacity>
                    </View>

                    {aiLoading && (
                      <View className="items-center py-4">
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text className="text-textSecondary text-sm mt-2">AI is processing...</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default EnhancedNotesScreen;
