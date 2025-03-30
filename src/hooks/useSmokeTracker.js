import { useEffect } from 'react';
import { useUserData } from './useUserData';

export const useSmokeTracker = (userId) => {
  const { 
    data, 
    loading, 
    updateDoc 
  } = useUserData(userId);

  // Инициализация данных при первом входе
  useEffect(() => {
    if (!userId || loading || data) return;
    
    const initData = {
      count: 0,
      dailyLimit: 5,
      history: {},
      achievements: [],
      createdAt: new Date().toISOString()
    };
    
    updateDoc(initData);
  }, [userId, loading, data, updateDoc]);

  const addCigarette = async () => {
    const today = new Date().toLocaleDateString();
    const newCount = (data?.count || 0) + 1;
    
    await updateDoc({
      count: newCount,
      [`history.${today}`]: (data?.history[today] || 0) + 1
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
    count: data?.count || 0,
    dailyLimit: data?.dailyLimit || 5,
    history: data?.history || {},
    achievements: data?.achievements || [],
    addCigarette,
    removeCigarette,
    updateSettings,
    getSavedCigarettes,
    loading
  };
};