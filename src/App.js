import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import './App.css';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Загрузка...</div>;
  }

  return currentUser ? <MainPage /> : <AuthPage />;
}

export default App;