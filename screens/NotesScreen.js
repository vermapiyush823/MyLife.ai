import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { 
  collection, 
  addDoc, 
  getDocs, 
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
import { Ionicons } from '@expo/vector-icons';

const NotesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for notes with server-side sorting
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
      if (editingNote) {
        // Update existing note
        await updateDoc(doc(db, 'notes', editingNote.id), {
          title: noteTitle.trim(),
          content: noteContent.trim(),
          updatedAt: serverTimestamp()
        });
        Alert.alert('Success', 'Note updated successfully');
      } else {
        // Create new note
        await addDoc(collection(db, 'notes'), {
          title: noteTitle.trim(),
          content: noteContent.trim(),
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        Alert.alert('Success', 'Note created successfully');
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
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString();
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleEditNote(item)}
      className="bg-surface rounded-xl p-6 mb-4 shadow-lg border border-surface"
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-lg font-semibold text-textPrimary flex-1" numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteNote(item)}
          className="p-2 rounded-lg bg-background ml-3"
        >
          <Ionicons name="trash-outline" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
      
      {item.content && (
        <Text className="text-textSecondary mb-3 leading-6" numberOfLines={2}>
          {item.content}
        </Text>
      )}
      
      <Text className="text-xs text-textSecondary opacity-70">
        {formatDate(item.updatedAt || item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-6xl mb-4">📝</Text>
      <Text className="text-xl font-semibold text-textPrimary mb-2">
        No notes yet
      </Text>
      <Text className="text-textSecondary text-center mb-8 leading-6">
        Start capturing your thoughts and ideas. Tap the + button to create your first note.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StatusBar barStyle="light-content" backgroundColor="#0B1119" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2979FF" />
          <Text className="text-textSecondary mt-4">Loading notes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1  bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#0B1119" />
      
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-background">
        <View className="flex-row justify-between items-center ">
          <View>
            <Text className="text-2xl font-semibold text-textPrimary">Notes</Text>
            <Text className="text-textSecondary mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>
        </View>
      </View>

      {/* Notes List */}
      <View className="flex-1 px-6">
        <FlatList
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={notes.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        />
      </View>

      {/* Floating Action Button */}
      <View className="absolute bottom-8 right-6">
        <TouchableOpacity
          onPress={handleAddNote}
          className="bg-primary w-14 h-14 rounded-xl items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={24} color="#F1F5F9" />
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
          <SafeAreaView className="flex-1">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-surface">
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
                    <ActivityIndicator size="small" color="#2979FF" />
                  ) : (
                    <Text className="text-secondary font-medium">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View className="flex-1 px-6 py-6">
              <TextInput
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="Note title"
                className="text-xl font-semibold text-textPrimary mb-6 p-4 bg-surface rounded-xl border border-surface"
                placeholderTextColor="#94A3B8"
                style={{ color: '#F1F5F9' }}
              />
              
              <TextInput
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing your note..."
                multiline
                textAlignVertical="top"
                className="flex-1 text-textPrimary p-4 bg-surface rounded-xl border border-surface"
                placeholderTextColor="#94A3B8"
                style={{ color: '#F1F5F9' }}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default NotesScreen;
