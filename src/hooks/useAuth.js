import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from '../firebase';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('current_user');
      }
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('current_user', JSON.stringify(userCredential.user));
    return userCredential.user;
  };

  const logInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const logOut = async () => {
    await signOut(auth);
    localStorage.removeItem('current_user');
  };

  // const loadUserData = async (userId) => {
  //   const docRef = doc(db, "users", userId);
  //   const docSnap = await getDoc(docRef);
  //   return docSnap.exists() ? docSnap.data() : null;
  // };
  
  // const saveUserData = async (userId, data) => {
  //   await setDoc(doc(db, "users", userId), data);
  // };

  return {
    currentUser,
    signUp,
    logIn,
    logInWithGoogle,
    logOut,
    loading
  };
}