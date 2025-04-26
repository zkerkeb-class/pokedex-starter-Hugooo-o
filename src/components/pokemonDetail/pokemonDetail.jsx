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

  // Vérification des droits d'administration
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const serverAdminStatus = await authService.checkAdminStatus();
        setIsAdmin(serverAdminStatus.isAdmin);
      } catch (error) {
        // Erreur silencieuse
      }
    };

    checkAdminStatus();
  }, []);

  // Récupération des données du Pokémon
  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await pokemonService.getOnePokemon(id);
        
        // Extraire les données du Pokémon de différents formats possibles de réponse
        const data = response?.pokemon?.pokemon || response?.pokemon || response;
        setPokemon(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonData();
  }, [id]);

  useEffect(() => {
    // S'abonner aux changements de statut admin
    const unsubscribe = authService.subscribeToAdminChanges((newStatus) => {
      setIsAdmin(newStatus);
    });
    
    // Se désabonner lorsque le composant est démonté
    return () => unsubscribe();
  }, []);

  const handleUpdate = () => navigate(`/pokemon/${id}/edit`);
  const handleBack = () => navigate('/');
  
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pokémon ?')) {
      try {
        await pokemonService.DeletePokemon(id);
        navigate('/');
      } catch (error) {
        setError('Erreur lors de la suppression');
      }
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