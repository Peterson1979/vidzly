import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { fetchVideos } from '../services/youtubeService'; // Updated import
import { VideoCard } from './VideoCard';
import { LoadingSpinner } from './LoadingSpinner';
import { XIcon, SearchIcon, HistoryIcon } from './Icons';
import { SEARCH_DEBOUNCE_DELAY, RECENT_SEARCHES_STORAGE_KEY, MAX_RECENT_SEARCHES } from '../constants';
import { useSubscription } from '../contexts/SubscriptionContext';
import { AdBanner } from './AdBanner';
export const SearchOverlay = ({ currentSearchTerm, onSearch, onClose }) => {
    const [internalSearchTerm, setInternalSearchTerm] = useState(currentSearchTerm);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(currentSearchTerm);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultsNextPageToken, setResultsNextPageToken] = useState(undefined);
    const [hasMore, setHasMore] = useState(true);
    const { isSubscribed } = useSubscription();
    const [recentSearches, setRecentSearches] = useState([]);
    useEffect(() => {
        try {
            const storedSearches = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
            if (storedSearches) {
                setRecentSearches(JSON.parse(storedSearches));
            }
        }
        catch (e) {
            console.error("Failed to load recent searches:", e);
        }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(recentSearches));
        }
        catch (e) {
            console.error("Failed to save recent searches:", e);
        }
    }, [recentSearches]);
    const addSearchToRecents = useCallback((term) => {
        if (!term.trim())
            return;
        setRecentSearches(prev => {
            const cleanedTerm = term.trim().toLowerCase();
            const filtered = prev.filter(s => s.toLowerCase() !== cleanedTerm);
            return [term.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
        });
    }, []);
    const removeSearchFromRecents = (termToRemove, event) => {
        event.stopPropagation();
        setRecentSearches(prev => prev.filter(term => term !== termToRemove));
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(internalSearchTerm);
            // Reset pagination for new debounced term
            setResults([]);
            setResultsNextPageToken(undefined);
            setHasMore(true);
        }, SEARCH_DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [internalSearchTerm]);
    const fetchSearchResultsCallback = useCallback(async (term, pageToken) => {
        if (!term.trim()) {
            setResults([]);
            setIsLoading(false);
            setResultsNextPageToken(undefined);
            setHasMore(false);
            onSearch(''); // Clear search term in App state if overlay search is cleared
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const apiResult = await fetchVideos({ searchTerm: term, pageToken, count: 12 }); // Fetch more for overlay
            setResults(prev => pageToken ? [...prev, ...apiResult.videos] : apiResult.videos);
            setResultsNextPageToken(apiResult.nextPageToken);
            setHasMore(apiResult.hasMore);
            if (!pageToken) { // Only add to recents on a new search, not on "load more"
                addSearchToRecents(term);
            }
            onSearch(term); // Update App's searchTerm
        }
        catch (err) {
            setError('Failed to fetch search results.');
            console.error(err);
            setHasMore(false);
        }
        finally {
            setIsLoading(false);
        }
    }, [onSearch, addSearchToRecents]);
    useEffect(() => {
        // Fetch when debouncedSearchTerm changes (and is not empty)
        if (debouncedSearchTerm.trim()) {
            fetchSearchResultsCallback(debouncedSearchTerm, undefined); // Initial fetch for this term
        }
        else {
            setResults([]);
            setResultsNextPageToken(undefined);
            setHasMore(false);
            // Optionally clear App's search term if desired: onSearch('');
        }
    }, [debouncedSearchTerm, fetchSearchResultsCallback]);
    const handleLoadMore = () => {
        if (!isLoading && hasMore && resultsNextPageToken) {
            fetchSearchResultsCallback(debouncedSearchTerm, resultsNextPageToken);
        }
    };
    const handleRecentSearchClick = (term) => {
        setInternalSearchTerm(term); // This will trigger debounce and then fetch
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Clear debounce timer and fetch immediately
        clearTimeout(useEffect.debounceTimer); // This is a bit hacky, normally you'd manage the timer instance better
        setDebouncedSearchTerm(internalSearchTerm); // Force update debounced term
        setResults([]);
        setResultsNextPageToken(undefined);
        setHasMore(true);
        if (internalSearchTerm.trim()) {
            fetchSearchResultsCallback(internalSearchTerm, undefined);
        }
        else {
            setResults([]);
            setResultsNextPageToken(undefined);
            setHasMore(false);
            onSearch('');
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 bg-primary-light dark:bg-primary-dark z-80 flex flex-col p-4 sm:p-6 md:p-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark", children: "Search Videos" }), _jsx("button", { onClick: onClose, className: "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-orange", "aria-label": "Close search", children: _jsx(XIcon, { className: "h-7 w-7" }) })] }), _jsx("form", { onSubmit: handleFormSubmit, className: "mb-4", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(SearchIcon, { className: "h-5 w-5 text-gray-400 dark:text-gray-500" }) }), _jsx("input", { type: "search", value: internalSearchTerm, onChange: (e) => setInternalSearchTerm(e.target.value), placeholder: "Enter keywords to search...", className: "block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-lg", autoFocus: true })] }) }), recentSearches.length > 0 && !internalSearchTerm.trim() && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2", children: "Recent Searches" }), _jsx("ul", { className: "flex flex-wrap gap-2", children: recentSearches.map(term => (_jsx("li", { children: _jsxs("button", { onClick: () => handleRecentSearchClick(term), className: "flex items-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-light dark:text-text-dark text-sm px-3 py-1.5 rounded-full transition-colors", "aria-label": `Search for ${term}`, children: [_jsx(HistoryIcon, { className: "w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" }), term, _jsx("button", { onClick: (e) => removeSearchFromRecents(term, e), className: "ml-2 p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500", "aria-label": `Remove ${term} from recent searches`, children: _jsx(XIcon, { className: "w-3 h-3 text-gray-500 dark:text-gray-400" }) })] }) }, term))) })] })), _jsxs("div", { className: "flex-grow overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent", children: [isLoading && results.length === 0 && ( // Show spinner only on initial load for a search term
                    _jsx("div", { className: "flex justify-center py-10", children: _jsx(LoadingSpinner, {}) })), error && _jsx("p", { className: "text-center text-red-500 dark:text-red-400 my-4", children: error }), !isLoading && results.length === 0 && debouncedSearchTerm.trim() && !error && (_jsxs("p", { className: "text-center text-gray-600 dark:text-gray-300 py-10 text-lg", children: ["No results found for \"", debouncedSearchTerm, "\"."] })), !debouncedSearchTerm.trim() && results.length === 0 && recentSearches.length === 0 && (_jsx("p", { className: "text-center text-gray-600 dark:text-gray-300 py-10 text-lg", children: "Start typing to search for videos." })), results.length > 0 && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", children: results.map((video, index) => (_jsxs(React.Fragment, { children: [_jsx(VideoCard, { video: video }), index > 0 && (index + 1) % 4 === 0 && !isSubscribed && (_jsx("div", { className: "sm:col-span-2 lg:col-span-3 xl:col-span-4", children: _jsx(AdBanner, {}) }))] }, video.id))) })), isLoading && results.length > 0 && ( // Show spinner if loading more results
                    _jsx("div", { className: "flex justify-center py-8", children: _jsx(LoadingSpinner, {}) })), !isLoading && hasMore && results.length > 0 && (_jsx("div", { className: "text-center py-6", children: _jsx("button", { onClick: handleLoadMore, className: "px-6 py-3 bg-brand-orange text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors", children: "Load More Results" }) }))] })] }));
};
