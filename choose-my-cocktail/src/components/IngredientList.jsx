import React from 'react';
import Ingredient from './Ingredients';

function IngredientList({ ingredients }) {
    return (
        <ul className="ingredients-list">
            {ingredients.map((ingredient, index) => (
                <Ingredient
                    key={index}
                    name={ingredient.nom}
                    dose={ingredient.dose}
                    alcohol={ingredient.alcool}
                />
            ))}
        </ul>
    );
}

export default IngredientList;