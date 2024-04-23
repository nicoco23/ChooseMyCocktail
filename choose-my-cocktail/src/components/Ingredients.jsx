import React from 'react';

function Ingredient({ name, dose, alcohol }) {
  return (
    <div>
      <p>{`${alcohol ? alcohol : name} - ${dose}`}</p>
    </div>
  );
}

export default Ingredient;
