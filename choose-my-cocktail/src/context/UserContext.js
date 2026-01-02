import React, { createContext, useContext, useState, useEffect } from 'react';
// Context for user favorites and ratings
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé dans un UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState(new Set());
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [ratings, setRatings] = useState({}); // Map: itemId -> rating
  const [ratedItems, setRatedItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setFavorites(new Set());
      setFavoriteItems([]);
      setRatings({});
      setRatedItems([]);
    }
  }, [user]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      const [favs, rates] = await Promise.all([
        userService.getFavorites(),
        userService.getRatings()
      ]);

      setFavoriteItems(favs);
      setFavorites(new Set(favs.map(f => f.id)));

      setRatedItems(rates);
      const ratingsMap = {};
      rates.forEach(r => {
        ratingsMap[r.id] = r.userRating;
      });
      setRatings(ratingsMap);

    } catch (error) {
      console.error("Erreur chargement données utilisateur:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleFavorite = async (item) => {
    if (!user) return false; // Ou ouvrir modal login

    // Optimistic update
    const isFav = favorites.has(item.id);
    const newFavorites = new Set(favorites);
    let newFavoriteItems = [...favoriteItems];

    if (isFav) {
      newFavorites.delete(item.id);
      newFavoriteItems = newFavoriteItems.filter(i => i.id !== item.id);
    } else {
      newFavorites.add(item.id);
      newFavoriteItems.unshift(item); // Add to top
    }
    setFavorites(newFavorites);
    setFavoriteItems(newFavoriteItems);

    try {
      await userService.toggleFavorite(item.id, item.kind || (item.alcool ? 'cocktail' : 'food')); // Fallback detection
      return !isFav;
    } catch (error) {
      // Revert on error
      console.error("Erreur toggle favorite:", error);
      setFavorites(favorites); // Revert to old state
      setFavoriteItems(favoriteItems);
      return isFav;
    }
  };

  const rateItem = async (item, rating, comment = '') => {
    if (!user) {
        console.warn("User not logged in, cannot rate item");
        return;
    }

    console.log(`Rating item ${item.id} (${item.nom}) with ${rating} stars`);

    // Optimistic update
    const newRatings = { ...ratings, [item.id]: rating };
    setRatings(newRatings);

    // Update ratedItems list
    let newRatedItems = [...ratedItems];
    const existingIndex = newRatedItems.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
        newRatedItems[existingIndex] = { ...newRatedItems[existingIndex], userRating: rating, userComment: comment };
    } else {
        newRatedItems.unshift({ ...item, userRating: rating, userComment: comment });
    }
    setRatedItems(newRatedItems);

    try {
      // Pass kind to userService.setRating
      const kind = item.kind || (item.alcool ? 'cocktail' : 'food');
      console.log(`Calling userService.setRating(${item.id}, ${kind}, ${rating}, "${comment}")`);
      await userService.setRating(item.id, kind, rating, comment);
    } catch (error) {
      console.error("Erreur notation:", error);
      setRatings(ratings); // Revert
      setRatedItems(ratedItems);
    }
  };

  return (
    <UserContext.Provider value={{ user, favorites, favoriteItems, ratings, ratedItems, toggleFavorite, rateItem, loadingData }}>
      {children}
    </UserContext.Provider>
  );
};
