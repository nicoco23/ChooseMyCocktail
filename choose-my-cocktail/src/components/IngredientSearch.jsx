import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function IngredientSearch({ allIngredients, selectedIngredients, onAddIngredient, onRemoveIngredient, theme }) {
  const [query, setQuery] = useState('');
  const location = useLocation();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');

  const filteredIngredients = query === ''
    ? allIngredients
    : allIngredients.filter((ingredient) =>
        ingredient.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (value) => {
    if (value && !selectedIngredients.includes(value)) {
      onAddIngredient(value);
      setQuery('');
    }
  };

  const getThemeClasses = () => {
    if (theme === 'kitty') {
      return {
        container: "bg-white/90 backdrop-blur-sm border-2 border-hk-pink-light focus-within:border-hk-pink-hot focus-within:ring-4 focus-within:ring-hk-pink-pale rounded-[2rem] shadow-[0_5px_15px_rgba(255,105,180,0.2)]",
        input: "text-hk-red-dark placeholder-hk-red-light/70 font-display font-medium",
        icon: "text-hk-pink-hot",
        button: "text-hk-pink-hot hover:text-hk-red-dark bg-hk-pink-pale/50 rounded-full p-1 m-1",
        optionsBg: "bg-white/95 backdrop-blur-xl border-2 border-hk-pink-light rounded-2xl mt-2",
        optionActive: "bg-hk-pink-pale text-hk-red-dark font-bold",
        optionInactive: "text-hk-red-dark hover:bg-hk-pink-pale/30",
        tag: "bg-hk-pink-hot text-white border-2 border-white shadow-md rounded-full px-3 py-1 font-bold",
        tagRemove: "text-white/80 hover:text-white hover:bg-white/20 rounded-full p-0.5 ml-1"
      };
    }
    if (theme === 'creme' || isFoodContext) {
       return {
        container: "bg-white border-food-purple/20 focus-within:border-food-orange focus-within:ring-4 focus-within:ring-food-orange/10 rounded-2xl shadow-lg",
        input: "text-food-dark placeholder-food-dark/40 font-medium",
        icon: "text-food-orange",
        button: "text-food-purple hover:text-food-orange",
        optionsBg: "bg-white border-food-purple/10 rounded-xl mt-2 shadow-xl",
        optionActive: "bg-food-orange text-white",
        optionInactive: "text-food-dark hover:bg-food-yellow/10",
        tag: "bg-food-purple text-white border border-food-purple/20 rounded-full px-3 py-1 shadow-sm",
        tagRemove: "text-white/70 hover:text-white hover:bg-white/20 rounded-full ml-1"
      };
    }
    // Default Dark
    return {
        container: "bg-slate-900 border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 rounded-xl shadow-lg",
        input: "text-slate-100 placeholder-slate-500",
        icon: "text-amber-500",
        button: "text-slate-400 hover:text-amber-500",
        optionsBg: "bg-slate-800 border-slate-700 rounded-xl mt-2 shadow-xl",
        optionActive: "bg-amber-600 text-white",
        optionInactive: "text-slate-300 hover:bg-slate-700",
        tag: "bg-slate-800 border border-slate-600 text-amber-500 rounded-full px-3 py-1",
        tagRemove: "text-slate-500 hover:text-rose-500 ml-1"
    };
  };

  const classes = getThemeClasses();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <Combobox value={null} onChange={handleSelect}>
        <div className="relative mt-1">
          <div className={`relative w-full cursor-default rounded-xl text-left shadow-lg border transition-all duration-200 ${classes.container}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${classes.icon}`} aria-hidden="true" />
            </div>
            <Combobox.Input
              className={`w-full border-none py-4 pl-12 pr-12 text-lg leading-5 bg-transparent focus:ring-0 outline-none ${classes.input}`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un ingrédient (ex: Menthe, Rhum, Citron...)"
              displayValue={() => query}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className={`h-5 w-5 transition-colors ${classes.button}`}
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className={`absolute mt-2 max-h-60 w-full overflow-auto rounded-xl py-1 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border ${classes.optionsBg}`}>
            {filteredIngredients.length === 0 && query !== '' ? (
              <div className={`relative cursor-default select-none py-3 px-4 italic ${classes.optionInactive} opacity-70`}>
                Aucun ingrédient trouvé.
              </div>
            ) : (
              filteredIngredients.map((ingredient) => (
                <Combobox.Option
                  key={ingredient}
                  className={({ active }) =>
                    `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${
                      active ? classes.optionActive : classes.optionInactive
                    }`
                  }
                  value={ingredient}
                  disabled={selectedIngredients.includes(ingredient)}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        } ${selectedIngredients.includes(ingredient) ? 'opacity-50' : ''}`}
                      >
                        {ingredient}
                      </span>
                      {selectedIngredients.includes(ingredient) ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : (theme === 'kitty' ? 'text-hk-blue-light' : (theme === 'creme' || isFoodContext ? 'text-food-orange' : 'text-amber-500'))
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {/* Selected Ingredients Tags */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {selectedIngredients.map((ingredient) => (
          <span
            key={ingredient}
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm transition-colors group ${classes.tag}`}
          >
            {ingredient}
            <button
              type="button"
              className={`ml-2 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-all ${classes.tagRemove}`}
              onClick={() => onRemoveIngredient(ingredient)}
            >
              <span className="sr-only">Remove {ingredient}</span>
              <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
