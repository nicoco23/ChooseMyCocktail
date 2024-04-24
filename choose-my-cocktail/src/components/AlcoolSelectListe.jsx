import React, { useState, useEffect } from 'react';

function MultiSelectCheckbox({ options, selectedOptions, onChange }) {
  const [filter, setFilter] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    // Filtrer les options en fonction de la saisie de l'utilisateur
    const filtered = options.filter(option =>
      option.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [filter, options]);

  const handleCheckboxChange = (e) => {
    const option = e.target.name;
    if (e.target.checked) {
      onChange(prevOptions => [...prevOptions, option]);
    } else {
      onChange(prevOptions => prevOptions.filter(prevOption => prevOption !== option));
    }
  };

  const handleInputChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      <input type="text" value={filter} onChange={handleInputChange} placeholder="Séléctionnez un ou plusieurs alcools..." />
      <div>
        {filteredOptions.map((option, index) => (
          <div key={index}>
            <input type="checkbox" id={option} name={option} checked={selectedOptions.includes(option)} onChange={handleCheckboxChange} />
            <label htmlFor={option}>{option}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultiSelectCheckbox;