import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function Ingredient({ name, dose, alcohol }) {
  const location = useLocation();
  const { theme } = useTheme();
  const isFoodContext = location.pathname.includes('food') || location.pathname.includes('admin/food');

  const getBorderClass = () => {
    if (theme === 'kitty') return 'border-hk-pink-light/30';
    return isFoodContext ? 'border-food-purple/10' : 'border-slate-700/50';
  };

  const getDotClass = () => {
    if (theme === 'kitty') return 'bg-hk-pink-hot';
    return isFoodContext ? 'bg-food-orange' : 'bg-amber-500';
  };

  const getTextClass = () => {
    if (theme === 'kitty') return 'text-hk-red-dark';
    return isFoodContext ? 'text-food-dark/80' : 'text-slate-300';
  };

  const getDoseClass = () => {
    if (theme === 'kitty') return 'text-hk-red-dark/60';
    return isFoodContext ? 'text-food-dark/60' : 'text-slate-500';
  };

  return (
    <div className={`flex items-center justify-between py-1 border-b last:border-0 ${getBorderClass()}`}>
      <div className="flex items-center">
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${getDotClass()}`}></span>
        <span className={`text-sm font-medium ${getTextClass()}`}>
          {alcohol ? alcohol : name}
        </span>
      </div>
      <span className={`text-xs font-mono ${getDoseClass()}`}>
        {dose}
      </span>
    </div>
  );
}

export default Ingredient;
