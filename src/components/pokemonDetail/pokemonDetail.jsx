import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import { imageType } from '../../assets/imageType';
import './pokemonDetail.css';


const PokemonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    pokemonService.getOnePokemon(id)
      .then(response => {
        console.log('Received data:', response);
        // Accéder à l'objet pokemon dans la réponse
        if (response.type === 'success' && response.pokemon) {
          setPokemon(response.pokemon);
        } else {
          setError('Format de données invalide');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError('Erreur lors du chargement des détails du pokémon');
        setIsLoading(false);
      });
  }, [id]);


  const handleUpdate = () => {
    navigate(`/pokemon/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pokemon) return <div>Pokemon non trouvé</div>;

  return (
    <div className="pokemon-detail">
      <div className='button-group'>
        <button onClick={handleBack} className="back-button">Retour à la liste</button>
        <button onClick={handleUpdate} className="update-button">Modifier ce pokémon</button>
      </div>
      <h1>{pokemon.name.french}</h1>
      <img src={pokemon.image} alt={pokemon.name.french} />
      <div className="pokemon-types">
        {pokemon.type.map((type) => (
          <span key={type} className="pokemon-type">
            <img src={imageType[type]} alt={type} className="type-icon"/>
          </span>
        ))}
      </div>
      <div className="pokemon-stats">
        <div className="pokemon-stat">
          <span>Attack:</span>
          <span>{pokemon.base['Attack']}</span>
        </div>
        <div className="pokemon-stat">
          <span>Defense:</span>
          <span>{pokemon.base['Defense']}</span>
        </div>
        <div className="pokemon-stat">
          <span>Special Attack:</span>
          <span>{pokemon.base['Sp. Attack']}</span>
        </div>
        <div className="pokemon-stat">
          <span>Special Defense:</span>
          <span>{pokemon.base['Sp. Defense']}</span>
        </div>
        <div className="pokemon-stat">
          <span>HP:</span>
          <span>{pokemon.base['HP']}</span>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetail;