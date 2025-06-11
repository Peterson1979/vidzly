import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
const ThemeContext = createContext(undefined);
const LOCAL_STORAGE_KEY = 'vidzly_theme';
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedTheme) {
                return storedTheme;
            }
            // Default to system preference if no stored theme
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        catch (error) {
            console.error("Error reading theme from localStorage", error);
            return 'light'; // Fallback to light theme
        }
    });
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, theme);
        }
        catch (error) {
            console.error("Error saving theme to localStorage", error);
        }
    }, [theme]);
    const toggleTheme = useCallback(() => {
        setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
    }, []);
    const contextValue = useMemo(() => ({
        theme,
        toggleTheme,
        setTheme
    }), [theme, toggleTheme, setTheme]);
    return (_jsx(ThemeContext.Provider, { value: contextValue, children: children }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
