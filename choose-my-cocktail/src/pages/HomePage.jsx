import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { cocktailService } from '../services/cocktailService';
import Cocktail from '../components/Cocktail';
import CocktailModal from '../components/CocktailModal';

function HomePage() {
  const { theme } = useTheme();
  const { favoriteItems } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCocktail, setSelectedCocktail] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (favoriteItems.length > 0) {
        const allCocktails = await cocktailService.getAllCocktails();
        const recs = cocktailService.getRecommendations(favoriteItems, allCocktails, 3);
        setRecommendations(recs);
      }
    };
    loadRecommendations();
  }, [favoriteItems]);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'kitty' ? "bg-hk-pink-pale bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMjAnIGhlaWdodD0nMTIwJyB2aWV3Qm94PScwIDAgMTIwIDEyMCc+PHRleHQgeD0nMzAnIHk9JzMwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PHRleHQgeD0nOTAnIHk9JzkwJyBmb250LXNpemU9JzMwJyB0ZXh0LWFuY2hvcj0nbWlkZGxlJyBkeT0nLjM1ZW0nPvCfjoA8L3RleHQ+PC9zdmc+')]" : "bg-gray-50 text-gray-900"}`}>
      {/* Hero Section */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {theme === 'kitty' ? (
            <div className="absolute inset-0 bg-gradient-to-b from-hk-pink-pale/50 via-white/30 to-hk-pink-pale/80"></div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-gray-50"></div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {theme === 'kitty' && <div className="mb-4 text-6xl md:text-8xl animate-gentle-bounce">🎀</div>}

          {theme === 'kitty' ? (
            <div className="relative inline-block mb-8">
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight drop-shadow-sm font-display animate-gentle-bounce relative px-10 py-6 bg-white/80 backdrop-blur-md rounded-[3rem] border-4 border-hk-pink-light shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                <div className="absolute -top-4 -right-4 md:-top-8 md:-right-8 text-3xl md:text-5xl animate-float">💖</div>
                <div className="absolute -top-4 -left-4 md:-top-8 md:-left-8 text-3xl md:text-5xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
                <span className="block text-hk-red-dark">
                  Bienvenue au
                </span>
                <span className="block text-hk-pink-hot drop-shadow-md mt-2">
                  Bar Hello Kitty
                </span>
              </h1>
            </div>
          ) : (
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold tracking-tight mb-8 drop-shadow-sm">
              <span className="block text-gray-900">
                Bienvenue sur
              </span>
              <span className="block text-amber-500">
                ChooseMyCocktail
              </span>
            </h1>
          )}

          <p className={`mt-4 max-w-2xl mx-auto text-2xl mb-12 font-medium p-6 rounded-3xl backdrop-blur-sm ${
            theme === 'kitty'
              ? 'text-hk-red-dark bg-white/90 border-4 border-hk-pink-light shadow-lg'
              : 'text-gray-600 bg-white/60 border border-gray-200 shadow-sm'
          }`}>
            {theme === 'kitty'
              ? 'Découvre des recettes magiques, deviens une pro de la mixologie et trouve le cocktail de tes rêves ! ✨'
              : 'Découvrez des recettes de cocktails, gérez votre bar et trouvez l\'inspiration pour votre prochain verre.'}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/cocktails"
              className={`px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-110 shadow-xl ${
                theme === 'kitty'
                  ? 'bg-hk-pink-hot text-white hover:bg-hk-red-light border-4 border-white'
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {theme === 'kitty' ? '🍹 Mon Frigo Magique' : '🍹 Mon Bar'}
            </Link>
            <Link
              to="/all-cocktails"
              className={`px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:scale-110 shadow-xl ${
                theme === 'kitty'
                  ? 'bg-white text-hk-pink-hot border-4 border-hk-pink-hot hover:bg-hk-pink-pale'
                  : 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700'
              }`}
            >
              {theme === 'kitty' ? '📖 Le Grimoire' : '📖 Toutes les Recettes'}
            </Link>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className={`py-16 relative z-10 ${theme === 'kitty' ? 'bg-hk-pink-pale/50' : 'bg-gray-100'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'kitty' ? 'text-hk-red-dark font-display' : 'text-gray-900'}`}>
                {theme === 'kitty' ? '✨ Spécialement pour toi ! ✨' : 'Recommandé pour vous'}
              </h2>
              <p className={`text-xl ${theme === 'kitty' ? 'text-hk-red-light' : 'text-gray-600'}`}>
                {theme === 'kitty' ? 'Basé sur tes coups de cœur 💖' : 'Basé sur vos favoris'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendations.map((cocktail) => (
                <Cocktail
                  key={cocktail.id}
                  cocktail={cocktail}
                  onSelect={setSelectedCocktail}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedCocktail && (
        <CocktailModal
          cocktail={selectedCocktail}
          onClose={() => setSelectedCocktail(null)}
          theme={theme}
        />
      )}

      {/* Features Section */}
      <div className={`${theme === 'kitty' ? 'bg-white/80 backdrop-blur-md border-t-8 border-hk-pink-light' : 'bg-slate-800 border-t border-slate-700'} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className={`p-8 ${theme === 'kitty' ? 'bg-white/70 border-4 border-hk-pink-light rounded-[2rem] shadow-[0_10px_30px_rgba(255,105,180,0.2)] transform hover:scale-105 transition-all duration-300' : 'rounded-2xl border bg-slate-900/50 border-slate-700'}`}>
              <div className="text-5xl mb-4 animate-bounce">🔍</div>
              <h3 className={`text-xl font-bold mb-3 ${theme === 'kitty' ? 'text-hk-red-dark font-display' : 'text-white'}`}>Recherche Intelligente</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70 font-medium' : 'text-slate-400'}>Trouvez des recettes basées sur les ingrédients que vous possédez déjà.</p>
            </div>
            <div className={`p-8 ${theme === 'kitty' ? 'bg-white/70 border-4 border-hk-pink-light rounded-[2rem] shadow-[0_10px_30px_rgba(255,105,180,0.2)] transform hover:scale-105 transition-all duration-300' : 'rounded-2xl border bg-slate-900/50 border-slate-700'}`}>
              <div className="text-5xl mb-4 animate-pulse">🍹</div>
              <h3 className={`text-xl font-bold mb-3 ${theme === 'kitty' ? 'text-hk-red-dark font-display' : 'text-white'}`}>Recettes Variées</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70 font-medium' : 'text-slate-400'}>Des centaines de cocktails classiques et modernes à découvrir.</p>
            </div>
            <div className={`p-8 ${theme === 'kitty' ? 'bg-white/70 border-4 border-hk-pink-light rounded-[2rem] shadow-[0_10px_30px_rgba(255,105,180,0.2)] transform hover:scale-105 transition-all duration-300' : 'rounded-2xl border bg-slate-900/50 border-slate-700'}`}>
              <div className="text-5xl mb-4 animate-bounce">✨</div>
              <h3 className={`text-xl font-bold mb-3 ${theme === 'kitty' ? 'text-hk-red-dark font-display' : 'text-white'}`}>Design Moderne</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70 font-medium' : 'text-slate-400'}>Une interface fluide et élégante pour une expérience utilisateur optimale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
