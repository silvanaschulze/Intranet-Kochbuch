/**
 * @fileoverview Theme Context für die Verwaltung des Farbschemas
 * @module ThemeContext
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Hook für den Zugriff auf den Theme Context
 * @returns {Object} Theme Context Werte
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme muss innerhalb eines ThemeProviders verwendet werden');
  }
  return context;
};

/**
 * Theme Provider Komponente
 * Verwaltet den Theme-Status und speichert ihn im localStorage
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} ThemeProvider component
 */
export const ThemeProvider = ({ children }) => {
  // Theme aus localStorage laden oder Standard (light) verwenden
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Theme im localStorage speichern wenn es sich ändert
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Body-Klasse für globale Styles aktualisieren
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    
    // Meta theme-color für mobile Geräte aktualisieren
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#212529' : '#ffffff'
      );
    }
  }, [theme]);

  /**
   * Wechselt zwischen hellem und dunklem Theme
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 