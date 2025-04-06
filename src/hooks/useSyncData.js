import { useEffect } from 'react';

export const useSyncData = (userId) => {
  useEffect(() => {
    if (!userId) return;

    // Синхронизация при изменении онлайн-статуса
    const handleOnline = () => {
      console.log('Онлайн - синхронизация с Firestore');
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);
};