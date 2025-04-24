import { useState } from 'react';
import { useNavigate } from 'react-router';
import authService from '../services/authService';
import './LoginRegister.css';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting registration with:', userData);
      await authService.register(userData.username, userData.password);
      console.log('Registration successful');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', {
        response: err.response?.data,
        status: err.response?.status,
        fullError: err
      });
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        "Erreur lors de l'inscription"
      );
    }
};

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Inscription</h2>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
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
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;