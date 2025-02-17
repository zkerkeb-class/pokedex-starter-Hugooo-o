import React, { useState } from 'react';
import PokemonCard from '../pokemonCard/Card';
import SearchBar from '../searchBar/searchBar';
import TypeFilter from '../typeFilter/typeFilter';
import pokemons from '../../assets/pokemons';
//import './pokemonList.css';

const PokemonList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(''); // Ajout de l'état selectedType

  const filteredPokemons = pokemons.filter(pokemon => {
    const matchesSearch = pokemon.name.french.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || pokemon.type.includes(selectedType);
    return matchesSearch && matchesType;
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  return (
    <div>
      <div className="filters">
        <SearchBar onSearch={handleSearch} />
        <TypeFilter 
          onTypeSelect={handleTypeSelect} 
          selectedType={selectedType}
        />
      </div>
      <div className="pokemon-list">
        {filteredPokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            name={pokemon.name.french}
            image={pokemon.image}
            types={pokemon.type}
            attack={pokemon.base.Attack}
            defense={pokemon.base.Defense}
            hp={pokemon.base.HP}
          />
        ))}
      </div>
    </div>
  );
};

export default PokemonList;