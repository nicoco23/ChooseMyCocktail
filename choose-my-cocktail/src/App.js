import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AllCocktailsPage from './pages/AllCocktailPage';
import CocktailTest from './pages/CocktailsApp';
import Navbar from './components/navbar';

function App() {
  return (
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* Utilisation correcte de Routes et Route */}
            <Route path="/all-cocktails" element={<AllCocktailsPage />} />
            <Route path="/cocktails" element={<CocktailTest />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
