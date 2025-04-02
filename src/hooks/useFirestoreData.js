import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  arrayUnion,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestoreData = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка и подписка на данные
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (!docSnap.exists()) {
        return initUserData(userId);
      }
      
      const firestoreData = docSnap.data();
      setData(firestoreData);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // Инициализация данных для нового пользователя
  const initUserData = async (userId) => {
    const defaultData = {
      settings: {
        dailyLimit: 5,
        notifyExcess: true
      },
      stats: {
        currentCount: 0,
        lastUpdated: new Date().toISOString()
      },
      history: {},
      achievements: [],
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', userId), defaultData);
    setData(defaultData);
  };

  // Обновление настроек
  const updateSettings = async (newSettings) => {
    await updateDoc(doc(db, 'users', userId), {
      'settings': { ...data.settings, ...newSettings }
    });
  };

  // Добавление сигареты
  const addCigarette = async () => {
    const today = new Date().toLocaleDateString();
    const newCount = (data.stats.currentCount || 0) + 1;
    
    await updateDoc(doc(db, 'users', userId), {
      'stats.currentCount': newCount,
      'stats.lastUpdated': new Date().toISOString(),
      [`history.${today}`]: (data.history[today] || 0) + 1
    });
    
    checkAchievements(newCount);
  };

  // Проверка достижений
  const checkAchievements = async (currentCount) => {
    if (currentCount <= data.settings.dailyLimit) {
      await updateDoc(doc(db, 'users', userId), {
        achievements: arrayUnion('day_within_limit')
      });
    }
  };

  return { 
    data, 
    loading,
    addCigarette,
    updateSettings
  };
};