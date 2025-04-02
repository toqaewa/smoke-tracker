// import { useEffect } from 'react';
import { useUserData } from './useUserData';

export const useSmokeTracker = (userId) => {
  const { 
    data, 
    loading, 
    updateDoc 
  } = useUserData(userId);

  // // Инициализация данных при первом входе
  // useEffect(() => {
  //   if (loading || !userId || data) return;

  //   const today = new Date().toLocaleDateString();
  //   const initData = {
  //     count: 0,
  //     dailyLimit: 5,
  //     history: { [today]: 0 },
  //     achievements: [],
  //     lastUpdated: new Date().toISOString(),
  //     isInitialized: true // Маркер инициализации
  //   };
    
  //   updateDoc(initData);
  // }, [userId, loading, data, updateDoc]);

  const addCigarette = async () => {
    if (!userId) return;

    const today = new Date().toLocaleDateString();
    const newCount = (data?.count || 0) + 1;
    
    await updateDoc({
      count: newCount,
      [`history.${today}`]: (data?.history[today] || 0) + 1,
      lastUpdated: new Date().toISOString()
    });
  };

  const removeCigarette = async () => {
    if (data?.count > 0) {
      await updateDoc({
        count: data.count - 1
      });
    }
  };

  const updateSettings = async (newSettings) => {
    await updateDoc({
      dailyLimit: newSettings.dailyLimit
    });
  };

  const getSavedCigarettes = () => {
    if (!data?.history) return 0;
    const totalSmoked = Object.values(data.history).reduce((sum, val) => sum + val, 0);
    const daysTracked = Object.keys(data.history).length;
    return (daysTracked * data.dailyLimit) - totalSmoked;
  };

  return {
    count: data?.count,
    dailyLimit: data?.dailyLimit,
    history: data?.history,
    achievements: data?.achievements,
    addCigarette,
    removeCigarette,
    updateSettings,
    getSavedCigarettes,
    loading
  };
};