import { API_BASE_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const userService = {
    getFavorites: async () => {
        const response = await fetch(`${API_BASE_URL}/api/favorites`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const json = await response.json();
        return json.data;
    },
    toggleFavorite: async (itemId) => {
        const response = await fetch(`${API_BASE_URL}/api/favorites/${itemId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to toggle favorite');
        return response.json();
    },
    getRatings: async () => {
        const response = await fetch(`${API_BASE_URL}/api/ratings`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch ratings');
        const json = await response.json();
        return json.data;
    },
    setRating: async (itemId, kind, rating, comment) => {
        const response = await fetch(`${API_BASE_URL}/api/ratings/${itemId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ rating, comment, kind })
        });
        if (!response.ok) throw new Error('Failed to set rating');
        return response.json();
    }
};
