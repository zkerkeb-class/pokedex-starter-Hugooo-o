import React from 'react';
import './typeFilter.css';

const TypeFilter = ({ onTypeSelect, selectedType }) => {
  const types = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
  ];

  return (
    <div className="type-filter-container">
      <select 
        className="type-select"
        value={selectedType} 
        onChange={(e) => onTypeSelect(e.target.value)}
      >
        <option value="">Tous les types</option>
        {types.map(type => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypeFilter;