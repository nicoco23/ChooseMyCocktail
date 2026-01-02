const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class AuthDatabase {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erreur de connexion à la base de données:', err);
      } else {
        console.log('Base de données auth connectée');
      }
    });
  }

  // Initialiser les tables d'authentification
  async initialize() {
    const migrationPath = path.join(__dirname, 'migrations', '001_create_users_tables.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    return new Promise((resolve, reject) => {
      this.db.exec(migration, async (err) => {
        if (err) {
          console.error('Erreur lors de l\'exécution de la migration:', err);
          reject(err);
        } else {
          console.log('Tables d\'authentification créées avec succès');

          // Migration manuelle pour ajouter la colonne verification_token si elle n'existe pas
          try {
            await this.addVerificationTokenColumn();
            resolve();
          } catch (migrationErr) {
            console.error('Erreur lors de la migration de la colonne verification_token:', migrationErr);
            // On ne rejette pas forcément si la colonne existe déjà, mais addVerificationTokenColumn gère ça
            resolve();
          }
        }
      });
    });
  }

  addVerificationTokenColumn() {
    return new Promise((resolve, reject) => {
      this.db.run("ALTER TABLE users ADD COLUMN verification_token TEXT", (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Créer un utilisateur
  createUser(userData) {
    const { email, name, avatar_url, provider, provider_id, password_hash, verification_token } = userData;

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (email, name, avatar_url, provider, provider_id, password_hash, email_verified, verification_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        sql,
        [email, name, avatar_url, provider, provider_id, password_hash, provider !== 'local' ? 1 : 0, verification_token],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  }

  // Trouver un utilisateur par token de vérification
  findUserByVerificationToken(token) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE verification_token = ?',
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Obtenir tous les utilisateurs (Admin)
  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, email, name, provider, email_verified, created_at, last_login FROM users ORDER BY created_at DESC',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Supprimer un utilisateur (Admin)
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Valider l'email d'un utilisateur
  verifyUserEmail(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = ?',
        [userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Trouver un utilisateur par email
  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Trouver un utilisateur par provider
  findUserByProvider(provider, providerId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
        [provider, providerId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Trouver un utilisateur par ID
  findUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, email, name, avatar_url, provider, created_at, last_login FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Mettre à jour le dernier login
  updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Ajouter un favori
  addFavorite(userId, itemId, itemType) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO user_favorites (user_id, item_id, item_type) VALUES (?, ?, ?)',
        [userId, itemId, itemType],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Supprimer un favori
  removeFavorite(userId, itemId, itemType) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_favorites WHERE user_id = ? AND item_id = ? AND item_type = ?',
        [userId, itemId, itemType],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Obtenir les favoris d'un utilisateur
  getUserFavorites(userId, itemType = null) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM user_favorites WHERE user_id = ?';
      const params = [userId];

      if (itemType) {
        sql += ' AND item_type = ?';
        params.push(itemType);
      }

      sql += ' ORDER BY added_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Vérifier si un item est favori
  isFavorite(userId, itemId, itemType) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM user_favorites WHERE user_id = ? AND item_id = ? AND item_type = ?',
        [userId, itemId, itemType],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count > 0);
        }
      );
    });
  }

  // Ajouter à l'historique
  addToHistory(userId, itemId, itemType) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO user_history (user_id, item_id, item_type) VALUES (?, ?, ?)',
        [userId, itemId, itemType],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Obtenir l'historique d'un utilisateur
  getUserHistory(userId, itemType = null, limit = 50) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM user_history WHERE user_id = ?';
      const params = [userId];

      if (itemType) {
        sql += ' AND item_type = ?';
        params.push(itemType);
      }

      sql += ' ORDER BY viewed_at DESC LIMIT ?';
      params.push(limit);

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = AuthDatabase;
