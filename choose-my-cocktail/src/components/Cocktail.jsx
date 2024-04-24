import React from 'react';
import Ingredient from './Ingredients'; // Assurez-vous d'avoir le bon chemin d'importation

function Cocktail({ cocktail }) {
  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ccc', borderRadius: '10px', padding: '10px' }}>
      <h2 style={{ color: '#333', fontSize: '2em' }}>{cocktail.nom}</h2>
      <img src={cocktail.image} alt={cocktail.nom} style={{ maxWidth: '100%', height: 'auto' }} />
      <p style={{ fontSize: '1.2em', lineHeight: '1.6' }}>{cocktail.description}</p>
      <h3 style={{ color: '#007bff', fontSize: '1.5em' }}>Ingrédients :</h3>
      <ul>
        {cocktail.ingredients.map((ingredient, index) => (
          <Ingredient key={index} name={ingredient.nom || ingredient.alcool} dose={ingredient.dose} />
        ))}
      </ul>
    </div>
  );
}

export default Cocktail;
