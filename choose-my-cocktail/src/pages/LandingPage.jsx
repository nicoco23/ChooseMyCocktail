import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function LandingPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${theme === 'kitty' ? "bg-hk-pink-pale font-display bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-hk-red-dark" : "bg-slate-900 text-slate-100"}`}>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-12 text-center">
        <span className={`block ${theme === 'kitty' ? 'text-hk-red-dark drop-shadow-md' : 'text-white'}`}>Choose My</span>
        <span className={`block bg-clip-text text-transparent ${theme === 'kitty' ? 'bg-gradient-to-r from-hk-pink-hot to-hk-red-light' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}>
          Experience
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Cocktail Card */}
        <Link to="/cocktails" className={`group relative h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${theme === 'kitty' ? 'border-2 border-hk-pink-hot shadow-[0_0_15px_rgba(255,105,180,0.3)]' : 'hover:shadow-amber-500/20'}`}>
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Cocktails"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={`absolute inset-0 transition-opacity opacity-80 group-hover:opacity-70 ${theme === 'kitty' ? 'bg-gradient-to-t from-hk-pink-hot/90 via-hk-pink-light/60 to-transparent' : 'bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent'}`}></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🍹</span>
            <h2 className={`text-3xl font-bold mb-2 ${theme === 'kitty' ? 'text-white drop-shadow-md' : 'text-white'}`}>Cocktails</h2>
            <p className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 ${theme === 'kitty' ? 'text-white font-medium' : 'text-slate-300'}`}>
              Trouvez le cocktail parfait avec ce que vous avez dans votre bar.
            </p>
          </div>
        </Link>

        {/* Food Card */}
        <Link to="/food" className={`group relative h-80 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${theme === 'kitty' ? 'border-2 border-hk-blue-light shadow-[0_0_15px_rgba(135,206,250,0.3)]' : 'hover:shadow-food-orange/20'}`}>
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Food"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className={`absolute inset-0 transition-opacity opacity-80 group-hover:opacity-70 ${theme === 'kitty' ? 'bg-gradient-to-t from-hk-blue-light/90 via-hk-blue-light/60 to-transparent' : 'bg-gradient-to-t from-food-dark via-food-dark/60 to-transparent'}`}></div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">🥗</span>
            <h2 className={`text-3xl font-bold mb-2 ${theme === 'kitty' ? 'text-white drop-shadow-md' : 'text-food-yellow'}`}>Cuisine</h2>
            <p className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 ${theme === 'kitty' ? 'text-white font-medium' : 'text-food-yellow/80'}`}>
              Trouvez une recette délicieuse avec ce qu'il reste dans votre frigo.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
