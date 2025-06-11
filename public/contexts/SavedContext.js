import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { SAVED_ITEMS_STORAGE_KEY } from '../constants'; // Updated from WATCH_LATER_STORAGE_KEY
const SavedContext = createContext(undefined); // Renamed from WatchLaterContext
export const SavedProvider = ({ children }) => {
    const [savedItems, setSavedItems] = useState(() => {
        try {
            const storedItems = localStorage.getItem(SAVED_ITEMS_STORAGE_KEY); // Updated storage key
            return storedItems ? JSON.parse(storedItems) : [];
        }
        catch (error) {
            console.error("Error reading saved items from localStorage", error); // Updated message
            return [];
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(savedItems)); // Updated storage key & items
        }
        catch (error) {
            console.error("Error saving saved items to localStorage", error); // Updated message
        }
    }, [savedItems]); // Updated items
    const addToSaved = useCallback((videoId) => {
        setSavedItems(prevItems => {
            if (!prevItems.some(item => item.videoId === videoId)) {
                return [...prevItems, { videoId, addedAt: Date.now() }];
            }
            return prevItems;
        });
    }, []);
    const removeFromSaved = useCallback((videoId) => {
        setSavedItems(prevItems => prevItems.filter(item => item.videoId !== videoId)); // Renamed from setWatchLaterItems
    }, []);
    const isInSaved = useCallback((videoId) => {
        return savedItems.some(item => item.videoId === videoId); // Renamed from watchLaterItems
    }, [savedItems]); // Renamed from watchLaterItems
    const contextValue = useMemo(() => ({
        savedItems, // Renamed
        addToSaved, // Renamed
        removeFromSaved, // Renamed
        isInSaved, // Renamed
    }), [savedItems, addToSaved, removeFromSaved, isInSaved]); // Renamed variables
    return (_jsx(SavedContext.Provider, { value: contextValue, children: children }));
};
export const useSaved = () => {
    const context = useContext(SavedContext); // Renamed
    if (!context) {
        throw new Error('useSaved must be used within a SavedProvider'); // Updated message
    }
    return context;
};
