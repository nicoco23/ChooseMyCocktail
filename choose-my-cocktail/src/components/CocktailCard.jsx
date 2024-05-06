import React, { useState } from 'react';
import IngredientList from './IngredientList';

function CocktailCard({ cocktail }) {
    const [showDetails, setShowDetails] = useState(false);

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div className="cocktail-card">
            <h2 className="text-3xl font-semibold mb-2">{cocktail.nom}</h2>
            <p className="mb-4">{cocktail.description}</p>
            {showDetails && (
                <>
                    <h3 className="text-2xl font-semibold mb-2">Ingrédients :</h3>
                    <IngredientList ingredients={cocktail.ingredients} />
                    <button onClick={toggleDetails}>
                        Hide Details
                    </button>
                </>
            )}
            {!showDetails && (
                <button onClick={toggleDetails}>
                    Show Details
                </button>
            )}
        </div>
    );
}

export default CocktailCard;