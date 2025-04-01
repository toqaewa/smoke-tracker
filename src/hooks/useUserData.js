import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const useUserData = (userId) => {
  const [data, setData] = useState(() => {
    // здесь сразу инициализирую состояние из LocalStorage
    if (!userId) return null;
    const savedData = localStorage.getItem(`user_${userId}_data`);
    return savedData ? JSON.parse(savedData) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // // проверочка локал стораджа при инициализации
    // const savedData = localStorage.getItem(`user_${userId}_data`);
    // if (savedData) {
    //   setData(JSON.parse(savedData));
    //   setLoading(false);
    // }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        setData(firestoreData);
        localStorage.setItem(`user_${userId}_data`, JSON.stringify(firestoreData)); // как только получаю данные из Firestore - сохраняю в лс
      } else {
        setData(null); // Явно указываем что данных нет
        localStorage.removeItem(`user_${userId}_data`); // может это все ломает?
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const updateDoc = async (newData) => {
    const mergedData = { ...data, ...newData };
    // оптимистичное обновление LocalStorage
    localStorage.setItem(`user_${userId}_data`, JSON.stringify(mergedData));
    setData(mergedData);
    
    try {
      await setDoc(doc(db, 'users', userId), mergedData, { merge: true });
    } catch (error) {
      console.error("Ошибка синхронизации с Firestore:", error);
    }
  };

  return { data, loading, updateDoc };
};