import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

const ACHIEVEMENTS_CONFIG = {
  dayWithinLimit: {
    condition: (count, dailyLimit) => count <= dailyLimit,
    name: 'day_within_limit'
  },
  weekNonSmoker: {
    condition: (history, dailyLimit) => 
      Object.values(history).reduce((sum, val) => sum + val, 0) === 0,
    name: 'week_non_smoker'
  }
}

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
      const today = new Date().toISOString().split('T')[0];
      
      const currentStats = data?.stats || {
        currentCount: 0,
        lastUpdated: new Date().toISOString()
      };
      
      const currentHistory = data?.history || {};
      
      const lastDate = currentStats.lastUpdated.split('T')[0];
      const isNewDay = lastDate !== today;
      
      const newCount = isNewDay ? 1 : (currentStats.currentCount + 1);
      const todayCount = (isNewDay ? 0 : (currentHistory[today] || 0)) + 1;
      
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

      const newAchievements = Object.values(ACHIEVEMENTS_CONFIG)
        .filter(({ id, check }) => 
          !data.achievements?.includes(id) && check(newCount, data, isNewDay))
        .map(({ id }) => id);

      if (newAchievements.length > 0) {
        updates.achievements = [...(data.achievements || []), ...newAchievements];
      }
      
      // Оптимистичное обновление
      setData(prev => ({
        ...prev,
        ...updates
      }));
      await updateDoc(doc(db, 'users', userId), updates);
      
    } catch (error) {
      console.error("Ошибка при добавлении сигареты:", error);
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

  // const checkAchievements = async (newData) => {
  //   try {
  //     const { currentCount } = newData.stats;
  //     const { dailyLimit } = newData.settings;
  //     const { history } = newData;
      
  //     const newAchievements = [];
      
  //     // Проверяем условия достижений
  //     if (ACHIEVEMENTS_CONFIG.dayWithinLimit.condition(currentCount, dailyLimit)) {
  //       newAchievements.push(ACHIEVEMENTS_CONFIG.dayWithinLimit.name);
  //     }
      
  //     if (history && ACHIEVEMENTS_CONFIG.weekNonSmoker.condition(history, dailyLimit)) {
  //       newAchievements.push(ACHIEVEMENTS_CONFIG.weekNonSmoker.name);
  //     }
      
  //     // Если есть новые достижения - обновляем
  //     if (newAchievements.length > 0) {
  //       await updateDoc(doc(db, 'users', userId), {
  //         achievements: arrayUnion(...newAchievements)
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Ошибка проверки достижений:', error);
  //   }
  // };

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
    error,
    addCigarette: data && userId ? addCigarette : null,
    removeCigarette,
    updateSettings,
    getSavedCigarettes,
  };
};