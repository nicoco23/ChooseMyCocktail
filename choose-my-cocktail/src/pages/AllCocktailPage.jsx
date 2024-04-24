import React, { useEffect, useState } from 'react';
import Ingredient from '../components/Ingredients';

function AllCocktailsPage() {
  const [cocktails, setCocktails] = useState([]);

  useEffect(() => {
    fetch('/path/to/your/cocktails/data.json') // Remplacez par le chemin vers vos données de cocktails
      .then(response => response.json())
      .then(data => setCocktails(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#007bff', fontSize: '2.5em', textAlign: 'center' }}>Tous les Cocktails</h1>
      {/* Afficher les cocktails */}
      {cocktails.map(cocktail => (
        <div key={cocktail.nom} style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '10px', padding: '10px' }}>
          <h2 style={{ color: '#333', fontSize: '2em' }}>{cocktail.nom}</h2>
          <p style={{ fontSize: '1.2em', lineHeight: '1.6' }}>{cocktail.description}</p>
          <h3 style={{ color: '#007bff', fontSize: '1.5em' }}>Ingrédients :</h3>
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
