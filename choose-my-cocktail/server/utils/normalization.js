/**
 * Normalize ingredient name for consistency
 * @param {string} name - Raw ingredient name
 * @returns {string} - Normalized name
 */
function normalizeIngredient(name) {
    if (!name) return '';

    let normalized = name.toString().trim();

    // Convert to lowercase
    normalized = normalized.toLowerCase();

    // Replace multiple spaces with single space
    normalized = normalized.replace(/\s+/g, ' ');

    // Remove trailing punctuation
    normalized = normalized.replace(/[.,;:!?]+$/, '');

    // Remove parentheses content (e.g., "citron (jus)" -> "citron jus")
    normalized = normalized.replace(/\([^)]*\)/g, '').trim();

    // Handle common variations
    const pluralMap = {
        'citrons': 'citron',
        'tomates': 'tomate',
        'oignons': 'oignon',
        'carottes': 'carotte',
        'pommes': 'pomme',
        'glaçons': 'glaçon',
        'feuilles': 'feuille',
    };

    if (pluralMap[normalized]) {
        normalized = pluralMap[normalized];
    }

    return normalized;
}

/**
 * Check if two ingredient names are likely the same
 * @param {string} name1
 * @param {string} name2
 * @returns {boolean}
 */
function areSimilarIngredients(name1, name2) {
    const norm1 = normalizeIngredient(name1);
    const norm2 = normalizeIngredient(name2);

    if (norm1 === norm2) return true;

    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        return true;
    }

    return false;
}

/**
 * Extract base ingredient from complex names
 * E.g., "jus de citron" -> "citron"
 * @param {string} name
 * @returns {string}
 */
function extractBaseIngredient(name) {
    const normalized = normalizeIngredient(name);

    // Common patterns
    const patterns = [
        /^jus de (.+)$/,
        /^zeste de (.+)$/,
        /^purée de (.+)$/,
        /^sirop de (.+)$/,
        /^(.+) frais$/,
        /^(.+) fraiche$/,
        /^(.+) séché$/,
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    return normalized;
}

// Legacy compatibility
const normalizeName = normalizeIngredient;

module.exports = {
    normalizeIngredient,
    areSimilarIngredients,
    extractBaseIngredient,
    normalizeName
};
