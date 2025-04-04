import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import '../pokemonEdit/pokemonEdit.css';

const PokemonCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [pokemon, setPokemon] = useState({
    id: '',
    name: { french: '' },
    type: [],
    base: {
      HP: 0,
      Attack: 0,
      Defense: 0,
      'Sp. Attack': 0,
      'Sp. Defense': 0
    }
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isValid, setIsValid] = useState(false);

  const availableTypes = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
    "Steel", "Fairy"
  ];

  const handleIdChange = (e) => {
    setPokemon(prev => ({
      ...prev,
      id: e.target.value
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPokemon(prev => ({
      ...prev,
      name: {
        ...prev.name,
        [name]: value
      }
    }));
  };

  const handleTypeChange = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else if (prev.length < 2) {
        return [...prev, type];
      }
      return prev;
    });
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value);
    if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 255) {
      setPokemon(prev => ({
        ...prev,
        base: {
          ...prev.base,
          [name]: numberValue
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!pokemon.id || !pokemon.name.french || selectedTypes.length === 0) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }
  
    try {
      // Structure correcte du nouveau pokémon
      const newPokemon = {
        id: parseInt(pokemon.id),
        name: {
          french: pokemon.name.french,
          english: pokemon.name.french // Par défaut même valeur
        },
        type: selectedTypes,
        base: {
          HP: parseInt(pokemon.base.HP),
          Attack: parseInt(pokemon.base.Attack),
          Defense: parseInt(pokemon.base.Defense),
          'Sp. Attack': parseInt(pokemon.base['Sp. Attack']),
          'Sp. Defense': parseInt(pokemon.base['Sp. Defense'])
        }
      };
      
      console.log('Données envoyées:', newPokemon); // Pour déboguer
      const response = await pokemonService.PostNewPokemon(newPokemon);
      console.log('Réponse:', response); // Pour déboguer
      navigate('/');
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors de la création du pokémon');
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="pokemon-edit">
      <h1>Créer un nouveau Pokémon</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-name">
            <label>ID du Pokémon</label>
            <input
              type="number"
              name="id"
              value={pokemon.id}
              onChange={handleIdChange}
              min="1"
              required
            />
          </div>
          <div className="form-name">
            <label>Nom (Français)</label>
            <input
              type="text"
              name="french"
              value={pokemon.name.french}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-types">
            <label>Types (sélectionnez 1 ou 2 types)</label>
            <div className="types-grid">
              {availableTypes.map((type) => (
                <div key={type} className="type-option">
                  <input
                    type="checkbox"
                    id={type}
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeChange(type)}
                    disabled={!selectedTypes.includes(type) && selectedTypes.length >= 2}
                  />
                  <label htmlFor={type}>{type}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Statistiques</label>
            <div className="stats-grid">
              <div className="stat-input">
                <label htmlFor="HP">Points de vie (HP)</label>
                <input
                  type="number"
                  id="HP"
                  name="HP"
                  value={pokemon.base.HP}
                  onChange={handleStatsChange}
                  min="0"
                  max="255"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Attack">Attaque</label>
                <input
                  type="number"
                  id="Attack"
                  name="Attack"
                  value={pokemon.base.Attack}
                  onChange={handleStatsChange}
                  min="0"
                  max="255"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Defense">Défense</label>
                <input
                  type="number"
                  id="Defense"
                  name="Defense"
                  value={pokemon.base.Defense}
                  onChange={handleStatsChange}
                  min="0"
                  max="255"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Sp. Attack">Attaque Spéciale</label>
                <input
                  type="number"
                  id="Sp. Attack"
                  name="Sp. Attack"
                  value={pokemon.base['Sp. Attack']}
                  onChange={handleStatsChange}
                  min="0"
                  max="255"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Sp. Defense">Défense Spéciale</label>
                <input
                  type="number"
                  id="Sp. Defense"
                  name="Sp. Defense"
                  value={pokemon.base['Sp. Defense']}
                  onChange={handleStatsChange}
                  min="0"
                  max="255"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/')} className="cancel-button">
            Annuler
          </button>
          <button type="submit" className="save-button">
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default PokemonCreate;