import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importez Routes à la place de Switch
import CocktailsApp from './CocktailsApp';
import AllCocktailsPage from './AllCocktailPage';
import Navbar from './components/navbar';

function App() {
  const [cocktails, setCocktails] = useState([]);

  useEffect(() => {
    // Charger les cocktails à partir du fichier JSON
    const data = require('./Cocktails.json');
    setCocktails(data);
  }, []);

  return (
    <Router>
      <div>
        <Navbar />
        <Routes> {/* Utilisez Routes au lieu de Switch */}
          <Route path="/all-cocktails" element={<AllCocktailsPage cocktails={cocktails} />} /> {/* Utilisez "element" au lieu de "component" */}
          <Route path="/" element={<CocktailsApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
