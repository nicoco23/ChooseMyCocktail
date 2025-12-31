const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'recipes.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    type TEXT,
    image TEXT,
    preparation_time INTEGER,
    cooking_time INTEGER,
    total_time INTEGER,
    ingredients TEXT,
    steps TEXT,
    equipment TEXT,
    glass TEXT,
    alcool INTEGER,
    is_custom INTEGER DEFAULT 0,
    validated INTEGER DEFAULT 0
  )`, (err) => {
    if (!err) {
      // Try to add the column if table already exists (migration)
      db.run(`ALTER TABLE recipes ADD COLUMN validated INTEGER DEFAULT 0`, (err) => {
        // Ignore error if column already exists
      });
      db.run(`ALTER TABLE recipes ADD COLUMN tags TEXT`, (err) => {
        // Ignore error if column already exists
      });
    }
  });
});

module.exports = db;
