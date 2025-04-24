import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../searchBar/searchBar';
import TypeFilter from '../typeFilter/typeFilter';
import './pokemonList.css'; 
import { imageType } from '../../assets/imageType';
import { useNavigate } from 'react-router';
import pokemonService from '../services/pokemonService';
import authService from '../services/authService';

const PokemonList = () => {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérification du statut d'administrateur
    const checkAdmin = async () => {
      try {
        if (authService.isAuthenticated()) {
          const adminStatus = await authService.checkAdminStatus();
          console.log("PokemonList - Statut admin (serveur):", adminStatus.isAdmin);
          setIsAdmin(adminStatus.isAdmin === true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut admin:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
    
    // Chargement de TOUS les pokémons du Pokédex
    setIsLoading(true);
    pokemonService.getPokemonList()
      .then(response => {
        console.log('Response from API:', response);
        // Vérification simple de l'existence des données
        if (response && response.pokemons) {
          // S'assurer de trier par ID
          const sortedPokemons = response.pokemons.sort((a, b) => a.id - b.id);
          setPokemons(sortedPokemons);
          
          // Extraction et dédoublonnage des types pour le filtre
          const types = [...new Set(sortedPokemons.flatMap(pokemon => pokemon.type))];
          setAvailableTypes(types);
          
          console.log(`Nombre total de Pokémons chargés: ${sortedPokemons.length}`);
        } else {
          setError('Erreur lors du chargement des pokémons');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pokemons:', err);
        setError('Erreur lors du chargement des pokémons');
        setIsLoading(false);
      });
  }, []);
  
  // Ajout d'un effet pour écouter les changements de statut admin
  useEffect(() => {
    const handleAdminStatusChange = (newStatus) => {
      console.log("PokemonList - Événement de changement de statut admin reçu:", newStatus);
      setIsAdmin(newStatus);
    };
    
    const unsubscribe = authService.subscribeToAdminChanges(handleAdminStatusChange);
    return () => unsubscribe();
  }, []);
  
  // Plus bas dans le code, avant le return
  console.log('Current pokemons state:', pokemons);

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
          {isAdmin && (
            <button onClick={() => navigate('/pokemon/create')} className="create-button">
              Créer un Pokémon
            </button>
          )}
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
          </div>
        ))}
      </div>
    </div>
  );
};
export default PokemonList;