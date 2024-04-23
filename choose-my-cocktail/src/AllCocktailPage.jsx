import React, { useState, useEffect } from 'react';
import Ingredient from './components/Ingredients';

function AllCocktailsPage({ cocktails }) {
  return (
    <div>
      <h1>Tous les Cocktails</h1>
      {/* Afficher les cocktails */}
      {cocktails.map(cocktail => (
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

export default AllCocktailsPage;
