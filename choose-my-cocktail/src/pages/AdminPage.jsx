import React, { useState, useEffect, useCallback } from 'react';
import { cocktailService } from '../services/cocktailService';
import { foodService } from '../services/foodService';
import { useTheme } from '../context/ThemeContext';
import { API_UPLOAD_URL, API_BASE_URL } from '../config';

const FRONT_ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN || 'admin123';

function AdminPage({ mode = 'cocktail' }) {
  const isFoodMode = mode === 'food';
  const service = isFoodMode ? foodService : cocktailService;
  const { theme } = useTheme();

  // Simple Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminToken, setAdminToken] = useState('');

  const units = isFoodMode
    ? ['g', 'kg', 'cl', 'ml', 'dl', 'l', 'c.à.c', 'c.à.s', 'pièce', 'Autre']
    : ['cl', 'ml', 'oz', 'trait', 'zeste', 'tranche', 'feuille', 'pièce', 'c.à.c', 'c.à.s', 'Autre'];

  const [recipe, setRecipe] = useState({
    nom: '',
    category: isFoodMode ? 'plat' : 'cocktail',
    preparation: '',
    cuisson: '',
    total: '',
    etapes: [{ titre: '', description: '' }],
    ingredients: [{ nom: '', amount: '', unit: isFoodMode ? 'g' : 'cl' }],
    image: '',
    equipment: [],
    tags: [],
    validated: true // Admins create validated recipes by default
  });

  // Edit mode state
  const [allRecipes, setAllRecipes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'

  // Users state
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'x-admin-token': adminToken }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [adminToken]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const availableEquipment = isFoodMode
    ? ['Four', 'Plaques', 'Poêle', 'Casserole', 'Micro-ondes', 'Air Fryer', 'Robot Cuiseur', 'Barbecue', 'Friteuse', 'Mixeur']
    : ['Shaker', 'Verre à mélange', 'Cuillère à mélange', 'Jigger', 'Passoire', 'Pilon', 'Blender', 'Presse-agrumes', 'Couteau', 'Planche à découper'];

  const availableTags = isFoodMode
    ? ['Viande', 'Poisson', 'Végétarien', 'Vegan', 'Sans Gluten', 'Soupe', 'Salade', 'Pâtes', 'Riz', 'Fruits de mer', 'Chocolat', 'Fruits', 'Fromage', 'Épicé', 'Rapide', 'Traditionnel', 'Sain', 'Gourmand']
    : ['Amer', 'Sucré', 'Acide', 'Fruité', 'Épicé', 'Fort', 'Léger', 'Sans alcool', 'Classique', 'Moderne', 'Été', 'Hiver', 'Pétillant', 'Crémeux'];

  const categories = isFoodMode
    ? ['entrée', 'plat', 'dessert']
    : ['cocktail', 'mocktail', 'smoothie', 'shot', 'punch'];

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === FRONT_ADMIN_TOKEN) {
      setIsAuthenticated(true);
      setAdminToken(password);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const loadRecipes = useCallback(async () => {
    // Pass true to fetch ALL recipes (including non-validated)
    const recipes = await service.getAllRecipes(true, adminToken);
    setAllRecipes(recipes);
  }, [service, adminToken]);

  useEffect(() => {
    if (isAuthenticated) {
      if (mode === 'users') {
        loadUsers();
      } else {
        loadRecipes();
      }
    }
  }, [isAuthenticated, loadRecipes, loadUsers, mode, service]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await fetch(API_UPLOAD_URL, {
        method: 'POST',
        headers: adminToken ? { 'x-admin-token': adminToken } : {},
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
      equipment: [],
      tags: [],
      validated: true
    });
    setViewMode('list');
  }, [isFoodMode]);

  const handleCreateNew = () => {
    resetForm();
    setViewMode('form');
  };

  const handleEditRecipe = (recipeToEdit) => {
    setEditingId(recipeToEdit.id);
    setRecipe({
        nom: recipeToEdit.nom || recipeToEdit.name,
        category: recipeToEdit.category,
        preparation: recipeToEdit.preparation_time ? `${recipeToEdit.preparation_time} min` : (recipeToEdit.preparation || ''),
        cuisson: recipeToEdit.cooking_time ? `${recipeToEdit.cooking_time} min` : (recipeToEdit.cuisson || ''),
        total: recipeToEdit.total_time ? `${recipeToEdit.total_time} min` : (recipeToEdit.total || ''),
        etapes: recipeToEdit.steps && recipeToEdit.steps.length > 0 ? recipeToEdit.steps : [{ titre: '', description: '' }],
        ingredients: recipeToEdit.ingredients.map(i => ({
            nom: i.nom,
            amount: i.quantite || '',
            unit: i.unite || 'g'
        })),
        image: recipeToEdit.image || '',
        equipment: recipeToEdit.equipment || [],
        tags: recipeToEdit.tags || [],
        validated: recipeToEdit.validated // Keep existing validation status
    });
    setViewMode('form');
  };

  const handleValidateRecipe = async (recipeToValidate) => {
    try {
        const updatedRecipe = {
            ...recipeToValidate,
            validated: 1,
            etapes: recipeToValidate.steps || recipeToValidate.etapes,
        };

        await service.updateRecipe(updatedRecipe, adminToken);
        loadRecipes(); // Refresh list
    } catch (error) {
        alert('Erreur lors de la validation : ' + error.message);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      try {
        await service.deleteRecipe(id, adminToken);
        setAllRecipes(allRecipes.filter(r => r.id !== id));
      } catch (error) {
        alert('Erreur lors de la suppression : ' + error.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newRecipe = { ...recipe, [name]: value };

    if (isFoodMode && (name === 'preparation' || name === 'cuisson')) {
      const getMinutes = (str) => {
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

  const saveToDB = async () => {
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
      id: editingId,
      kind: isFoodMode ? 'food' : 'beverage',
      beverage_type: isFoodMode ? null : recipe.category,
      etapes: validSteps,
      ingredients: validIngredients.map(ing => {
        const base = { nom: ing.nom };
        if (ing.amount) base.quantite = ing.amount;
        if (ing.unit && ing.unit !== 'Autre') base.unite = ing.unit;
        base.dose = getDose(ing);
        return base;
      }),
      // Ensure validated status is preserved or set to true for admin edits
      validated: recipe.validated ? 1 : 1
    };

    try {
      if (editingId) {
        await service.updateRecipe(finalRecipe, adminToken);
        alert('Recette mise à jour !');
      } else {
        await service.addRecipe(finalRecipe, adminToken);
        alert('Recette créée !');
      }
      loadRecipes();
      resetForm();
    } catch (error) {
      alert('Erreur lors de la sauvegarde : ' + error.message);
    }
  };

  // Styles helpers
  const getContainerClasses = () => {
    if (theme === 'kitty') {
      return "min-h-screen bg-hk-pink-pale text-hk-red-dark p-8 font-display bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]";
    }
    if (isFoodMode) {
      return "min-h-screen bg-food-yellow/10 text-food-dark p-8";
    }
    return "min-h-screen bg-gray-50 text-gray-900 p-8";
  };
  const getCardClasses = () => {
    if (theme === 'kitty') {
      return "max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-2 border-hk-pink-hot p-6 rounded-3xl shadow-[0_0_15px_rgba(255,105,180,0.3)]";
    }
    if (isFoodMode) {
      return "max-w-4xl mx-auto bg-white border border-food-purple/10 p-6 rounded-xl shadow-xl";
    }
    return "max-w-4xl mx-auto bg-white border border-gray-200 p-6 rounded-xl shadow-xl";
  };
  const getButtonPrimaryClasses = () => {
    if (theme === 'kitty') {
      return "bg-hk-pink-hot hover:bg-hk-pink-hot/90 text-white font-bold py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white";
    }
    if (isFoodMode) {
      return "bg-food-purple hover:bg-food-purple/80 text-white font-bold py-3 rounded-lg transition-colors";
    }
    return "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors";
  };
  const getInputClasses = () => {
    if (theme === 'kitty') {
      return "w-full bg-white/80 border-2 border-hk-pink-light rounded-2xl p-3 focus:ring-2 focus:ring-hk-pink-hot outline-none text-hk-red-dark placeholder-hk-pink-hot/50";
    }
    if (isFoodMode) {
      return "w-full bg-white border border-food-purple/20 rounded p-2 focus:ring-2 focus:ring-food-orange outline-none text-food-dark placeholder-food-dark/30";
    }
    return "w-full bg-white border border-gray-300 rounded p-2 focus:ring-2 focus:ring-amber-500 outline-none text-gray-900";
  };

  if (!isAuthenticated) {
    return (
      <div className={getContainerClasses()}>
        <div className={theme === 'kitty' ? "max-w-md mx-auto mt-20 p-6 bg-white/90 backdrop-blur-sm border-2 border-hk-pink-hot rounded-3xl shadow-[0_0_15px_rgba(255,105,180,0.3)]" : "max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-xl"}>
          <h2 className={theme === 'kitty' ? "text-2xl font-bold mb-4 text-center text-hk-red-dark font-display" : "text-2xl font-bold mb-4 text-center text-gray-800"}>Accès Administrateur</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className={theme === 'kitty' ? "w-full p-3 border-2 border-hk-pink-light rounded-2xl mb-4 text-hk-red-dark focus:ring-2 focus:ring-hk-pink-hot outline-none" : "w-full p-3 border rounded-lg mb-4 text-gray-800"}
            />
            <button
              type="submit"
              className={theme === 'kitty' ? "w-full bg-hk-pink-hot text-white py-3 rounded-full font-bold hover:bg-hk-pink-hot/90 shadow-lg transform hover:scale-105 transition-all duration-300" : "w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={getContainerClasses()}>
      <div className={getCardClasses()}>
        <h1 className="text-3xl font-bold mb-6 text-center">
          {mode === 'users' ? 'Gestion des Utilisateurs' : (isFoodMode ? 'Administration Cuisine' : 'Administration Cocktails')}
        </h1>

        {mode === 'users' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === 'kitty' ? 'bg-hk-pink-pale/50 text-hk-red-dark' : 'bg-gray-50 text-gray-500'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Vérifié</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className={theme === 'kitty' ? "hover:bg-hk-pink-light/10 text-hk-red-dark" : "hover:bg-black/5 text-gray-900"}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{u.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {u.email_verified ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Oui
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Non
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className={theme === 'kitty' ? "text-hk-red-hot hover:text-hk-red-hot/80" : "text-red-600 hover:text-red-900"}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mode !== 'users' && viewMode === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${theme === 'kitty' ? 'text-hk-red-light' : 'text-food-orange'}`}>Liste des Recettes</h2>
              <button
                onClick={handleCreateNew}
                className={theme === 'kitty' ? "px-4 py-2 bg-hk-pink-hot text-white rounded-full hover:bg-hk-pink-hot/90 shadow-md" : "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"}
              >
                + Nouvelle Recette
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === 'kitty' ? 'bg-hk-pink-pale/50 text-hk-red-dark' : 'bg-food-yellow/20 text-gray-500'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allRecipes.map((r) => (
                    <tr key={r.id} className={theme === 'kitty' ? "hover:bg-hk-pink-light/10 text-hk-red-dark" : "hover:bg-black/5 text-gray-900"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {r.validated ? (
                            <span className={theme === 'kitty' ? "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-hk-green-light text-white" : "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"}>
                                Validé
                            </span>
                        ) : (
                            <span className={theme === 'kitty' ? "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-hk-pink-light text-white" : "px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"}>
                                En attente
                            </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{r.nom || r.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{r.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {!r.validated && (
                            <button
                                onClick={() => handleValidateRecipe(r)}
                                className={theme === 'kitty' ? "text-hk-green-dark hover:text-hk-green-dark/80 font-bold" : "text-green-600 hover:text-green-900 font-bold"}
                            >
                                Valider
                            </button>
                        )}
                        <button
                          onClick={() => handleEditRecipe(r)}
                          className={theme === 'kitty' ? "text-hk-blue-dark hover:text-hk-blue-dark/80" : "text-indigo-600 hover:text-indigo-900"}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(r.id)}
                          className={theme === 'kitty' ? "text-hk-red-hot hover:text-hk-red-hot/80" : "text-red-600 hover:text-red-900"}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {mode !== 'users' && viewMode === 'form' && (
        <>
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${theme === 'kitty' ? 'text-hk-red-light' : isFoodMode ? 'text-food-orange' : 'text-amber-600'}`}>
                {editingId ? 'Modifier la recette' : 'Nouvelle recette'}
            </h2>
            {/* Back button for both modes now */}
            <button
                onClick={() => setViewMode('list')}
                className="text-sm underline opacity-70 hover:opacity-100"
            >
                Retour à la liste
            </button>
        </div>

        <div className="space-y-4">
          {/* Form fields similar to before */}
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la Recette</label>
            <input
              type="text"
              name="nom"
              value={recipe.nom}
              onChange={handleInputChange}
              className={getInputClasses()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select
              name="category"
              value={recipe.category}
              onChange={handleInputChange}
              className={getInputClasses()}
            >
                {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Temps</label>
            <div className="grid grid-cols-3 gap-4">
                <input type="text" name="preparation" value={recipe.preparation} onChange={handleInputChange} placeholder="Prep (min)" className={getInputClasses()} />
                <input type="text" name="cuisson" value={recipe.cuisson} onChange={handleInputChange} placeholder="Cuisson (min)" className={getInputClasses()} />
                <input type="text" name="total" value={recipe.total} onChange={handleInputChange} placeholder="Total" className={getInputClasses()} />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium mb-1">Ingrédients</label>
            {recipe.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 mb-2">
                 <input
                    value={ing.nom}
                    onChange={(e) => handleIngredientChange(index, 'nom', e.target.value)}
                    placeholder="Nom"
                    className={`${getInputClasses()} flex-grow`}
                 />
                 <input
                    value={ing.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                    placeholder="Qté"
                    className={`${getInputClasses()} w-20`}
                 />
                 <select
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className={`${getInputClasses()} w-24`}
                 >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
                 <button onClick={() => removeIngredient(index)} className="text-red-500">✕</button>
              </div>
            ))}
            <button onClick={addIngredient} className="text-sm text-indigo-500">+ Ingrédient</button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Étapes</label>
            {recipe.etapes.map((step, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                    <input
                        value={step.titre}
                        onChange={(e) => handleStepChange(index, 'titre', e.target.value)}
                        placeholder="Titre"
                        className={`${getInputClasses()} mb-1`}
                    />
                    <textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className={getInputClasses()}
                    />
                    <button onClick={() => removeStep(index)} className="text-red-500 text-sm mt-1">Supprimer étape</button>
                </div>
            ))}
            <button onClick={addStep} className="text-sm text-indigo-500">+ Étape</button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Équipement</label>
            <div className="flex flex-wrap gap-2">
              {availableEquipment.map(eq => (
                <button
                  key={eq}
                  type="button"
                  onClick={() => toggleEquipment(eq)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    recipe.equipment.includes(eq)
                      ? (theme === 'kitty' ? 'bg-hk-red-light text-white border-hk-red-light' : 'bg-food-orange text-white border-food-orange')
                      : (theme === 'kitty' ? 'bg-white text-hk-red-dark border-hk-pink-light/50 hover:bg-hk-pink-pale' : 'bg-white text-food-dark border-food-purple/20 hover:bg-food-yellow/10')
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    recipe.tags.includes(tag)
                      ? (theme === 'kitty' ? 'bg-hk-blue-light text-white border-hk-blue-light' : 'bg-food-purple text-white border-food-purple')
                      : (theme === 'kitty' ? 'bg-white text-hk-blue-dark border-hk-pink-light/50 hover:bg-hk-pink-pale' : 'bg-white text-food-dark border-food-purple/20 hover:bg-food-yellow/10')
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input type="file" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            {recipe.image && <img src={recipe.image} alt="Preview" className="h-32 mt-2 rounded" />}
          </div>

          <div className="mt-6">
            <button
              onClick={saveToDB}
              className={getButtonPrimaryClasses()}
            >
              {editingId ? 'Mettre à jour' : 'Créer et Valider'}
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
