import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../searchBar/searchBar';
import TypeFilter from '../typeFilter/typeFilter';
import './pokemonList.css'; 
import { imageType } from '../../assets/imageType';
import { useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';

const PokemonList = () => {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);


  useEffect(() => {
    setIsLoading(true);
    pokemonService.getPokemonList()
      .then(data => {
        console.log('Received data:', data);
        console.log('Received data:',typeof  data);
          setPokemons(data.pokemons);
          setIsLoading(false);
     
          
      })
      .catch(err => {
        console.error('Error:', err);
        setError('Erreur lors du chargement des pokémons');
        setIsLoading(false);
      });
  }, []);

  // Modifier la fonction filter pour utiliser 'pokemons' au lieu de 'pokemonArray'
  const filteredPokemons = pokemons?.filter(pokemon => {
    if (!pokemon || !pokemon.name || !pokemon.type) return false;
    const matchesSearch = pokemon.name.french.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || pokemon.type.includes(selectedType);
    return matchesSearch && matchesType;
  }) || [];

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  /*const handlePokemonClick = (pokemonId) => {
    pokemonService.getOnePokemon(pokemonId)
      .then(data => {
        navigate(`/pokemon/${pokemonId}`);
      })
      .catch(err => {
        console.error('Error fetching pokemon:', err);
        setError('Erreur lors du chargement du pokémon');
      });
  };*/

  const handlePokemonClick = (pokemonId) => {
    navigate(`/pokemon/${pokemonId}`);
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!pokemons || pokemons.length === 0) return <div>Aucun pokémon trouvé</div>;

  return (
    <div className="pokemon-container">
      <div className="filters">
        <div className="search-container">
          <SearchBar onSearch={handleSearch} className="search-input" placeholder="Rechercher un pokémon..." />
        </div>
        <div className="right-controls">
          <TypeFilter 
            onTypeSelect={handleTypeSelect} 
            selectedType={selectedType}
          />
          <button onClick={() => navigate('/pokemon/create')} className="create-button">
              Créer un Pokémon
          </button>
        </div>
      </div>
      <div className="pokemon-list">
        {filteredPokemons.map((pokemon) => (
          <div 
            className="pokemon-card" 
            key={pokemon.id}
            onClick={() => handlePokemonClick(pokemon.id)}
          >
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
                <span>{pokemon.base.Attack}</span>
              </div>
              <div className="pokemon-stat">
                <span>Defense:</span>
                <span>{pokemon.base.Defense}</span>
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
                <span>{pokemon.base.HP}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PokemonList;