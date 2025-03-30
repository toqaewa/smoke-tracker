import './LogoutButton.css';
import { useAuth } from '../../hooks/useAuth';

export default function LogoutButton() {
  const { logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-btn">
      Выйти
    </button>
  );
}