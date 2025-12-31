const API_URL = 'http://localhost:3001/api/recipes';

export const cocktailService = {
  /**
   * Récupère tous les cocktails (API + LocalStorage)
   * Fusionne Cocktails, Mocktails, Smoothies et Custom
   */
  getAllCocktails: async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const dbRecipes = data.data || [];

      // Filter only drink categories
      const drinks = dbRecipes
        .filter(r => ['cocktail', 'mocktail', 'smoothie'].includes(r.category))
        .map(r => ({ ...r, etapes: r.steps || r.etapes }));

      const customCocktails = JSON.parse(localStorage.getItem('customCocktails') || '[]');
      return [...drinks, ...customCocktails];
    } catch (error) {
      console.error("Error fetching cocktails:", error);
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
   * Récupère la liste unique de tous les ingrédients depuis l'API
   */
  getAllIngredients: async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const recipes = data.data || [];

      const ingredientsSet = new Set();
      recipes.forEach(r => {
        if (r.ingredients) {
          r.ingredients.forEach(i => ingredientsSet.add(i.nom || i.alcool));
        }
      });

      return Array.from(ingredientsSet).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return [];
    }
  },

  /**
   * Récupère le type d'un ingrédient (alcool, soft, autre)
   */
  getIngredientType: (name) => {
    // TODO: Implement API endpoint for ingredients metadata if needed
    return 'autre';
  },

  /**
   * Catégorise les cocktails en fonction des ingrédients de l'utilisateur.
   * "available" : l'utilisateur a tout.
   * "needToBuy" : il manque au moins un ingrédient (retourné dans missingIngredients).
   * @param {string[]} userIngredients - Liste des ingrédients de l'utilisateur
   */
  categorizeCocktails: async (userIngredients) => {
    if (!userIngredients || userIngredients.length === 0) {
      return { available: [], needToBuy: [] };
    }

    const normalize = (value = '') => value.trim().toLowerCase();
    const userIngredientsLower = userIngredients.map(normalize);
    const available = [];
    const needToBuy = [];

    // Liste des ingrédients "communs" qu'on ignore pour le calcul strict (on suppose que l'utilisateur les a ou peut s'en passer)
    const commonIngredients = ['glaçons', 'eau', 'eau gazeuse', 'sucre', 'sel', 'sucre de canne', 'sirop de sucre de canne'];

    const allCocktails = await cocktailService.getAllCocktails();

    allCocktails.forEach(cocktail => {
      const cocktailIngredients = cocktail.ingredients.map(ing => normalize(ing.nom || ing.alcool));

      const missingIngredients = cocktailIngredients.filter(ing => !userIngredientsLower.includes(ing));

      // On retire les ingrédients communs de la liste des manquants
      const realMissingIngredients = missingIngredients.filter(ing => !commonIngredients.includes(ing));

      const missingCount = realMissingIngredients.length;
      const ownedCount = cocktailIngredients.length - missingIngredients.length; // Ingrédients que l'utilisateur possède vraiment

      const enrichedCocktail = {
        ...cocktail,
        missingIngredients: realMissingIngredients,
        matchPercentage: Math.round((ownedCount / cocktailIngredients.length) * 100)
      };

      // On ne garde que les cocktails où l'utilisateur a au moins un ingrédient
      if (ownedCount > 0) {
        if (missingCount === 0) {
          available.push(enrichedCocktail);
        } else {
          // On affiche tout ce qu'il faut encore acheter, quel que soit le nombre d'ingrédients manquants.
          needToBuy.push(enrichedCocktail);
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
