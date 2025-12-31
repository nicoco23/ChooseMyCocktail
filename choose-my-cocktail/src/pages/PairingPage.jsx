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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-8 text-center">
          🍷 Food & Beverage Pairing
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Select a Food Item</h2>

          <select
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            value={selectedFood?.id || ''}
            onChange={(e) => {
              const food = foodItems.find(f => f.id === parseInt(e.target.value));
              setSelectedFood(food);
              setPairings([]);
            }}
          >
            <option value="">-- Choose a food --</option>
            {foodItems.map(food => (
              <option key={food.id} value={food.id}>
                {food.title || food.name}
              </option>
            ))}
          </select>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your available ingredients (comma-separated, optional):
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="e.g., vodka, citron, menthe"
              value={userIngredients}
              onChange={(e) => setUserIngredients(e.target.value)}
            />
          </div>

          <button
            onClick={handleGetPairings}
            disabled={!selectedFood || loading}
            className={`w-full py-3 rounded-lg font-semibold text-white ${
              !selectedFood || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Loading...' : 'Get Pairing Recommendations'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {pairings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Recommended Beverages for "{selectedFood.title || selectedFood.name}"
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pairings.map((pairing, index) => (
                <div
                  key={pairing.beverage.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-purple-900">
                      #{index + 1} {pairing.beverage.title}
                    </h3>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      Score: {pairing.score.toFixed(1)}
                    </span>
                  </div>

                  {pairing.beverage.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {pairing.beverage.description}
                    </p>
                  )}

                  <div className="mb-3">
                    <p className="text-sm text-gray-500 italic">
                      "{pairing.reason}"
                    </p>
                  </div>

                  {pairing.beverage.ingredients && pairing.beverage.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Ingredients:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pairing.beverage.ingredients.slice(0, 5).map((ing, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {ing.name}
                          </span>
                        ))}
                        {pairing.beverage.ingredients.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{pairing.beverage.ingredients.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleFeedback(pairing.beverage, 'favorite')}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      ❤️ Love it
                    </button>
                    <button
                      onClick={() => handleFeedback(pairing.beverage, 'reject')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      👎 Not for me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && pairings.length === 0 && selectedFood && (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-center">
            Click "Get Pairing Recommendations" to see suggested beverages
          </div>
        )}
      </div>
    </div>
  );
};

export default PairingPage;
