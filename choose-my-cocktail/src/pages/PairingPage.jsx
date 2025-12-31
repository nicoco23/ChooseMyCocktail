import React, { useState, useEffect } from 'react';
import { foodService } from '../services/foodService';
import pairingService from '../services/pairingService';

const PairingPage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userIngredients, setUserIngredients] = useState('');

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const foods = await foodService.getAllRecipes(false);
      setFoodItems(foods);
    } catch (err) {
      setError('Failed to load food items');
    }
  };

  const handleGetPairings = async () => {
    if (!selectedFood) return;

    setLoading(true);
    setError(null);
    setPairings([]);

    try {
      const options = {
        limit: 5,
      };

      if (userIngredients.trim()) {
        options.userIngredients = userIngredients
          .split(',')
          .map(i => i.trim())
          .filter(i => i);
      }

      const results = await pairingService.getPairings(selectedFood.id, options);
      setPairings(results);
    } catch (err) {
      setError('Failed to get pairing recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (beverage, action) => {
    try {
      await pairingService.recordFeedback(selectedFood.id, beverage.id, action);
      console.log(`Feedback recorded: ${action}`);
    } catch (err) {
      console.error('Failed to record feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-hk-pink-pale p-4 md:p-8 font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 animate-bounce">
          <h1 className="text-6xl font-display font-bold text-hk-red-dark mb-2 drop-shadow-md">
            🎀 Perfect Match 🎀
          </h1>
          <p className="text-hk-red-light text-2xl font-medium bg-white/50 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
            Trouve la boisson idéale pour ton plat ! ✨
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-[0_20px_50px_rgba(255,105,180,0.3)] border-8 border-hk-pink-light p-6 md:p-10 mb-12 relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 text-8xl opacity-20 rotate-12 select-none">🍓</div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 text-8xl opacity-20 -rotate-12 select-none">🧁</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5 pointer-events-none">😻</div>

          <h2 className="text-3xl font-bold text-hk-red-dark mb-8 flex items-center justify-center gap-3">
            <span className="text-4xl">🍽️</span> Qu'est-ce qu'on mange ?
          </h2>

          <div className="space-y-8">
            <div className="group">
              <label className="block text-hk-red-dark font-bold mb-3 ml-2 text-lg">
                Choisis ton plat
              </label>
              <div className="relative">
                <select
                  className="w-full p-5 border-4 border-hk-pink-light rounded-3xl bg-hk-pink-pale/30 text-gray-700 text-lg focus:border-hk-red-light focus:ring-4 focus:ring-hk-pink-light/30 outline-none transition-all appearance-none cursor-pointer hover:bg-hk-pink-pale/50"
                  value={selectedFood?.id || ''}
                  onChange={(e) => {
                    const food = foodItems.find(f => f.id === parseInt(e.target.value));
                    setSelectedFood(food);
                    setPairings([]);
                  }}
                >
                  <option value="">-- Sélectionne un délice --</option>
                  {foodItems.map(food => (
                    <option key={food.id} value={food.id}>
                      {food.title || food.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-2xl">
                  🔽
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-hk-red-dark font-bold mb-3 ml-2 text-lg">
                Ingrédients dispos (optionnel) 🍋
              </label>
              <input
                type="text"
                className="w-full p-5 border-4 border-hk-pink-light rounded-3xl bg-hk-pink-pale/30 text-gray-700 text-lg focus:border-hk-red-light focus:ring-4 focus:ring-hk-pink-light/30 outline-none transition-all placeholder-hk-red-light/40"
                placeholder="ex: vodka, citron, menthe..."
                value={userIngredients}
                onChange={(e) => setUserIngredients(e.target.value)}
              />
            </div>

            <button
              onClick={handleGetPairings}
              disabled={!selectedFood || loading}
              className={`w-full py-5 rounded-full font-bold text-2xl text-white shadow-lg transform transition-all duration-200 border-b-8 active:border-b-0 active:translate-y-2
                ${!selectedFood || loading
                  ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-hk-red-light to-hk-red-dark border-hk-red-dark hover:brightness-110'
                }`}
            >
              {loading ? 'Recherche en cours... 💖' : '✨ Trouver mon Match ! ✨'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-200 text-red-600 p-4 rounded-2xl mb-8 text-center font-bold animate-bounce">
            😿 Oups ! {error}
          </div>
        )}

        {pairings.length > 0 && (
          <div className="space-y-6 animate-fade-in-up">
            <h3 className="text-3xl font-bold text-hk-red-dark text-center mb-8">
              💖 Tes recommandations 💖
            </h3>

            {pairings.map((pairing, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 shadow-lg border-2 border-hk-pink-light hover:border-hk-red-light transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/3">
                    <div className="aspect-square rounded-2xl overflow-hidden border-4 border-hk-pink-pale shadow-inner bg-hk-pink-pale flex items-center justify-center text-6xl">
                      {pairing.beverage.image_url ? (
                        <img
                          src={pairing.beverage.image_url}
                          alt={pairing.beverage.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>🍹</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-2/3 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                      <h4 className="text-2xl font-bold text-hk-red-dark">
                        {pairing.beverage.title}
                      </h4>
                      <span className="bg-hk-yellow text-hk-red-dark px-4 py-1 rounded-full font-bold text-sm shadow-sm mt-2 md:mt-0">
                        Match: {Math.round(pairing.score)}% 💘
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 italic">
                      {pairing.beverage.description || "Une boisson délicieuse !"}
                    </p>

                    <div className="bg-hk-pink-pale/50 rounded-xl p-4 mb-4">
                      <p className="text-hk-red-dark font-bold text-sm mb-2">Pourquoi ce match ?</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {pairing.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>🌸</span> {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-center md:justify-start gap-4">
                      <button
                        onClick={() => handleFeedback(pairing.beverage, 'favorite')}
                        className="flex items-center gap-2 px-6 py-2 bg-hk-pink-light text-white rounded-full font-bold hover:bg-hk-red-light transition-colors"
                      >
                        <span>😍</span> J'adore
                      </button>
                      <button
                        onClick={() => handleFeedback(pairing.beverage, 'reject')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-500 rounded-full font-bold hover:bg-gray-200 transition-colors"
                      >
                        <span>🤔</span> Bof
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PairingPage;
