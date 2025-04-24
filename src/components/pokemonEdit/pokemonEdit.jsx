import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import './pokemonEdit.css';

const PokemonEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const availableTypes = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
    "Steel", "Fairy"
  ];
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    pokemonService.getOnePokemon(id)
      .then(response => {
        console.log('API Response:', response);
        // Utiliser la même approche que dans pokemonDetail
        const pokemonData = response?.pokemon?.pokemon || response?.pokemon || response;
        console.log('Pokemon Data:', pokemonData);
        
        if (pokemonData) {
          // Assurez-vous que les données sont formatées correctement
          const formattedPokemon = {
            ...pokemonData,
            name: pokemonData.name || { french: '' },
            base: pokemonData.base || {
              HP: 0,
              Attack: 0,
              Defense: 0,
              'Sp. Attack': 0,
              'Sp. Defense': 0
            },
            type: Array.isArray(pokemonData.type) ? pokemonData.type : []
          };
          
          console.log('Formatted Pokemon:', formattedPokemon);
          setPokemon(formattedPokemon);
          setSelectedTypes(formattedPokemon.type);
          console.log('Selected Types:', formattedPokemon.type);
        } else {
          setError('Format de données invalide');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pokemon:', err);
        setError('Erreur lors du chargement du pokémon');
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setIsValid(selectedTypes.length >= 1 && selectedTypes.length <= 2);
  }, [selectedTypes]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const updatedPokemon = {
        ...pokemon,
        type: selectedTypes
      };
      await pokemonService.UpdatePokemon(id, updatedPokemon);
      navigate(`/pokemon/${id}`);
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    }
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

  const handleCancel = () => {
    navigate(`/pokemon/${id}`);
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

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pokémon ?')) {
      try {
        await pokemonService.DeletePokemon(id);
        navigate('/');
      } catch (err) {
        setError('Erreur lors de la suppression du pokémon');
      }
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!pokemon) return <div>Pokemon non trouvé</div>;

  console.log('Rendering with pokemon:', pokemon);
  console.log('Selected Types:', selectedTypes);

  return (
    <div className="pokemon-edit">
      <h1>Modifier {pokemon.name && pokemon.name.french ? pokemon.name.french : 'Pokémon'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-name">
            <label>Nom (Français)</label>
            <input type="text" name="french" value={pokemon.name && pokemon.name.french ? pokemon.name.french : ''} onChange={handleChange}/>
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
                    disabled={selectedTypes.length >= 2 && !selectedTypes.includes(type)}
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
                  value={pokemon.base && pokemon.base.HP !== undefined ? pokemon.base.HP : 0}
                  onChange={handleStatsChange}
                  min="0"
                  max="1000"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Attack">Attaque</label>
                <input
                  type="number"
                  id="Attack"
                  name="Attack"
                  value={pokemon.base?.Attack || 0}
                  onChange={handleStatsChange}
                  min="0"
                  max="1000"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Defense">Défense</label>
                <input
                  type="number"
                  id="Defense"
                  name="Defense"
                  value={pokemon.base?.Defense || 0}
                  onChange={handleStatsChange}
                  min="0"
                  max="1000"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Sp. Attack">Attaque Spéciale</label>
                <input
                  type="number"
                  id="Sp. Attack"
                  name="Sp. Attack"
                  value={pokemon.base?.['Sp. Attack'] || 0}
                  onChange={handleStatsChange}
                  min="0"
                  max="1000"
                />
              </div>
              <div className="stat-input">
                <label htmlFor="Sp. Defense">Défense Spéciale</label>
                <input
                  type="number"
                  id="Sp. Defense"
                  name="Sp. Defense"
                  value={pokemon.base?.['Sp. Defense'] || 0}
                  onChange={handleStatsChange}
                  min="0"
                  max="1000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button type="button" onClick={handleCancel} className="cancel-button">
            Annuler
          </button>
          <button type="submit" className="save-button" disabled={!isValid}>
            Sauvegarder
          </button>
          <button type="button" onClick={handleDelete} className="delete-button">
            Supprimer
          </button>
        </div>
      </form>
    </div>
  );
};

export default PokemonEdit;