import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function HomePage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'kitty' ? "bg-hk-pink-pale bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-slate-900 text-slate-100"}`}>
      {/* Hero Section */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {theme === 'kitty' ? (
            <div className="absolute inset-0 bg-gradient-to-b from-hk-pink-pale/50 via-white/30 to-hk-pink-pale/80"></div>
          ) : (
            <>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900"></div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {theme === 'kitty' && <div className="animate-bounce mb-4 text-8xl">🎀</div>}
          <h1 className={`text-6xl md:text-8xl font-extrabold tracking-tight mb-8 drop-shadow-sm ${theme === 'kitty' ? 'font-display' : ''}`}>
            <span className={`block ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>
              {theme === 'kitty' ? 'Bienvenue au' : 'Bienvenue sur'}
            </span>
            <span className={`block ${theme === 'kitty' ? 'text-hk-pink-hot drop-shadow-md' : 'text-amber-500'}`}>
              {theme === 'kitty' ? 'Bar Hello Kitty' : 'ChooseMyCocktail'}
            </span>
          </h1>

          <p className={`mt-4 max-w-2xl mx-auto text-2xl mb-12 font-medium p-6 rounded-3xl backdrop-blur-sm ${
            theme === 'kitty'
              ? 'text-hk-red-dark/80 bg-white/60 border-4 border-hk-pink-light'
              : 'text-slate-300 bg-slate-800/50 border border-slate-700'
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

      {/* Features Section */}
      <div className={`${theme === 'kitty' ? 'bg-white/80 backdrop-blur-md border-t-8 border-hk-pink-light' : 'bg-slate-800 border-t border-slate-700'} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className={`p-6 rounded-2xl border ${theme === 'kitty' ? 'bg-hk-pink-pale/30 border-hk-pink-light/20' : 'bg-slate-900/50 border-slate-700'}`}>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>Recherche Intelligente</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-slate-400'}>Trouvez des recettes basées sur les ingrédients que vous possédez déjà.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme === 'kitty' ? 'bg-hk-pink-pale/30 border-hk-pink-light/20' : 'bg-slate-900/50 border-slate-700'}`}>
              <div className="text-4xl mb-4">🍹</div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>Recettes Variées</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-slate-400'}>Des centaines de cocktails classiques et modernes à découvrir.</p>
            </div>
            <div className={`p-6 rounded-2xl border ${theme === 'kitty' ? 'bg-hk-pink-pale/30 border-hk-pink-light/20' : 'bg-slate-900/50 border-slate-700'}`}>
              <div className="text-4xl mb-4">✨</div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'kitty' ? 'text-hk-red-dark' : 'text-white'}`}>Design Moderne</h3>
              <p className={theme === 'kitty' ? 'text-hk-red-dark/70' : 'text-slate-400'}>Une interface fluide et élégante pour une expérience utilisateur optimale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
