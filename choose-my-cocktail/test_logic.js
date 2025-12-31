
const cocktailsData = [
    {
      "nom": "Mojito",
      "ingredients": [
        { "alcool": "Rhum blanc", "dose": "6 cl" },
        { "nom": "Jus de citron vert", "dose": "3 cl" },
        { "nom": "Feuilles de menthe", "dose": "6 feuilles" },
        { "nom": "Sucre de canne", "dose": "2 cuillères à café" },
        { "nom": "Eau gazeuse", "dose": "Quantité suffisante" },
        { "nom": "Glaçons", "dose": "Quantité suffisante" }
      ]
    },
    {
      "nom": "Piña Colada",
      "ingredients": [
        { "alcool": "Rhum blanc", "dose": "5 cl" },
        { "nom": "Jus d'ananas", "dose": "12 cl" },
        { "nom": "Lait de coco", "dose": "3 cl" }
      ]
    },
    {
      "nom": "Forestier",
      "ingredients": [
        { "alcool": "Jagermeister", "dose": "5 cl" },
        { "alcool": "Amaretto", "dose": "5 cl" },
        { "nom": "limonade", "dose": "Quantité suffisante" },
        { "nom": "jus de citron", "dose": "3 cl" }
      ]
    }
];

const findPossibleCocktails = (userIngredients) => {
    if (!userIngredients || userIngredients.length === 0) {
      return { possible: [], almost: [] };
    }

    const userIngredientsLower = userIngredients.map(i => i.toLowerCase());
    const possible = [];
    const almost = [];

    // Clean list
    const commonIngredients = ['glaçons', 'eau', 'eau gazeuse', 'sucre', 'sel', 'sucre de canne', 'sirop de sucre de canne'];

    cocktailsData.forEach(cocktail => {
      const cocktailIngredients = cocktail.ingredients.map(ing => (ing.nom || ing.alcool).toLowerCase());

      const missingIngredients = cocktailIngredients.filter(ing => !userIngredientsLower.includes(ing));

      const realMissingIngredients = missingIngredients.filter(ing => !commonIngredients.includes(ing));

      const missingCount = realMissingIngredients.length;
      const ownedCount = cocktailIngredients.length - missingIngredients.length;

      console.log(`Cocktail: ${cocktail.nom}`);
      console.log(`  Missing (Raw): ${missingIngredients}`);
      console.log(`  Missing (Real): ${realMissingIngredients}`);
      console.log(`  Missing Count: ${missingCount}`);
      console.log(`  Owned Count: ${ownedCount}`);

      if (missingCount === 0) {
        possible.push(cocktail);
      } else if (missingCount <= 3 && ownedCount > 0) { // Updated to 3
        almost.push(cocktail);
      }
    });

    return { possible, almost };
};

console.log("--- Testing with 'Rhum blanc' ---");
const result1 = findPossibleCocktails(['Rhum blanc']);
console.log("Possible:", result1.possible.map(c => c.nom));
console.log("Almost:", result1.almost.map(c => c.nom));

console.log("\n--- Testing with 'Jagermeister' ---");
const result2 = findPossibleCocktails(['Jagermeister']);
console.log("Possible:", result2.possible.map(c => c.nom));
console.log("Almost:", result2.almost.map(c => c.nom));
