import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getVideoSummary } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { LightBulbIcon } from './Icons';
import { useBadges } from '../contexts/BadgesContext'; // Import useBadges
export const GeminiInsights = ({ videoId, videoTitle, videoDescription }) => {
    const [insight, setInsight] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const badgesContext = useBadges(); // Get badges context
    useEffect(() => {
        if (isVisible && !insight && !isLoading) {
            setIsLoading(true);
            badgesContext.recordAiInsightUsage(); // Record AI insight usage for badge
            getVideoSummary(videoTitle, videoDescription)
                .then(summary => {
                setInsight({ videoId, summary });
            })
                .catch(error => {
                console.error("Error fetching Gemini summary:", error);
                setInsight({ videoId, error: "Could not load AI insights." });
            })
                .finally(() => {
                setIsLoading(false);
            });
        }
    }, [videoId, videoTitle, videoDescription, insight, isLoading, isVisible, badgesContext]);
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
        // Note: The actual recording of usage is now in the useEffect above, tied to when loading starts
    };
    return (_jsxs("div", { className: "w-full", children: [" ", _jsxs("button", { onClick: toggleVisibility, className: "flex items-center text-sm text-brand-orange hover:text-orange-400 dark:hover:text-orange-300 focus:outline-none w-full text-left", "aria-expanded": isVisible, "aria-controls": `gemini-insights-${videoId}`, children: [_jsx(LightBulbIcon, { className: "w-5 h-5 mr-2 flex-shrink-0" }), _jsx("span", { className: "font-semibold", children: "AI Insights" }), _jsx("svg", { className: `w-4 h-4 ml-auto transform transition-transform duration-200 ${isVisible ? 'rotate-180' : 'rotate-0'}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" }) })] }), isVisible && (_jsxs("div", { id: `gemini-insights-${videoId}`, className: "mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow", children: [isLoading && (_jsxs("div", { className: "flex items-center", children: [_jsx(LoadingSpinner, {}), " ", _jsx("span", { className: "ml-2", children: "Generating insights..." })] })), insight?.summary && _jsx("p", { children: insight.summary }), insight?.error && _jsx("p", { className: "text-red-500 dark:text-red-400", children: insight.error }), !isLoading && !insight && _jsx("p", { children: "Click to load AI-powered summary." })] }))] }));
};
