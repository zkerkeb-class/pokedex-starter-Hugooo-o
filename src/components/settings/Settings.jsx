import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import authService from '../services/authService';
import './Settings.css';

/**
 * Composant de paramètres permettant de gérer les droits d'administration.
 * 
 * Note: Nous utilisons imports de react-router au lieu de react-router-dom.
 */
const Settings = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [statusChangeMessage, setStatusChangeMessage] = useState('');
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  // Fonction pour afficher un message temporaire
  const showTemporaryMessage = (message) => {
    setStatusChangeMessage(message);
    setShowStatusMessage(true);
    setTimeout(() => {
      setShowStatusMessage(false);
    }, 3000);
  };

  // Vérification du statut à l'ouverture du modal
  useEffect(() => {
    if (isOpen) {
      // Vérifier le statut admin directement depuis le serveur
      const checkStatus = async () => {
        try {
          if (authService.isAuthenticated()) {
            // Obtenir les données utilisateur
            const user = authService.getCurrentUser();
            setCurrentUser(user);
            
            // Vérifier le statut admin avec le serveur
            const adminStatus = await authService.checkAdminStatus();
            console.log("Settings - Statut admin du serveur:", adminStatus.isAdmin);
            setIsAdmin(adminStatus.isAdmin);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du statut admin:", error);
        }
      };
      
      checkStatus();
    }
  }, [isOpen]);

  // Écouter les changements de statut admin
  useEffect(() => {
    const handleAdminStatusChange = (newStatus) => {
      console.log("Settings - Événement de changement de statut admin reçu:", newStatus);
      setIsAdmin(newStatus);
      if (newStatus) {
        showTemporaryMessage('Félicitations! Vous êtes maintenant administrateur.');
      }
    };
    
    const unsubscribe = authService.subscribeToAdminChanges(handleAdminStatusChange);
    return () => unsubscribe();
  }, []);

  const handleToggleAdmin = async () => {
    if (!currentUser) return;
    
    try {
      setIsToggling(true);
      
      if (!isAdmin) {
        // Si l'utilisateur n'est pas admin, on le promeut
        await authService.promoteSelfToAdmin();
        
        // La mise à jour de l'état sera gérée par l'événement
        console.log("Settings - Promotion demandée, attente de l'événement...");
        
        // Mettre à jour les informations utilisateur locales
        const updatedUser = authService.getCurrentUser();
        setCurrentUser(updatedUser);
      } else {
        // Si on est déjà admin, on informe l'utilisateur
        showTemporaryMessage('Vous êtes déjà administrateur!');
      }
    } catch (error) {
      console.error('Erreur lors de la modification des droits:', error);
      showTemporaryMessage('Une erreur s\'est produite lors de la modification des droits.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres">
      <div className="settings-container">
        {showStatusMessage && (
          <div className="status-message">
            {statusChangeMessage}
          </div>
        )}
        
        {currentUser ? (
          <>
            <div className="user-info">
              <h3>Informations utilisateur</h3>
              <p>Nom d'utilisateur: <strong>{currentUser.username}</strong></p>
              <p>Statut: <strong>{isAdmin ? 'Administrateur' : 'Utilisateur standard'}</strong></p>
            </div>
            
            <div className="admin-toggle">
              <h3>Paramètres d'administration</h3>
              <div className="toggle-container">
                <span>Activer les droits administrateur</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={isAdmin} 
                    onChange={handleToggleAdmin}
                    disabled={isToggling || isAdmin} // Désactivé pendant le chargement ou si déjà admin
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              
              {isAdmin && (
                <p className="admin-notice">
                  Note: Une fois activés, les droits d'administrateur ne peuvent pas être révoqués via cette interface.
                </p>
              )}
            </div>
          </>
        ) : (
          <p>Chargement des informations utilisateur...</p>
        )}
      </div>
    </Modal>
  );
};

export default Settings; 