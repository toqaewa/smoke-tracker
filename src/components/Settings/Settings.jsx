import { useState } from 'react';
import { useFirestoreData } from '../hooks/useFirestoreData';

export default function Settings({ userId }) {
  const { data, updateSettings } = useFirestoreData(userId);
  const [limit, setLimit] = useState(data?.settings.dailyLimit || 5);
  
  const handleSave = () => {
    updateSettings({ dailyLimit: limit });
  };
  
  return (
    <div>
      <input 
        type="number" 
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
      />
      <button onClick={handleSave}>Сохранить</button>
    </div>
  );
}