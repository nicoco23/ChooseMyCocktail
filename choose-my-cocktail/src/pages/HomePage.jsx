import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Cocktail Bar Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-white">Devenez le</span>
            <span className="block bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
              Maître du Bar
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300 mb-12">
            Découvrez des recettes exquises, apprenez l'art de la mixologie et trouvez le cocktail parfait avec ce que vous avez déjà chez vous.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/cocktails"
              className="px-8 py-4 rounded-full bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 transition-all transform hover:scale-105 shadow-lg shadow-amber-500/25"
            >
              Mon Bar (Frigo)
            </Link>
            <Link
              to="/all-cocktails"
              className="px-8 py-4 rounded-full bg-slate-800 text-white font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all transform hover:scale-105"
            >
              Voir toutes les recettes
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Recherche Intelligente</h3>
              <p className="text-slate-400">Trouvez des recettes basées sur les ingrédients que vous possédez déjà.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700">
              <div className="text-4xl mb-4">🍹</div>
              <h3 className="text-xl font-bold text-white mb-2">Recettes Variées</h3>
              <p className="text-slate-400">Des centaines de cocktails classiques et modernes à découvrir.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-white mb-2">Design Moderne</h3>
              <p className="text-slate-400">Une interface fluide et élégante pour une expérience utilisateur optimale.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
