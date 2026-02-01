/**
 * Theme context: light / night mode, persisted in localStorage
 */
import { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const KEY = 'mushi_theme_night';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { nightMode: false, toggleNightMode: () => {} };
  return ctx;
}

export function ThemeProvider({ children }) {
  const [nightMode, setNightMode] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw === '1';
    } catch {
      return false;
    }
  });

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', nightMode ? 'dark' : 'light');
  }, [nightMode]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, nightMode ? '1' : '0');
    } catch {}
  }, [nightMode]);

  const toggleNightMode = () => setNightMode((v) => !v);

  return (
    <ThemeContext.Provider value={{ nightMode, toggleNightMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
