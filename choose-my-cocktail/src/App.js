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
import SubmitRecipePage from './pages/SubmitRecipePage';
import PairingPage from './pages/PairingPage';
import ProfilePage from './pages/ProfilePage';
import AuthCallback from './pages/AuthCallback';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Navbar from './components/navbar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
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
              <Route path="/pairings" element={<PairingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Public Submission Page */}
              <Route path="/submit-recipe" element={<SubmitRecipePage mode="food" />} />
              <Route path="/submit-cocktail" element={<SubmitRecipePage mode="cocktail" />} />

              {/* Protected Admin Pages */}
              <Route path="/admin/cocktails" element={<AdminPage mode="cocktail" />} />
              <Route path="/admin/food" element={<AdminPage mode="food" />} />
              <Route path="/admin/users" element={<AdminPage mode="users" />} />
              <Route path="/admin" element={<AdminPage mode="cocktail" />} />
            </Routes>
          </div>
        </Router>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
