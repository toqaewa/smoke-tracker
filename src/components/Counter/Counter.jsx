import './Counter.css';

export default function Counter({ count, dailyLimit, onIncrement, onDecrement }) {
  return (
    <div className={`counter ${count >= dailyLimit ? 'limit-reached' : ''}`}>
      <div className="counter-display">
        <span className="current">{count}</span>
        <span className="separator">/</span>
        <span className="limit">{dailyLimit}</span>
      </div>
      <p className="counter-text">
        {count >= dailyLimit 
          ? 'Лимит превышен! 😞' 
          : `Осталось ${dailyLimit - count} из ${dailyLimit}`}
      </p>
      
      <div className="buttons">
        <button onClick={onDecrement} disabled={count === 0}>
          -
        </button>
        <button onClick={onIncrement}>
          +
        </button>
      </div>
    </div>
  );
}