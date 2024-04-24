import React, { useState, useEffect } from 'react';
import Cocktail from '../components/Cocktail';
import '../css/CocktailPage.css'; // Importez le fichier CSS que nous venons de créer

function AllCocktailsPage() {
  const [cocktails, setCocktails] = useState([]);

  useEffect(() => {
    // Charger les cocktails à partir du fichier JSON
    const data = require('../JSON/Cocktails.json');
    setCocktails(data);
  }, []);

  return (
    <div className="cocktails-page">
      <h1 className="title">Liste des Cocktails</h1>
      <div className="cocktails-list">
        {cocktails.map(cocktail => (
          <Cocktail key={cocktail.nom} cocktail={cocktail} />
        ))}
      </div>
    </div>
  );
}

export default AllCocktailsPage;

