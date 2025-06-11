import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useViewHistory } from '../contexts/ViewHistoryContext';
import { VideoCard } from '../components/VideoCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { allMockVideos as globalAllMockVideos } from '../services/youtubeService';
import { HistoryIcon, TrashIcon } from '../components/Icons';
import { AdBanner } from '../components/AdBanner';
import { useSubscription } from '../contexts/SubscriptionContext';
export const HistoryView = () => {
    const { historyItems, clearHistory } = useViewHistory();
    const { isSubscribed } = useSubscription();
    const [detailedHistoryVideos, setDetailedHistoryVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchHistoryVideoDetails = async () => {
            if (historyItems.length === 0) {
                setDetailedHistoryVideos([]);
                return;
            }
            setIsLoading(true);
            const historyVideoIds = historyItems.map(item => item.videoId);
            const detailed = globalAllMockVideos.filter(video => historyVideoIds.includes(video.id));
            // Map historyItems to detailed videos, preserving order and ensuring no undefined
            const sortedAndDetailed = historyItems
                .map(historyItem => detailed.find(video => video.id === historyItem.videoId))
                .filter(Boolean); // Filter out any undefined results and assert type
            setDetailedHistoryVideos(sortedAndDetailed);
            setIsLoading(false);
        };
        fetchHistoryVideoDetails();
    }, [historyItems]);
    if (isLoading && historyItems.length > 0) {
        return (_jsx("div", { className: "flex justify-center items-center h-64", children: _jsx(LoadingSpinner, {}) }));
    }
    return (_jsxs("div", { className: "pb-20 min-h-[calc(100vh-10rem)]", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center my-6 px-2 sm:px-0", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark text-center sm:text-left flex-grow mb-4 sm:mb-0", children: "Viewing History" }), historyItems.length > 0 && (_jsxs("button", { onClick: () => {
                            if (window.confirm("Are you sure you want to clear your entire viewing history? This action cannot be undone.")) {
                                clearHistory();
                            }
                        }, className: "flex items-center px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors shadow hover:shadow-md", "aria-label": "Clear all viewing history", children: [_jsx(TrashIcon, { className: "w-4 h-4 sm:w-5 sm:h-5 mr-2" }), "Clear History"] }))] }), historyItems.length === 0 ? (_jsxs("div", { className: "text-center py-12 px-4 text-text-light dark:text-text-dark", children: [_jsx(HistoryIcon, { className: "w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" }), _jsx("h3", { className: "text-xl sm:text-2xl font-semibold mb-2", children: "No History Yet" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Videos you watch will appear here, sorted by most recently viewed." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6", children: detailedHistoryVideos.map((video, index) => (_jsxs(React.Fragment, { children: [_jsx(VideoCard, { video: video }), index > 0 && (index + 1) % 4 === 0 && !isSubscribed && (_jsx("div", { className: "sm:col-span-2 lg:col-span-3 xl:col-span-4", children: _jsx(AdBanner, {}) }))] }, video.id))) }))] }));
};
