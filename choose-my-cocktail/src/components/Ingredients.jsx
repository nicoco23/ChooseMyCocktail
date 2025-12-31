import React from 'react';
import { useLocation } from 'react-router-dom';

function Ingredient({ name, dose, alcohol }) {
  const location = useLocation();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');

  return (
    <div className={`flex items-center justify-between py-1 border-b last:border-0 ${isFoodContext ? 'border-food-purple/10' : 'border-slate-700/50'}`}>
      <div className="flex items-center">
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isFoodContext ? 'bg-food-orange' : 'bg-amber-500'}`}></span>
        <span className={`text-sm font-medium ${isFoodContext ? 'text-food-dark/80' : 'text-slate-300'}`}>
          {alcohol ? alcohol : name}
        </span>
      </div>
      <span className={`text-xs font-mono ${isFoodContext ? 'text-food-dark/60' : 'text-slate-500'}`}>
        {dose}
      </span>
    </div>
  );
}

export default Ingredient;
