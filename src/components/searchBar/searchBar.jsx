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
        className="search-input"
        placeholder="Rechercher un pokémon..."
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;