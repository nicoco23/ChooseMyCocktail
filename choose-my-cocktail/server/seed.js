const db = require('./database');
const fs = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, '../src/JSON');

const files = [
  { file: 'Cocktails.json', type: 'cocktail' },
  { file: 'Entrees.json', type: 'food' },
  { file: 'Plats.json', type: 'food' },
  { file: 'Desserts.json', type: 'food' },
  { file: 'Aperitifs.json', type: 'food' }
];

db.serialize(() => {
  // Clear existing data
  db.run("DELETE FROM recipes");

  const stmt = db.prepare(`INSERT INTO recipes (
    name, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, glass, alcool, is_custom
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`);

  files.forEach(({ file, type }) => {
    const filePath = path.join(jsonDir, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      data.forEach(recipe => {
        // Normalize data
        const name = recipe.nom || recipe.name; // Cocktails use 'nom', Food might use 'nom'
        const category = recipe.category || (type === 'cocktail' ? 'cocktail' : 'plat');
        const image = recipe.image || '';
        const prepTime = parseInt(recipe.preparation) || 0; // Assuming string "10" or similar
        const cookTime = parseInt(recipe.cuisson) || 0;
        const totalTime = parseInt(recipe.total) || (prepTime + cookTime);

        // Ingredients normalization
        // Cocktails: ingredients array of objects { nom, quantite, unite } or just strings?
        // Food: ingredients array of objects { nom, quantite, unite }
        const ingredients = JSON.stringify(recipe.ingredients || []);

        // Steps normalization
        // Old cocktails: 'recette' string
        // New food: 'etapes' array of objects { titre, description }
        let steps = [];
        if (recipe.etapes) {
            steps = recipe.etapes;
        } else if (recipe.recette) {
            // Convert old string recipe to step
            steps = [{ titre: "Préparation", description: recipe.recette }];
        }

        const equipment = JSON.stringify(recipe.equipment || []);
        const glass = recipe.verre || '';
        const alcool = recipe.alcool ? 1 : 0;

        stmt.run(
          name, category, type, image, prepTime, cookTime, totalTime,
          ingredients, JSON.stringify(steps), equipment, glass, alcool
        );
      });
      console.log(`Imported ${data.length} recipes from ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
  });

  stmt.finalize();
  console.log("Data import completed.");
});
