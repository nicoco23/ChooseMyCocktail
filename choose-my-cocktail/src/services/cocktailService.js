import { API_RECIPES_URL, API_INGREDIENTS_URL, API_PAIRINGS_URL } from '../config';

export const cocktailService = {
  getAllRecipes: async (isAdmin = false, adminToken) => {
    try {
      const url = isAdmin ? `${API_RECIPES_URL}?admin=true&kind=beverage` : `${API_RECIPES_URL}?kind=beverage`;
      const response = await fetch(url, {
        headers: adminToken ? { 'x-admin-token': adminToken } : {}
      });
      const json = await response.json();
      const dbRecipes = json.data || [];

      return dbRecipes
        .filter(r => ['cocktail', 'mocktail', 'smoothie', 'shot', 'punch', 'milk-shake'].includes(r.category))
        .map(r => ({ ...r, etapes: r.steps || r.etapes }));
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  },

  /**
   * Récupère tous les cocktails (API + LocalStorage)
   * Fusionne Cocktails, Mocktails, Smoothies et Custom
   */
  getAllCocktails: async () => {
    try {
      const response = await fetch(`${API_RECIPES_URL}?kind=beverage`);
      const data = await response.json();
      const dbRecipes = data.data || [];

      // Filter only drink categories
      const drinks = dbRecipes
        .filter(r => ['cocktail', 'mocktail', 'smoothie', 'shot', 'punch'].includes(r.category))
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
  addRecipe: async (recipe, adminToken) => {
    try {
      const response = await fetch(API_RECIPES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {})
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
  updateRecipe: async (recipe, adminToken) => {
    if (!recipe.id) throw new Error("Recipe ID is required for update");
    try {
      const response = await fetch(`${API_RECIPES_URL}/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {})
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
      const response = await fetch(`${API_INGREDIENTS_URL}?kind=beverage`);
      const data = await response.json();
      return (data.data || []).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return [];
    }
  },

  /**
   * Génère des recommandations basées sur les favoris de l'utilisateur
   * @param {Array} favorites - Liste des cocktails favoris de l'utilisateur
   * @param {Array} allCocktails - Liste de tous les cocktails disponibles
   * @param {number} limit - Nombre de recommandations souhaitées (défaut 3)
   */
  getRecommendations: (favorites, allCocktails, limit = 3) => {
    if (!favorites || favorites.length === 0 || !allCocktails) return [];

    // 1. Analyser le profil de goût de l'utilisateur
    const tagFrequency = {};
    const ingredientFrequency = {};

    favorites.forEach(fav => {
      // Poids des tags
      if (fav.tags) {
        fav.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
      // Poids des ingrédients (alcools principaux surtout)
      if (fav.ingredients) {
        fav.ingredients.forEach(ing => {
          const name = (ing.nom || ing.alcool || '').toLowerCase();
          // On donne moins de poids aux ingrédients communs
          if (!['sucre', 'citron', 'glace', 'eau'].some(common => name.includes(common))) {
             ingredientFrequency[name] = (ingredientFrequency[name] || 0) + 1;
          }
        });
      }
    });

    // 2. Scorer les autres cocktails
    const scoredCocktails = allCocktails
      .filter(c => !favorites.some(f => f.id === c.id)) // Exclure les favoris actuels
      .map(cocktail => {
        let score = 0;
        const reasons = [];

        // Score par Tags
        if (cocktail.tags) {
          cocktail.tags.forEach(tag => {
            if (tagFrequency[tag]) {
              score += tagFrequency[tag] * 2; // Les tags valent 2 points par occurrence
              if (!reasons.includes(`Style ${tag}`)) reasons.push(`Style ${tag}`);
            }
          });
        }

        // Score par Ingrédients
        if (cocktail.ingredients) {
          cocktail.ingredients.forEach(ing => {
            const name = (ing.nom || ing.alcool || '').toLowerCase();
            if (ingredientFrequency[name]) {
              score += ingredientFrequency[name] * 3; // Les ingrédients valent 3 points
              if (!reasons.includes(`Contient ${name}`)) reasons.push(`Contient ${name}`);
            }
          });
        }

        return { ...cocktail, score, reasons: reasons.slice(0, 3) }; // Garder top 3 raisons
      });

    // 3. Trier et retourner les meilleurs
    return scoredCocktails
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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
   * @param {string[]} userEquipment - Liste des équipements de l'utilisateur (optionnel)
   * @param {string[]} userTags - Liste des tags sélectionnés (optionnel)
   */
  categorizeCocktails: async (userIngredients, userEquipment = [], userTags = []) => {
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

    // Liste des ingrédients "communs" qu'on ignore pour le calcul strict (on suppose que l'utilisateur les a ou peut s'en passer)
    const commonIngredients = ['glaçons', 'eau', 'eau gazeuse', 'sucre', 'sel', 'sucre de canne', 'sirop de sucre de canne'];

    const allCocktails = await cocktailService.getAllCocktails();

    allCocktails.forEach(cocktail => {
      // 1. Check Tags (Filter if tags are selected)
      if (hasTags) {
        const cocktailTags = cocktail.tags || [];
        // On vérifie si le cocktail a TOUS les tags sélectionnés (ET logique)
        // Ou au moins UN tag ? Pour les préférences, souvent c'est "Je veux du Fruité" -> OK.
        // "Je veux du Fruité ET Sans Alcool" -> OK.
        // Donc "every" semble correct pour affiner.
        const hasAllTags = userTags.every(tag => cocktailTags.includes(tag));

        // Cas spécial pour "Sans Alcool" si ce n'est pas un tag explicite mais une catégorie
        const isMocktail = cocktail.category === 'mocktail' || cocktail.category === 'smoothie';
        const wantsNoAlcohol = userTags.includes('Sans Alcool');

        if (wantsNoAlcohol && !isMocktail && !cocktailTags.includes('Sans Alcool')) return;
        if (!wantsNoAlcohol && !hasAllTags) return;
      }

      // 2. Check Equipment
      if (hasEquipment) {
        if (cocktail.equipment && cocktail.equipment.length > 0) {
           const usesSelectedEquipment = cocktail.equipment.some(eq => userEquipmentLower.includes(normalize(eq)));
           if (!usesSelectedEquipment) return;
        } else {
           // Si pas d'équipement spécifié dans la recette, on l'exclut si on cherche par équipement ?
           // Disons que oui pour l'instant.
           return;
        }
      }

      const cocktailIngredients = cocktail.ingredients.map(ing => normalize(ing.nom || ing.alcool));

      const missingIngredients = cocktailIngredients.filter(ing => !userIngredientsLower.includes(ing));

      // On retire les ingrédients communs de la liste des manquants
      const realMissingIngredients = missingIngredients.filter(ing => !commonIngredients.includes(ing));

      const missingCount = realMissingIngredients.length;
      const ownedCount = cocktailIngredients.length - missingIngredients.length; // Ingrédients que l'utilisateur possède vraiment

      const enrichedCocktail = {
        ...cocktail,
        missingIngredients: realMissingIngredients,
        matchPercentage: cocktailIngredients.length > 0 ? Math.round((ownedCount / cocktailIngredients.length) * 100) : 0
      };

      // Logique d'inclusion :
      // Si on a filtré par Ingrédients, il faut au moins un match.
      // Si on a filtré par Tags ou Equipement (sans ingrédients), on prend tout ce qui passe les filtres précédents.
      const matchesIngredients = hasIngredients ? ownedCount > 0 : true;

      // On ne garde que les cocktails où l'utilisateur a au moins un ingrédient (si ingrédients fournis)
      if (matchesIngredients) {
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
  },

  pairForFood: async (foodId, topK = 5) => {
    const response = await fetch(API_PAIRINGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodId, topK })
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pairings');
    }
    const json = await response.json();
    return json.data || [];
  }
};
