import { useState } from 'react';
import './AuthForm.css';

export default function AuthForm({ onSubmit, isLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">
        {isLogin ? 'Войти' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}