const db = require('../database');
const { normalizeIngredient } = require('../utils/normalization');

class ItemRepository {
    /**
     * Get all items with filters
     * @param {Object} filters - { kind, beverage_type, validated, search }
     * @returns {Promise<Array>}
     */
    async getAllItems(filters = {}) {
        let sql = `
            SELECT i.*,
            (SELECT json_group_array(json_object('nom', ing.name, 'quantity', ii.quantity, 'unit', ii.unit))
             FROM item_ingredients ii
             JOIN ingredients ing ON ii.ingredient_id = ing.id
             WHERE ii.item_id = i.id) as ingredients_json,
            (SELECT json_group_array(t.name)
             FROM item_tags it
             JOIN tags t ON it.tag_id = t.id
             WHERE it.item_id = i.id) as tags_json,
            (SELECT json_group_array(e.name)
             FROM item_equipment ie
             JOIN equipment e ON ie.equipment_id = e.id
             WHERE ie.item_id = i.id) as equipment_json,
            (SELECT json_group_array(json_object('titre', s.title, 'description', s.description))
             FROM item_steps s
             WHERE s.item_id = i.id
             ORDER BY s.step_order) as steps_json,
            (SELECT AVG(rating) FROM ratings WHERE item_id = i.id) as avg_rating,
            (SELECT COUNT(*) FROM ratings WHERE item_id = i.id) as rating_count
            FROM items i
            WHERE 1=1
        `;

        const params = [];

        if (filters.kind) {
            sql += ' AND i.kind = ?';
            params.push(filters.kind);
        }

        if (filters.beverage_type) {
            sql += ' AND i.beverage_type = ?';
            params.push(filters.beverage_type);
        }

        if (filters.validated !== undefined) {
            sql += ' AND i.validated = ?';
            params.push(filters.validated ? 1 : 0);
        }

        if (filters.search) {
            sql += ' AND i.title LIKE ?';
            params.push(`%${filters.search}%`);
        }

        sql += ' ORDER BY i.created_at DESC';

        const rows = await db.all(sql, params);

        return rows.map(row => this.formatItem(row));
    }

