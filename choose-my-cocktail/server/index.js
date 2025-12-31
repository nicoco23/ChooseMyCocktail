const express = require('express');
const cors = require('cors');
const db = require('./database');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Helpers
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  const isAdmin = req.query.admin === 'true';

  const sql = `
    SELECT r.*,
    (SELECT json_group_array(json_object('nom', i.name, 'amount', ri.quantity, 'unit', ri.unit))
     FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.id WHERE ri.recipe_id = r.id) as ingredients_rel,
    (SELECT json_group_array(t.name) FROM recipe_tags rt JOIN tags t ON rt.tag_id = t.id WHERE rt.recipe_id = r.id) as tags_rel,
    (SELECT json_group_array(e.name) FROM recipe_equipment re JOIN equipment e ON re.equipment_id = e.id WHERE re.recipe_id = r.id) as equipment_rel
    FROM recipes r
    WHERE ${isAdmin ? '1=1' : 'validated = 1'}
  `;

  try {
      const rows = await all(sql);
      const recipes = rows.map(row => {
          // Prefer relational data, fallback to JSON columns if migration failed or for legacy support
          let ingredients = [];
          try { ingredients = JSON.parse(row.ingredients_rel); } catch(e) {}
          // If relational data is empty (e.g. old data not migrated properly or empty), try legacy column
          // But migration script should have handled it.
          // Note: json_group_array returns "[{}]" or "[]" string.

          // Clean up empty objects from json_group_array if any (SQLite sometimes returns [null] or similar if join fails)
          if (ingredients.length === 1 && !ingredients[0].nom) ingredients = [];

          let tags = [];
          try { tags = JSON.parse(row.tags_rel); } catch(e) {}
          if (tags.length === 1 && !tags[0]) tags = [];

          let equipment = [];
          try { equipment = JSON.parse(row.equipment_rel); } catch(e) {}
          if (equipment.length === 1 && !equipment[0]) equipment = [];

          return {
            ...row,
            nom: row.name,
            ingredients: ingredients,
            steps: JSON.parse(row.steps || '[]'),
            equipment: equipment,
            tags: tags,
            alcool: !!row.alcool,
            is_custom: !!row.is_custom,
            validated: !!row.validated
          };
      });
      res.json({ message: "success", data: recipes });
  } catch (err) {
      res.status(400).json({ "error": err.message });
  }
});

