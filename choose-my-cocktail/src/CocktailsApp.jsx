import React, { useState, useEffect } from 'react';
import AlcoholButton from './AlcoolButton';

function CocktailsApp() {
  const [cocktails, setCocktails] = useState([]);
  const [selectedAlcohols, setSelectedAlcohols] = useState([]);
  const [filteredCocktails, setFilteredCocktails] = useState([]);

  useEffect(() => {
    // Charger les cocktails à partir du fichier JSON
    const data = require('./Cocktails.json');
    setCocktails(data);
    setFilteredCocktails(data); // Initialiser les cocktails filtrés avec tous les cocktails
  }, []);

  useEffect(() => {
    // Filtrer les cocktails en fonction des alcools sélectionnés
    if (selectedAlcohols.length === 0) {
      setFilteredCocktails(cocktails); // Si aucun alcool n'est sélectionné, afficher tous les cocktails
    } else {
      const filtered = cocktails.filter(cocktail =>
        selectedAlcohols.every(selectedAlcohol =>
          cocktail.ingredients.some(ingredient =>
            ingredient.alcool && ingredient.alcool.toLowerCase().includes(selectedAlcohol.toLowerCase())
          )
        )
      );
      setFilteredCocktails(filtered);
    }
  }, [selectedAlcohols, cocktails]);

  const handleAlcoholClick = alcohol => {
    if (selectedAlcohols.includes(alcohol)) {
      setSelectedAlcohols(selectedAlcohols.filter(selected => selected !== alcohol));
    } else {
      setSelectedAlcohols([...selectedAlcohols, alcohol]);
    }
  };

  return (
    <div>
      <h1>Liste des Cocktails</h1>
      <div>
        <h2>Filtrer par alcool :</h2>
        <div>
          {/* Créer un bouton pour chaque type d'alcool */}
          {cocktails.flatMap(cocktail => cocktail.ingredients.filter(ingredient => ingredient.alcool).map(ingredient => ingredient.alcool.toLowerCase())).filter((value, index, self) => self.indexOf(value) === index).map((alcohol, index) => (
            <AlcoholButton key={index} alcohol={alcohol} onClick={handleAlcoholClick} selected={selectedAlcohols.includes(alcohol)} />
          ))}
          {/* Bouton pour afficher tous les alcools */}
          <button onClick={() => setSelectedAlcohols([])}>Tous les alcools</button>
        </div>
      </div>
      {/* Afficher les cocktails filtrés */}
      {filteredCocktails.map(cocktail => (
        <div key={cocktail.nom}>
          <h2>{cocktail.nom}</h2>
          <p>{cocktail.description}</p>
          <h3>Ingrédients :</h3>
          <ul>
            {cocktail.ingredients.map((ingredient, index) => (
              <li key={index}>{`${ingredient.alcool ? ingredient.alcool : ingredient.nom} - ${ingredient.dose}`}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default CocktailsApp;