import React from 'react';
//import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Rechercher un Pokémon..."
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;