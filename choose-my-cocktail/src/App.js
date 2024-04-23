import React from 'react';
import './App.css';
import CocktailsApp from './CocktailsApp';

function ScrollToTop() {
  window.scrollTo(0, 0);
  return null;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cocktails App</h1>
      </header>
      <main>
        <CocktailsApp />
      </main>
      <footer>
        <p>Créé par [Vayko]</p>
      </footer>
    </div>
  );
}

export default App;
