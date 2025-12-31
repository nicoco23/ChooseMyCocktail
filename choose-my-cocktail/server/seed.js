const db = require('./database');
const { normalizeName } = require('./utils/normalization');

const sampleItems = [
  {
    title: 'Margarita',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Tequila, citron vert et une touche de sel.',
    ingredients: [
      { nom: 'Tequila', quantite: 5, unite: 'cl' },
      { nom: 'Triple sec', quantite: 2, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 3, unite: 'cl' },
      { nom: 'Sel', quantite: null, unite: null }
    ],
    steps: [
      { titre: 'Préparer le verre', description: 'Givrer le bord du verre avec du sel.' },
      { titre: 'Shaker', description: 'Mélanger tous les ingrédients avec des glaçons puis filtrer.' }
    ],
    equipment: ['Shaker', 'Verre à margarita'],
    tags: ['acidulé', 'classique'],
    glass: 'margarita',
    validated: 1,
    alcool: 1,
    category: 'cocktail'
  },
  {
    title: 'Pâtes au pesto',
    kind: 'food',
    beverage_type: null,
    description: 'Pâtes fraîches au pesto basilic maison.',
    ingredients: [
      { nom: 'Pâtes', quantite: 200, unite: 'g' },
      { nom: 'Basilic', quantite: 1, unite: 'botte' },
      { nom: 'Pignons de pin', quantite: 30, unite: 'g' },
      { nom: 'Parmesan', quantite: 40, unite: 'g' },
      { nom: 'Huile d\'olive', quantite: 4, unite: 'c.à.s' }
    ],
    steps: [
      { titre: 'Cuisson', description: 'Cuire les pâtes al dente.' },
      { titre: 'Pesto', description: 'Mixer basilic, pignons, parmesan, huile.' },
      { titre: 'Mélanger', description: 'Assembler pâtes et pesto avec un peu d\'eau de cuisson.' }
    ],
    equipment: ['Mixeur', 'Casserole'],
    tags: ['végétarien', 'rapide'],
    validated: 1,
    alcool: 0,
    category: 'plat'
  }
];

async function upsertIngredient(rawName) {
  const normalized = normalizeName(rawName);
  if (!normalized) return null;
  await db.run(`INSERT OR IGNORE INTO ingredients (name, normalized_name) VALUES (?, ?)`, [normalized, normalized]);
  const row = await db.get(`SELECT id FROM ingredients WHERE normalized_name = ?`, [normalized]);
  return row ? row.id : null;
}

async function upsertTag(rawName) {
  const normalized = normalizeName(rawName);
  if (!normalized) return null;
  await db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [normalized]);
  const row = await db.get(`SELECT id FROM tags WHERE name = ?`, [normalized]);
  return row ? row.id : null;
}

async function upsertEquipment(rawName) {
  const normalized = normalizeName(rawName);
  if (!normalized) return null;
  await db.run(`INSERT OR IGNORE INTO equipment (name) VALUES (?)`, [normalized]);
  const row = await db.get(`SELECT id FROM equipment WHERE name = ?`, [normalized]);
  return row ? row.id : null;
}

async function seed() {
  try {
    console.log('Starting seed...');
    await db.run('PRAGMA foreign_keys = OFF');
    await db.run('BEGIN TRANSACTION');

    // Clean existing data
    await db.run('DELETE FROM item_ingredients');
    await db.run('DELETE FROM item_tags');
    await db.run('DELETE FROM item_equipment');
    await db.run('DELETE FROM item_profiles');
    await db.run('DELETE FROM items');
    await db.run('DELETE FROM ingredients');
    await db.run('DELETE FROM tags');
    await db.run('DELETE FROM equipment');

    await db.run('COMMIT');
    await db.run('PRAGMA foreign_keys = ON');

    await db.run('BEGIN TRANSACTION');
    for (const item of sampleItems) {
      const now = new Date().toISOString();
      const insert = await db.run(
        `INSERT INTO items (kind, beverage_type, title, description, instructions, image_url, preparation_time, cooking_time, total_time, glass, validated, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.kind,
          item.beverage_type,
          item.title,
          item.description || null,
          JSON.stringify(item.steps || []),
          item.image_url || null,
          item.preparation_time || null,
          item.cooking_time || null,
          item.total_time || null,
          item.glass || null,
          item.validated ? 1 : 0,
          now,
          now
        ]
      );
      const itemId = insert.lastID;

      for (const ing of item.ingredients || []) {
        const ingId = await upsertIngredient(ing.nom || ing.name || ing.alcool || '');
        if (!ingId) continue;
        await db.run(`INSERT OR REPLACE INTO item_ingredients (item_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
          [itemId, ingId, ing.quantite ? Number(ing.quantite) : null, ing.unite || ing.unit || null]);
      }

      for (const tag of item.tags || []) {
        const tagId = await upsertTag(tag);
        if (tagId) {
          await db.run(`INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)`, [itemId, tagId]);
        }
      }

      for (const eq of item.equipment || []) {
        const eqId = await upsertEquipment(eq);
        if (eqId) {
          await db.run(`INSERT OR IGNORE INTO item_equipment (item_id, equipment_id) VALUES (?, ?)`, [itemId, eqId]);
        }
      }
    }
    await db.run('COMMIT');
    console.log('Seed completed successfully with sample items.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    try {
      await db.run('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    process.exit(1);
  }
}

seed();
