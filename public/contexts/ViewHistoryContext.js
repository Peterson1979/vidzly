import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { VIEW_HISTORY_STORAGE_KEY, MAX_VIEW_HISTORY_ITEMS } from '../constants';
const ViewHistoryContext = createContext(undefined);
export const ViewHistoryProvider = ({ children }) => {
    const [historyItems, setHistoryItems] = useState(() => {
        try {
            const storedItems = localStorage.getItem(VIEW_HISTORY_STORAGE_KEY);
            return storedItems ? JSON.parse(storedItems) : [];
        }
        catch (error) {
            console.error("Error reading view history items from localStorage", error);
            return [];
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(VIEW_HISTORY_STORAGE_KEY, JSON.stringify(historyItems));
        }
        catch (error) {
            console.error("Error saving view history items to localStorage", error);
        }
    }, [historyItems]);
    const addVideoToHistory = useCallback((videoId) => {
        setHistoryItems(prevItems => {
            // Remove if already exists to move it to the top
            const filteredItems = prevItems.filter(item => item.videoId !== videoId);
            const newHistoryItem = { videoId, viewedAt: Date.now() };
            const updatedItems = [newHistoryItem, ...filteredItems];
            // Limit the history size
            return updatedItems.slice(0, MAX_VIEW_HISTORY_ITEMS);
        });
    }, []);
    const clearHistory = useCallback(() => {
        setHistoryItems([]);
        // localStorage will be updated by the useEffect hook
    }, []);
    const contextValue = useMemo(() => ({
        historyItems,
        addVideoToHistory,
        clearHistory,
    }), [historyItems, addVideoToHistory, clearHistory]);
    return (_jsx(ViewHistoryContext.Provider, { value: contextValue, children: children }));
};
export const useViewHistory = () => {
    const context = useContext(ViewHistoryContext);
    if (!context) {
        throw new Error('useViewHistory must be used within a ViewHistoryProvider');
    }
    return context;
};
