import React, { useState, useEffect } from 'react';
import MultiSelectCheckbox from '../components/AlcoolSelectListe';
import Ingredient from '../components/Ingredients';

function CocktailsApp() {
  const [cocktails, setCocktails] = useState([]);
  const [selectedAlcohols, setSelectedAlcohols] = useState([]);
  const [filteredCocktails, setFilteredCocktails] = useState([]);

  useEffect(() => {
    // Charger les cocktails à partir du fichier JSON
    const data = require('../JSON/Cocktails.json');
    setCocktails(data);
  }, []);

  useEffect(() => {
    // Filtrer les cocktails en fonction des alcools sélectionnés
    if (selectedAlcohols.length === 0) {
      setFilteredCocktails(cocktails); // Si aucun alcool n'est sélectionné, afficher tous les cocktails
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
      <div>
        <h2>Filtrer par alcool :</h2>
        <MultiSelectCheckbox options={cocktails.flatMap(cocktail => cocktail.ingredients.filter(ingredient => ingredient.alcool).map(ingredient => ingredient.alcool.toLowerCase())).filter((value, index, self) => self.indexOf(value) === index)} selectedOptions={selectedAlcohols} onChange={setSelectedAlcohols} />        <button onClick={resetSelection}>Reset</button>
      </div>
      {/* Afficher les cocktails filtrés */}
      {filteredCocktails.map(cocktail => (
        <div key={cocktail.nom}>
          <h2>{cocktail.nom}</h2>
          <p>{cocktail.description}</p>
          <h3>Ingrédients :</h3>
          <ul>
            {cocktail.ingredients.map((ingredient, index) => (
              <Ingredient key={index} name={ingredient.nom} dose={ingredient.dose} alcohol={ingredient.alcool} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default CocktailsApp;