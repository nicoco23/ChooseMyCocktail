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

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the URL to the uploaded file
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Get all recipes
app.get('/api/recipes', (req, res) => {
  const isAdmin = req.query.admin === 'true';
  // If admin, show all. If not, show only validated.
  const sql = isAdmin ? "SELECT * FROM recipes" : "SELECT * FROM recipes WHERE validated = 1";

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
      tags: JSON.parse(row.tags || '[]'),
      alcool: !!row.alcool,
      is_custom: !!row.is_custom,
      validated: !!row.validated
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
    ingredients, steps, equipment, tags, glass, alcool, validated
  } = req.body;

  const finalName = name || nom;
  // Default validated to 0 (false) unless explicitly set (e.g. by admin)
  const isValidated = validated ? 1 : 0;

  const sql = `INSERT INTO recipes (
    name, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, tags, glass, alcool, is_custom, validated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`;

  const params = [
    finalName, category, type, image, preparation_time, cooking_time, total_time,
    JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), JSON.stringify(tags || []), glass, alcool ? 1 : 0, isValidated
  ];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      message: "success",
      data: { id: this.lastID, ...req.body, validated: isValidated },
      id: this.lastID
    });
  });
});

// Update a recipe
app.put('/api/recipes/:id', (req, res) => {
  const {
    name, nom, category, type, image, preparation_time, cooking_time, total_time,
    ingredients, steps, equipment, glass, alcool, validated
  } = req.body;

  const finalName = name || nom;

  const sql = `UPDATE recipes SET
    name = ?, category = ?, type = ?, image = ?, preparation_time = ?, cooking_time = ?, total_time = ?,
    ingredients = ?, steps = ?, equipment = ?, glass = ?, alcool = ?, validated = ?
    WHERE id = ?`;

  const params = [
    finalName, category, type, image, preparation_time, cooking_time, total_time,
    JSON.stringify(ingredients), JSON.stringify(steps), JSON.stringify(equipment || []), glass, alcool ? 1 : 0, validated ? 1 : 0,
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
