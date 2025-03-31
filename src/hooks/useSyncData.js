import { useEffect } from 'react';
import { auth } from '../firebase';

export const useSyncData = (userId) => {
  useEffect(() => {
    if (!userId) return;

    // Восстановление из LS при загрузке
    const savedData = localStorage.getItem(`user_${userId}_data`);
    if (savedData) {
      console.log('Восстановлено из LS:', JSON.parse(savedData));
    }

    // Синхронизация при изменении онлайн-статуса
    const handleOnline = () => {
      console.log('Онлайн - синхронизация с Firestore');
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);
};