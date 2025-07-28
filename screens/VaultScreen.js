import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  AppState,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { BiometricAuth } from '../lib/biometricAuth';
import { Colors } from '../constants/Config';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export default function VaultScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [vaultItems, setVaultItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    notes: '',
    category: 'Login'
  });

  const categories = ['Login', 'Card', 'Note', 'Identity', 'Other'];
  const categoryIcons = {
    'Login': '🔐',
    'Card': '💳',
    'Note': '📝',
    'Identity': '👤',
    'Other': '📁'
  };

  useEffect(() => {
    loadVaultItems();
  }, []);

  const loadVaultItems = async () => {
    try {
      const items = await AsyncStorage.getItem(`vault_items_${user?.uid}`);
      if (items) {
        setVaultItems(JSON.parse(items));
      }
    } catch (error) {
      console.error('Error loading vault items:', error);
    }
  };

  const saveVaultItems = async (items) => {
    try {
      await AsyncStorage.setItem(`vault_items_${user?.uid}`, JSON.stringify(items));
      setVaultItems(items);
    } catch (error) {
      console.error('Error saving vault items:', error);
      Alert.alert('Error', 'Failed to save vault item. Please try again.');
    }
  };

  const handleSaveItem = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for this item.');
      return;
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      ...formData,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedItems;
    if (editingItem) {
      updatedItems = vaultItems.map(item => 
        item.id === editingItem.id ? newItem : item
      );
    } else {
      updatedItems = [...vaultItems, newItem];
    }

    saveVaultItems(updatedItems);
    resetForm();
    setIsModalVisible(false);
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItems = vaultItems.filter(item => item.id !== itemId);
            saveVaultItems(updatedItems);
          }
        }
      ]
    );
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      username: item.username || '',
      password: item.password || '',
      website: item.website || '',
      notes: item.notes || '',
      category: item.category || 'Login'
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      username: '',
      password: '',
      website: '',
      notes: '',
      category: 'Login'
    });
    setEditingItem(null);
  };

  const copyToClipboard = (text, label) => {
    // Note: In a real app, you'd use @react-native-clipboard/clipboard
    Alert.alert('Copied', `${label} copied to clipboard!`);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const getItemsByCategory = (category) => {
    return vaultItems.filter(item => item.category === category);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-6 py-6 border-b border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-textPrimary mb-1">
              Vault
            </Text>
            <Text className="text-textSecondary text-base">
              Secure storage for your sensitive data
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
                Add Item
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
        {/* Stats */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Total Items</Text>
              <Text className="text-textPrimary text-2xl font-bold">{vaultItems.length}</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Categories</Text>
              <Text className="text-textPrimary text-2xl font-bold">
                {categories.filter(cat => getItemsByCategory(cat).length > 0).length}
              </Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Most Used</Text>
              <Text className="text-textPrimary text-lg font-bold">
                {vaultItems.length > 0 ? categoryIcons[
                  categories.reduce((a, b) => 
                    getItemsByCategory(a).length > getItemsByCategory(b).length ? a : b
                  )
                ] : '📁'}
              </Text>
            </View>
          </View>
        </View>

        {/* Vault Items by Category */}
        {vaultItems.length === 0 ? (
          <View className="px-6 py-8">
            <View className="bg-surface rounded-xl p-8 border border-gray-600 items-center">
              <Text className="text-6xl mb-4">🔒</Text>
              <Text className="text-textPrimary text-xl font-semibold mb-2">
                Your Vault is Empty
              </Text>
              <Text className="text-textSecondary text-center mb-4">
                Start by adding your first secure item like passwords, cards, or important notes.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setIsModalVisible(true);
                }}
                className="bg-primary px-6 py-3 rounded-lg"
              >
                <Text className="text-textPrimary font-medium">
                  Add Your First Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          categories.map(category => {
            const categoryItems = getItemsByCategory(category);
            if (categoryItems.length === 0) return null;

            return (
              <View key={category} className="px-6 py-4">
                <View className="flex-row items-center mb-4">
                  <Text className="text-2xl mr-2">{categoryIcons[category]}</Text>
                  <Text className="text-xl font-semibold text-textPrimary">
                    {category} ({categoryItems.length})
                  </Text>
                </View>
                
                <View className="space-y-3">
                  {categoryItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleEditItem(item)}
                      className="bg-surface rounded-xl p-4 border border-gray-600"
                    >
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className="text-textPrimary text-lg font-semibold mb-1">
                            {item.title}
                          </Text>
                          {item.username && (
                            <Text className="text-textSecondary text-sm mb-1">
                              Username: {item.username}
                            </Text>
                          )}
                          {item.website && (
                            <Text className="text-textSecondary text-sm mb-1">
                              Website: {item.website}
                            </Text>
                          )}
                          <Text className="text-textSecondary text-xs">
                            Updated: {new Date(item.updatedAt).toLocaleDateString()}
                          </Text>
                        </View>
                        
                        <View className="flex-row space-x-2">
                          {item.password && (
                            <TouchableOpacity
                              onPress={() => copyToClipboard(item.password, 'Password')}
                              className="bg-primary/20 px-3 py-1 rounded-lg"
                            >
                              <Text className="text-primary text-xs">Copy</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(item.id)}
                            className="bg-danger/20 px-3 py-1 rounded-lg"
                          >
                            <Text className="text-danger text-xs">Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-textPrimary">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={handleSaveItem}
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
            {/* Category Selection */}
            <Text className="text-textPrimary font-medium mb-2">Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setFormData({ ...formData, category })}
                  className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                    formData.category === category
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <Text className={`${
                    formData.category === category ? 'text-primary' : 'text-textPrimary'
                  }`}>
                    {categoryIcons[category]} {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Fields */}
            <Text className="text-textPrimary font-medium mb-2">Title *</Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter title"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            <Text className="text-textPrimary font-medium mb-2">Username/Email</Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Enter username or email"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              autoCapitalize="none"
            />

            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-textPrimary font-medium">Password</Text>
              <TouchableOpacity
                onPress={generatePassword}
                className="bg-primary/20 px-3 py-1 rounded-lg"
              >
                <Text className="text-primary text-sm">Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Enter password"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              secureTextEntry
            />

            <Text className="text-textPrimary font-medium mb-2">Website/URL</Text>
            <TextInput
              value={formData.website}
              onChangeText={(text) => setFormData({ ...formData, website: text })}
              placeholder="Enter website URL"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              autoCapitalize="none"
            />

            <Text className="text-textPrimary font-medium mb-2">Notes</Text>
            <TextInput
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Additional notes"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
