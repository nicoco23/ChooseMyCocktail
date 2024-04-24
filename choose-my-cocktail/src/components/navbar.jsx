import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; // Assurez-vous de créer ce fichier CSS dans le même dossier

function Navbar() {
  let lastScrollTop = 0;

  window.addEventListener("scroll", function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop){
      document.querySelector('.navbar').style.top = "-50px"; // cache la navbar
    } else {
      document.querySelector('.navbar').style.top = "0"; // montre la navbar
    }
    lastScrollTop = scrollTop;
  });
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