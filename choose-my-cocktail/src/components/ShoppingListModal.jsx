import React from 'react';
import { useLocation } from 'react-router-dom';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

function ShoppingListModal({ cocktails, onClose }) {
  const location = useLocation();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');
  const [copied, setCopied] = React.useState(false);
  // Initialize with all cocktails selected
  const [selectedCocktailNames, setSelectedCocktailNames] = React.useState(
    cocktails.map(c => c.nom)
  );

  const toggleCocktail = (name) => {
    if (selectedCocktailNames.includes(name)) {
      setSelectedCocktailNames(selectedCocktailNames.filter(n => n !== name));
    } else {
      setSelectedCocktailNames([...selectedCocktailNames, name]);
    }
  };

  const toggleAll = () => {
    if (selectedCocktailNames.length === cocktails.length) {
      setSelectedCocktailNames([]);
    } else {
      setSelectedCocktailNames(cocktails.map(c => c.nom));
    }
  };

  // Aggregate missing ingredients based on selection
  const missingIngredients = React.useMemo(() => {
    const activeCocktails = cocktails.filter(c => selectedCocktailNames.includes(c.nom));
    const allMissing = activeCocktails.flatMap(c => c.missingIngredients || []);
    return [...new Set(allMissing)].sort();
  }, [cocktails, selectedCocktailNames]);

  const handleCopy = () => {
    const title = isFoodContext ? "🍳 ChooseMyFood - Ma Liste de Courses 🛒" : "🍹 ChooseMyCocktail - Ma Liste de Courses 🛒";
    const text = title + "\n\n" + missingIngredients.map(i => `• ${i.charAt(0).toUpperCase() + i.slice(1)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div className={`fixed inset-0 transition-opacity ${isFoodContext ? 'bg-white/60 backdrop-blur-sm' : 'bg-slate-900/80'}`} aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border ${
            isFoodContext
            ? 'bg-white border-food-purple/10'
            : 'bg-slate-800 border-slate-700'
        }`}>
          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${isFoodContext ? 'bg-white' : 'bg-slate-800'}`}>
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-lg leading-6 font-medium ${isFoodContext ? 'text-food-dark' : 'text-white'}`} id="modal-title">
                    🛒 Ma Liste de Courses
                    </h3>
                    <button onClick={onClose} className={`${isFoodContext ? 'text-food-dark/50 hover:text-food-orange' : 'text-slate-400 hover:text-white'}`}>
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Cocktail Selection */}
                    <div className={`border-r pr-4 ${isFoodContext ? 'border-food-purple/10' : 'border-slate-700'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className={`text-sm font-semibold uppercase tracking-wider ${isFoodContext ? 'text-food-orange' : 'text-amber-500'}`}>
                                {isFoodContext ? 'Pour quelles recettes ?' : 'Pour quels cocktails ?'}
                            </h4>
                            <button onClick={toggleAll} className={`text-xs ${isFoodContext ? 'text-food-dark/50 hover:text-food-orange' : 'text-slate-400 hover:text-white'}`}>
                                {selectedCocktailNames.length === cocktails.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {cocktails.map(cocktail => (
                                <label key={cocktail.nom} className={`flex items-center space-x-3 cursor-pointer group p-2 rounded transition-colors ${
                                    isFoodContext ? 'hover:bg-food-yellow/10' : 'hover:bg-slate-700/50'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedCocktailNames.includes(cocktail.nom)}
                                        onChange={() => toggleCocktail(cocktail.nom)}
                                        className={`form-checkbox h-4 w-4 rounded focus:ring-offset-0 ${
                                            isFoodContext
                                            ? 'text-food-orange border-food-purple/30 bg-white focus:ring-food-orange'
                                            : 'text-amber-500 border-slate-600 bg-slate-700 focus:ring-amber-500'
                                        }`}
                                    />
                                    <span className={`text-sm ${
                                        selectedCocktailNames.includes(cocktail.nom)
                                        ? (isFoodContext ? 'text-food-dark font-medium' : 'text-white')
                                        : (isFoodContext ? 'text-food-dark/60' : 'text-slate-500')
                                    }`}>
                                        {cocktail.nom}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Ingredients List */}
                    <div>
                        <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isFoodContext ? 'text-food-orange' : 'text-amber-500'}`}>Ingrédients à acheter</h4>
                        <div className={`max-h-60 overflow-y-auto rounded-lg p-4 ${isFoodContext ? 'bg-food-yellow/10' : 'bg-slate-900/50'}`}>
                        {missingIngredients.length === 0 ? (
                            <p className={`text-sm italic text-center py-4 ${isFoodContext ? 'text-food-dark/40' : 'text-slate-500'}`}>
                                {selectedCocktailNames.length === 0 ? (isFoodContext ? "Sélectionnez des recettes..." : "Sélectionnez des cocktails...") : "Rien à acheter !"}
                            </p>
                        ) : (
                            <ul className={`divide-y ${isFoodContext ? 'divide-food-purple/10' : 'divide-slate-700/50'}`}>
                                {missingIngredients.map((ing, idx) => (
                                    <li key={idx} className={`py-2 flex items-center text-sm ${isFoodContext ? 'text-food-dark/80' : 'text-slate-300'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isFoodContext ? 'bg-food-orange' : 'bg-rose-500'}`}></span>
                                        <span className="capitalize">{ing}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        </div>
                    </div>
                </div>

              </div>
            </div>
          </div>
          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isFoodContext ? 'bg-food-yellow/10' : 'bg-slate-700/50'}`}>
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors ${
                  copied
                  ? 'bg-green-600 hover:bg-green-700'
                  : (isFoodContext ? 'bg-food-purple hover:bg-food-purple/90' : 'bg-amber-600 hover:bg-amber-700')
              }`}
              onClick={handleCopy}
              disabled={missingIngredients.length === 0}
            >
              {copied ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Copié !
                  </>
              ) : (
                  <>
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                    Copier la liste
                  </>
              )}
            </button>
            <button
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                  isFoodContext
                  ? 'border-food-purple/20 bg-white text-food-dark hover:bg-food-yellow/10'
                  : 'border-slate-600 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingListModal;
