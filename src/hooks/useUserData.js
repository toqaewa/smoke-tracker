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
      if (docSnap.exists()) {
        setData(docSnap.data());
      } else {
        setData(null); // Явно указываем что данных нет
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const updateDoc = async (newData) => {
    // 1. Обновляем Firestore
    await setDoc(doc(db, 'users', userId), newData, { merge: true });
    
    // 2. Локальное сохранение в LS
    localStorage.setItem(`user_${userId}_data`, JSON.stringify({
      ...JSON.parse(localStorage.getItem(`user_${userId}_data`) || '{}'),
      ...newData
    }))};

  return { data, loading, updateDoc };
};