import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AllCocktailsPage from './pages/AllCocktailPage';
import AllFoodPage from './pages/AllFoodPage';
import CocktailsApp from './pages/CocktailsApp';
import FoodApp from './pages/FoodApp';
import CocktailDetailsPage from './pages/CocktailDetailsPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/navbar';

function App() {
  return (
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cocktails-home" element={<HomePage />} />
            <Route path="/all-cocktails" element={<AllCocktailsPage />} />
            <Route path="/all-food" element={<AllFoodPage />} />
            <Route path="/cocktails" element={<CocktailsApp />} />
            <Route path="/food" element={<FoodApp />} />
            <Route path="/cocktail/:name" element={<CocktailDetailsPage />} />
            <Route path="/admin/cocktails" element={<AdminPage mode="cocktail" />} />
            <Route path="/admin/food" element={<AdminPage mode="food" />} />
            {/* Fallback for old link or direct access */}
            <Route path="/admin" element={<AdminPage mode="cocktail" />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
