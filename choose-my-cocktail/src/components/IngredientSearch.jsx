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
        container: "bg-hk-pink-pale border-hk-pink-light focus-within:border-hk-red-light focus-within:ring-1 focus-within:ring-hk-red-light",
        input: "text-hk-red-dark placeholder-hk-red-light/50",
        icon: "text-hk-blue-light",
        button: "text-hk-blue-light hover:text-hk-blue-dark",
        optionsBg: "bg-hk-pink-pale border-hk-pink-light",
        optionActive: "bg-hk-red-light text-white",
        optionInactive: "text-hk-red-dark",
        tag: "bg-hk-blue-light border-hk-blue-dark text-white",
        tagRemove: "text-white/70 hover:bg-hk-red-dark hover:text-white"
      };
    }
    if (theme === 'creme' || isFoodContext) {
       return {
        container: "bg-white border-food-purple/20 focus-within:border-food-orange focus-within:ring-1 focus-within:ring-food-orange",
        input: "text-food-dark placeholder-food-dark/40",
        icon: "text-food-purple",
        button: "text-food-purple hover:text-food-orange",
        optionsBg: "bg-white border-food-purple/10",
        optionActive: "bg-food-orange text-white",
        optionInactive: "text-food-dark",
        tag: "bg-food-yellow/20 border-food-purple/20 text-food-dark",
        tagRemove: "text-food-dark/50 hover:bg-food-orange hover:text-white"
      };
    }
    // Default Dark
    return {
        container: "bg-slate-900 border-slate-600 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500",
        input: "text-slate-100 placeholder-slate-500",
        icon: "text-slate-400",
        button: "text-slate-400 hover:text-amber-500",
        optionsBg: "bg-slate-800 border-slate-700",
        optionActive: "bg-amber-500 text-white",
        optionInactive: "text-slate-300",
        tag: "bg-slate-700 border-slate-600 text-slate-200",
        tagRemove: "text-slate-400 hover:bg-rose-500 hover:text-white"
    };
  };

  const classes = getThemeClasses();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <Combobox value={null} onChange={handleSelect}>
        <div className="relative mt-1">
          <div className={`relative w-full cursor-default overflow-hidden rounded-xl text-left shadow-lg border transition-all duration-200 ${classes.container}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${classes.icon}`} aria-hidden="true" />
            </div>
            <Combobox.Input
              className={`w-full border-none py-4 pl-10 pr-10 text-lg leading-5 bg-transparent focus:ring-0 outline-none ${classes.input}`}
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
