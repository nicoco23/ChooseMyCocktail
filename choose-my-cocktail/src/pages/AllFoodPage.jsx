import React, { useState, useEffect } from 'react';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import { foodService } from '../services/foodService';

function AllFoodPage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    // Utiliser le service pour récupérer toutes les recettes de cuisine
    foodService.getAllRecipes().then(data => {
      setRecipes(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-food-dark text-food-yellow py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-food-orange sm:text-5xl">
            Toutes nos Recettes
          </h1>
          <p className="mt-4 text-xl text-food-yellow/60">
            Explorez notre collection complète de plats, entrées et desserts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => (
            <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} />
          ))}
        </div>

        {selectedRecipe && (
          <CocktailModal cocktail={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
        )}
      </div>
    </div>
  );
}

export default AllFoodPage;
