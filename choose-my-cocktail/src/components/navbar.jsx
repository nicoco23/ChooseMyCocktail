import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; // Assurez-vous de créer ce fichier CSS dans le même dossier

function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/">Accueil</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/all-cocktails">Tous les Cocktails</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/cocktails">Cocktails</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;