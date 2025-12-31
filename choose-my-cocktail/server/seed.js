const db = require('./database');
const { normalizeIngredient } = require('./utils/normalization');

const sampleItems = [
  // --- BEVERAGES ---
  {
    title: 'Mojito',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le classique cubain rafraîchissant.',
    ingredients: [
      { nom: 'Rhum blanc', quantite: 5, unite: 'cl' },
      { nom: 'Menthe', quantite: 10, unite: 'feuilles' },
      { nom: 'Citron vert', quantite: 0.5, unite: 'unité' },
      { nom: 'Sucre de canne', quantite: 2, unite: 'c.à.c' },
      { nom: 'Eau gazeuse', quantite: null, unite: 'top' }
    ],
    tags: ['rafraîchissant', 'mentholé', 'agrumes', 'sucré'],
    equipment: ['Pilon', 'Verre Highball', 'Cuillère à mélange'],
    profile: { freshness: 5, acidity: 3, sweetness: 3, abv: 10, sparkling_level: 3 },
    validated: 1
  },
  {
    title: 'Margarita',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Tequila, citron vert et sel.',
    ingredients: [
      { nom: 'Tequila', quantite: 5, unite: 'cl' },
      { nom: 'Triple sec', quantite: 2, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 3, unite: 'cl' }
    ],
    tags: ['acide', 'agrumes', 'fort', 'acidulé'],
    equipment: ['Shaker', 'Verre à Margarita'],
    profile: { acidity: 5, abv: 15, sweetness: 2, freshness: 3 },
    validated: 1
  },
  {
    title: 'Cosmopolitan',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Vodka, cranberry et citron vert.',
    ingredients: [
      { nom: 'Vodka', quantite: 4, unite: 'cl' },
      { nom: 'Triple sec', quantite: 2, unite: 'cl' },
      { nom: 'Jus de cranberry', quantite: 3, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 1, unite: 'cl' }
    ],
    tags: ['fruité', 'sucré', 'acide'],
    equipment: ['Shaker', 'Verre à Martini'],
    profile: { sweetness: 3, acidity: 3, abv: 12 },
    validated: 1
  },
  {
    title: 'Old Fashioned',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Whisky, bitter et sucre.',
    ingredients: [
      { nom: 'Whisky', quantite: 6, unite: 'cl' },
      { nom: 'Angostura bitters', quantite: 2, unite: 'traits' },
      { nom: 'Sucre', quantite: 1, unite: 'morceau' }
    ],
    tags: ['fort', 'amer', 'classique'],
    equipment: ['Verre Old Fashioned', 'Cuillère à mélange'],
    profile: { abv: 30, bitterness: 3, sweetness: 2, body: 5 },
    validated: 1
  },
  {
    title: 'Cola Artisanal',
    kind: 'beverage',
    beverage_type: 'soft',
    description: 'Soda pétillant au cola.',
    ingredients: [{ nom: 'Sirop de cola', quantite: 3, unite: 'cl' }, { nom: 'Eau gazeuse', quantite: 20, unite: 'cl' }],
    tags: ['sucré', 'pétillant', 'sans alcool'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 5, sparkling_level: 5, abv: 0 },
    validated: 1
  },

  // --- FOOD ---
  {
    title: 'Salade César',
    kind: 'food',
    beverage_type: 'entrée',
    description: 'Laitue romaine, parmesan, croûtons et sauce César.',
    steps: [
        { titre: 'Préparation', description: 'Laver la salade et couper le poulet en dés.' },
        { titre: 'Cuisson', description: 'Faire dorer le poulet à la poêle.' },
        { titre: 'Assemblage', description: 'Mélanger la salade, le poulet, les croûtons et la sauce. Saupoudrer de parmesan.' }
    ],
    ingredients: [
      { nom: 'Laitue romaine', quantite: 1, unite: 'pièce' },
      { nom: 'Parmesan', quantite: 50, unite: 'g' },
      { nom: 'Poulet', quantite: 150, unite: 'g' },
      { nom: 'Sauce César', quantite: 5, unite: 'cl' }
    ],
    tags: ['frais', 'léger', 'umami', 'salé', 'Salade', 'Viande', 'Fromage'],
    equipment: ['Saladier', 'Poêle'],
    profile: { freshness: 4, creaminess: 2, body: 2 },
    validated: 1
  },
  {
    title: 'Pâtes Carbonara',
    kind: 'food',
    beverage_type: 'plat',
    description: 'La vraie recette italienne avec guanciale et pecorino.',
    steps: [
        { titre: 'Cuisson des pâtes', description: 'Cuire les spaghetti al dente dans de l\'eau bouillante salée.' },
        { titre: 'Préparation de la sauce', description: 'Mélanger les oeufs et le pecorino râpé avec beaucoup de poivre.' },
        { titre: 'Cuisson du guanciale', description: 'Faire revenir le guanciale coupé en lardons jusqu\'à ce qu\'il soit croustillant.' },
        { titre: 'Assemblage', description: 'Mélanger les pâtes avec le guanciale, puis hors du feu ajouter le mélange oeufs/fromage et un peu d\'eau de cuisson pour créer une émulsion crémeuse.' }
    ],
    ingredients: [
      { nom: 'Spaghetti', quantite: 200, unite: 'g' },
      { nom: 'Guanciale', quantite: 100, unite: 'g' },
      { nom: 'Oeufs', quantite: 3, unite: 'pièce' },
      { nom: 'Pecorino', quantite: 50, unite: 'g' }
    ],
    tags: ['gras', 'riche', 'salé', 'savoureux', 'Pâtes', 'Viande', 'Fromage', 'Traditionnel', 'Gourmand'],
    equipment: ['Casserole', 'Poêle', 'Bol'],
    profile: { creaminess: 5, body: 5, saltiness: 4 },
    validated: 1
  },
  {
    title: 'Tacos Épicés',
    kind: 'food',
    beverage_type: 'plat',
    description: 'Tacos au boeuf épicé et salsa.',
    ingredients: [
      { nom: 'Tortillas', quantite: 3, unite: 'pièce' },
      { nom: 'Boeuf haché', quantite: 150, unite: 'g' },
      { nom: 'Piment', quantite: 1, unite: 'pièce' },
      { nom: 'Salsa', quantite: 50, unite: 'g' }
    ],
    tags: ['épicé', 'savoureux', 'mexicain', 'Viande', 'Épicé', 'Mexicain'],
    equipment: ['Poêle'],
    profile: { spice_heat: 5, body: 3 },
    validated: 1
  },
  {
    title: 'Fondant au chocolat',
    kind: 'food',
    beverage_type: 'dessert',
    description: 'Coeur coulant au chocolat noir.',
    ingredients: [
      { nom: 'Chocolat noir', quantite: 200, unite: 'g' },
      { nom: 'Beurre', quantite: 150, unite: 'g' },
      { nom: 'Sucre', quantite: 100, unite: 'g' },
      { nom: 'Oeufs', quantite: 4, unite: 'pièce' }
    ],
    tags: ['sucré', 'chocolaté', 'dessert', 'riche', 'Dessert', 'Chocolat', 'Gourmand', 'Sucré'],
    equipment: ['Four', 'Bol', 'Fouet'],
    profile: { sweetness: 5, body: 4, bitterness: 2 },
    validated: 1
  }
];

