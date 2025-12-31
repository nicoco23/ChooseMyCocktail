import cocktailsData from '../JSON/Cocktails.json';
import mocktailsData from '../JSON/Mocktails.json';
import smoothiesData from '../JSON/Smoothies.json';
import ingredientsData from '../JSON/Ingredients.json';

export const cocktailService = {
  /**
   * Récupère tous les cocktails (JSON + LocalStorage)
   * Fusionne Cocktails, Mocktails, Smoothies et Custom
   */
  getAllCocktails: () => {
    const customCocktails = JSON.parse(localStorage.getItem('customCocktails') || '[]');

    // On ajoute une propriété 'category' si elle n'existe pas déjà
    const cocktails = cocktailsData.map(c => ({ ...c, category: 'cocktail' }));
    const mocktails = mocktailsData.map(c => ({ ...c, category: 'mocktail' }));
    const smoothies = smoothiesData.map(c => ({ ...c, category: 'smoothie' }));

    return [...cocktails, ...mocktails, ...smoothies, ...customCocktails];
  },

  /**
   * Récupère la liste unique de tous les ingrédients depuis le fichier maître
   */
  getAllIngredients: () => {
    // On retourne les noms des ingrédients triés
    return ingredientsData.map(i => i.nom).sort((a, b) => a.localeCompare(b));
  },

  /**
   * Récupère le type d'un ingrédient (alcool, soft, autre)
   */
  getIngredientType: (name) => {
    const ingredient = ingredientsData.find(i => i.nom.toLowerCase() === name.toLowerCase());
    return ingredient ? ingredient.type : 'autre';
  },

  /**
   * Catégorise les cocktails en fonction des ingrédients de l'utilisateur.
   * "available" : l'utilisateur a tout.
   * "needToBuy" : il manque au moins un ingrédient (retourné dans missingIngredients).
   * @param {string[]} userIngredients - Liste des ingrédients de l'utilisateur
   */
  categorizeCocktails: (userIngredients) => {
    if (!userIngredients || userIngredients.length === 0) {
      return { available: [], needToBuy: [] };
    }

    const normalize = (value = '') => value.trim().toLowerCase();
    const userIngredientsLower = userIngredients.map(normalize);
    const available = [];
    const needToBuy = [];

    // Liste des ingrédients "communs" qu'on ignore pour le calcul strict (on suppose que l'utilisateur les a ou peut s'en passer)
    const commonIngredients = ['glaçons', 'eau', 'eau gazeuse', 'sucre', 'sel', 'sucre de canne', 'sirop de sucre de canne'];

    const allCocktails = cocktailService.getAllCocktails();

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
