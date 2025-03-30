import React from 'react';
import './App.css';
import Counter from './components/Counter/Counter';
import LimitControl from './components/LimitControl/LimitControl';
import Calendar from './components/Calendar/Calendar';
import Achievements from './components/Achievements/Achievements';
import { useSmokeTracker } from './hooks/useSmokeTracker';

function App() {
  const {
    dailyLimit,
    count,
    history,
    achievements,
    addCigarette,
    removeCigarette,
    setNewLimit,
    getSavedCigarettes
  } = useSmokeTracker();

  return (
    <div className="app">
      <header>
        <h1>🚬 Smoke Tracker</h1>
        <p>Следи за привычкой и уменьшай потребление</p>
      </header>

      <LimitControl 
        dailyLimit={dailyLimit}
        onLimitChange={setNewLimit}
      />

      <Counter 
        count={count}
        dailyLimit={dailyLimit}
        onIncrement={addCigarette}
        onDecrement={removeCigarette}
      />

      <Calendar 
        history={history}
        dailyLimit={dailyLimit}
      />

      <Achievements 
        achievements={achievements}
      />

      <div className="savings">
        <h2>💰 Сэкономлено</h2>
        <p>Вы сэкономили {getSavedCigarettes()} сигарет по сравнению с вашим лимитом!</p>
      </div>
    </div>
  );
}

export default App;