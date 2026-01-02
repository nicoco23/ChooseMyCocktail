import React, { useState, useEffect } from 'react';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import Confetti from '../components/Confetti';
import { foodService } from '../services/foodService';
import { useTheme } from '../context/ThemeContext';

function AllFoodPage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Utiliser le service pour récupérer toutes les recettes de cuisine
    foodService.getAllRecipes().then(data => {
      setRecipes(data);
    });
  }, []);

  // Extract unique values
  const categories = ['all', ...new Set(recipes.map(r => r.category).filter(Boolean))];
  const allEquipment = [...new Set(recipes.flatMap(r => r.equipment || []))].sort();

  // Filter Logic
  const filteredRecipes = recipes.filter(recipe => {
    const matchCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    // Show recipe if it uses AT LEAST ONE of the selected equipment (OR logic)
    // If no equipment selected, show all (subject to category)
    const matchEquipment = selectedEquipment.length === 0 || (recipe.equipment && recipe.equipment.some(eq => selectedEquipment.includes(eq)));
    return matchCategory && matchEquipment;
  });

  const toggleEquipment = (eq) => {
    if (selectedEquipment.includes(eq)) {
      setSelectedEquipment(selectedEquipment.filter(e => e !== eq));
    } else {
      setSelectedEquipment([...selectedEquipment, eq]);
    }
  };

  const handleSurpriseMe = () => {
    if (filteredRecipes.length > 0) {
      const randomRecipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
      setSelectedRecipe(randomRecipe);
      setShowConfetti(true);
    }
  };

  // Theme Classes Helpers
  const getBgClass = () => theme === 'kitty' ? "bg-hk-pink-pale text-hk-red-dark font-display bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]" : 'bg-food-yellow/10 text-food-dark';
  const getPrimaryText = () => theme === 'kitty' ? 'text-hk-red-dark' : 'text-food-orange';
  const getSecondaryText = () => theme === 'kitty' ? 'text-hk-blue-dark' : 'text-food-purple';

  const getFilterButtonClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-pink-hot text-white border-2 border-white shadow-md transform scale-105'
        : 'bg-white text-hk-red-dark border-2 border-hk-pink-light hover:bg-hk-pink-pale hover:border-hk-pink-hot';
    }
    return isActive
      ? 'bg-food-orange text-white shadow-md shadow-food-orange/20'
      : 'bg-white text-food-dark border border-food-purple/20 hover:bg-food-yellow/10';
  };

  const getChipClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-blue-light text-white border-2 border-white shadow-md transform scale-105'
        : 'bg-white text-hk-blue-dark border-2 border-hk-blue-light/30 hover:border-hk-blue-light hover:bg-hk-blue-light/10';
    }
    return isActive
      ? 'bg-food-purple text-white border-food-purple'
      : 'bg-white text-food-purple border border-food-purple/30 hover:border-food-purple';
  };

  return (
    <div className={`min-h-screen py-8 ${getBgClass()} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        {theme === 'kitty' ? (
          <div className="text-center mb-10 relative pt-8 px-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl md:text-6xl animate-sparkle">⭐</div>
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-6xl font-display font-bold text-hk-red-dark mb-6 drop-shadow-sm animate-gentle-bounce relative px-8 py-4 bg-white/80 backdrop-blur-md rounded-full border-4 border-hk-pink-light shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                🎀 Livre de Recettes Magiques 🎀
                <div className="absolute -top-3 -right-3 md:-top-6 md:-right-6 text-2xl md:text-4xl animate-float">🍰</div>
                <div className="absolute -top-3 -left-3 md:-top-6 md:-left-6 text-2xl md:text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🍓</div>
              </h1>
            </div>
            <br />
            <p className="text-hk-red-light text-lg md:text-2xl font-medium bg-gradient-to-r from-white/90 via-hk-pink-pale/80 to-white/90 inline-block px-6 md:px-8 py-2 md:py-3 rounded-full backdrop-blur-md border-2 md:border-4 border-white shadow-lg mt-4">
              Découvre toutes nos recettes gourmandes ! ✨🧁
            </p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-extrabold ${getPrimaryText()} sm:text-5xl transition-colors duration-300`}>
              Toutes nos Recettes
            </h1>
            <p className={`mt-4 text-xl ${getSecondaryText()} transition-colors duration-300`}>
              Explorez notre collection complète de plats, entrées et desserts.
            </p>
          </div>
        )}

        {/* Filters Section */}
        {theme === 'kitty' ? (
          <div className="bg-gradient-to-br from-white/95 via-hk-pink-pale/20 to-white/95 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(255,105,180,0.4)] border-4 md:border-[10px] border-hk-pink-light p-4 md:p-10 mb-12 relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 md:-mt-8 md:-mr-8 text-5xl md:text-8xl opacity-20 rotate-12 select-none animate-sparkle">🥨</div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 md:-mb-8 md:-ml-8 text-5xl md:text-8xl opacity-20 -rotate-12 select-none animate-sparkle" style={{ animationDelay: '0.5s' }}>🍰</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl md:text-9xl opacity-5 pointer-events-none">😻</div>
            <div className="hidden md:block absolute top-10 right-20 text-5xl opacity-30 animate-float">🎀</div>
            <div className="hidden md:block absolute bottom-10 left-20 text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>💞</div>

            <div className="space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-2xl font-bold text-hk-red-dark mb-4 flex items-center justify-center gap-2">
                  <span className="text-3xl">🍴</span> Catégories
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300 ${getFilterButtonClass(selectedCategory === cat)}`}
                    >
                      {cat === 'all' ? 'Tout' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              {allEquipment.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-hk-blue-dark mb-3 flex items-center justify-center gap-2">
                    <span className="text-2xl">🦄</span> Équipement
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {allEquipment.map(eq => (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${getChipClass(selectedEquipment.includes(eq))}`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton Surprise-moi ! */}
            <div className="text-center mt-6">
              <button
                onClick={handleSurpriseMe}
                className={`px-8 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-xl ${
                  theme === 'kitty'
                    ? 'bg-gradient-to-r from-hk-pink-hot to-hk-red-light text-white border-4 border-white'
                    : 'bg-gradient-to-r from-food-orange to-food-purple text-white'
                }`}
              >
                🎲 Surprise-moi !
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-12 space-y-6">
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all duration-300 ${getFilterButtonClass(selectedCategory === cat)}`}
                >
                  {cat === 'all' ? 'Tout' : cat}
                </button>
              ))}
            </div>

            {/* Equipment */}
            {allEquipment.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {allEquipment.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${getChipClass(selectedEquipment.includes(eq))}`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            )}

            {/* Bouton Surprise-moi ! */}
            <div className="text-center mt-6">
              <button
                onClick={handleSurpriseMe}
                className="px-8 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-xl bg-gradient-to-r from-food-orange to-food-purple text-white"
              >
                🎲 Surprise-moi !
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe, index) => (
            <Cocktail key={index} cocktail={recipe} onSelect={setSelectedRecipe} theme={theme} />
          ))}
        </div>

        {selectedRecipe && (
          <CocktailModal cocktail={selectedRecipe} onClose={() => setSelectedRecipe(null)} theme={theme} />
        )}

        {showConfetti && (
          <Confetti theme={theme} onComplete={() => setShowConfetti(false)} />
        )}
      </div>
    </div>
  );
}

export default AllFoodPage;
