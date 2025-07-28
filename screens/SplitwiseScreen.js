import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

export default function SplitwiseScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isFriendModalVisible, setIsFriendModalVisible] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: user?.displayName || user?.email?.split('@')[0] || 'You',
    splitWith: [],
    category: 'General',
    date: new Date().toISOString()
  });
  const [friendForm, setFriendForm] = useState({
    name: '',
    email: ''
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Travel', 'General'];
  const categoryIcons = {
    'Food': '🍕',
    'Transportation': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Bills': '💡',
    'Travel': '✈️',
    'General': '💰'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const expensesData = await AsyncStorage.getItem(`expenses_${user?.uid}`);
      const friendsData = await AsyncStorage.getItem(`friends_${user?.uid}`);
      
      if (expensesData) {
        setExpenses(JSON.parse(expensesData));
      }
      if (friendsData) {
        setFriends(JSON.parse(friendsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem(`expenses_${user?.uid}`, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveFriends = async (newFriends) => {
    try {
      await AsyncStorage.setItem(`friends_${user?.uid}`, JSON.stringify(newFriends));
      setFriends(newFriends);
    } catch (error) {
      console.error('Error saving friends:', error);
    }
  };

  const addExpense = () => {
    if (!expenseForm.description.trim() || !expenseForm.amount.trim()) {
      Alert.alert('Error', 'Please fill in description and amount.');
      return;
    }

    if (expenseForm.splitWith.length === 0) {
      Alert.alert('Error', 'Please select at least one person to split with.');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    const totalPeople = expenseForm.splitWith.length + 1; // +1 for the person who paid
    const amountPerPerson = amount / totalPeople;

    const newExpense = {
      id: Date.now().toString(),
      ...expenseForm,
      amount: amount,
      amountPerPerson: amountPerPerson,
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
    
    setExpenseForm({
      description: '',
      amount: '',
      paidBy: user?.displayName || user?.email?.split('@')[0] || 'You',
      splitWith: [],
      category: 'General',
      date: new Date().toISOString()
    });
    setIsExpenseModalVisible(false);

    Alert.alert('Success', 'Expense added successfully!');
  };

  const addFriend = () => {
    if (!friendForm.name.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }

    const newFriend = {
      id: Date.now().toString(),
      name: friendForm.name.trim(),
      email: friendForm.email.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedFriends = [...friends, newFriend];
    saveFriends(updatedFriends);
    
    setFriendForm({ name: '', email: '' });
    setIsFriendModalVisible(false);

    Alert.alert('Success', 'Friend added successfully!');
  };

  const deleteExpense = (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
            saveExpenses(updatedExpenses);
          }
        }
      ]
    );
  };

  const deleteFriend = (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedFriends = friends.filter(friend => friend.id !== friendId);
            saveFriends(updatedFriends);
          }
        }
      ]
    );
  };

  const toggleFriendSelection = (friendName) => {
    const isSelected = expenseForm.splitWith.includes(friendName);
    if (isSelected) {
      setExpenseForm({
        ...expenseForm,
        splitWith: expenseForm.splitWith.filter(name => name !== friendName)
      });
    } else {
      setExpenseForm({
        ...expenseForm,
        splitWith: [...expenseForm.splitWith, friendName]
      });
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getYourBalance = () => {
    let balance = 0;
    const yourName = user?.displayName || user?.email?.split('@')[0] || 'You';
    
    expenses.forEach(expense => {
      if (expense.paidBy === yourName) {
        // You paid, so others owe you
        balance += expense.amount - expense.amountPerPerson;
      } else if (expense.splitWith.includes(yourName)) {
        // Someone else paid, you owe them
        balance -= expense.amountPerPerson;
      }
    });
    
    return balance;
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-6 py-6 border-b border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-textPrimary mb-1">
              Splitwise
            </Text>
            <Text className="text-textSecondary text-base">
              Split expenses with friends
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

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Balance Overview */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Total Expenses</Text>
              <Text className="text-textPrimary text-2xl font-bold">
                ${getTotalExpenses().toFixed(2)}
              </Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Your Balance</Text>
              <Text className={`text-2xl font-bold ${
                getYourBalance() >= 0 ? 'text-success' : 'text-danger'
              }`}>
                ${Math.abs(getYourBalance()).toFixed(2)}
              </Text>
              <Text className="text-textSecondary text-xs">
                {getYourBalance() >= 0 ? 'You are owed' : 'You owe'}
              </Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Friends</Text>
              <Text className="text-textPrimary text-2xl font-bold">{friends.length}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => setIsExpenseModalVisible(true)}
              className="flex-1 bg-primary rounded-xl p-4 items-center"
            >
              <Text className="text-4xl mb-2">💰</Text>
              <Text className="text-textPrimary font-semibold">Add Expense</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setIsFriendModalVisible(true)}
              className="flex-1 bg-secondary rounded-xl p-4 items-center"
            >
              <Text className="text-4xl mb-2">👥</Text>
              <Text className="text-textPrimary font-semibold">Add Friend</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Expenses */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Recent Expenses
          </Text>
          
          {expenses.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 border border-gray-600 items-center">
              <Text className="text-6xl mb-4">💸</Text>
              <Text className="text-textPrimary text-xl font-semibold mb-2">
                No Expenses Yet
              </Text>
              <Text className="text-textSecondary text-center mb-4">
                Start by adding your first expense to split with friends.
              </Text>
              <TouchableOpacity
                onPress={() => setIsExpenseModalVisible(true)}
                className="bg-primary px-6 py-3 rounded-lg"
              >
                <Text className="text-textPrimary font-medium">
                  Add First Expense
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {expenses.slice().reverse().map((expense) => (
                <View key={expense.id} className="bg-surface rounded-xl p-4 border border-gray-600">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-2xl mr-2">{categoryIcons[expense.category]}</Text>
                        <Text className="text-textPrimary text-lg font-semibold">
                          {expense.description}
                        </Text>
                      </View>
                      <Text className="text-textSecondary text-sm mb-1">
                        Paid by: {expense.paidBy}
                      </Text>
                      <Text className="text-textSecondary text-sm mb-1">
                        Split with: {expense.splitWith.join(', ')}
                      </Text>
                      <Text className="text-textSecondary text-xs">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-textPrimary text-xl font-bold">
                        ${expense.amount.toFixed(2)}
                      </Text>
                      <Text className="text-textSecondary text-sm">
                        ${expense.amountPerPerson.toFixed(2)} each
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteExpense(expense.id)}
                        className="bg-danger/20 px-2 py-1 rounded mt-2"
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

        {/* Friends List */}
        <View className="px-6 py-4">
          <Text className="text-xl font-semibold text-textPrimary mb-4">
            Friends ({friends.length})
          </Text>
          
          {friends.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 border border-gray-600 items-center">
              <Text className="text-4xl mb-2">👥</Text>
              <Text className="text-textPrimary text-lg font-semibold mb-1">
                No Friends Added
              </Text>
              <Text className="text-textSecondary text-center">
                Add friends to start splitting expenses
              </Text>
            </View>
          ) : (
            <View className="space-y-2">
              {friends.map((friend) => (
                <View key={friend.id} className="bg-surface rounded-xl p-3 border border-gray-600">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-textPrimary font-semibold">
                        {friend.name}
                      </Text>
                      {friend.email && (
                        <Text className="text-textSecondary text-sm">
                          {friend.email}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteFriend(friend.id)}
                      className="bg-danger/20 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-danger text-xs">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={isExpenseModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-textPrimary">
                Add Expense
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={addExpense}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-textPrimary font-medium">Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsExpenseModalVisible(false)}
                  className="bg-surface px-4 py-2 rounded-lg border border-gray-600"
                >
                  <Text className="text-textPrimary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            <Text className="text-textPrimary font-medium mb-2">Description *</Text>
            <TextInput
              value={expenseForm.description}
              onChangeText={(text) => setExpenseForm({ ...expenseForm, description: text })}
              placeholder="What was this expense for?"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            <Text className="text-textPrimary font-medium mb-2">Amount *</Text>
            <TextInput
              value={expenseForm.amount}
              onChangeText={(text) => setExpenseForm({ ...expenseForm, amount: text })}
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              keyboardType="numeric"
            />

            <Text className="text-textPrimary font-medium mb-2">Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setExpenseForm({ ...expenseForm, category })}
                  className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                    expenseForm.category === category
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <Text className={`text-sm ${
                    expenseForm.category === category ? 'text-primary' : 'text-textPrimary'
                  }`}>
                    {categoryIcons[category]} {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-textPrimary font-medium mb-2">Split With *</Text>
            {friends.length === 0 ? (
              <View className="bg-surface border border-gray-600 rounded-lg p-4 mb-4">
                <Text className="text-textSecondary text-center">
                  No friends added yet. Add friends first to split expenses.
                </Text>
              </View>
            ) : (
              <View className="mb-4">
                {friends.map(friend => (
                  <TouchableOpacity
                    key={friend.id}
                    onPress={() => toggleFriendSelection(friend.name)}
                    className={`flex-row items-center justify-between p-3 mb-2 rounded-lg border ${
                      expenseForm.splitWith.includes(friend.name)
                        ? 'border-primary bg-primary/20'
                        : 'border-gray-600 bg-surface'
                    }`}
                  >
                    <Text className={`${
                      expenseForm.splitWith.includes(friend.name) ? 'text-primary' : 'text-textPrimary'
                    }`}>
                      {friend.name}
                    </Text>
                    <View className={`w-5 h-5 rounded border-2 ${
                      expenseForm.splitWith.includes(friend.name)
                        ? 'border-primary bg-primary'
                        : 'border-gray-600'
                    }`}>
                      {expenseForm.splitWith.includes(friend.name) && (
                        <Text className="text-textPrimary text-center text-xs">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Add Friend Modal */}
      <Modal
        visible={isFriendModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-textPrimary">
                Add Friend
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={addFriend}
                  className="bg-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-textPrimary font-medium">Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFriendModalVisible(false)}
                  className="bg-surface px-4 py-2 rounded-lg border border-gray-600"
                >
                  <Text className="text-textPrimary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-1 px-6 py-4">
            <Text className="text-textPrimary font-medium mb-2">Name *</Text>
            <TextInput
              value={friendForm.name}
              onChangeText={(text) => setFriendForm({ ...friendForm, name: text })}
              placeholder="Enter friend's name"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            <Text className="text-textPrimary font-medium mb-2">Email (Optional)</Text>
            <TextInput
              value={friendForm.email}
              onChangeText={(text) => setFriendForm({ ...friendForm, email: text })}
              placeholder="Enter friend's email"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
