import React, { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function IngredientSearch({ allIngredients, selectedIngredients, onAddIngredient, onRemoveIngredient }) {
  const [query, setQuery] = useState('');

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <Combobox value={null} onChange={handleSelect}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-slate-900 text-left shadow-lg border border-slate-600 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-200">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <Combobox.Input
              className="w-full border-none py-4 pl-10 pr-10 text-lg leading-5 text-slate-100 bg-transparent focus:ring-0 outline-none placeholder-slate-500"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un ingrédient (ex: Menthe, Rhum, Citron...)"
              displayValue={() => query}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-slate-400 hover:text-amber-500 transition-colors"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-800 py-1 text-base shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-slate-700">
            {filteredIngredients.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-3 px-4 text-slate-400 italic">
                Aucun ingrédient trouvé.
              </div>
            ) : (
              filteredIngredients.map((ingredient) => (
                <Combobox.Option
                  key={ingredient}
                  className={({ active }) =>
                    `relative cursor-default select-none py-3 pl-10 pr-4 transition-colors ${
                      active ? 'bg-amber-500 text-white' : 'text-slate-300'
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
                            active ? 'text-white' : 'text-amber-500'
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
            className="inline-flex items-center rounded-full bg-slate-700 border border-slate-600 px-4 py-1.5 text-sm font-medium text-slate-200 shadow-sm hover:bg-slate-600 transition-colors group"
          >
            {ingredient}
            <button
              type="button"
              className="ml-2 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-rose-500 hover:text-white focus:bg-rose-500 focus:text-white focus:outline-none transition-all"
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