async function upsertIngredient(rawName) {
  const normalized = normalizeIngredient(rawName) || rawName.toLowerCase().trim();
  await db.run(`INSERT OR IGNORE INTO ingredients (name, normalized_name) VALUES (?, ?)`, [normalized, normalized]);
  const row = await db.get(`SELECT id FROM ingredients WHERE normalized_name = ?`, [normalized]);
  return row ? row.id : null;
}

async function upsertTag(rawName) {
  const normalized = rawName.toLowerCase().trim();
  await db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [normalized]);
  const row = await db.get(`SELECT id FROM tags WHERE name = ?`, [normalized]);
  return row ? row.id : null;
}

async function upsertEquipment(rawName) {
  const normalized = rawName.trim();
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
        `INSERT INTO items (kind, beverage_type, title, description, validated, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.kind,
          item.beverage_type || null,
          item.title,
          item.description || null,
          item.validated ? 1 : 0,
          now,
          now
        ]
      );
      const itemId = insert.lastID;

      // Ingredients
      for (const ing of item.ingredients || []) {
        const ingId = await upsertIngredient(ing.nom);
        if (!ingId) continue;
        await db.run(`INSERT OR REPLACE INTO item_ingredients (item_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
          [itemId, ingId, ing.quantite ? Number(ing.quantite) : null, ing.unite || null]);
      }

      // Tags
      for (const tag of item.tags || []) {
        const tagId = await upsertTag(tag);
        if (tagId) {
          await db.run(`INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)`, [itemId, tagId]);
        }
      }

      // Equipment
      for (const eq of item.equipment || []) {
        const eqId = await upsertEquipment(eq);
        if (eqId) {
          await db.run(`INSERT OR IGNORE INTO item_equipment (item_id, equipment_id) VALUES (?, ?)`, [itemId, eqId]);
        }
      }

      // Steps
      if (item.steps && item.steps.length > 0) {
          for (let i = 0; i < item.steps.length; i++) {
              const step = item.steps[i];
              await db.run(
                  `INSERT INTO item_steps (item_id, step_order, title, description) VALUES (?, ?, ?, ?)`,
                  [itemId, i + 1, step.titre || `Étape ${i+1}`, step.description]
              );
          }
      }

      // Profile
      if (item.profile) {
        const p = item.profile;
        await db.run(`
            INSERT INTO item_profiles (item_id, sweetness, acidity, bitterness, body, spice_heat, creaminess, smokiness, freshness, sparkling_level, abv, served_cold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            itemId,
            p.sweetness || 0, p.acidity || 0, p.bitterness || 0, p.body || 0, p.spice_heat || 0,
            p.creaminess || 0, p.smokiness || 0, p.freshness || 0, p.sparkling_level || 0, p.abv || 0, p.served_cold || 0
        ]);
      }
    }
    await db.run('COMMIT');
    console.log('Seed completed successfully with rich dataset.');
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
