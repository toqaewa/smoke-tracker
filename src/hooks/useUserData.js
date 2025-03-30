import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useUserData = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      setData(docSnap.exists() ? docSnap.data() : null);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const updateDoc = async (newData) => {
    await setDoc(doc(db, 'users', userId), newData, { merge: true });
  };

  return { data, loading, updateDoc };
};