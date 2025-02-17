import React from 'react';

const TypeFilter = ({ onTypeSelect, selectedType }) => {
  const types = [
    "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
    "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
    "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
  ];

  return (
    <select 
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
  );
};

export default TypeFilter;