import React, { useState } from 'react';
import PokemonCard from '../pokemonCard/Card';
import SearchBar from '../searchBar/searchBar';
import pokemons from '../../assets/pokemons';
//import './pokemonList.css';

const PokemonList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPokemons = pokemons.filter(pokemon =>
    pokemon.name.french.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
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