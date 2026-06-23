import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from '../firebase';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const profileData = localStorage.getItem('userProfile');
          const parsedProfile = profileData ? JSON.parse(profileData) : null;
          await api.post('/auth/login', {
            profileData: parsedProfile,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (parsedProfile) {
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userId');
            localStorage.removeItem('recentAnalyses');
            localStorage.removeItem('verificationReports');
          }
        } catch (err) {
          console.error('Backend auth sync failed:', err);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncWithBackend = async () => {
    try {
      const profileData = localStorage.getItem('userProfile');
      const parsedProfile = profileData ? JSON.parse(profileData) : null;
      const res = await api.post('/auth/login', { profileData: parsedProfile });
      if (parsedProfile) {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('userId');
        localStorage.removeItem('recentAnalyses');
        localStorage.removeItem('verificationReports');
      }
      return res.data.user;
    } catch (err) {
      console.error('Backend sync failed:', err);
      return null;
    }
  };

  const signUp = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    setUser({ ...cred.user, displayName: name });
    await syncWithBackend();
    return cred.user;
  };

  const logIn = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncWithBackend();
    return cred.user;
  };

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncWithBackend();
    return cred.user;
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, signInWithGoogle, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
