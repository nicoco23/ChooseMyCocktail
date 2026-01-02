const db = require('./database');

async function checkPoulet() {
    try {
        console.log("Checking 'Poulet'...");
        const sql = `
            SELECT i.title, i.kind, ing.name
            FROM items i
            JOIN item_ingredients ii ON i.id = ii.item_id
            JOIN ingredients ing ON ii.ingredient_id = ing.id
            WHERE ing.name LIKE '%Poulet%'
        `;
        const rows = await db.all(sql);
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkPoulet();
