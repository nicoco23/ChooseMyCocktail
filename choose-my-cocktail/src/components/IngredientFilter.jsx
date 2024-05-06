import React, { useState, useEffect } from 'react';

function IngredientFilter({ cocktails }) {
    const [selectedIngredients, setSelectedIngredients] = useState([]);

    const handleInputChange = (e) => {
        const ingredient = e.target.value;
        setSelectedIngredients(ingredient.split(',').map(i => i.trim().toLowerCase()));
    };

    const filteredCocktails = cocktails.filter(cocktail =>
        selectedIngredients.every(selectedIngredient =>
            cocktail.ingredients.some(ingredient =>
                ingredient.nom.toLowerCase().includes(selectedIngredient)
            )
        )
    );

    return (
        <div>
            <input type="text" onChange={handleInputChange} placeholder="Entrez vos ingrédients..." />
            {filteredCocktails.map(cocktail => (
                <div key={cocktail.nom}>
                    <h2>{cocktail.nom}</h2>
                    <p>{cocktail.description}</p>
                </div>
            ))}
        </div>
    );
}

export default IngredientFilter;