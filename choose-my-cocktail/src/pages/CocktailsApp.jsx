import React, { useState, useEffect } from 'react';
import FilterSection from '../components/FilterSection';
import '../css/CocktailApp.css';
import cocktailsData from '../JSON/Cocktails.json';
import CocktailList from '../components/CocktailList';


function CocktailsApp() {
  const [cocktails, setCocktails] = useState([]);
  const [selectedAlcohols, setSelectedAlcohols] = useState([]);
  const [filteredCocktails, setFilteredCocktails] = useState([]);

  useEffect(() => {
    setCocktails(cocktailsData);
    setFilteredCocktails(cocktailsData);
  }, []);

  useEffect(() => {
    if (selectedAlcohols.length === 0) {
      setFilteredCocktails(cocktails);
    } else {
      const filtered = cocktails.filter(cocktail =>
        selectedAlcohols.some(selectedAlcohol =>
          cocktail.ingredients.some(ingredient =>
            ingredient.alcool && ingredient.alcool.toLowerCase().includes(selectedAlcohol.toLowerCase())
          )
        )
      );
      setFilteredCocktails(filtered);
    }
  }, [selectedAlcohols, cocktails]);

  const resetSelection = () => {
    setSelectedAlcohols([]);
  };

  return (
      <div>
        <h1>Liste des Cocktails</h1>
        <FilterSection
            options={cocktails
                .flatMap(cocktail => cocktail.ingredients.filter(ingredient => ingredient.alcool)
                    .map(ingredient => ingredient.alcool.toLowerCase()))
                .filter((value, index, self) => self.indexOf(value) === index)}
            selectedOptions={selectedAlcohols}
            onChange={setSelectedAlcohols}
            resetSelection={resetSelection}
        />
        <CocktailList cocktails={filteredCocktails} />
      </div>
  );
}

export default CocktailsApp;