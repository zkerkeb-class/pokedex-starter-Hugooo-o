import React from 'react';
import './searchBar.css';

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Rechercher un Pokémon"
        //onChange={handleChange}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;