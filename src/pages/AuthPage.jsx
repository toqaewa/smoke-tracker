import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/Auth/AuthForm';
import GoogleAuth from '../components/Auth/GoogleAuth';
import './AuthPage.css';

export default function AuthPage() {
  const { logIn, signUp, logInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async (email, password) => {
    try {
      if (isLogin) {
        await logIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await logInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AuthForm 
          onSubmit={handleAuth}
          isLogin={isLogin}
          error={error}
        />
        
        <GoogleAuth 
          onLogin={handleGoogleAuth}
          disabled={false}
        />
        
        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
}