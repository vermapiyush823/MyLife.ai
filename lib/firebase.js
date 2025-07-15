import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDNnjhYiIbK2khb329R9TtrQbHrmpNsJTk",
  authDomain: "mylife-ai.firebaseapp.com",
  projectId: "mylife-ai",
  storageBucket: "mylife-ai.firebasestorage.app",
  messagingSenderId: "937507742250",
  appId: "1:937507742250:web:be43dcbb8d736f62cc9953",
  measurementId: "G-RC4Z6K3JM0"
};

// Initialize Firebase - check if already initialized to prevent duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication with proper persistence
let auth;
let db;

if (Platform.OS === 'web') {
  // For web, use the default getAuth and getFirestore
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // For React Native, use initializeAuth with AsyncStorage persistence
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    // If auth is already initialized, get the existing instance
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
  
  // Initialize Firestore with offline persistence
  try {
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true, // For React Native
    });
  } catch (error) {
    // If Firestore is already initialized, get the existing instance
    db = getFirestore(app);
  }
}

// Export the firebase config for authentication providers
export { firebaseConfig };

// Export the auth and db instances
export { auth, db };

// Export the app instance if needed elsewhere
export default app;
