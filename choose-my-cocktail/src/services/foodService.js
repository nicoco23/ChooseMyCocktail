const API_URL = 'http://localhost:3001/api/recipes';

export const foodService = {
  /**
   * Récupère toutes les recettes depuis l'API
   */
  getAllRecipes: async (isAdmin = false) => {
    try {
      const url = isAdmin ? `${API_URL}?admin=true` : API_URL;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      // Filter to keep only food recipes (exclude cocktails if any, though API serves all)
      // Assuming 'cocktail' category is for cocktails.
      // Map 'steps' from API to 'etapes' for frontend compatibility
      return json.data
        .filter(r => r.category !== 'cocktail' && r.category !== 'mocktail' && r.category !== 'smoothie')
        .map(r => ({ ...r, etapes: r.steps || r.etapes }));
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      return [];
    }
  },

  /**
   * Ajoute une recette via l'API
   */
  addRecipe: async (recipe) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) {
        throw new Error('Failed to add recipe');
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding recipe:", error);
      throw error;
    }
  },

  /**
   * Met à jour une recette via l'API
   */
  updateRecipe: async (recipe) => {
    if (!recipe.id) throw new Error("Recipe ID is required for update");
    try {
      const response = await fetch(`${API_URL}/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
      });
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      return await response.json();
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  },

  /**
   * Supprime une recette via l'API
   */
  deleteRecipe: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  },

  /**
   * Récupère la liste unique de tous les ingrédients (API)
   */
  getAllIngredients: async () => {
    try {
      const recipes = await foodService.getAllRecipes();
      const dynamicIngredients = new Set();

      recipes.forEach(recipe => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            if (ing.nom) dynamicIngredients.add(ing.nom);
          });
        }
      });

      return Array.from(dynamicIngredients).sort((a, b) => a.localeCompare(b));
    } catch (e) {
      console.error("Error fetching dynamic ingredients", e);
      return [];
    }
  },

  /**
   * Récupère le type d'un ingrédient
   */
  getIngredientType: (name) => {
    return 'autre';
  },

  /**
   * Catégorise les recettes en fonction des ingrédients de l'utilisateur et de son équipement.
   * @param {string[]} userIngredients - Liste des ingrédients de l'utilisateur
   * @param {string[]} userEquipment - Liste des équipements de l'utilisateur (optionnel)
   * @param {string[]} userTags - Liste des tags sélectionnés (optionnel)
   */
  categorizeRecipes: async (userIngredients, userEquipment = [], userTags = []) => {
    const hasIngredients = userIngredients && userIngredients.length > 0;
    const hasTags = userTags && userTags.length > 0;
    const hasEquipment = userEquipment && userEquipment.length > 0;

    if (!hasIngredients && !hasTags && !hasEquipment) {
      return { available: [], needToBuy: [] };
    }

    const normalize = (value = '') => value.trim().toLowerCase();
    const userIngredientsLower = (userIngredients || []).map(normalize);
    const userEquipmentLower = (userEquipment || []).map(normalize);

    const available = [];
    const needToBuy = [];

    // Ingrédients de base supposés présents dans une cuisine
    const commonIngredients = ['sel', 'poivre', 'eau', 'huile', 'huile d\'olive'];

    const allRecipes = await foodService.getAllRecipes();

    allRecipes.forEach(recipe => {
      // 1. Check Tags (Filter if tags are selected)
      if (hasTags) {
        const recipeTags = recipe.tags || [];
        const hasAllTags = userTags.every(tag => recipeTags.includes(tag));
        if (!hasAllTags) return;
      }

      // 2. Check Equipment (Filter if equipment is selected)
      // Si l'utilisateur a sélectionné des équipements, on veut voir les recettes qui utilisent ces équipements.
      // Si l'utilisateur n'a rien sélectionné, on ignore ce filtre (on montre tout).
      if (hasEquipment) {
        if (recipe.equipment && recipe.equipment.length > 0) {
           // On vérifie si la recette utilise au moins un des équipements sélectionnés
           // (Logique de recherche "Contenant cet ustensile")
           const usesSelectedEquipment = recipe.equipment.some(eq => userEquipmentLower.includes(normalize(eq)));
           if (!usesSelectedEquipment) return;
        } else {
           // Si la recette n'a pas d'équipement et qu'on cherche par équipement, on l'exclut ?
           // "Je veux des recettes au Four". Une salade n'a pas de four. On l'exclut.
           return;
        }
      }

      // 3. Check Ingredients
      const recipeIngredients = recipe.ingredients.map(i => normalize(i.nom));

      const missingIngredients = recipeIngredients.filter(ing => !userIngredientsLower.includes(ing));

      // On retire les ingrédients communs de la liste des manquants
      const realMissingIngredients = missingIngredients.filter(ing => !commonIngredients.includes(ing));

      const missingCount = realMissingIngredients.length;
      const ownedCount = recipeIngredients.length - missingIngredients.length;

      const enrichedRecipe = {
        ...recipe,
        missingIngredients: realMissingIngredients,
        matchPercentage: recipeIngredients.length > 0 ? Math.round((ownedCount / recipeIngredients.length) * 100) : 0
      };

      // Logique d'inclusion :
      // Si on a filtré par Ingrédients, il faut au moins un match.
      // Si on a filtré par Tags ou Equipement (sans ingrédients), on prend tout ce qui passe les filtres précédents.

      const matchesIngredients = hasIngredients ? ownedCount > 0 : true;

      if (matchesIngredients) {
        if (missingCount === 0) {
            available.push(enrichedRecipe);
        } else {
            needToBuy.push(enrichedRecipe);
        }
      }
    });

    const sortByMatch = (a, b) => b.matchPercentage - a.matchPercentage || a.nom.localeCompare(b.nom);

    return {
      available: available.sort(sortByMatch),
      needToBuy: needToBuy.sort(sortByMatch)
    };
  }
};
