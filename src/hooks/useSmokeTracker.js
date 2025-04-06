import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_DATA = {
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
  isInitialized: true
};

export const useSmokeTracker = (userId) => {
  const [data, setData] = useState(() => {
    // Пытаемся загрузить из localStorage при инициализации
    const cached = userId && localStorage.getItem(`user_${userId}_data`);
    return cached ? JSON.parse(cached) : DEFAULT_DATA;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        try {
          if (!docSnap.exists()) {
            initUserData(userId);
            return;
          }

          const firestoreData = docSnap.data();
          setData(firestoreData);
          localStorage.setItem(`user_${userId}_data`, JSON.stringify(firestoreData));
          setLoading(false);
        } catch (err) {
          setError(err);
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe;
  }, [userId]);

  const initUserData = async (userId) => {
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const initialData = {
        ...DEFAULT_DATA,
        history: { [todayKey]: 0 },
        stats: { ...DEFAULT_DATA.stats, lastUpdated: new Date().toISOString() }
      };

      await setDoc(doc(db, 'users', userId), initialData);
      setData(initialData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const addCigarette = async () => {
    if (!data) return; // оберег от undefined

    try {
      // Получаем текущую дату в нужном формате
      const today = new Date().toISOString().split('T')[0];
      
      // Создаём безопасные значения по умолчанию
      const currentStats = data?.stats || {
        currentCount: 0,
        lastUpdated: new Date().toISOString()
      };
      
      const currentHistory = data?.history || {};
      
      // Проверяем, наступил ли новый день
      const lastDate = currentStats.lastUpdated.split('T')[0];
      const isNewDay = lastDate !== today;
      
      // Рассчитываем новые значения
      const newCount = isNewDay ? 1 : (currentStats.currentCount + 1);
      const todayCount = (isNewDay ? 0 : (currentHistory[today] || 0)) + 1;
      
      // Подготавливаем обновления
      const updates = {
        stats: {
          currentCount: newCount,
          lastUpdated: new Date().toISOString()
        },
        history: {
          ...currentHistory,
          [today]: todayCount
        }
      };
      
      // Оптимистичное обновление UI
      setData(prev => ({
        ...prev,
        ...updates
      }));
      
      // Обновление в Firestore
      await updateDoc(doc(db, 'users', userId), updates);
      
    } catch (error) {
      console.error("Ошибка при добавлении сигареты:", error);
      // Можно добавить восстановление состояния или уведомление пользователя
    }
  };

  const removeCigarette = async () => {
    if (!data || !data.stats) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newCount = Math.max((data.stats.currentCount || 0) - 1, 0);

    await updateDoc(doc(db, 'users', userId), {
      'stats.currentCount': newCount,
      [`history.${today}`]: Math.max((data.history?.[today] || 0) - 1, 0)
    });
  };

  const updateSettings = async (newSettings) => {
    await updateDoc(doc(db, 'users', userId), {
      'settings': { ...data.settings, ...newSettings },
    });
  };

  const checkAchievements = async (currentCount) => {
    if (currentCount <= data.settings.dailyLimit) {
      await updateDoc(doc(db, 'users', userId), {
        achievements: arrayUnion('day_within_limit'),
      });
    }
  };

  const getSavedCigarettes = () => {
    if (!data?.history) return 0;
    const totalSmoked = Object.values(data.history).reduce((sum, val) => sum + val, 0);
    const daysTracked = Object.keys(data.history).length;
    return daysTracked * data.settings.dailyLimit - totalSmoked;
  };

  // МИГРАЦИЯ
  useEffect(() => {
    if (!userId) return;
  
    const userRef = doc(db, 'users', userId);
    getDoc(userRef).then(docSnap => {
      if (docSnap.exists()) {
        const oldData = docSnap.data();
        
        // Если обнаружена старая структура
        if ('count' in oldData && !('stats' in oldData)) {
          const migratedData = {
            settings: oldData.settings || DEFAULT_DATA.settings,
            stats: {
              currentCount: oldData.count || 0,
              lastUpdated: oldData.lastUpdated || new Date().toISOString()
            },
            history: oldData.history || {},
            achievements: oldData.achievements || []
          };
          
          setDoc(userRef, migratedData, { merge: true });
        }
      }
    });
  }, [userId]);

  return {
    count: data?.stats?.currentCount || 0,
    dailyLimit: data?.settings?.dailyLimit || 5,
    history: data?.history || {},
    achievements: data?.achievements || [],
    loading,
    addCigarette: data && userId ? addCigarette : null,
    removeCigarette,
    updateSettings,
    getSavedCigarettes,
  };
};