import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import authService from '../services/authService';
import { imageType } from '../../assets/imageType';
import './pokemonDetail.css';

const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fonction séparée pour vérifier le statut admin
  const checkAdminStatus = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        setIsAdmin(false);
        return;
      }

      // Vérification avec le serveur directement, ignorer le cache local
      const serverAdminStatus = await authService.checkAdminStatus();
      console.log("PokemonDetail - Statut admin (serveur):", serverAdminStatus.isAdmin);
      setIsAdmin(serverAdminStatus.isAdmin === true);
    } catch (error) {
      console.error("Erreur lors de la vérification du statut admin:", error);
      setIsAdmin(false);
    }
  }, []);

  // Charger les données du Pokémon et vérifier le statut admin
  useEffect(() => {
    // Vérifier le statut admin
    checkAdminStatus();
    
    // Chargement des détails du pokémon
    setIsLoading(true);
    pokemonService.getOnePokemon(id)
      .then(response => {
        console.log('Received response:', response);
        // Accéder au bon niveau de la structure
        const pokemonData = response?.pokemon?.pokemon || response?.pokemon;
        if (pokemonData) {
          setPokemon(pokemonData);
          console.log('Pokemon data set:', pokemonData);
        } else {
          setError('Pokemon non trouvé');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setError('Erreur lors du chargement des détails du pokémon');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, checkAdminStatus]);

  // S'abonner aux changements de statut admin
  useEffect(() => {
    const handleAdminStatusChange = (newStatus) => {
      console.log("PokemonDetail - Événement de changement de statut admin reçu:", newStatus);
      setIsAdmin(newStatus);
    };
    
    const unsubscribe = authService.subscribeToAdminChanges(handleAdminStatusChange);
    return () => unsubscribe();
  }, []);

  const handleUpdate = () => navigate(`/pokemon/${id}/edit`);
  const handleBack = () => navigate('/');
  
  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${pokemon.name.french} ?`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await pokemonService.DeletePokemon(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting pokemon:', error);
      setError('Erreur lors de la suppression');
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (isDeleting) return <div>Suppression en cours...</div>;
  if (error) return <div>{error}</div>;
  if (!pokemon) return <div>Pokemon non trouvé</div>;

  return (
    <div className="pokemon-detail">
      <div className='button-group'>
        <button onClick={handleBack} className="back-button">
          Retour à la liste
        </button>
        {isAdmin && (
          <>
            <button onClick={handleUpdate} className="update-button">
              Modifier ce pokémon
            </button>
            <button onClick={handleDelete} className="delete-button">
              Supprimer ce pokémon
            </button>
          </>
        )}
      </div>
      {pokemon.name && pokemon.name.french && (
        <>
          <h1>{pokemon.name.french}</h1>
          <img src={pokemon.image} alt={pokemon.name.french} />
        </>
      )}
      <div className="pokemon-types">
        {Array.isArray(pokemon.type) && pokemon.type.map((type) => (
          <span key={type} className="pokemon-type">
            <img src={imageType[type]} alt={type} className="type-icon"/>
          </span>
        ))}
      </div>
      {pokemon.base && (
        <div className="pokemon-stats">
          <div className="pokemon-stat">
            <span>HP:</span>
            <span>{pokemon.base.HP || 0}</span>
          </div>
          <div className="pokemon-stat">
            <span>ATK:</span>
            <span>{pokemon.base.Attack || 0}</span>
          </div>
          <div className="pokemon-stat">
            <span>DEF:</span>
            <span>{pokemon.base.Defense || 0}</span>
          </div>
          <div className="pokemon-stat">
            <span>SP.ATK:</span>
            <span>{pokemon.base['Sp. Attack'] || pokemon.base.SpecialAttack || 0}</span>
          </div>
          <div className="pokemon-stat">
            <span>SP.DEF:</span>
            <span>{pokemon.base['Sp. Defense'] || pokemon.base.SpecialDefense || 0}</span>
          </div>
          <div className="pokemon-stat">
            <span>SPD:</span>
            <span>{pokemon.base.Speed || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PokemonDetail;