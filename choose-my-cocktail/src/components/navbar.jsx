import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
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
  );
}

export default Navbar;
