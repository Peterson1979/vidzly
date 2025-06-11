import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useSaved } from '../contexts/SavedContext'; // Updated from useWatchLater
import { VideoCard } from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { allMockVideos as globalAllMockVideos } from '../services/youtubeService';
import { ClockIcon } from '../components/Icons'; // Icon can remain the same for "Saved"
import { AdBanner } from '../components/AdBanner';
import { useSubscription } from '../contexts/SubscriptionContext';
export const SavedView = () => {
    const { savedItems } = useSaved(); // Updated from useWatchLater and watchLaterItems
    const { isSubscribed } = useSubscription();
    const [detailedSavedVideos, setDetailedSavedVideos] = useState([]); // Renamed
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchSavedVideoDetails = async () => {
            if (savedItems.length === 0) {
                setDetailedSavedVideos([]); // Renamed
                return;
            }
            setIsLoading(true);
            const savedVideoIds = savedItems.map(item => item.videoId); // Renamed
            const detailed = globalAllMockVideos.filter(video => savedVideoIds.includes(video.id));
            const sortedDetailed = detailed.sort((a, b) => {
                const itemA = savedItems.find(item => item.videoId === a.id); // Renamed
                const itemB = savedItems.find(item => item.videoId === b.id); // Renamed
                return (itemB?.addedAt || 0) - (itemA?.addedAt || 0);
            });
            setDetailedSavedVideos(sortedDetailed); // Renamed
            setIsLoading(false);
        };
        fetchSavedVideoDetails(); // Renamed
    }, [savedItems]); // Renamed
    if (isLoading && savedItems.length > 0) { // Renamed
        return (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx(LoadingSpinner, {}) }));
    }
    return (_jsxs("div", { className: "pb-20 min-h-[calc(100vh-10rem)]", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark text-center my-6", children: "Saved Videos" }), savedItems.length === 0 ? ( // Renamed
            _jsxs("div", { className: "text-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(ClockIcon, { className: "w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" }), _jsx("h3", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "Your Saved List is Empty" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Tap the clock icon on videos to save them here." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", children: detailedSavedVideos.map((video, index) => ( // Renamed
                _jsxs(React.Fragment, { children: [_jsx(VideoCard, { video: video }), index > 0 && (index + 1) % 4 === 0 && !isSubscribed && (_jsx("div", { className: "sm:col-span-2 lg:col-span-3 xl:col-span-4", children: _jsx(AdBanner, {}) }))] }, video.id))) }))] }));
};
