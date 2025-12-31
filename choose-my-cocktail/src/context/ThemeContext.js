import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('foodTheme');
    return saved || 'creme';
  });

  useEffect(() => {
    localStorage.setItem('foodTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'creme' ? 'kitty' : 'creme');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
