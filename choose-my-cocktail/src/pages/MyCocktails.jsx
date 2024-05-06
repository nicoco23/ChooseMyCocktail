import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import cocktailsData from '../JSON/Cocktails.json';
import CocktailList from '../components/CocktailList';

function MyCocktails() {
    const [selectedIngredients, setSelectedIngredients] = useState([]);

    const handleInputChange = (event, value) => {
        setSelectedIngredients(value);
    };

    const filteredCocktails = cocktailsData.filter(cocktail =>
        selectedIngredients.every(selectedIngredient =>
            cocktail.ingredients.some(ingredient =>
                ingredient.nom.toLowerCase().includes(selectedIngredient.toLowerCase())
            )
        )
    );

    return (
        <div>
            <h1>Mes Cocktails</h1>
            <Autocomplete
                multiple
                options={cocktailsData.flatMap(cocktail =>
                    (cocktail.ingredients || []).map(ingredient =>
                        ingredient && ingredient.nom ? ingredient.nom.toLowerCase() : ''
                    )
                )}                onChange={handleInputChange}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Ingrédients" placeholder="Entrez vos ingrédients..." />
                )}
            />
            <CocktailList cocktails={filteredCocktails} />
        </div>
    );
}

export default MyCocktails;