import { useAuth } from '../hooks/useAuth';
import { useSyncData } from '../hooks/useSyncData.js';
import { useSmokeTracker } from '../hooks/useSmokeTracker';
import Counter from '../components/Counter/Counter';
import Calendar from '../components/Calendar/Calendar';
import Achievements from '../components/Achievements/Achievements';
import LogoutButton from '../components/Auth/LogoutButton.jsx'
import './MainPage.css';
import { useEffect } from 'react';

export default function MainPage() {
  const { currentUser } = useAuth();
  useSyncData(currentUser?.uid);
  const {
    count,
    dailyLimit,
    history,
    achievements,
    loading,
    addCigarette,
    removeCigarette,
    updateSettings,
    getSavedCigarettes
  } = useSmokeTracker(currentUser?.uid);

  useEffect(() => {
    console.log('Current data:', 
      JSON.parse(localStorage.getItem(`user_${currentUser?.uid}_data`)));
  }, [currentUser?.uid]);

  // Состояние загрузки
  if (loading || !history) {
    return <div className="loading">Загрузка данных...</div>;
  }

  // Проверка авторизации
  if (!currentUser) {
    return <div className="auth-warning">Пожалуйста, войдите в систему</div>;
  }

  return (
    <div className="main-page">
      <h1 className="app-title">🚬 Smoke Tracker</h1>
      
      <div className="content-container">
        <div className="limit-control">
          <label>
            Дневной лимит:
            <input 
              type="number" 
              value={dailyLimit}
              onChange={(e) => updateSettings({ dailyLimit: Number(e.target.value) })}
              min="1"
            />
          </label>
        </div>

        <Counter 
          count={count}
          dailyLimit={dailyLimit}
          onIncrement={addCigarette}
          onDecrement={removeCigarette}
        />

        <div className="stats-section">
          <Calendar history={history} dailyLimit={dailyLimit} />
          <Achievements achievements={achievements} />
        </div>

        <div className="savings-card">
          <h3>Ваша экономия</h3>
          <p>Сэкономлено денег: {(getSavedCigarettes()-count)*200} рублей</p>
        </div>
      </div>

      <LogoutButton/>

    </div>
  );
}