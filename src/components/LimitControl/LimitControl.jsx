import './LimitControl.css';

export default function LimitControl({ dailyLimit, onLimitChange }) {
  return (
    <div className="limit-control">
      <label>
        Дневной лимит:
        <input 
          type="number" 
          value={dailyLimit} 
          onChange={onLimitChange}
          min="1"
        />
      </label>
    </div>
  );
}