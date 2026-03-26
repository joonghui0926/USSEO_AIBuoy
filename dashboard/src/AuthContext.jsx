import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const AuthContext = createContext();
const ADMIN_EMAIL = "teacher@logncoding.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const googleLogin = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, googleLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);