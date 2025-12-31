const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all recipes
app.get('/api/recipes', (req, res) => {
  const sql = "SELECT * FROM recipes";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    // Parse JSON fields
    const recipes = rows.map(row => ({
      ...row,
      nom: row.name, // Alias for frontend compatibility
      ingredients: JSON.parse(row.ingredients || '[]'),
      steps: JSON.parse(row.steps || '[]'),
      equipment: JSON.parse(row.equipment || '[]'),
      alcool: !!row.alcool,
      is_custom: !!row.is_custom
    }));
    res.json({
      message: "success",
      data: recipes
    });
  });
});

// Add a new recipe
app.post('/api/recipes', (req, res) => {
  const {
    name, nom, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, glass, alcool
  } = req.body;

  const finalName = name || nom;

  const sql = `INSERT INTO recipes (
    name, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, glass, alcool, is_custom
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

  const params = [
    finalName, category, type, image, preparation_time, cooking_time, total_time,
    JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), glass, alcool ? 1 : 0
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      data: { id: this.lastID, ...req.body },
      id: this.lastID
    });
  });
});

// Update a recipe
app.put('/api/recipes/:id', (req, res) => {
  const {
    name, nom, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, glass, alcool
  } = req.body;

  const finalName = name || nom;

  const sql = `UPDATE recipes SET
    name = ?, category = ?, type = ?, image = ?, preparation_time = ?, cooking_time = ?, total_time = ?,
    ingredients = ?, steps = ?, equipment = ?, glass = ?, alcool = ?
    WHERE id = ?`;

  const params = [
    finalName, category, type, image, preparation_time, cooking_time, total_time,
    JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), glass, alcool ? 1 : 0,
    req.params.id
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      data: req.body,
      changes: this.changes
    });
  });
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
    const sql = "DELETE FROM recipes WHERE id = ?";
    db.run(sql, req.params.id, function (err) {
        if (err) {
            res.status(400).json({ "error": res.message });
            return;
        }
        res.json({ message: "deleted", changes: this.changes });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
