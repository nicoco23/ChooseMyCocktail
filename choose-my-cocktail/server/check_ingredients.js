const db = require('./database');

async function checkIngredients() {
    try {
        console.log('Checking for food ingredients in beverages...');

        // Find ingredients that are used in beverages but seem like food
        // This is hard to define strictly, but we can list all ingredients in beverages
        // and see if any suspicious ones appear.

        const sql = `
            SELECT DISTINCT ing.name, i.title as item_title, i.kind
            FROM ingredients ing
            JOIN item_ingredients ii ON ing.id = ii.ingredient_id
            JOIN items i ON ii.item_id = i.id
            WHERE i.kind = 'beverage'
            ORDER BY ing.name
        `;

        const rows = await db.all(sql);
        console.log(`Found ${rows.length} ingredient usages in beverages.`);

        // Group by ingredient
        const ingredients = {};
        rows.forEach(r => {
            if (!ingredients[r.name]) ingredients[r.name] = [];
            ingredients[r.name].push(r.item_title);
        });

        console.log('Ingredients in beverages:', Object.keys(ingredients));

    } catch (error) {
        console.error(error);
    }
}

checkIngredients();
