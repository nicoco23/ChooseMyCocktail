const itemRepository = require('../repositories/itemRepository');
const db = require('../database');

/**
 * Pairing Engine - Rule-based scoring for Food → Beverage recommendations
 */
class PairingEngine {
    constructor() {
        // Tag-based rules (domain: flavor/context/service)
        this.rules = [
            { foodTag: 'fatty', beverageTags: ['sour', 'citrusy', 'refreshing'], score: 3, reason: 'fatty→acidic/refreshing' },
            { foodTag: 'spicy', beverageTags: ['refreshing', 'sweet', 'citrusy'], score: 3, reason: 'spicy→refreshing/sweet' },
            { foodTag: 'spicy', beverageTags: ['high_abv'], score: -2, reason: 'spicy→avoid_alcohol' },
            { foodTag: 'smoky', beverageTags: ['spiced', 'rich', 'bitter'], score: 2, reason: 'smoky→spiced/rich' },
            { foodTag: 'chocolatey', beverageTags: ['coffee', 'creamy', 'vanilla'], score: 3, reason: 'chocolate→coffee/cream' },
            { foodTag: 'umami', beverageTags: ['herbal', 'citrusy', 'bitter'], score: 2, reason: 'umami→herbal/citrus' },
            { foodTag: 'dessert', beverageTags: ['sweet', 'creamy', 'chocolatey'], score: 2, reason: 'dessert→sweet/cream' },
            { foodTag: 'rich', beverageTags: ['acidity', 'sparkling'], score: 2, reason: 'rich→acidic/sparkling' },
            { foodTag: 'light', beverageTags: ['refreshing', 'fruity'], score: 2, reason: 'light→refreshing' },
        ];

        // Profile-based adjustments (sweetness, acidity, body, etc.)
        this.profileRules = [
            { foodProfile: { spice_heat: '>3' }, beverageProfile: { abv: '<5' }, score: 2 },
            { foodProfile: { creaminess: '>3' }, beverageProfile: { acidity: '>3' }, score: 2 },
        ];
    }

    /**
     * Get pairing recommendations for a food item
     * @param {number} foodId - Food item ID
     * @param {Object} options - { topK, allowAlcohol, maxAbv, userIngredients }
     * @returns {Promise<Array>} - Recommendations with scores and reasons
     */
    async getPairings(foodId, options = {}) {
        const { topK = 5, allowAlcohol = true, maxAbv = null, userIngredients = [] } = options;

        // Get food item
        const foodItem = await itemRepository.getItemById(foodId);
        if (!foodItem || foodItem.kind !== 'food') {
            throw new Error('Food item not found');
        }

        // Get all beverages
        const beverages = await itemRepository.getAllItems({ kind: 'beverage', validated: 1 });

        // Score each beverage
        const scoredBeverages = [];

        for (const beverage of beverages) {
            const { score, reasons } = this.calculateScore(foodItem, beverage, userIngredients);

            // Apply filters
            if (!allowAlcohol) {
                if (beverage.tags.includes('alcoholic') || beverage.tags.includes('high_abv')) {
                    continue;
                }
            }

            if (maxAbv !== null) {
                // Check if beverage has ABV profile
                const profile = await this.getProfile(beverage.id);
                if (profile && profile.abv > maxAbv) {
                    continue;
                }
            }

            scoredBeverages.push({
                beverage,
                score,
                reasons
            });
        }

        // Sort by score and return top K
        scoredBeverages.sort((a, b) => b.score - a.score);

        return scoredBeverages.slice(0, topK);
    }

    /**
     * Calculate pairing score between food and beverage
     * @param {Object} foodItem
     * @param {Object} beverageItem
     * @param {Array} userIngredients - Optional list of user's ingredients
     * @returns {Object} - { score, reasons }
     */
    calculateScore(foodItem, beverageItem, userIngredients = []) {
        let score = 0;
        const reasons = [];

        const foodTags = foodItem.tags || [];
        const beverageTags = beverageItem.tags || [];

        // 1. Tag matching (intersection)
        const commonTags = foodTags.filter(tag => beverageTags.includes(tag));
        if (commonTags.length > 0) {
            score += commonTags.length * 1.5;
            commonTags.forEach(tag => reasons.push(`tags_match:${tag}`));
        }

        // 2. Apply rules
        for (const rule of this.rules) {
            if (foodTags.includes(rule.foodTag)) {
                const matchedBevTags = rule.beverageTags.filter(tag => beverageTags.includes(tag));
                if (matchedBevTags.length > 0) {
                    score += rule.score;
                    reasons.push(`rule:${rule.reason}`);
                }
            }
        }

        // 3. Ingredient availability bonus (if user has ingredients for this beverage)
        if (userIngredients.length > 0) {
            const beverageIngredients = beverageItem.ingredients.map(i => i.nom.toLowerCase());
            const userIngredientsLower = userIngredients.map(i => i.toLowerCase());
            const availableCount = beverageIngredients.filter(ing => userIngredientsLower.includes(ing)).length;

            if (availableCount > 0) {
                const availabilityRatio = availableCount / beverageIngredients.length;
                score += availabilityRatio * 5;
                if (availabilityRatio === 1) {
                    reasons.push('all_ingredients_available');
                } else if (availabilityRatio > 0.7) {
                    reasons.push('most_ingredients_available');
                }
            }
        }

        // 4. Base score (to avoid zero scores)
        score += 1;

        return { score: Math.round(score * 10) / 10, reasons };
    }

    /**
     * Get item profile
     * @param {number} itemId
     * @returns {Promise<Object|null>}
     */
    async getProfile(itemId) {
        const row = await db.get('SELECT * FROM item_profiles WHERE item_id = ?', [itemId]);
        return row || null;
    }

    /**
     * Record pairing feedback
     * @param {Object} feedbackData - { food_id, beverage_id, action, rating, reason_tag, session_id, meta }
     * @returns {Promise<number>} - Event ID
     */
    async recordFeedback(feedbackData) {
        const { food_id, beverage_id, action, rating, reason_tag, session_id, meta } = feedbackData;

        const sql = `
            INSERT INTO pairing_events (food_id, beverage_id, action, rating, reason_tag, session_id, meta)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.run(sql, [
            food_id,
            beverage_id,
            action,
            rating || null,
            reason_tag || null,
            session_id || null,
            meta ? JSON.stringify(meta) : null
        ]);

        return result.lastID;
    }
}

module.exports = new PairingEngine();
