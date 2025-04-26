import { useState } from 'react';
import { useNavigate } from 'react-router';
import authService from '../services/authService';
import './LoginRegister.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(credentials.username, credentials.password);
      navigate('/'); // Redirect to home page after login
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/favicon.png" alt="Pokédex Logo" />
          <h1>Pokédex</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Connexion</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;