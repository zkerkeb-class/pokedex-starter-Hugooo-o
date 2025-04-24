import { Link, useLocation } from 'react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import Settings from '../settings/Settings';
import authService from '../services/authService';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [navbarHeight, setNavbarHeight] = useState(0);
  const location = useLocation();
  const navbarRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Calculer la hauteur de la navbar pour le padding
  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }

    // Réinitialiser la navbar quand la page change
    setIsVisible(true);
    setPrevScrollPos(0);
  }, [location.pathname]);

  // Gérer l'apparition/disparition de la navbar lors du scroll
  useEffect(() => {
    const handleScroll = () => {
      // Annuler le timeout précédent pour éviter les appels en rafale
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Utiliser requestAnimationFrame pour limiter les opérations DOM
      scrollTimeout.current = setTimeout(() => {
        const currentScrollPos = window.scrollY;
        
        // Toujours visible au sommet de la page (position 0)
        if (currentScrollPos <= 0) {
          setIsVisible(true);
          setPrevScrollPos(currentScrollPos);
          return;
        }
        
        const isScrollingDown = currentScrollPos > prevScrollPos;
        const scrollDelta = Math.abs(currentScrollPos - prevScrollPos);
        
        // Ne réagir qu'aux changements significatifs (plus de 10px)
        if (scrollDelta > 10) {
          // Disparaître lors du scroll vers le bas, réapparaître lors du scroll vers le haut
          if (isScrollingDown) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          
          setPrevScrollPos(currentScrollPos);
        }
      }, 50); // Délai court pour débouncer sans sensation de retard
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Nettoyage
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [prevScrollPos, navbarHeight]);

  // Fonction pour vérifier le statut administrateur
  const checkAdminStatus = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        setIsAdmin(false);
        return;
      }
      
      // Vérifier directement avec le serveur au lieu de vérifier localement d'abord
      const serverStatus = await authService.checkAdminStatus();
      console.log("Navbar - Vérification serveur du statut admin:", serverStatus.isAdmin);
      setIsAdmin(serverStatus.isAdmin);
    } catch (error) {
      console.error("Erreur vérification statut admin:", error);
    }
  }, []);

  // Vérifier l'authentification et le statut admin à chaque changement de route
  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Vérifier le statut admin si l'utilisateur est connecté
    if (token) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [location.pathname, checkAdminStatus]);

  // S'abonner aux changements de statut admin
  useEffect(() => {
    // Fonction appelée quand le statut admin change
    const handleAdminStatusChange = (newStatus) => {
      console.log("Navbar - Événement de changement de statut admin reçu:", newStatus);
      setIsAdmin(newStatus);
    };
    
    // S'abonner aux changements
    const unsubscribe = authService.subscribeToAdminChanges(handleAdminStatusChange);
    
    // Se désabonner quand le composant est démonté
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    window.location.reload();
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    // Vérifier si le statut admin a changé
    checkAdminStatus();
  };

  return (
    <>
      <nav 
        ref={navbarRef}
        className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}
      >
        <div className="nav-brand">
          {location.pathname !== '/login' && (
            <>
              <Link to="/my-pokemons" className="nav-link">
                Mes Pokémons
              </Link>
              {isAuthenticated && (
                <Link to="/booster" className="nav-link">
                  Booster
                </Link>
              )}
              <Link to="/" className="nav-link">
                Tout le Pokédex
              </Link>
            </>
          )}
        </div>
        <div className="nav-links">
          {isAuthenticated ? (
            <>
              <span className="admin-status">
                {isAdmin ? '👑 Admin' : '👤 Utilisateur'}
              </span>
              <button onClick={openSettings} className="nav-link settings-link">
                Paramètres
              </button>
              <button onClick={handleLogout} className="nav-link">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              {location.pathname === '/login' ? (
                <Link to="/register" className="nav-link">
                  Inscription
                </Link>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Connexion
                  </Link>
                  <Link to="/register" className="nav-link">
                    Inscription
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
      {/* Spacer pour empêcher le contenu de sauter quand la navbar est en fixed position */}
      <div style={{ height: isVisible ? 0 : 0 }} />
      
      <Settings isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};

export default Navbar;