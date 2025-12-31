import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';
import { cocktailService } from '../services/cocktailService';

function AllCocktailsPage() {
  const { theme } = useTheme();
  const [cocktails, setCocktails] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  useEffect(() => {
    // Utiliser le service pour récupérer les cocktails
    const fetchCocktails = async () => {
      const data = await cocktailService.getAllCocktails();
      setCocktails(data);
    };
    fetchCocktails();
  }, []);

  return (
    <div className={`min-h-screen py-12 ${theme === 'kitty' ? "bg-hk-pink-pale font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-hk-red-dark" : "bg-slate-900 text-slate-100"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-extrabold sm:text-5xl ${theme === 'kitty' ? 'text-hk-red-dark font-display drop-shadow-sm' : 'text-white'}`}>
            {theme === 'kitty' ? '🎀 Le Grimoire des Potions 🎀' : 'Tous nos Cocktails'}
          </h1>
          <p className={`mt-4 text-xl ${theme === 'kitty' ? 'text-hk-red-dark/80 font-medium' : 'text-slate-400'}`}>
            {theme === 'kitty' ? 'Découvre toutes nos recettes magiques ! ✨' : 'Explorez notre collection complète de recettes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cocktails.map((cocktail, index) => (
            <Cocktail key={index} cocktail={cocktail} onSelect={setSelectedCocktail} theme={theme} />
          ))}
        </div>

        {selectedCocktail && (
          <CocktailModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} theme={theme} />
        )}
      </div>
    </div>
  );
}

export default AllCocktailsPage;
