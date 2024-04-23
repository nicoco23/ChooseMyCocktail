import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import CocktailsApp from './CocktailsApp';
import AllCocktailsPage from './AllCocktailPage';

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
        <nav>
          <ul>
            <li>
              <Link to="/">Accueil</Link>
            </li>
            <li>
              <Link to="/all-cocktails">Tous les Cocktails</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/all-cocktails">
            <AllCocktailsPage cocktails={cocktails} />
          </Route>
          <Route path="/">
            <CocktailsApp />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
