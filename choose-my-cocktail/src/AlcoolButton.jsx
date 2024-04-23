import React from 'react';
import './css/AlcoolButton.css'; // Importer le fichier CSS pour les styles des boutons

function AlcoholButton({ alcohol, onClick, selected }) {
  return (
    <button className={selected ? "selected" : ""} onClick={() => onClick(alcohol)}>{alcohol}</button>
  );
}

export default AlcoholButton;
