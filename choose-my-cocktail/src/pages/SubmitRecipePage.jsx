import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Combobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, TrashIcon, PhotoIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { foodService } from '../services/foodService';
import { useTheme } from '../context/ThemeContext';
import { API_UPLOAD_URL } from '../config';

function SubmitRecipePage() {
  const { theme } = useTheme();
  const service = foodService;

  const units = ['g', 'kg', 'cl', 'ml', 'dl', 'l', 'c.à.c', 'c.à.s', 'pièce', 'tranche', 'pincée', 'Autre'];

  const [recipe, setRecipe] = useState({
    nom: '',
    category: 'plat',
    preparation: '',
    cuisson: '',
    total: '',
    etapes: [{ titre: '', description: '' }],
    ingredients: [{ nom: '', amount: '', unit: 'g' }],
    image: '',
    equipment: [],
    tags: []
  });

  const [existingIngredients, setExistingIngredients] = useState([]);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const availableEquipment = ['Four', 'Plaques', 'Poêle', 'Casserole', 'Micro-ondes', 'Air Fryer', 'Robot Cuiseur', 'Barbecue', 'Friteuse', 'Mixeur', 'Batteur', 'Moule à gâteau'];
  const availableTags = ['Viande', 'Poisson', 'Végétarien', 'Vegan', 'Sans Gluten', 'Soupe', 'Salade', 'Pâtes', 'Riz', 'Fruits de mer', 'Chocolat', 'Fruits', 'Fromage', 'Épicé', 'Rapide', 'Traditionnel', 'Sain', 'Gourmand'];

  useEffect(() => {
    const loadIngredients = async () => {
        const ingredients = await service.getAllIngredients();
        setExistingIngredients(ingredients);
    };
    loadIngredients();
  }, [service]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await fetch(API_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setRecipe(prev => ({ ...prev, image: data.imageUrl }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
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

    if (name === 'preparation' || name === 'cuisson') {
      const getMinutes = (str) => {
        const match = str.toString().match(/(\d+)/);
        return match ? parseInt(match[0], 10) : 0;
      };

      const prep = name === 'preparation' ? getMinutes(value) : getMinutes(newRecipe.preparation);
      const cook = name === 'cuisson' ? getMinutes(value) : getMinutes(newRecipe.cuisson);

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

  const toggleTag = (tag) => {
    const current = recipe.tags || [];
    if (current.includes(tag)) {
      setRecipe({ ...recipe, tags: current.filter(t => t !== tag) });
    } else {
      setRecipe({ ...recipe, tags: [...current, tag] });
    }
  };

  const getDose = (ing) => {
    if (!ing.amount) return 'QS';
    if (ing.unit === 'Autre') return ing.amount;
    if (ing.unit === 'pièce') return ing.amount;
    return `${ing.amount} ${ing.unit}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!recipe.nom.trim()) {
      alert('Le nom de la recette est obligatoire.');
      return;
    }

    const validIngredients = recipe.ingredients.filter(ing => ing.nom.trim() !== '');
    if (validIngredients.length === 0) {
      alert('La recette doit contenir au moins un ingrédient.');
      return;
    }

    const validSteps = recipe.etapes.filter(step => step.description.trim() !== '');
    if (validSteps.length === 0) {
      alert('La recette doit contenir au moins une étape.');
      return;
    }

    const finalRecipe = {
      ...recipe,
      type: 'food',
      etapes: validSteps,
      ingredients: validIngredients.map(ing => ({
        nom: ing.nom,
        dose: getDose(ing),
        quantite: ing.amount,
        unite: ing.unit
      })),
      steps: validSteps, // Backend expects steps
      preparation_time: parseInt(recipe.preparation) || 0,
      cooking_time: parseInt(recipe.cuisson) || 0,
      total_time: parseInt(recipe.total) || 0,
      tags: recipe.tags || [],
      validated: 0
    };

    try {
      await service.addRecipe(finalRecipe);
      setSubmitted(true);
      setRecipe({
        nom: '',
        category: 'plat',
        preparation: '',
        cuisson: '',
        total: '',
        etapes: [{ titre: '', description: '' }],
        ingredients: [{ nom: '', amount: '', unit: 'g' }],
        image: '',
        equipment: [],
        tags: []
      });
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + error.message);
    }
  };

  // --- STYLES ---
  const isKitty = theme === 'kitty';

  const styles = {
    container: isKitty
      ? "min-h-screen bg-gradient-to-br from-hk-pink-pale to-white text-hk-red-dark p-4 md:p-8"
      : "min-h-screen bg-gradient-to-br from-food-yellow/20 to-white text-food-dark p-4 md:p-8",

    card: isKitty
      ? "max-w-5xl mx-auto bg-white/80 backdrop-blur-sm border border-hk-pink-light/30 rounded-3xl shadow-xl shadow-hk-red-light/10 overflow-hidden"
      : "max-w-5xl mx-auto bg-white/90 backdrop-blur-sm border border-food-purple/10 rounded-3xl shadow-xl overflow-hidden",

    header: isKitty
      ? "bg-gradient-to-r from-hk-red-light to-hk-red-dark p-8 text-white text-center"
      : "bg-gradient-to-r from-food-orange to-food-purple p-8 text-white text-center",

    sectionTitle: isKitty
      ? "text-xl font-bold text-hk-red-dark mb-4 flex items-center gap-2"
      : "text-xl font-bold text-food-orange mb-4 flex items-center gap-2",

    input: isKitty
      ? "w-full bg-white border border-hk-pink-light/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-hk-red-light focus:border-transparent outline-none transition-all placeholder-hk-red-dark/30"
      : "w-full bg-white border border-food-purple/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-food-orange focus:border-transparent outline-none transition-all placeholder-food-dark/30",

    label: isKitty
      ? "block text-sm font-bold mb-2 text-hk-red-dark/80 ml-1"
      : "block text-sm font-bold mb-2 text-food-dark/80 ml-1",

    buttonPrimary: isKitty
      ? "bg-hk-red-light hover:bg-hk-red-dark text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-hk-red-light/30 flex items-center justify-center gap-2"
      : "bg-gradient-to-r from-food-orange to-food-purple hover:opacity-90 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-food-purple/30 flex items-center justify-center gap-2",

    buttonSecondary: isKitty
      ? "border-2 border-dashed border-hk-pink-light/50 text-hk-red-light hover:bg-hk-pink-pale hover:border-hk-red-light rounded-xl py-3 px-4 transition-all font-medium flex items-center justify-center gap-2 w-full"
      : "border-2 border-dashed border-food-purple/30 text-food-purple hover:bg-food-yellow/10 hover:border-food-orange rounded-xl py-3 px-4 transition-all font-medium flex items-center justify-center gap-2 w-full",

    stepBox: isKitty
      ? "group relative bg-white border border-hk-pink-light/20 rounded-2xl p-6 hover:shadow-md transition-all hover:border-hk-pink-light/50"
      : "group relative bg-white border border-food-purple/10 rounded-2xl p-6 hover:shadow-md transition-all hover:border-food-orange/30",

    ingredientRow: isKitty
      ? "flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-hk-pink-pale/20 p-3 rounded-xl border border-transparent hover:border-hk-pink-light/30 transition-colors"
      : "flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-food-yellow/5 p-3 rounded-xl border border-transparent hover:border-food-orange/20 transition-colors",
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-3xl shadow-2xl">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Miam ! C'est envoyé !</h2>
          <p className="mb-8 text-lg text-gray-600">Votre recette a été bien reçue. Nos chefs (ou le chat) vont la valider très vite.</p>
          <button
            onClick={() => setSubmitted(false)}
            className={styles.buttonPrimary}
          >
            Proposer une autre recette
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className="text-4xl font-display font-bold mb-2">Partagez votre Recette</h1>
          <p className="opacity-90 text-lg">Faites découvrir vos talents culinaires à la communauté</p>
        </div>

        <div className="p-6 md:p-10 space-y-10">

          {/* Section 1: Informations Générales */}
          <section>
            <h2 className={styles.sectionTitle}>
              <PhotoIcon className="w-6 h-6" />
              La Carte d'Identité
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={styles.label}>Nom du plat</label>
                  <input
                    type="text"
                    name="nom"
                    value={recipe.nom}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Ex: Le fameux gâteau au chocolat..."
                  />
                </div>
                <div>
                  <label className={styles.label}>Catégorie</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={recipe.category}
                      onChange={handleInputChange}
                      className={`${styles.input} appearance-none`}
                    >
                      <option value="aperitif">🥜 Apéritif</option>
                      <option value="entree">🥗 Entrée</option>
                      <option value="plat">🥘 Plat Principal</option>
                      <option value="dessert">🍰 Dessert</option>
                    </select>
                    <ChevronUpDownIcon className="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className={styles.label}>Photo appétissante</label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all h-[140px] flex flex-col items-center justify-center relative overflow-hidden ${
                  isKitty ? 'border-hk-pink-light/40 hover:bg-hk-pink-pale/30' : 'border-food-purple/20 hover:bg-food-yellow/10'
                }`}>
                  {recipe.image ? (
                    <>
                      <img src={recipe.image} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                      <div className="relative z-10 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                        <span className="text-sm font-medium">Image chargée !</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <PhotoIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm">Cliquez pour ajouter une photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {uploading && <p className="text-xs text-center mt-2 text-gray-500 animate-pulse">Téléchargement en cours...</p>}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2: Temps & Matériel & Tags */}
          <section>
            <h2 className={styles.sectionTitle}>
              <ClockIcon className="w-6 h-6" />
              En Cuisine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Temps */}
              <div className="bg-gray-50/50 p-4 rounded-2xl">
                <label className={styles.label}>Temps de préparation</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-xs uppercase font-bold opacity-50 mb-1 block">Prépa (min)</span>
                    <input
                      type="number"
                      name="preparation"
                      value={recipe.preparation}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase font-bold opacity-50 mb-1 block">Cuisson (min)</span>
                    <input
                      type="number"
                      name="cuisson"
                      value={recipe.cuisson}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="0"
                    />
                  </div>
                </div>
                {recipe.total && (
                  <div className={`mt-3 text-sm font-medium text-center py-2 rounded-lg ${isKitty ? 'bg-hk-pink-pale text-hk-red-dark' : 'bg-food-yellow/20 text-food-dark'}`}>
                    Temps total estimé : {recipe.total}
                  </div>
                )}
              </div>

              {/* Équipements */}
              <div>
                <label className={styles.label}>Matériel requis</label>
                <div className="flex flex-wrap gap-2">
                  {availableEquipment.map(eq => (
                    <button
                      key={eq}
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                        recipe.equipment.includes(eq)
                          ? (isKitty ? 'bg-hk-red-light text-white border-hk-red-light shadow-md' : 'bg-food-orange text-white border-food-orange shadow-md')
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8">
              <label className={styles.label}>Tags & Régimes</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      recipe.tags?.includes(tag)
                        ? (isKitty ? 'bg-hk-pink-light text-white border-hk-pink-light shadow-md' : 'bg-food-purple text-white border-food-purple shadow-md')
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3: Ingrédients */}
          <section>
            <h2 className={styles.sectionTitle}>
              <span className="text-2xl">🥕</span>
              Les Ingrédients
            </h2>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <div className="flex-grow w-full sm:w-auto relative z-20">
                    <Combobox
                      value={ing.nom}
                      onChange={(val) => handleIngredientChange(index, 'nom', val)}
                    >
                      <div className="relative w-full">
                        <Combobox.Input
                          className={`${styles.input} py-2`}
                          onChange={(event) => {
                            setQuery(event.target.value);
                            handleIngredientChange(index, 'nom', event.target.value);
                          }}
                          placeholder="Ingrédient (ex: Farine)"
                          displayValue={(item) => item}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Combobox.Button>
                      </div>
                      <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredIngredients.length === 0 && query !== '' ? (
                          <div className="relative cursor-default select-none py-2 px-4 text-gray-700 italic">
                            Nouvel ingrédient : "{query}"
                          </div>
                        ) : (
                          filteredIngredients.map((ingredient, i) => (
                            <Combobox.Option
                              key={i}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? (isKitty ? 'bg-hk-pink-pale text-hk-red-dark' : 'bg-food-yellow/20 text-food-dark')
                                    : 'text-gray-900'
                                }`
                              }
                              value={ingredient}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                    {ingredient}
                                  </span>
                                  {selected ? (
                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${isKitty ? 'text-hk-red-light' : 'text-food-orange'}`}>
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

                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      placeholder="Qté"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className={`${styles.input} w-24 py-2 text-center`}
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      className={`${styles.input} w-28 py-2 appearance-none`}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>

                  <button
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <button onClick={addIngredient} className={styles.buttonSecondary}>
                <PlusIcon className="w-5 h-5" />
                Ajouter un ingrédient
              </button>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4: Étapes */}
          <section>
            <h2 className={styles.sectionTitle}>
              <FireIcon className="w-6 h-6" />
              La Préparation
            </h2>
            <div className="space-y-4">
              {recipe.etapes.map((step, index) => (
                <div key={index} className={styles.stepBox}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isKitty ? 'bg-hk-red-light text-white' : 'bg-food-orange text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <button
                      onClick={() => removeStep(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Titre de l'étape (ex: Préparation de la pâte)"
                    value={step.titre}
                    onChange={(e) => handleStepChange(index, 'titre', e.target.value)}
                    className={`${styles.input} mb-3 font-medium`}
                  />
                  <textarea
                    placeholder="Décrivez cette étape en détail..."
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    className={`${styles.input} min-h-[100px] resize-y`}
                  />
                </div>
              ))}

              <button onClick={addStep} className={styles.buttonSecondary}>
                <PlusIcon className="w-5 h-5" />
                Ajouter une étape
              </button>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6">
            <button
              onClick={handleSubmit}
              className={`${styles.buttonPrimary} w-full text-lg`}
            >
              <span>Envoyer ma recette au Chef</span>
            </button>
          </div>

        </div>
      </div>

      {/* Admin Link */}
      <div className="mt-12 text-center pb-8">
        <Link
          to="/admin/food"
          className={`text-sm font-medium opacity-40 hover:opacity-100 transition-all ${isKitty ? 'text-hk-red-dark' : 'text-food-dark'}`}
        >
          🔒 Accès Dashboard Admin
        </Link>
      </div>
    </div>
  );
}

export default SubmitRecipePage;
