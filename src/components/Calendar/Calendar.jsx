import './Calendar.css';

export default function Calendar({ history, dailyLimit }) {
  const renderDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateKey = date.toDateString();
      const dayCount = history[dateKey];
      
      let dayStatus = 'empty';
      if (dayCount !== undefined) {
        dayStatus = dayCount <= dailyLimit ? 'success' : 'fail';
      }
      
      days.push(
        <div key={dateKey} className={`calendar-day ${dayStatus}`}>
          {date.getDate()}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="calendar-container">
      <h2>📅 Последние 30 дней</h2>
      <div className="calendar-grid">
        {renderDays()}
      </div>
      <div className="calendar-legend">
        <div><span className="legend success"></span> В лимите</div>
        <div><span className="legend fail"></span> Превышение</div>
        <div><span className="legend empty"></span> Нет данных</div>
      </div>
    </div>
  );
}