    /**
     * Get item by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    async getItemById(id) {
        const sql = `
            SELECT i.*,
            (SELECT json_group_array(json_object('nom', ing.name, 'quantity', ii.quantity, 'unit', ii.unit))
             FROM item_ingredients ii
             JOIN ingredients ing ON ii.ingredient_id = ing.id
             WHERE ii.item_id = i.id) as ingredients_json,
            (SELECT json_group_array(t.name)
             FROM item_tags it
             JOIN tags t ON it.tag_id = t.id
             WHERE it.item_id = i.id) as tags_json,
            (SELECT json_group_array(e.name)
             FROM item_equipment ie
             JOIN equipment e ON ie.equipment_id = e.id
             WHERE ie.item_id = i.id) as equipment_json,
            (SELECT json_group_array(json_object('titre', s.title, 'description', s.description))
             FROM item_steps s
             WHERE s.item_id = i.id
             ORDER BY s.step_order) as steps_json,
            (SELECT AVG(rating) FROM ratings WHERE item_id = i.id) as avg_rating,
            (SELECT COUNT(*) FROM ratings WHERE item_id = i.id) as rating_count
            FROM items i
            WHERE i.id = ?
        `;

        const row = await db.get(sql, [id]);
        return row ? this.formatItem(row) : null;
    }

    /**
     * Create a new item
     * @param {Object} itemData
     * @returns {Promise<number>} - New item ID
     */
    async createItem(itemData) {
        const {
            kind, beverage_type, title, description, instructions,
            image_url, preparation_time, cooking_time, total_time, glass,
            validated, ingredients, steps, tags, equipment
        } = itemData;

        await db.run('BEGIN TRANSACTION');

        try {
            // Insert item
            const itemSql = `
                INSERT INTO items (kind, beverage_type, title, description, instructions,
                                   image_url, preparation_time, cooking_time, total_time,
                                   glass, validated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await db.run(itemSql, [
                kind, beverage_type, title, description, instructions,
                image_url, preparation_time, cooking_time, total_time,
                glass, validated ? 1 : 0
            ]);

            const itemId = result.lastID;

            // Add ingredients
            if (ingredients && ingredients.length > 0) {
                await this.addIngredients(itemId, ingredients);
            }

            // Add steps
            if (steps && steps.length > 0) {
                await this.addSteps(itemId, steps);
            }

            // Add tags
            if (tags && tags.length > 0) {
                await this.addTags(itemId, tags);
            }

            // Add equipment
            if (equipment && equipment.length > 0) {
                await this.addEquipment(itemId, equipment);
            }

            await db.run('COMMIT');
            return itemId;
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Update an item
     * @param {number} id
     * @param {Object} itemData
     * @returns {Promise<void>}
     */
    async updateItem(id, itemData) {
        const {
            kind, beverage_type, title, description, instructions,
            image_url, preparation_time, cooking_time, total_time, glass,
            validated, ingredients, steps, tags, equipment
        } = itemData;

        await db.run('BEGIN TRANSACTION');

        try {
            // Update item
            const itemSql = `
                UPDATE items SET
                    kind = ?, beverage_type = ?, title = ?, description = ?, instructions = ?,
                    image_url = ?, preparation_time = ?, cooking_time = ?, total_time = ?,
                    glass = ?, validated = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await db.run(itemSql, [
                kind, beverage_type, title, description, instructions,
                image_url, preparation_time, cooking_time, total_time,
                glass, validated ? 1 : 0, id
            ]);

            // Clear and re-add relationships
            await db.run('DELETE FROM item_ingredients WHERE item_id = ?', [id]);
            await db.run('DELETE FROM item_steps WHERE item_id = ?', [id]);
            await db.run('DELETE FROM item_tags WHERE item_id = ?', [id]);
            await db.run('DELETE FROM item_equipment WHERE item_id = ?', [id]);

            if (ingredients) await this.addIngredients(id, ingredients);
            if (steps) await this.addSteps(id, steps);
            if (tags) await this.addTags(id, tags);
            if (equipment) await this.addEquipment(id, equipment);

            await db.run('COMMIT');
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    /**
     * Delete an item
     * @param {number} id
     * @returns {Promise<void>}
     */
    async deleteItem(id) {
        await db.run('DELETE FROM items WHERE id = ?', [id]);
    }

    // Helper methods

    async addIngredients(itemId, ingredients) {
        for (const ing of ingredients) {
            const name = ing.nom || ing.name || '';
            if (!name.trim()) continue;

            const normalized = normalizeIngredient(name);

            // Get or create ingredient
            await db.run(
                'INSERT OR IGNORE INTO ingredients (name, normalized_name) VALUES (?, ?)',
                [name, normalized]
            );

            const ingredient = await db.get(
                'SELECT id FROM ingredients WHERE normalized_name = ?',
                [normalized]
            );

            if (ingredient) {
                await db.run(
                    'INSERT INTO item_ingredients (item_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
                    [itemId, ingredient.id, ing.quantity || ing.quantite || ing.amount || '', ing.unit || ing.unite || '']
                );
            }
        }
    }

    async addSteps(itemId, steps) {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            await db.run(
                'INSERT INTO item_steps (item_id, step_order, title, description) VALUES (?, ?, ?, ?)',
                [itemId, i + 1, step.titre || step.title || '', step.description]
            );
        }
    }

    async addTags(itemId, tags) {
        for (const tagName of tags) {
            if (!tagName.trim()) continue;

            // Get or create tag
            await db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tagName]);
            const tag = await db.get('SELECT id FROM tags WHERE name = ?', [tagName]);

            if (tag) {
                await db.run('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tag.id]);
            }
        }
    }

    async addEquipment(itemId, equipment) {
        for (const eqName of equipment) {
            if (!eqName.trim()) continue;

            // Get or create equipment
            await db.run('INSERT OR IGNORE INTO equipment (name) VALUES (?)', [eqName]);
            const eq = await db.get('SELECT id FROM equipment WHERE name = ?', [eqName]);

            if (eq) {
                await db.run('INSERT OR IGNORE INTO item_equipment (item_id, equipment_id) VALUES (?, ?)', [itemId, eq.id]);
            }
        }
    }

