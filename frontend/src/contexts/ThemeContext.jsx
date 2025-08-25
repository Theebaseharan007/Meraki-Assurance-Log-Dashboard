import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme context
const ThemeContext = createContext();

// Theme types
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Theme provider component
export const ThemeProvider = ({ children, defaultTheme = THEMES.SYSTEM }) => {
  // Initialize theme from localStorage immediately to prevent flash
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('dashboard-theme');
      if (storedTheme && Object.values(THEMES).includes(storedTheme)) {
        return storedTheme;
      }
    }
    return defaultTheme;
  });

  // Get system theme preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
  };

  // Get effective theme (resolve 'system' to actual theme)
  const getEffectiveTheme = () => {
    if (theme === THEMES.SYSTEM) {
      return getSystemTheme();
    }
    return theme;
  };



  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove(THEMES.LIGHT, THEMES.DARK);
    
    // Add current theme class
    root.classList.add(effectiveTheme);
    
    // Store theme preference
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      // Force re-render to apply new system theme
      setTheme(THEMES.SYSTEM);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  // Set theme function
  const setThemeValue = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme: ${newTheme}`);
    }
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    const currentEffective = getEffectiveTheme();
    setTheme(currentEffective === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
  };

  // Context value
  const value = {
    theme,
    effectiveTheme: getEffectiveTheme(),
    setTheme: setThemeValue,
    toggleTheme,
    isLight: getEffectiveTheme() === THEMES.LIGHT,
    isDark: getEffectiveTheme() === THEMES.DARK,
    isSystem: theme === THEMES.SYSTEM,
    systemTheme: getSystemTheme(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
