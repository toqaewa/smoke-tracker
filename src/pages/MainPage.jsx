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
  const { currentUser, loading: authLoading } = useAuth();
  useSyncData(currentUser?.uid);

  const {
    count,
    dailyLimit,
    history,
    achievements,
    loading: dataLoading,
    error,
    addCigarette,
    removeCigarette,
    updateSettings,
    // getSavedCigarettes = () => 0
  } = useSmokeTracker(currentUser?.uid);

  useEffect(() => {
    console.log('Current data:', 
      JSON.parse(localStorage.getItem(`user_${currentUser?.uid}_data`)));
  }, [currentUser?.uid]);

  // Состояние загрузки
  if (authLoading || dataLoading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  // Обработка ошибок
  if (error) {
    return <div className="error">Ошибка: {error.message}</div>;
  }

  // Проверка авторизации
  if (!currentUser) {
    return <div className="auth-warning">Пожалуйста, войдите в систему</div>;
  }

  // Проверка инициализации данных
  if (!history || typeof count === 'undefined') {
    return <div className="loading">Инициализация данных...</div>;
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

        <div className="savings-section">
          <h2>💸 Ваша экономия</h2>
          <p>Функция расчёта экономии в разработке</p>
          {/* Позже заменить на рабочий вариант */}
        </div>
      </div>

      <LogoutButton/>

    </div>
  );
}