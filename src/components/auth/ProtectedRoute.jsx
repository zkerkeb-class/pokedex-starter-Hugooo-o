import { Navigate } from 'react-router';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si pas de token, redirection vers la page de login
    return <Navigate to="/login" />;
  }

  // Si token présent, affiche le composant enfant
  return children;
};

export default ProtectedRoute;