// Add a new recipe
app.post('/api/recipes', async (req, res) => {
  const {
    name, nom, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, tags, glass, alcool, validated
  } = req.body;

  const finalName = name || nom;
  const isValidated = validated ? 1 : 0;

  try {
      await run("BEGIN TRANSACTION");

      // Insert into recipes (keeping JSON columns for backup/legacy for now, but could be removed)
      const sql = `INSERT INTO recipes (
        name, category, type, image, preparation_time, cooking_time, total_time,
        ingredients, steps, equipment, tags, glass, alcool, is_custom, validated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`;

      const params = [
        finalName, category, type, image, preparation_time, cooking_time, total_time,
        JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), JSON.stringify(tags || []), glass, alcool ? 1 : 0, isValidated
      ];

      const result = await run(sql, params);
      const recipeId = result.lastID;

      // Handle Ingredients
      if (ingredients && Array.isArray(ingredients)) {
          for (const ing of ingredients) {
              const ingName = (ing.nom || ing.name || '').trim();
              if (!ingName) continue;

              await run(`INSERT OR IGNORE INTO ingredients (name) VALUES (?)`, [ingName]);
              const ingRow = await get(`SELECT id FROM ingredients WHERE name = ?`, [ingName]);

              if (ingRow) {
                  await run(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
                      [recipeId, ingRow.id, ing.amount || ing.quantite || '', ing.unit || ing.unite || '']);
              }
          }
      }

      // Handle Tags
      if (tags && Array.isArray(tags)) {
          for (const tag of tags) {
              const tagName = tag.trim();
              if (!tagName) continue;
              await run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tagName]);
              const tagRow = await get(`SELECT id FROM tags WHERE name = ?`, [tagName]);
              if (tagRow) {
                  await run(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`, [recipeId, tagRow.id]);
              }
          }
      }

      // Handle Equipment
      if (equipment && Array.isArray(equipment)) {
          for (const eq of equipment) {
              const eqName = eq.trim();
              if (!eqName) continue;
              await run(`INSERT OR IGNORE INTO equipment (name) VALUES (?)`, [eqName]);
              const eqRow = await get(`SELECT id FROM equipment WHERE name = ?`, [eqName]);
              if (eqRow) {
                  await run(`INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES (?, ?)`, [recipeId, eqRow.id]);
              }
          }
      }

      await run("COMMIT");
      res.json({
        message: "success",
        data: { id: recipeId, ...req.body, validated: isValidated },
        id: recipeId
      });

  } catch (err) {
      await run("ROLLBACK");
      res.status(400).json({ "error": err.message });
  }
});

// Update a recipe
app.put('/api/recipes/:id', async (req, res) => {
  const {
    name, nom, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, tags, glass, alcool, validated
  } = req.body;
  const id = req.params.id;
  const finalName = name || nom;

  try {
      await run("BEGIN TRANSACTION");

      const sql = `UPDATE recipes SET
        name = ?, category = ?, type = ?, image = ?, preparation_time = ?, cooking_time = ?, total_time = ?,
        ingredients = ?, steps = ?, equipment = ?, tags = ?, glass = ?, alcool = ?, validated = ?
        WHERE id = ?`;

      const params = [
        finalName, category, type, image, preparation_time, cooking_time, total_time,
        JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), JSON.stringify(tags || []), glass, alcool ? 1 : 0, validated ? 1 : 0,
        id
      ];

      await run(sql, params);

      // Update Relations: Delete all and re-insert
      await run(`DELETE FROM recipe_ingredients WHERE recipe_id = ?`, [id]);
      await run(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [id]);
      await run(`DELETE FROM recipe_equipment WHERE recipe_id = ?`, [id]);

      // Re-insert Ingredients
      if (ingredients && Array.isArray(ingredients)) {
        for (const ing of ingredients) {
            const ingName = (ing.nom || ing.name || '').trim();
            if (!ingName) continue;

            await run(`INSERT OR IGNORE INTO ingredients (name) VALUES (?)`, [ingName]);
            const ingRow = await get(`SELECT id FROM ingredients WHERE name = ?`, [ingName]);

            if (ingRow) {
                await run(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
                    [id, ingRow.id, ing.amount || ing.quantite || '', ing.unit || ing.unite || '']);
            }
        }
      }

      // Re-insert Tags
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
            const tagName = tag.trim();
            if (!tagName) continue;
            await run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tagName]);
            const tagRow = await get(`SELECT id FROM tags WHERE name = ?`, [tagName]);
            if (tagRow) {
                await run(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`, [id, tagRow.id]);
            }
        }
      }

      // Re-insert Equipment
      if (equipment && Array.isArray(equipment)) {
        for (const eq of equipment) {
            const eqName = eq.trim();
            if (!eqName) continue;
            await run(`INSERT OR IGNORE INTO equipment (name) VALUES (?)`, [eqName]);
            const eqRow = await get(`SELECT id FROM equipment WHERE name = ?`, [eqName]);
            if (eqRow) {
                await run(`INSERT INTO recipe_equipment (recipe_id, equipment_id) VALUES (?, ?)`, [id, eqRow.id]);
            }
        }
      }

      await run("COMMIT");
      res.json({
        message: "success",
        data: req.body
      });

  } catch (err) {
      await run("ROLLBACK");
      res.status(400).json({ "error": err.message });
  }
});

// Delete a recipe
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        await run("BEGIN TRANSACTION");
        // Relations are ON DELETE CASCADE if enabled, but let's be safe
        await run(`DELETE FROM recipe_ingredients WHERE recipe_id = ?`, [req.params.id]);
        await run(`DELETE FROM recipe_tags WHERE recipe_id = ?`, [req.params.id]);
        await run(`DELETE FROM recipe_equipment WHERE recipe_id = ?`, [req.params.id]);
        await run(`DELETE FROM recipes WHERE id = ?`, [req.params.id]);
        await run("COMMIT");
        res.json({ message: "deleted" });
    } catch (err) {
        await run("ROLLBACK");
        res.status(400).json({ "error": err.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
