import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import { cocktailService } from '../services/cocktailService';
import { MagnifyingGlassIcon, TagIcon } from '@heroicons/react/24/outline';

function AllCocktailsPage() {
  const { theme } = useTheme();
  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTags, setSelectedTags] = useState([]);

  const categories = ['Tous', 'Cocktail', 'Mocktail', 'Smoothie', 'Shot', 'Punch', 'Milk-Shake'];
  const availableTags = ['Sans Alcool', 'Fruité', 'Amer', 'Sucré', 'Acide', 'Épicé', 'Crémeux', 'Pétillant', 'Chaud', 'Classique'];

  useEffect(() => {
    // Utiliser le service pour récupérer les cocktails
    const fetchCocktails = async () => {
      const data = await cocktailService.getAllCocktails();
      setCocktails(data);
    };
    fetchCocktails();
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredCocktails = cocktails.filter(cocktail => {
    // 1. Search Term
    const matchesSearch = cocktail.nom.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category
    const matchesCategory = selectedCategory === 'Tous' ||
                            (cocktail.category && cocktail.category.toLowerCase() === selectedCategory.toLowerCase());

    // 3. Tags (AND logic - must have all selected tags)
    const cocktailTags = cocktail.tags || [];
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => cocktailTags.includes(tag));

    return matchesSearch && matchesCategory && matchesTags;
  });

  const getFilterButtonClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-pink-hot text-white shadow-md transform scale-105 border-2 border-white font-bold'
        : 'bg-white text-hk-red-dark border-2 border-hk-pink-light hover:bg-hk-pink-pale hover:border-hk-pink-hot font-medium';
    }
    return isActive
      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50';
  };

  const getChipClass = (isActive) => {
    if (theme === 'kitty') {
      return isActive
        ? 'bg-hk-pink-hot text-white border-2 border-white shadow-sm font-bold'
        : 'bg-white text-hk-red-dark border-2 border-hk-pink-light hover:bg-hk-pink-pale hover:border-hk-pink-hot font-medium';
    }
    return isActive
      ? 'bg-amber-500 text-white border-amber-500'
      : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-500';
  };

  return (
    <div className={`min-h-screen py-8 ${theme === 'kitty' ? "bg-hk-pink-pale font-sans text-hk-red-dark bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {theme === 'kitty' ? (
          <>
            {/* Hero Section Hello Kitty */}
            <div className="text-center mb-10 relative pt-8 px-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-4xl md:text-6xl animate-sparkle">⭐</div>
              <div className="absolute top-10 left-10 text-5xl opacity-30 animate-bounce" style={{ animationDuration: '3s' }}>🎀</div>
              <div className="absolute top-20 right-20 text-4xl opacity-30 animate-pulse rotate-12" style={{ animationDuration: '2s' }}>🍓</div>
              <div className="relative inline-block">
                <h1 className="text-4xl md:text-6xl font-display font-bold text-hk-red-dark mb-6 drop-shadow-sm animate-gentle-bounce relative px-8 py-4 bg-white/80 backdrop-blur-md rounded-full border-4 border-hk-pink-light shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                  🎀 Le Grimoire des Potions 🎀
                  <div className="absolute -top-3 -right-3 md:-top-6 md:-right-6 text-2xl md:text-4xl animate-float">💖</div>
                  <div className="absolute -top-3 -left-3 md:-top-6 md:-left-6 text-2xl md:text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🌸</div>
                </h1>
              </div>
              <br />
              <p className="text-hk-red-light text-lg md:text-2xl font-medium bg-gradient-to-r from-white/90 via-hk-pink-pale/80 to-white/90 inline-block px-6 md:px-8 py-2 md:py-3 rounded-full backdrop-blur-md border-2 md:border-4 border-white shadow-lg mt-4">
                Découvre toutes nos recettes magiques ! ✨🧚‍♀️
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-8 space-y-6 relative z-10">
              {/* Search & Category */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'kitty' ? 'text-hk-red-light' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un cocktail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-2xl leading-5 placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                      theme === 'kitty'
                        ? 'border-2 border-hk-pink-light bg-white/90 focus:ring-4 focus:ring-hk-pink-pale focus:border-hk-pink-hot text-hk-red-dark placeholder-hk-red-light/70 font-medium shadow-sm'
                        : 'border-gray-300 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    }`}
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2.5 rounded-full text-sm transition-all duration-300 ${getFilterButtonClass(selectedCategory === cat)}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className={`p-6 rounded-[2rem] ${theme === 'kitty' ? 'bg-white/90 border-2 border-hk-pink-light backdrop-blur-md shadow-[0_5px_15px_rgba(255,105,180,0.1)]' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className={`h-6 w-6 ${theme === 'kitty' ? 'text-hk-pink-hot' : 'text-gray-500'}`} />
                  <span className={`text-lg font-bold ${theme === 'kitty' ? 'text-hk-red-dark font-display' : 'text-gray-700'}`}>Filtrer par tags :</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 border ${getChipClass(selectedTags.includes(tag))}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Container with decorative elements */}
            <div className="bg-gradient-to-br from-white/95 via-hk-pink-pale/20 to-white/95 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(255,105,180,0.4)] border-4 md:border-[10px] border-hk-pink-light p-4 md:p-10 mb-12 relative overflow-hidden">
              {/* Décorations multiples */}
              <div className="absolute top-0 right-0 -mt-6 -mr-6 md:-mt-8 md:-mr-8 text-5xl md:text-8xl opacity-20 rotate-12 select-none animate-sparkle">🍹</div>
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 md:-mb-8 md:-ml-8 text-5xl md:text-8xl opacity-20 -rotate-12 select-none animate-sparkle" style={{ animationDelay: '0.5s' }}>🍸</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-7xl md:text-9xl opacity-5 pointer-events-none">💖</div>
              <div className="hidden md:block absolute top-10 right-20 text-5xl opacity-30 animate-float">🎀</div>
              <div className="hidden md:block absolute bottom-10 left-20 text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>✨</div>
              <div className="hidden md:block absolute top-1/3 left-10 text-4xl opacity-25 animate-sparkle" style={{ animationDelay: '0.8s' }}>💕</div>
              <div className="hidden md:block absolute bottom-1/3 right-10 text-4xl opacity-25 animate-sparkle" style={{ animationDelay: '1.2s' }}>🌸</div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCocktails.map((cocktail, index) => (
                  <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold sm:text-5xl text-gray-900">
                Tous nos Cocktails
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Explorez notre collection complète de recettes.
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-8 space-y-6">
              {/* Search & Category */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 ${theme === 'kitty' ? 'text-hk-red-light' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un cocktail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      theme === 'kitty'
                        ? 'border-hk-pink-light bg-white/80 focus:ring-hk-pink-hot focus:border-hk-pink-hot text-hk-red-dark'
                        : 'border-gray-300 bg-white focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
                    }`}
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${getFilterButtonClass(selectedCategory === cat)}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className={`p-4 rounded-2xl ${theme === 'kitty' ? 'bg-white/60 border border-hk-pink-light' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className={`h-5 w-5 ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-gray-700'}`}>Filtrer par tags :</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${getChipClass(selectedTags.includes(tag))}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCocktails.map((cocktail, index) => (
                <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
              ))}
            </div>
          </>
        )}

        {selectedCocktail && (
          <CocktailModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} theme={theme} />
        )}
      </div>
    </div>
  );
}

export default AllCocktailsPage;
