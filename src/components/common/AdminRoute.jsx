import { Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import authService from '../services/authService';

// Composant pour protéger les routes réservées aux administrateurs
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Vérifier d'abord localement
        if (!authService.isAuthenticated()) {
          setLoading(false);
          return;
        }

        // Puis vérifier avec le serveur
        const adminStatus = await authService.checkAdminStatus();
        setIsAdmin(adminStatus.isAdmin);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la vérification des droits:', error);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>Vérification des droits d'accès...</div>;
  }

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 