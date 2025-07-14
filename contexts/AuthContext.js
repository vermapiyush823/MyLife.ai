import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useFirebaseAuth, setUseFirebaseAuth] = useState(true); // Default to real Firebase auth

  useEffect(() => {
    let unsubscribe;
    
    if (useFirebaseAuth) {
      // Use real Firebase auth
      unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('Firebase auth state changed:', user ? `User: ${user.email}` : 'No user');
        setUser(user);
        setLoading(false);
      });
    }

    return unsubscribe;
  }, [useFirebaseAuth]);

  const logout = async () => {
    try {
      if (useFirebaseAuth) {
        await signOut(auth);
      } else {
        await demoAuth.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchToFirebaseAuth = () => {
    setUseFirebaseAuth(true);
  };

  const value = {
    user,
    loading,
    logout,
    useFirebaseAuth,
    switchToFirebaseAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
