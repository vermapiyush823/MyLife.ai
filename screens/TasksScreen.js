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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

export default function TasksScreen({ navigation }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Personal',
    dueDate: '',
    completed: false
  });
  const [filter, setFilter] = useState('All');

  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const categories = ['Personal', 'Work', 'Health', 'Learning', 'Shopping', 'Other'];
  const filters = ['All', 'Active', 'Completed', 'High Priority'];

  const priorityColors = {
    'Low': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'High': 'bg-orange-500',
    'Urgent': 'bg-red-500'
  };

  const categoryIcons = {
    'Personal': '👤',
    'Work': '💼',
    'Health': '🏥',
    'Learning': '📚',
    'Shopping': '🛒',
    'Other': '📋'
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await AsyncStorage.getItem(`tasks_${user?.uid}`);
      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(`tasks_${user?.uid}`, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  const addTask = () => {
    if (!taskForm.title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    const newTask = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      ...taskForm,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? newTask : task
      );
    } else {
      updatedTasks = [...tasks, newTask];
    }

    saveTasks(updatedTasks);
    resetForm();
    setIsModalVisible(false);
  };

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task
    );
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            saveTasks(updatedTasks);
          }
        }
      ]
    );
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      category: task.category || 'Personal',
      dueDate: task.dueDate || '',
      completed: task.completed || false
    });
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      priority: 'Medium',
      category: 'Personal',
      dueDate: '',
      completed: false
    });
    setEditingTask(null);
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'Active':
        return tasks.filter(task => !task.completed);
      case 'Completed':
        return tasks.filter(task => task.completed);
      case 'High Priority':
        return tasks.filter(task => task.priority === 'High' || task.priority === 'Urgent');
      default:
        return tasks;
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;
    const highPriority = tasks.filter(task => 
      (task.priority === 'High' || task.priority === 'Urgent') && !task.completed
    ).length;

    return { total, completed, active, highPriority };
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="px-6 py-6 border-b mt-10 border-gray-700">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-textPrimary mb-1">
              Tasks
            </Text>
            <Text className="text-textSecondary text-base">
              Stay organized and productive
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
                Add Task
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
              <Text className="text-textSecondary text-sm mb-1">Total Tasks</Text>
              <Text className="text-textPrimary text-2xl font-bold">{stats.total}</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Active</Text>
              <Text className="text-textPrimary text-2xl font-bold">{stats.active}</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">Completed</Text>
              <Text className="text-success text-2xl font-bold">{stats.completed}</Text>
            </View>
            
            <View className="flex-1 bg-surface rounded-xl p-4 border border-gray-600">
              <Text className="text-textSecondary text-sm mb-1">High Priority</Text>
              <Text className="text-danger text-2xl font-bold">{stats.highPriority}</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="px-6 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {filters.map(filterOption => (
                <TouchableOpacity
                  key={filterOption}
                  onPress={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-full border ${
                    filter === filterOption
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <Text className={`text-sm ${
                    filter === filterOption ? 'text-primary' : 'text-textPrimary'
                  }`}>
                    {filterOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tasks List */}
        <View className="px-6 py-4">
          {filteredTasks.length === 0 ? (
            <View className="bg-surface rounded-xl p-8 border border-gray-600 items-center">
              <Text className="text-6xl mb-4">✅</Text>
              <Text className="text-textPrimary text-xl font-semibold mb-2">
                {filter === 'All' ? 'No Tasks Yet' : `No ${filter} Tasks`}
              </Text>
              <Text className="text-textSecondary text-center mb-4">
                {filter === 'All' 
                  ? 'Create your first task to get organized!'
                  : `You don't have any ${filter.toLowerCase()} tasks right now.`
                }
              </Text>
              {filter === 'All' && (
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setIsModalVisible(true);
                  }}
                  className="bg-primary px-6 py-3 rounded-lg"
                >
                  <Text className="text-textPrimary font-medium">
                    Create First Task
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="space-y-3">
              {filteredTasks
                .sort((a, b) => {
                  // Sort by completion status first, then by priority, then by creation date
                  if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                  }
                  const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                  }
                  return new Date(b.createdAt) - new Date(a.createdAt);
                })
                .map((task) => (
                  <View 
                    key={task.id} 
                    className={`bg-surface rounded-xl p-4 border border-gray-600 ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <View className="flex-row items-start space-x-3">
                      {/* Completion Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleTaskCompletion(task.id)}
                        className={`w-6 h-6 rounded-full border-2 mt-1 items-center justify-center ${
                          task.completed 
                            ? 'border-success bg-success' 
                            : 'border-gray-400'
                        }`}
                      >
                        {task.completed && (
                          <Text className="text-textPrimary text-xs">✓</Text>
                        )}
                      </TouchableOpacity>

                      {/* Task Content */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className={`text-lg font-semibold ${
                            task.completed ? 'text-textSecondary line-through' : 'text-textPrimary'
                          }`}>
                            {task.title}
                          </Text>
                          
                          <View className="flex-row items-center space-x-2">
                            {/* Priority Indicator */}
                            <View className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} />
                            
                            {/* Category Icon */}
                            <Text className="text-lg">{categoryIcons[task.category]}</Text>
                          </View>
                        </View>

                        {task.description && (
                          <Text className={`text-sm mb-2 ${
                            task.completed ? 'text-textSecondary' : 'text-textSecondary'
                          }`}>
                            {task.description}
                          </Text>
                        )}

                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center space-x-4">
                            <Text className="text-textSecondary text-xs">
                              {task.priority} Priority
                            </Text>
                            <Text className="text-textSecondary text-xs">
                              {task.category}
                            </Text>
                            {task.dueDate && (
                              <Text className="text-textSecondary text-xs">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </Text>
                            )}
                          </View>

                          <View className="flex-row space-x-2">
                            <TouchableOpacity
                              onPress={() => editTask(task)}
                              className="bg-primary/20 px-3 py-1 rounded-lg"
                            >
                              <Text className="text-primary text-xs">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => deleteTask(task.id)}
                              className="bg-danger/20 px-3 py-1 rounded-lg"
                            >
                              <Text className="text-danger text-xs">Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Progress Section */}
        {tasks.length > 0 && (
          <View className="px-6 py-4">
            <View className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-xl border border-primary/30">
              <Text className="text-lg font-semibold text-textPrimary mb-2">
                📊 Your Progress
              </Text>
              <Text className="text-textSecondary text-sm mb-3">
                You've completed {stats.completed} out of {stats.total} tasks
              </Text>
              
              {/* Progress Bar */}
              <View className="bg-surface rounded-full h-3 mb-2">
                <View 
                  className="bg-success rounded-full h-3"
                  style={{ 
                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                  }}
                />
              </View>
              
              <Text className="text-textSecondary text-xs">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Complete
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Task Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="px-6 py-4 border-b border-gray-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-xl font-bold text-textPrimary">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={addTask}
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
              value={taskForm.title}
              onChangeText={(text) => setTaskForm({ ...taskForm, title: text })}
              placeholder="Enter task title"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />

            {/* Description */}
            <Text className="text-textPrimary font-medium mb-2">Description</Text>
            <TextInput
              value={taskForm.description}
              onChangeText={(text) => setTaskForm({ ...taskForm, description: text })}
              placeholder="Enter task description (optional)"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Priority */}
            <Text className="text-textPrimary font-medium mb-2">Priority</Text>
            <View className="flex-row flex-wrap mb-4">
              {priorities.map(priority => (
                <TouchableOpacity
                  key={priority}
                  onPress={() => setTaskForm({ ...taskForm, priority })}
                  className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                    taskForm.priority === priority
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-2 ${priorityColors[priority]}`} />
                    <Text className={`${
                      taskForm.priority === priority ? 'text-primary' : 'text-textPrimary'
                    }`}>
                      {priority}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text className="text-textPrimary font-medium mb-2">Category</Text>
            <View className="flex-row flex-wrap mb-4">
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setTaskForm({ ...taskForm, category })}
                  className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                    taskForm.category === category
                      ? 'border-primary bg-primary/20'
                      : 'border-gray-600 bg-surface'
                  }`}
                >
                  <Text className={`${
                    taskForm.category === category ? 'text-primary' : 'text-textPrimary'
                  }`}>
                    {categoryIcons[category]} {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Due Date */}
            <Text className="text-textPrimary font-medium mb-2">Due Date (Optional)</Text>
            <TextInput
              value={taskForm.dueDate}
              onChangeText={(text) => setTaskForm({ ...taskForm, dueDate: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
              className="bg-surface border border-gray-600 rounded-lg px-4 py-3 text-textPrimary mb-4"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
