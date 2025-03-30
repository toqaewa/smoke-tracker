import './Achievements.css';

export default function Achievements({ achievements }) {
  return (
    <div className="achievements-section">
      <h2>🏆 Достижения</h2>
      {achievements.length > 0 ? (
        <div className="achievements-list">
          {achievements.includes('week_success') && (
            <div className="achievement">Неделя без превышения лимита!</div>
          )}
          {achievements.includes('month_success') && (
            <div className="achievement">Месяц без превышения лимита!</div>
          )}
        </div>
      ) : (
        <p>Пока нет достижений. Продолжайте работать над собой!</p>
      )}
    </div>
  );
}