import { API_BASE_URL } from '../config';

const API_PAIRINGS_URL = `${API_BASE_URL}/api/pairings`;
const API_PAIRINGS_FEEDBACK_URL = `${API_PAIRINGS_URL}/feedback`;

/**
 * Service for food-beverage pairings
 */
const pairingService = {
  /**
   * Get beverage recommendations for a food item
   * @param {number} foodId - ID of the food item
   * @param {Object} options - Optional parameters
   * @param {number} options.limit - Max number of recommendations (default: 5)
   * @param {string[]} options.userIngredients - Ingredients user has
   * @returns {Promise<Array>} List of recommended beverages with scores
   */
  async getPairings(foodId, options = {}) {
    try {
      const response = await fetch(API_PAIRINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId,
          ...options
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get pairings: ${response.status}`);
      }

      const data = await response.json();
      return data.pairings || [];
    } catch (error) {
      console.error("Failed to get pairings:", error);
      throw error;
    }
  },

  /**
   * Record user feedback on a pairing
   * @param {number} foodId - ID of the food item
   * @param {number} beverageId - ID of the beverage item
   * @param {string} action - Action taken ('view', 'click', 'favorite', 'reject')
   * @param {Object} extra - Additional data (rating, reasonTag, sessionId)
   * @returns {Promise<Object>} Response
   */
  async recordFeedback(foodId, beverageId, action, extra = {}) {
    try {
      const response = await fetch(API_PAIRINGS_FEEDBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId,
          beverageId,
          action,
          ...extra
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record feedback: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to record feedback:", error);
      throw error;
    }
  }
};

export default pairingService;
