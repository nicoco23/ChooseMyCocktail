import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cocktailService } from '../services/cocktailService';
import { foodService } from '../services/foodService';

function AdminPage({ mode = 'cocktail' }) {
  const location = useLocation();
  const isFoodMode = mode === 'food';
  const service = isFoodMode ? foodService : cocktailService;

  const units = ['g', 'kg', 'cl', 'ml', 'dl', 'l', 'c.à.c', 'c.à.s', 'pièce', 'Autre'];

  const [recipe, setRecipe] = useState({
    nom: '',
    category: isFoodMode ? 'plat' : 'cocktail',
    preparation: '',
    cuisson: '',
    total: '',
    etapes: [{ titre: '', description: '' }],
    ingredients: [{ nom: '', amount: '', unit: 'g' }],
    image: '',
    equipment: [] // New field for equipment
  });

  const [existingIngredients, setExistingIngredients] = useState([]);
  const [generatedJson, setGeneratedJson] = useState('');
  const [query, setQuery] = useState('');

  // Edit mode state
  const [allRecipes, setAllRecipes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Equipment list (could be moved to a JSON later)
  const availableEquipment = ['Four', 'Plaques', 'Poêle', 'Casserole', 'Micro-ondes', 'Air Fryer', 'Robot Cuiseur', 'Barbecue', 'Friteuse', 'Mixeur'];

  const resetForm = useCallback(() => {
    setEditingId(null);
    setRecipe({
      nom: '',
      category: isFoodMode ? 'plat' : 'cocktail',
      preparation: '',
      cuisson: '',
      total: '',
      etapes: [{ titre: '', description: '' }],
      ingredients: [{ nom: '', amount: '', unit: 'g' }],
      image: '',
      equipment: []
    });
  }, [isFoodMode]);

  useEffect(() => {
    const loadIngredients = async () => {
        const ingredients = await service.getAllIngredients();
        setExistingIngredients(ingredients);
    };
    loadIngredients();

    if (isFoodMode) {
        service.getAllRecipes().then(setAllRecipes);
    }

    // Check for recipe passed via navigation state
    if (location.state && location.state.recipeToEdit) {
        const selected = location.state.recipeToEdit;
        setEditingId(selected.id);
        setRecipe({
            nom: selected.nom || selected.name,
            category: selected.category,
            preparation: selected.preparation_time ? `${selected.preparation_time} min` : (selected.preparation || ''),
            cuisson: selected.cooking_time ? `${selected.cooking_time} min` : (selected.cuisson || ''),
            total: selected.total_time ? `${selected.total_time} min` : (selected.total || ''),
            etapes: selected.steps && selected.steps.length > 0 ? selected.steps : [{ titre: '', description: '' }],
            ingredients: selected.ingredients.map(i => ({
                nom: i.nom,
                amount: i.quantite || '',
                unit: i.unite || 'g'
            })),
            image: selected.image || '',
            equipment: selected.equipment || []
        });
        // Clear state to avoid re-triggering on refresh if possible, though location.state persists
        window.history.replaceState({}, document.title);
    } else {
        resetForm();
    }
  }, [mode, isFoodMode, location.state, service, resetForm]);

  const handleSelectRecipeToEdit = (e) => {
    const recipeId = e.target.value;
    if (!recipeId) {
        resetForm();
        return;
    }
    const selected = allRecipes.find(r => r.id.toString() === recipeId);
    if (selected) {
        setEditingId(selected.id);
        setRecipe({
            nom: selected.nom || selected.name,
            category: selected.category,
            preparation: selected.preparation_time ? `${selected.preparation_time} min` : (selected.preparation || ''),
            cuisson: selected.cooking_time ? `${selected.cooking_time} min` : (selected.cuisson || ''),
            total: selected.total_time ? `${selected.total_time} min` : (selected.total || ''),
            etapes: selected.steps && selected.steps.length > 0 ? selected.steps : [{ titre: '', description: '' }],
            ingredients: selected.ingredients.map(i => ({
                nom: i.nom,
                amount: i.quantite || '',
                unit: i.unite || 'g'
            })),
            image: selected.image || '',
            equipment: selected.equipment || []
        });
    }
  };

  const filteredIngredients =
    query === ''
      ? existingIngredients
      : existingIngredients.filter((ing) =>
          ing.toLowerCase().includes(query.toLowerCase())
        );

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newRecipe = { ...recipe, [name]: value };

    // Auto-calculate total time for Food recipes
    if (isFoodMode && (name === 'preparation' || name === 'cuisson')) {
      const getMinutes = (str) => {
        // Extract first number found
        const match = str.toString().match(/(\d+)/);
        return match ? parseInt(match[0], 10) : 0;
      };

      const prep = getMinutes(newRecipe.preparation);
      const cook = getMinutes(newRecipe.cuisson);

      if (prep > 0 || cook > 0) {
        const totalMin = prep + cook;
        let totalStr = '';
        if (totalMin >= 60) {
          const h = Math.floor(totalMin / 60);
          const m = totalMin % 60;
          totalStr = `${h}h${m > 0 ? String(m).padStart(2, '0') : ''}`;
        } else {
          totalStr = `${totalMin} min`;
        }
        newRecipe.total = totalStr;
      }
    }

    setRecipe(newRecipe);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index][field] = value;

    // Auto-detect alcohol type if name changes (only for cocktails)
    if (!isFoodMode && field === 'nom') {
      const type = service.getIngredientType(value);
      newIngredients[index].isAlcohol = type === 'alcool';
    }

    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...recipe.etapes];
    newSteps[index][field] = value;
    setRecipe({ ...recipe, etapes: newSteps });
  };

  const addStep = () => {
    setRecipe({
      ...recipe,
      etapes: [...recipe.etapes, { titre: '', description: '' }]
    });
  };

  const removeStep = (index) => {
    const newSteps = recipe.etapes.filter((_, i) => i !== index);
    setRecipe({ ...recipe, etapes: newSteps });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, { nom: '', amount: '', unit: 'g' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const toggleEquipment = (eq) => {
    const current = recipe.equipment || [];
    if (current.includes(eq)) {
      setRecipe({ ...recipe, equipment: current.filter(e => e !== eq) });
    } else {
      setRecipe({ ...recipe, equipment: [...current, eq] });
    }
  };

  const getDose = (ing) => {
    if (!ing.amount) return 'QS';
    if (ing.unit === 'Autre') return ing.amount;
    if (ing.unit === 'pièce') return ing.amount;
    return `${ing.amount} ${ing.unit}`;
  };

  const generateJson = () => {
    const cleanIngredients = recipe.ingredients.filter(ing => ing.nom.trim() !== '');

    const finalRecipe = {
      ...recipe,
      ingredients: cleanIngredients.map(ing => {
        const dose = getDose(ing);
        if (!isFoodMode) {
           const isAlcohol = ing.isAlcohol !== undefined ? ing.isAlcohol : service.getIngredientType(ing.nom) === 'alcool';
           if (isAlcohol) return { alcool: ing.nom, dose: dose };
        }
        return { nom: ing.nom, dose: dose };
      })
    };

    setGeneratedJson(JSON.stringify(finalRecipe, null, 2) + ',');
  };

  const saveToDB = async () => {
    if (!isFoodMode) {
      alert("La sauvegarde en base de données n'est disponible que pour la cuisine pour le moment.");
      return;
    }

    const cleanIngredients = recipe.ingredients.filter(ing => ing.nom.trim() !== '');
    const finalRecipe = {
      ...recipe,
      id: editingId,
      type: 'food',
      ingredients: cleanIngredients.map(ing => {
        const base = { nom: ing.nom };
        if (ing.amount) base.quantite = ing.amount; // Legacy field name 'quantite' vs 'amount'
        if (ing.unit && ing.unit !== 'Autre') base.unite = ing.unit;
        base.dose = getDose(ing); // Add dose for display compatibility
        return base;
      })
    };

    try {
      if (editingId) {
        await service.updateRecipe(finalRecipe);
        alert('Recette mise à jour en base de données !');
      } else {
        await service.addRecipe(finalRecipe);
        alert('Recette créée en base de données !');
      }
      // Refresh list
      service.getAllRecipes().then(setAllRecipes);
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + error.message);
    }
  };

  const saveToLocal = () => {
    const cleanIngredients = recipe.ingredients.filter(ing => ing.nom.trim() !== '');

    const finalRecipe = {
      ...recipe,
      ingredients: cleanIngredients.map(ing => {
        const dose = getDose(ing);
        if (!isFoodMode) {
           const isAlcohol = ing.isAlcohol !== undefined ? ing.isAlcohol : service.getIngredientType(ing.nom) === 'alcool';
           if (isAlcohol) return { alcool: ing.nom, dose: dose };
        }
        return { nom: ing.nom, dose: dose };
      })
    };

    const storageKey = isFoodMode ? 'customFood' : 'customCocktails';
    const existingCustom = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newCustom = [...existingCustom, finalRecipe];
    localStorage.setItem(storageKey, JSON.stringify(newCustom));

    alert('Recette sauvegardée sur cet appareil !');

    setRecipe({
      nom: '',
      category: isFoodMode ? 'plat' : 'cocktail',
      preparation: '',
      cuisson: '',
      total: '',
      etapes: [{ titre: '', description: '' }],
      ingredients: [{ nom: '', amount: '', unit: 'g' }],
      image: '',
      equipment: []
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
    alert('JSON copié !');
  };

  const getContainerClasses = () => isFoodMode ? "min-h-screen bg-food-yellow/10 text-food-dark p-8" : "min-h-screen bg-slate-900 text-slate-100 p-8";
  const getCardClasses = () => isFoodMode ? "max-w-2xl mx-auto bg-white border border-food-purple/10 p-6 rounded-xl shadow-xl" : "max-w-2xl mx-auto bg-slate-800 p-6 rounded-xl shadow-xl";
  const getTitleClasses = () => isFoodMode ? "text-3xl font-bold mb-6 text-food-dark" : "text-3xl font-bold mb-6 text-amber-500";
  const getInputClasses = () => isFoodMode ? "w-full bg-white border border-food-purple/20 rounded p-2 focus:ring-2 focus:ring-food-orange outline-none text-food-dark placeholder-food-dark/30" : "w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-amber-500 outline-none";
  const getLabelClasses = () => isFoodMode ? "block text-sm font-medium mb-1 text-food-dark/80" : "block text-sm font-medium mb-1";
  const getSubLabelClasses = () => isFoodMode ? "block text-xs text-food-dark/60 mb-1" : "block text-xs text-slate-400 mb-1";
  const getStepBoxClasses = () => isFoodMode ? "mb-4 bg-food-yellow/10 p-4 rounded-lg border border-food-purple/10" : "mb-4 bg-slate-700/50 p-4 rounded-lg border border-slate-600";
  const getButtonPrimaryClasses = () => isFoodMode ? "bg-food-purple hover:bg-food-purple/80 text-white font-bold py-3 rounded-lg transition-colors" : "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors";
  const getButtonSecondaryClasses = () => isFoodMode ? "bg-food-yellow hover:bg-food-yellow/90 text-food-dark font-bold py-3 rounded-lg transition-colors" : "bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors";
  const getButtonTertiaryClasses = () => isFoodMode ? "bg-food-orange hover:bg-food-orange/90 text-white font-bold py-3 rounded-lg transition-colors" : "bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors";

  return (
    <div className={getContainerClasses()}>
      <div className={getCardClasses()}>
        <h1 className={getTitleClasses()}>
          {isFoodMode ? (editingId ? 'Modifier une Recette' : 'Ajouter une Recette Cuisine') : 'Ajouter un Cocktail'}
        </h1>

        {isFoodMode && (
          <div className="mb-8 p-4 bg-food-yellow/10 rounded-lg border border-food-purple/10">
            <label className="block text-sm font-medium mb-2 text-food-orange">Modifier une recette existante</label>
            <select
              onChange={handleSelectRecipeToEdit}
              value={editingId || ''}
              className={getInputClasses()}
            >
              <option value="">-- Créer une nouvelle recette --</option>
              {allRecipes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nom || r.name} ({r.category})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={getLabelClasses()}>Type de Recette</label>
            <select
              name="category"
              value={recipe.category}
              onChange={handleInputChange}
              className={getInputClasses()}
            >
              {isFoodMode ? (
                <>
                  <option value="entrée">Entrée</option>
                  <option value="plat">Plat</option>
                  <option value="dessert">Dessert</option>
                  <option value="apéritif">Apéritif</option>
                </>
              ) : (
                <>
                  <option value="cocktail">Cocktail (Alcoolisé)</option>
                  <option value="mocktail">Mocktail (Sans Alcool)</option>
                  <option value="smoothie">Smoothie</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className={getLabelClasses()}>Nom de la Recette</label>
            <input
              type="text"
              name="nom"
              value={recipe.nom}
              onChange={handleInputChange}
              className={getInputClasses()}
            />
          </div>

          <div>
            <label className={getLabelClasses()}>Temps (en minutes ou texte)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={getSubLabelClasses()}>Préparation {isFoodMode && '(min)'}</label>
                <input
                  type="text"
                  name="preparation"
                  value={recipe.preparation}
                  onChange={handleInputChange}
                  placeholder={isFoodMode ? "ex: 15" : "ex: 15 min"}
                  className={getInputClasses()}
                />
              </div>
              {isFoodMode && (
                <div>
                  <label className={getSubLabelClasses()}>Cuisson (min)</label>
                  <input
                    type="text"
                    name="cuisson"
                    value={recipe.cuisson}
                    onChange={handleInputChange}
                    placeholder="ex: 45"
                    className={getInputClasses()}
                  />
                </div>
              )}
              <div>
                <label className={getSubLabelClasses()}>Total</label>
                <input
                  type="text"
                  name="total"
                  value={recipe.total}
                  onChange={handleInputChange}
                  placeholder="ex: 1h"
                  className={getInputClasses()}
                />
              </div>
            </div>
          </div>

          {isFoodMode && (
            <div>
              <label className={getLabelClasses()}>Équipement Nécessaire</label>
              <div className="flex flex-wrap gap-2">
                {availableEquipment.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      recipe.equipment?.includes(eq)
                        ? 'bg-food-orange border-food-orange text-white'
                        : 'bg-white border-food-purple/20 text-food-dark/70 hover:border-food-orange'
                    }`}
                  >
                    {eq}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={getLabelClasses()}>Étapes de Préparation</label>
            {recipe.etapes.map((step, index) => (
              <div key={index} className={getStepBoxClasses()}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold uppercase ${isFoodMode ? 'text-food-orange' : 'text-amber-500'}`}>Étape {index + 1}</span>
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Titre de l'étape (ex: Préparation des légumes)"
                  value={step.titre}
                  onChange={(e) => handleStepChange(index, 'titre', e.target.value)}
                  className={`${getInputClasses()} mb-2 text-sm`}
                />
                <textarea
                  placeholder="Description détaillée..."
                  value={step.description}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  rows="3"
                  className={`${getInputClasses()} text-sm`}
                />
              </div>
            ))}
            <button
              onClick={addStep}
              className={`text-sm font-medium ${isFoodMode ? 'text-food-orange hover:text-food-orange/80' : 'text-amber-500 hover:text-amber-400'}`}
            >
              + Ajouter une étape
            </button>
          </div>

          <div>
            <label className={getLabelClasses()}>Ingrédients</label>

            {recipe.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center relative z-10">
                <div className="flex-1 relative">
                  <Combobox
                    value={ing.nom}
                    onChange={(value) => handleIngredientChange(index, 'nom', value)}
                  >
                    <div className="relative w-full">
                      <Combobox.Input
                        className={`${getInputClasses()} pr-10`}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          handleIngredientChange(index, 'nom', event.target.value);
                        }}
                        placeholder="Nom"
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className={`h-5 w-5 ${isFoodMode ? 'text-food-dark/50' : 'text-slate-400'}`}
                          aria-hidden="true"
                        />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className={`absolute mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 ${isFoodMode ? 'bg-white border border-food-purple/20' : 'bg-slate-800'}`}>
                      {filteredIngredients.length === 0 && query !== '' ? (
                        <div className={`relative cursor-default select-none py-2 px-4 ${isFoodMode ? 'text-food-dark/60' : 'text-slate-400'}`}>
                          Créer "{query}"
                        </div>
                      ) : (
                        filteredIngredients.map((ingredient, i) => (
                          <Combobox.Option
                            key={i}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? (isFoodMode ? 'bg-food-orange text-white' : 'bg-amber-600 text-white')
                                  : (isFoodMode ? 'text-food-dark' : 'text-slate-100')
                              }`
                            }
                            value={ingredient}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? 'font-medium' : 'font-normal'
                                  }`}
                                >
                                  {ingredient}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active
                                        ? (isFoodMode ? 'text-white' : 'text-white')
                                        : (isFoodMode ? 'text-food-orange' : 'text-amber-600')
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
                  </Combobox>
                </div>

                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder={ing.unit === 'Autre' ? "Ex: 1 pincée" : "Qté"}
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    className={`${getInputClasses()} w-20 text-sm`}
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className={`${getInputClasses()} w-24 text-sm`}
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                {!isFoodMode && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ing.isAlcohol || false}
                      onChange={(e) => handleIngredientChange(index, 'isAlcohol', e.target.checked)}
                      className="form-checkbox h-5 w-5 text-amber-500 rounded focus:ring-0 bg-slate-700 border-slate-600"
                    />
                    <span className="text-xs">Alcool</span>
                  </label>
                )}
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className={`mt-2 text-sm font-medium ${isFoodMode ? 'text-food-orange hover:text-food-orange/80' : 'text-amber-500 hover:text-amber-400'}`}
            >
              + Ajouter un ingrédient
            </button>
          </div>

          <div>
            <label className={getLabelClasses()}>Image URL (Optionnel)</label>
            <input
              type="text"
              name="image"
              value={recipe.image}
              onChange={handleInputChange}
              placeholder="Laisser vide si pas d'image"
              className={getInputClasses()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button
              onClick={saveToDB}
              className={getButtonPrimaryClasses()}
            >
              {editingId ? 'Mettre à jour (DB)' : 'Sauvegarder (DB)'}
            </button>
            <button
              onClick={saveToLocal}
              className={getButtonSecondaryClasses()}
            >
              Sauvegarder (Local)
            </button>
            <button
              onClick={generateJson}
              className={getButtonTertiaryClasses()}
            >
              Générer le JSON (Dev)
            </button>
          </div>

          {generatedJson && (
            <div className="mt-6">
              <label className={getLabelClasses()}>Résultat à copier dans src/JSON/{isFoodMode ? 'Plats.json' : 'Cocktails.json'}</label>
              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-green-400">
                  {generatedJson}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1 rounded"
                >
                  Copier
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