    formatItem(row) {
        let ingredients = [];
        let tags = [];
        let equipment = [];
        let steps = [];

        try { ingredients = JSON.parse(row.ingredients_json || '[]'); } catch(e) {}
        try { tags = JSON.parse(row.tags_json || '[]'); } catch(e) {}
        try { equipment = JSON.parse(row.equipment_json || '[]'); } catch(e) {}
        try { steps = JSON.parse(row.steps_json || '[]'); } catch(e) {}

        // Clean up null values
        ingredients = ingredients.filter(i => i.nom);
        tags = tags.filter(t => t);
        equipment = equipment.filter(e => e);
        steps = steps.filter(s => s.description);

        return {
            id: row.id,
            kind: row.kind,
            beverage_type: row.beverage_type,
            title: row.title,
            nom: row.title, // Alias for compatibility
            name: row.title,
            category: row.beverage_type || row.kind,
            description: row.description,
            instructions: row.instructions,
            image: row.image_url,
            image_url: row.image_url,
            preparation_time: row.preparation_time,
            cooking_time: row.cooking_time,
            total_time: row.total_time,
            preparation: row.preparation_time ? `${row.preparation_time} min` : '',
            cuisson: row.cooking_time ? `${row.cooking_time} min` : '',
            total: row.total_time ? `${row.total_time} min` : '',
            glass: row.glass,
            validated: !!row.validated,
            ingredients,
            etapes: steps,
            steps,
            tags,
            equipment,
            avg_rating: row.avg_rating || 0,
            rating_count: row.rating_count || 0,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    }

    /**
     * Get all unique ingredients, optionally filtered by item kind
     * @param {string} [kind] - 'beverage' or 'food'
     * @returns {Promise<Array<string>>}
     */
    async getAllIngredients(kind) {
        let sql = 'SELECT DISTINCT name FROM ingredients ORDER BY name';
        const params = [];

        if (kind) {
            sql = `
                SELECT DISTINCT ing.name
                FROM ingredients ing
                JOIN item_ingredients ii ON ing.id = ii.ingredient_id
                JOIN items i ON ii.item_id = i.id
                WHERE i.kind = ?
                ORDER BY ing.name
            `;
            params.push(kind);
        }

        const rows = await db.all(sql, params);
        return rows.map(r => r.name);
    }

    // --- User Interactions ---

    async toggleFavorite(userId, itemId) {
        const existing = await db.get('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ?', [userId, itemId]);
        if (existing) {
            await db.run('DELETE FROM favorites WHERE user_id = ? AND item_id = ?', [userId, itemId]);
            return { favorited: false };
        } else {
            await db.run('INSERT INTO favorites (user_id, item_id) VALUES (?, ?)', [userId, itemId]);
            return { favorited: true };
        }
    }

    async getFavorites(userId) {
        const sql = `
            SELECT i.*, f.created_at as favorited_at
            FROM items i
            JOIN favorites f ON i.id = f.item_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;
        const rows = await db.all(sql, [userId]);
        return rows.map(row => this.formatItem(row));
    }

    async setRating(userId, itemId, rating, comment) {
        const sql = `
            INSERT INTO ratings (user_id, item_id, rating, comment, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id, item_id) DO UPDATE SET
                rating = excluded.rating,
                comment = excluded.comment,
                updated_at = CURRENT_TIMESTAMP
        `;
        await db.run(sql, [userId, itemId, rating, comment]);
    }

    async getUserRatings(userId) {
        const sql = `
            SELECT i.*, r.rating, r.comment, r.updated_at as rated_at
            FROM items i
            JOIN ratings r ON i.id = r.item_id
            WHERE r.user_id = ?
            ORDER BY r.updated_at DESC
        `;
        const rows = await db.all(sql, [userId]);
        return rows.map(row => ({ ...this.formatItem(row), userRating: row.rating, userComment: row.comment }));
    }
}

module.exports = new ItemRepository();
