import './GoogleAuth.css';

export default function GoogleAuth({ onLogin, disabled }) {
    return (
      <button 
        onClick={onLogin} 
        disabled={disabled}
        className="google-auth-btn"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
        Войти через Google
      </button>
    );
  }