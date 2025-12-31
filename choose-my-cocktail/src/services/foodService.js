import ingredientsData from '../JSON/FoodIngredients.json';

const API_URL = 'http://localhost:3001/api/recipes';

export const foodService = {
  /**
   * Récupère toutes les recettes depuis l'API
   */
  getAllRecipes: async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const json = await response.json();
      // Filter to keep only food recipes (exclude cocktails if any, though API serves all)
      // Assuming 'cocktail' category is for cocktails.
      return json.data.filter(r => r.category !== 'cocktail');
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
   * Récupère la liste unique de tous les ingrédients (Fichier maître + Recettes DB)
   */
  getAllIngredients: async () => {
    const staticIngredients = ingredientsData.map(i => i.nom);

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

      const all = new Set([...staticIngredients, ...dynamicIngredients]);
      return Array.from(all).sort((a, b) => a.localeCompare(b));
    } catch (e) {
      console.error("Error fetching dynamic ingredients", e);
      return staticIngredients.sort((a, b) => a.localeCompare(b));
    }
  },

  /**
   * Récupère le type d'un ingrédient
   */
  getIngredientType: (name) => {
    const ingredient = ingredientsData.find(i => i.nom.toLowerCase() === name.toLowerCase());
    return ingredient ? ingredient.type : 'autre';
  },

  /**
   * Catégorise les recettes en fonction des ingrédients de l'utilisateur et de son équipement.
   * @param {string[]} userIngredients - Liste des ingrédients de l'utilisateur
   * @param {string[]} userEquipment - Liste des équipements de l'utilisateur (optionnel)
   */
  categorizeRecipes: async (userIngredients, userEquipment = []) => {
    if (!userIngredients || userIngredients.length === 0) {
      return { available: [], needToBuy: [] };
    }

    const normalize = (value = '') => value.trim().toLowerCase();
    const userIngredientsLower = userIngredients.map(normalize);
    const userEquipmentLower = userEquipment.map(normalize);

    const available = [];
    const needToBuy = [];

    // Ingrédients de base supposés présents dans une cuisine
    const commonIngredients = ['sel', 'poivre', 'eau', 'huile', 'huile d\'olive', 'sucre', 'farine', 'beurre'];

    const allRecipes = await foodService.getAllRecipes();

    allRecipes.forEach(recipe => {
      // 1. Check Equipment
      if (recipe.equipment && recipe.equipment.length > 0) {
        const missingEquipment = recipe.equipment.filter(eq => !userEquipmentLower.includes(normalize(eq)));
        if (missingEquipment.length > 0) {
          // Si l'équipement manque, on ne propose pas la recette (ou on pourrait la mettre dans une catégorie "Impossible")
          // Pour l'instant, on l'ignore simplement.
          return;
        }
      }

      // 2. Check Ingredients
      const recipeIngredients = recipe.ingredients.map(i => normalize(i.nom));

      const missingIngredients = recipeIngredients.filter(ing => !userIngredientsLower.includes(ing));

      // On retire les ingrédients communs de la liste des manquants
      const realMissingIngredients = missingIngredients.filter(ing => !commonIngredients.includes(ing));

      const missingCount = realMissingIngredients.length;
      const ownedCount = recipeIngredients.length - missingIngredients.length;

      const enrichedRecipe = {
        ...recipe,
        missingIngredients: realMissingIngredients,
        matchPercentage: Math.round((ownedCount / recipeIngredients.length) * 100)
      };

      if (ownedCount > 0) {
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
