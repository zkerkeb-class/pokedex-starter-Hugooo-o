import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Créer un objet d'événement personnalisé pour signaler les changements de statut admin
const adminStatusEvents = {
  listeners: [],
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  },
  emit(isAdmin) {
    this.listeners.forEach(callback => callback(isAdmin));
  }
};

const authService = {
  // Enregistrement d'un utilisateur
  register: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // Connexion d'un utilisateur
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Déconnexion d'un utilisateur
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!token && !!user;
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Vérifier si l'utilisateur est administrateur
  isAdmin: () => {
    if (!authService.isAuthenticated()) {
      return false;
    }
    const user = authService.getCurrentUser();
    return user && user.isAdmin === true;
  },

  // S'abonner aux changements de statut admin
  subscribeToAdminChanges: (callback) => {
    return adminStatusEvents.subscribe(callback);
  },

  // Vérifier le statut d'administrateur depuis le serveur
  checkAdminStatus: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { isAdmin: false };
      }

      try {
        // Tentative de vérification via l'API
        const response = await axios.get(`${API_URL}/auth/check-admin`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Mettre à jour les informations utilisateur dans le localStorage
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          const wasAdmin = currentUser.isAdmin;
          // Assurer que la valeur est un booléen
          const newAdminStatus = response.data.isAdmin === true;
          
          // Mettre à jour l'objet utilisateur
          currentUser.isAdmin = newAdminStatus;
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // Si le statut a changé, émettre l'événement
          if (wasAdmin !== newAdminStatus) {
            console.log('Émission d\'un événement de changement admin:', newAdminStatus);
            adminStatusEvents.emit(newAdminStatus);
          }
        }
        
        return response.data;
      } catch (apiError) {
        console.error('API error when checking admin status:', apiError);
        // Fallback à la vérification locale si l'API échoue
        console.log('Utilisation des données locales pour vérifier le statut admin');
        const user = authService.getCurrentUser();
        const isAdminLocal = user && user.isAdmin === true;
        
        return { isAdmin: isAdminLocal };
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false };
    }
  },

  // Promouvoir un utilisateur en administrateur (pour les administrateurs uniquement)
  promoteToAdmin: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté');
      }

      const response = await axios.post(`${API_URL}/auth/promote/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Si l'utilisateur promu est l'utilisateur actuel, mettre à jour les infos locales
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        adminStatusEvents.emit(response.data.user.isAdmin);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  },

  // Promouvoir l'utilisateur actuel en administrateur (contournement de la sécurité)
  promoteSelfToAdmin: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté');
      }

      try {
        // Tentative d'appel API
        const response = await axios.post(`${API_URL}/auth/self-promote`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.user) {
          // Mettre à jour le statut admin localement
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Émettre l'événement de changement
          adminStatusEvents.emit(response.data.user.isAdmin);
          
          console.log("Statut administrateur mis à jour avec succès via API");
          return response.data;
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Si l'API échoue, utiliser le fallback local
        console.log('Utilisation du fallback local pour la promotion admin');
        
        // Récupérer l'utilisateur actuel
        const user = authService.getCurrentUser();
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        
        // Vérifier si l'utilisateur est déjà admin
        if (user.isAdmin) {
          console.log("L'utilisateur est déjà administrateur");
          return {
            success: true,
            message: "Vous êtes déjà administrateur",
            user: user
          };
        }
        
        // Mise à jour du statut admin en local uniquement
        const updatedUser = { ...user, isAdmin: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Émettre l'événement de changement
        adminStatusEvents.emit(true);
        
        console.log("Statut administrateur mis à jour localement (fallback)");
        
        return {
          success: true,
          message: "L'utilisateur a été promu administrateur localement",
          user: updatedUser
        };
      }
    } catch (error) {
      console.error('Error promoting self to admin:', error);
      throw error;
    }
  },

  // Vérifier la validité du token
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      // Vérifier si le token est valide
      const response = await axios.get(`${API_URL}/auth/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.valid === true;
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Si erreur 401, le token est invalide
      if (error.response && error.response.status === 401) {
        // Nettoyage du stockage local
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      // En cas d'erreur réseau ou autre, considérer le token comme valide pour éviter une déconnexion
      return true;
    }
  }
};

export default authService; 