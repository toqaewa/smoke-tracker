import { useState, useEffect } from 'react';

export function useSmokeTracker() {
  const [dailyLimit, setDailyLimit] = useState(5);
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState({});
  const [achievements, setAchievements] = useState([]);

  // Загрузка данных при старте
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('smokeTrackerData')) || {};
    setDailyLimit(savedData.dailyLimit || 5);
    setCount(savedData.count || 0);
    setHistory(savedData.history || {});
    setAchievements(savedData.achievements || []);
  }, []);

  // Сохранение данных
  useEffect(() => {
    const data = { dailyLimit, count, history, achievements };
    localStorage.setItem('smokeTrackerData', JSON.stringify(data));
  }, [dailyLimit, count, history, achievements]);

  // Проверка на новый день
  useEffect(() => {
    const today = new Date().toDateString();
    if (!history[today]) {
      if (count > 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toDateString();
        
        if (!history[yesterdayKey]) {
          updateHistory(yesterdayKey, count);
        }
      }
    }
  }, [history, count]);

  const updateHistory = (date, count) => {
    const newHistory = { ...history, [date]: count };
    setHistory(newHistory);
    checkAchievements(newHistory);
  };

  const addCigarette = () => {
    setCount(prev => prev + 1);
  };

  const removeCigarette = () => {
    if (count > 0) setCount(prev => prev - 1);
  };

  const setNewLimit = (e) => {
    const limit = parseInt(e.target.value) || 0;
    setDailyLimit(limit > 0 ? limit : 1);
  };

  const checkAchievements = (hist) => {
    const newAchievements = [...achievements];
    const dates = Object.keys(hist).sort();
    const last7Days = dates.slice(-7).map(date => hist[date]);
    const last30Days = dates.slice(-30).map(date => hist[date]);

    if (last7Days.length >= 7 && last7Days.every(val => val <= dailyLimit)) {
      if (!newAchievements.includes('week_success')) {
        newAchievements.push('week_success');
      }
    }

    if (last30Days.length >= 30 && last30Days.every(val => val <= dailyLimit)) {
      if (!newAchievements.includes('month_success')) {
        newAchievements.push('month_success');
      }
    }

    setAchievements(newAchievements);
  };

  const getSavedCigarettes = () => {
    const dates = Object.keys(history);
    const totalSmoked = dates.reduce((sum, date) => sum + history[date], 0);
    const potentialWithoutLimit = dates.length * dailyLimit;
    return potentialWithoutLimit - totalSmoked;
  };

  return {
    dailyLimit,
    count,
    history,
    achievements,
    addCigarette,
    removeCigarette,
    setNewLimit,
    getSavedCigarettes
  };
}