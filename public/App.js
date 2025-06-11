import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { SkeletonVideoCard } from './components/SkeletonVideoCard';
import { AdBanner } from './components/AdBanner';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { BottomNavbar } from './components/BottomNavbar';
import { SettingsView } from './views/SettingsView';
import { FavoritesView } from './views/FavoritesView';
import { SavedView } from './views/SavedView'; // Renamed from WatchLaterView
import { AchievementsView } from './views/AchievementsView';
import { HistoryView } from './views/HistoryView';
import { SearchOverlay } from './components/SearchOverlay';
import { CuratedFeedSection } from './components/CuratedFeedSection';
import { fetchVideos, allMockVideos } from './services/youtubeService'; // Updated import
import { getLatestCuratedFeed } from './services/curationService';
import { getPersonalizedFeed } from './services/personalizationService';
import { useSubscription } from './contexts/SubscriptionContext';
import { useFavorites } from './contexts/FavoritesContext';
import { CopyrightFooter } from './components/CopyrightFooter';
import { initializeNotifications, checkAndSendScheduledNotifications, recordUserActivity, updateStreakAndNotify, checkAndSendInactivityNotification, checkAndSendHumorousNotification, announceNewFeature } from './services/notificationService';
import { UserIcon } from './components/Icons';
const App = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [videosNextPageToken, setVideosNextPageToken] = useState(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('home');
    const [isSearchOverlayVisible, setIsSearchOverlayVisible] = useState(false);
    const [curatedFeed, setCuratedFeed] = useState(null);
    const [isForYouModeActive, setIsForYouModeActive] = useState(false);
    const [forYouVideos, setForYouVideos] = useState([]);
    const [isForYouLoading, setIsForYouLoading] = useState(false);
    const [forYouError, setForYouError] = useState(null);
    const { isSubscribed } = useSubscription();
    const { favorites } = useFavorites();
    const observer = useRef(null);
    const loadMoreRef = useCallback((node) => {
        if (isLoading || isForYouLoading)
            return;
        if (observer.current)
            observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoading && currentView === 'home' && !isSearchOverlayVisible && !isForYouModeActive && videosNextPageToken) {
                // Fetch next page of videos for the main feed
                fetchVideosCallback(searchTerm, videosNextPageToken);
            }
        });
        if (node)
            observer.current.observe(node);
    }, [isLoading, isForYouLoading, hasMore, currentView, isSearchOverlayVisible, isForYouModeActive, videosNextPageToken, searchTerm]); // Added searchTerm and videosNextPageToken
    const fetchVideosCallback = useCallback(async (currentSearchTerm, pageToken) => {
        if (currentSearchTerm && !pageToken) { // New search term always resets
            setVideos([]);
            setVideosNextPageToken(undefined);
            setHasMore(false); // Will be updated by API response
            // Do not return here, let it fetch
        }
        if (isForYouModeActive) {
            setVideos([]);
            setIsLoading(false);
            setHasMore(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Pass empty string for searchTerm if fetching popular, pageToken for pagination
            const result = await fetchVideos({ searchTerm: currentSearchTerm, pageToken });
            setVideos(prevVideos => pageToken ? [...prevVideos, ...result.videos] : result.videos);
            setVideosNextPageToken(result.nextPageToken);
            setHasMore(result.hasMore);
        }
        catch (err) {
            setError('Failed to fetch videos. Please try again later.');
            console.error(err);
            setHasMore(false);
        }
        finally {
            setIsLoading(false);
        }
    }, [isForYouModeActive]); // Removed searchTerm from deps, as it's passed as arg
    useEffect(() => {
        initializeNotifications();
        recordUserActivity();
        updateStreakAndNotify(allMockVideos);
        checkAndSendScheduledNotifications(allMockVideos);
        checkAndSendInactivityNotification(allMockVideos);
        checkAndSendHumorousNotification(allMockVideos);
        if (!localStorage.getItem('vidzly_feature_notification_center_seen')) {
            announceNewFeature("Notification Center!", "Check your new in-app notifications using the bell icon in the top right.");
            localStorage.setItem('vidzly_feature_notification_center_seen', 'true');
        }
        getLatestCuratedFeed().then(feed => {
            setCuratedFeed(feed);
        }).catch(err => {
            console.error("Error fetching curated feed:", err);
            setCuratedFeed(null);
        });
    }, []);
    // Effect for initial load or when searchTerm changes from SearchOverlay
    useEffect(() => {
        if (currentView === 'home' && !isSearchOverlayVisible && !isForYouModeActive) {
            // This will be the initial fetch (pageToken is undefined) or new search fetch
            setVideos([]); // Clear current videos for new search or initial load
            setVideosNextPageToken(undefined); // Reset token
            setHasMore(true); // Assume more initially
            fetchVideosCallback(searchTerm, undefined);
        }
    }, [searchTerm, currentView, isSearchOverlayVisible, isForYouModeActive, fetchVideosCallback]); // fetchVideosCallback dependency is stable
    const fetchForYouContent = useCallback(async () => {
        if (!isForYouModeActive)
            return;
        setIsForYouLoading(true);
        setForYouError(null);
        setForYouVideos([]);
        try {
            const personalizedVideos = await getPersonalizedFeed(favorites, allMockVideos);
            setForYouVideos(personalizedVideos);
        }
        catch (err) {
            console.error("Error fetching 'For You' feed:", err);
            setForYouError("Could not load your personalized feed. Please try again later.");
        }
        finally {
            setIsForYouLoading(false);
        }
    }, [favorites, isForYouModeActive]);
    const handleExecuteSearch = (term) => {
        setSearchTerm(term); // This will trigger the useEffect for fetching videos
        setIsForYouModeActive(false);
    };
    const handleOpenSearch = () => {
        setIsSearchOverlayVisible(true);
    };
    const handleCloseSearch = () => {
        setIsSearchOverlayVisible(false);
        // If a search was active in overlay, App's searchTerm is already set.
        // If user closes without executing a new search from overlay, 
        // App's main view will use the existing App.searchTerm.
        // If searchTerm was cleared in overlay and then closed, App.searchTerm needs to reflect that.
        // This is handled by onSearch in SearchOverlay updating App's searchTerm.
    };
    const handleViewChange = (view) => {
        setCurrentView(view);
        setSearchTerm(''); // Clear search term when changing main views
        setVideosNextPageToken(undefined); // Reset pagination for main feed
        setHasMore(true);
        if (isForYouModeActive && view !== 'home') {
            setIsForYouModeActive(false);
            setForYouVideos([]);
            setForYouError(null);
        }
        else if (view === 'home' && isForYouModeActive) {
            fetchForYouContent();
        }
        else if (view === 'home' && !isForYouModeActive) {
            setIsForYouModeActive(false);
            // Fetching for home view will be handled by the useEffect dependent on currentView
        }
        if (isSearchOverlayVisible) {
            setIsSearchOverlayVisible(false);
        }
    };
    const toggleForYouMode = () => {
        setIsForYouModeActive(prev => {
            const newMode = !prev;
            if (newMode) { // Switching to "For You"
                setCurrentView('home');
                setSearchTerm('');
                setIsSearchOverlayVisible(false);
                setVideos([]);
                setVideosNextPageToken(undefined);
                setHasMore(false);
                fetchForYouContent();
            }
            else { // Switching off "For You"
                setForYouVideos([]);
                setForYouError(null);
                setVideosNextPageToken(undefined);
                setHasMore(true);
                // The useEffect for currentView='home' & !isForYouModeActive will trigger fetching popular videos
            }
            return newMode;
        });
    };
    const renderMainContent = () => {
        if (currentView === 'settings') {
            return _jsx(SettingsView, { onOpenSubscriptionModal: () => setIsSubscriptionModalOpen(true), onNavigateToView: handleViewChange });
        }
        if (currentView === 'favorites') {
            return _jsx(FavoritesView, {});
        }
        if (currentView === 'saved') {
            return _jsx(SavedView, {});
        }
        if (currentView === 'achievements') {
            return _jsx(AchievementsView, {});
        }
        if (currentView === 'history') {
            return _jsx(HistoryView, {});
        }
        if (isForYouModeActive && currentView === 'home') {
            if (isForYouLoading) {
                return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(UserIcon, { className: "w-12 h-12 text-brand-orange dark:text-orange-400 mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-3", children: "Crafting Your Personalized Feed..." }), _jsx(LoadingSpinner, {})] }));
            }
            if (forYouError) {
                return (_jsxs("div", { className: "text-center py-12 px-4 text-red-500 dark:text-red-400", children: [_jsx(UserIcon, { className: "w-16 h-16 mx-auto text-red-400 dark:text-red-300 mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "Oops! Something Went Wrong" }), _jsx("p", { children: forYouError }), _jsx("button", { onClick: fetchForYouContent, className: "mt-4 px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-600 transition-colors", children: "Try Again" })] }));
            }
            if (forYouVideos.length === 0) {
                return (_jsxs("div", { className: "text-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(UserIcon, { className: "w-16 h-16 mx-auto text-brand-orange dark:text-orange-400 mb-4" }), _jsx("h2", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "Your Personalized Feed Awaits!" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "We're still learning your tastes. Favorite some videos to help us tailor recommendations just for you, or check back soon!" })] }));
            }
            return (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-left py-4 px-1 mb-0 text-text-light dark:text-text-dark", children: _jsxs("div", { className: "flex items-center mb-0", children: [_jsx(UserIcon, { className: "w-8 h-8 mr-3 text-brand-orange dark:text-orange-400" }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl sm:text-2xl font-semibold", children: "Your Personalized Feed" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Amazing content tailored just for you!" })] })] }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-2", children: forYouVideos.map((video, index) => (_jsxs(React.Fragment, { children: [_jsx(VideoCard, { video: video }), index > 0 && (index + 1) % 4 === 0 && !isSubscribed && (_jsx("div", { className: "sm:col-span-2 lg:col-span-3 xl:col-span-4", children: _jsx(AdBanner, {}) }))] }, `foryou-${video.id}`))) })] }));
        }
        // Standard feed (popular or search results)
        const videosToDisplay = videos;
        const showNoVideosMessage = currentView === 'home' && !isLoading && videosToDisplay.length === 0 && !error && !curatedFeed && !isForYouModeActive;
        const showInitialLoadingSkeleton = currentView === 'home' && isLoading && videosToDisplay.length === 0 && !videosNextPageToken && !isForYouModeActive;
        return (_jsxs(_Fragment, { children: [error && _jsx("p", { className: "text-center text-red-500 dark:text-red-400 my-4", children: error }), currentView === 'home' && curatedFeed && !isForYouModeActive && !searchTerm && (_jsx(CuratedFeedSection, { feed: curatedFeed, allVideos: allMockVideos })), showInitialLoadingSkeleton && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6", children: [...Array(curatedFeed && !isForYouModeActive ? 4 : 8)].map((_, i) => _jsx(SkeletonVideoCard, {}, `skeleton-home-${i}`)) })), !showInitialLoadingSkeleton && !isForYouModeActive && (_jsx("div", { className: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${curatedFeed && !searchTerm ? 'mt-8' : 'mt-6'}`, children: videosToDisplay.map((video, index) => (_jsxs(React.Fragment, { children: [_jsx(VideoCard, { video: video }), index > 0 && (index + 1) % 4 === 0 && !isSubscribed && (_jsx("div", { className: "sm:col-span-2 lg:col-span-3 xl:col-span-4", children: _jsx(AdBanner, {}) }))] }, video.id))) })), isLoading && videosToDisplay.length > 0 && currentView === 'home' && !isForYouModeActive && ( // Show loading spinner if appending
                _jsx("div", { className: "flex justify-center py-8", children: _jsx(LoadingSpinner, {}) })), !isLoading && hasMore && videosToDisplay.length > 0 && currentView === 'home' && !isForYouModeActive && (_jsx("div", { ref: loadMoreRef, className: "h-10 flex justify-center items-center" })), showNoVideosMessage && (_jsx("p", { className: "text-center text-gray-600 dark:text-gray-300 py-8 text-lg sm:text-xl", children: searchTerm ? `No videos found for "${searchTerm}". Try a different search!` : "No videos available. Try reloading or check back later!" }))] }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-secondary-light dark:bg-primary-dark text-text-light dark:text-text-dark flex flex-col", children: [_jsx(Navbar, { onOpenSearch: handleOpenSearch, isForYouModeActive: isForYouModeActive, onToggleForYouMode: toggleForYouMode }), _jsx("main", { className: "flex-grow container mx-auto px-2 sm:px-4 py-4 pb-20", children: !isSearchOverlayVisible && renderMainContent() }), !isSearchOverlayVisible && _jsx(CopyrightFooter, {}), !isSearchOverlayVisible && _jsx(BottomNavbar, { currentView: isForYouModeActive ? 'home' : currentView, onViewChange: handleViewChange }), _jsx(SubscriptionModal, { isOpen: isSubscriptionModalOpen, onClose: () => setIsSubscriptionModalOpen(false) }), isSearchOverlayVisible && (_jsx(SearchOverlay, { currentSearchTerm: searchTerm, onSearch: handleExecuteSearch, onClose: handleCloseSearch }))] }));
};
export default App;
