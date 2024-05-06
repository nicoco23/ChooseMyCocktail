import React from 'react';
import CocktailCard from './CocktailCard';

function CocktailList({ cocktails }) {
    return (
        <div className="cocktail-list">
            {cocktails.map(cocktail => (
                <CocktailCard key={cocktail.nom} cocktail={cocktail} />
            ))}
        </div>
    );
}

export default CocktailList;