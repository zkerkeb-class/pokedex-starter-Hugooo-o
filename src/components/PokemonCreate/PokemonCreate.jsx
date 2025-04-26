import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import '../pokemonEdit/pokemonEdit.css';
import './PokemonCreate.css';

const PokemonCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pokemon, setPokemon] = useState({
    id: '',
    name: { french: '' },
    type: [],
    base: {
      HP: 0,
      Attack: 0,
      Defense: 0,
      'Sp. Attack': 0,
      'Sp. Defense': 0,
      Speed: 0
    }
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [previewImage, setPreviewImage] = useState('');

  const availableTypes = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", 
    "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", 
    "Steel", "Fairy"
  ];

  // Récupérer le dernier ID et l'incrémenter
  useEffect(() => {
    setIsLoading(true);
    pokemonService.getPokemonList()
      .then(response => {
        if (response && response.pokemons && response.pokemons.length > 0) {
          // Trouver l'ID maximum
          const maxId = Math.max(...response.pokemons.map(p => parseInt(p.id) || 0));
          setPokemon(prev => ({
            ...prev,
            id: maxId + 1
          }));
          console.log('ID calculé automatiquement:', maxId + 1);
          
          // Définir l'image par défaut comme preview
          setPreviewImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${maxId + 1}.png`);
        } else {
          setPokemon(prev => ({
            ...prev,
            id: 1 // Si aucun pokémon n'existe, commencer à 1
          }));
          
          // Définir l'image par défaut comme preview pour ID=1
          setPreviewImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png`);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des pokémons:', err);
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      });
  }, []);

  const handleIdChange = (e) => {
    const newId = e.target.value;
    setPokemon(prev => ({
      ...prev,
      id: newId
    }));
    
    // Mettre à jour l'image par défaut si l'option est activée
    if (useDefaultImage) {
      setPreviewImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${newId}.png`);
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

  useEffect(() => {
    setIsValid(pokemon.id && pokemon.name.french && selectedTypes.length >= 1 && selectedTypes.length <= 2);
  }, [pokemon.id, pokemon.name.french, selectedTypes]);

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convertir l'image en base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
        setPreviewImage(reader.result);
        setUseDefaultImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDefaultImage = () => {
    setUseDefaultImage(true);
    setCustomImage(null);
    setPreviewImage(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!pokemon.id || !pokemon.name.french || selectedTypes.length === 0) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }
  
    try {
      // Structure correcte du nouveau pokémon selon le modèle MongoDB
      const newPokemon = {
        id: parseInt(pokemon.id),
        name: {
          french: pokemon.name.french,
          english: pokemon.name.french // Par défaut même valeur
        },
        type: selectedTypes,
        // Utiliser l'image personnalisée si elle existe, sinon l'image par défaut
        image: useDefaultImage 
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
          : customImage,
        base: {
          HP: parseInt(pokemon.base.HP),
          Attack: parseInt(pokemon.base.Attack),
          Defense: parseInt(pokemon.base.Defense),
          // Ces noms doivent correspondre au modèle MongoDB
          SpecialAttack: parseInt(pokemon.base['Sp. Attack']),
          SpecialDefense: parseInt(pokemon.base['Sp. Defense']),
          Speed: parseInt(pokemon.base.Speed || 0)
        }
      };
      
      console.log('Données envoyées:', newPokemon); // Pour déboguer
      const response = await pokemonService.PostNewPokemon(newPokemon);
      console.log('Réponse:', response); // Pour déboguer
      
      // Forcer un rafraîchissement de la page
      window.location.href = '/';
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError('Erreur lors de la création du pokémon');
    }
  };

  if (isLoading) return <div>Chargement...</div>;
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
              readOnly // Rendre le champ en lecture seule
            />
            <small>ID généré automatiquement</small>
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
          
          <div className="form-image">
            <label>Image du Pokémon</label>
            <div className="image-preview">
              {previewImage && <img src={previewImage} alt="Aperçu du Pokémon" />}
            </div>
            <div className="image-buttons">
              <button 
                type="button" 
                className={`image-button ${useDefaultImage ? 'active' : ''}`} 
                onClick={handleUseDefaultImage}
              >
                Utiliser l'image par défaut
              </button>
              <div className="image-upload-container">
                <label htmlFor="image-upload" className={`image-button ${!useDefaultImage ? 'active' : ''}`}>
                  Télécharger une image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
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
              <div className="stat-input">
                <label htmlFor="Speed">Vitesse</label>
                <input
                  type="number"
                  id="Speed"
                  name="Speed"
                  value={pokemon.base.Speed || 0}
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
          <button type="submit" className="save-button" disabled={!isValid}>
            Créer
          </button>
        </div>
      </form>
    </div>
  );
};

export default PokemonCreate;