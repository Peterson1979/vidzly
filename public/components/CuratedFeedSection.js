import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { VideoCard } from './VideoCard';
import { LightBulbIcon } from './Icons'; // Or a more specific "curated" icon
export const CuratedFeedSection = ({ feed, allVideos }) => {
    const detailedVideos = feed.videoIds
        .map(id => allVideos.find(video => video.id === id))
        .filter(video => video !== undefined);
    if (!detailedVideos || detailedVideos.length === 0) {
        return null; // Don't render if no videos found for the feed
    }
    return (_jsxs("section", { className: "mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg", children: [_jsxs("div", { className: "flex items-center mb-3", children: [_jsx(LightBulbIcon, { className: "w-7 h-7 text-yellow-500 dark:text-yellow-400 mr-3 flex-shrink-0" }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl sm:text-2xl font-bold text-text-light dark:text-text-dark", children: feed.title }), feed.description && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: feed.description }))] })] }), _jsxs("div", { className: "flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent -mx-4 px-4", children: [detailedVideos.map(video => (_jsx("div", { className: "flex-shrink-0 w-full sm:w-72 md:w-80", children: _jsx(VideoCard, { video: video }) }, video.id))), detailedVideos.length < 2 && _jsx("div", { className: "w-px" }) /* Ensure scrollbar appears for single item too by having a tiny second element if needed */] }), feed.themePrompt && (_jsxs("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-2 text-right italic", children: ["AI Theme Hint: ", feed.themePrompt.substring(0, 100), feed.themePrompt.length > 100 ? '...' : ''] }))] }));
};
